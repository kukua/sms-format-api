import _ from 'lodash'
import cache from 'memory-cache'
import request from 'request-promise'
import parse from 'xml-parser'
import moment from 'moment-timezone'
import APIError from './APIError'
import config from './config'
import log from './log'

function findMeasurementForDateTime (measurements, date, time = '00:00') {
	const dateString = date.format('YYYY-MM-DD')
	const measurement = _.find(measurements, (child) => {
		return child.name === 'fc' && child.attributes.dt === `${dateString} ${time}`
	})

	if (measurement) return measurement.attributes
}

function prefixWithLocation (location, text, separator = ' ') {
	location = location.toUpperCase()

	if ( ! location) separator = ''

	if (text.length > 160) {
		throw new Error('Text length is longer than single SMS message.')
	}
	if (location.length + separator.length + text.length <= 160) {
		return `${location}${separator}${text}`
	}

	return `${location.substr(0, 160 - separator.length - text.length - 1 /* dot */)}.${separator}${text}`
}

function createTextLine (prefix, m) {
	return `${prefix} rain ${Math.ceil(m.pr)}mm ${m.pp}% temp ${m.t}C wind ${m.wn} ${Math.round(m.ws * 3.6)}kmh hum ${m.rh}%`
}

export default async function createText (latitude, longitude, location = '') {
	// Validate parameters
	if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
		throw new APIError(`Invalid latitude: "${latitude}".`, 400)
	}
	if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -90 || longitude > 90) {
		throw new APIError(`Invalid longitude: "${longitude}".`, 400)
	}

	// Check cache
	const cacheKey = `${latitude}:${longitude}:${location}`
	const cacheValue = cache.get(cacheKey)

	if (cacheValue) return cacheValue

	// Fetch forecast
	const xml = await request({
		method: 'GET',
		url: `${config.navifeed.url}&lat=${latitude}&lon=${longitude}`,
		headers: {
			'Accept': 'text/xml',
		},
	})

	log.debug({ type: 'raw', latitude, longitude, xml })

	const data = parse(xml)
	const measurements = _(data).get('root.children.0.children')

	// Use name of nearest weather station
	if ( ! location) {
		location = _.get(_(measurements).find((child) => child.name === 'obs'), 'attributes.station', '')
	}

	const date      = moment.utc()
	const morning   = findMeasurementForDateTime(measurements, date, '06:00')
	const afternoon = findMeasurementForDateTime(measurements, date, '12:00')
	const evening   = findMeasurementForDateTime(measurements, date, '18:00')

	if ( ! morning || ! afternoon || ! evening) {
		throw new APIError('Expected morning, afternoon and evening measurement.', 500)
	}

	const text = prefixWithLocation(location, [
		`${date.format('MMM D')}`,
		createTextLine('Morn', morning),
		createTextLine('Aft', afternoon),
		createTextLine('Eve', evening),
	].join('\n'))

	// Cache and return
	const response = { location, text }
	cache.put(cacheKey, response, config.navifeed.cacheTimeMS)
	return response
}

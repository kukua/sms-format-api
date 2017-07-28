import APIError from '../APIError'
import createText from '../createText'

const validNumber = /^\+[0-9]{11,13}$/

function sanitizePhoneNumber (number) {
	if (typeof number !== 'string') return null

	number = number.replace(/[\- ]+/g, '').replace(/^00/, '+')

	if ( ! number.startsWith('+')) return null
	if ( ! number.match(validNumber)) return null

	return number
}

export default async function (req, res) {
	const query = req.query

	// Gather phone numbers
	const phoneNumbers = []

	function addPhoneNumber (number) {
		var sanitized = sanitizePhoneNumber(number)
		if ( ! sanitized) throw new APIError(`Invalid phone number: "${number}".`)
		phoneNumbers.push(sanitized)
	}

	if (query.phone_number) {
		addPhoneNumber(query.phone_number)
	}
	if (Array.isArray(query.phone_numbers)) {
		query.phone_numbers.map(addPhoneNumber)
	}

	// Gather coordinate and location
	const latitude = parseFloat(query.latitude)
	const longitude = parseFloat(query.longitude)
	var location = String(query.location || '')

	// Create SMS body
	var { text, location } = await createText(latitude, longitude, location)

	// Send response
	const response = {
		phone_numbers: phoneNumbers,
		location,
		latitude,
		longitude,
		text,
	}

	req.log.debug(response)
	res.json(response)
}

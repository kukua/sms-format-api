import express from 'express'
import addRequestID from 'express-request-id'
import bodyParser from 'body-parser'
import cors from 'cors'
import noCache from 'connect-nocache'
import morgan from 'morgan'
import basicAuth from 'express-basic-auth'
import config from './config'
import router from './router'
import log from './log'
import APIError from './APIError'

const app = express()

app.use(addRequestID())
app.use((req, res, next) => {
	req.log = log.child({ rid: req.id })
	next()
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors({
	origin (origin, callback) { callback(null, true) }, // Allow any origin
	credentials: true,
}))
app.use(noCache())
app.use(morgan((tokens, req, res) => {
	req.log.info({
		type: 'request',
		ip: req.header('X-Forwarded-For') || req.connection.remoteAddress,
		method: tokens.method(req, res),
		url: tokens.url(req, res),
	})
}, {
	immediate: true,
}))
app.use(morgan((tokens, req, res) => {
	req.log.info({
		type: 'response',
		status: Number(tokens.status(req, res)),
		contentLength: Number(tokens.res(req, res, 'content-length')) || 0,
		// Seconds with 6 decimals
		responseTime: Math.round(Number(tokens['response-time'](req, res)) * 1000) / 1000000,
		user: req.auth.user,
	})
}))

// Parse Authorization header
app.use(basicAuth({ authorizer () { return true } }))

router(app)

app.get('*', (req, res) => {
	if (res.headersSent) return
	res.status(404).json({ title: 'Not found.', status_code: 404 })
})
app.use((err, req, res, next) => {
	err = APIError.fromError(err)
	req.log.error(err)
	res.header(err.statusCode).json(err.toJSON())
})

app.listen(config.port)
log.info({ type: 'status' }, `Listening on port ${config.port}..`)

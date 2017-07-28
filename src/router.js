import format from './routes/format'

function asyncRoute (fn) {
	return function (req, res, next) {
		const promise = fn(req, res)

		if (promise instanceof Promise) {
			promise.then(next).catch(next)
		} else {
			next()
		}
	}
}

export default function register (app) {
	app.get('/v1/format', asyncRoute(format))
}

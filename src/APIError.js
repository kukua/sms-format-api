export default class APIError {
	constructor (message, statusCode = 500) {
		Error.captureStackTrace(this, this.constructor)
		this.name = this.constructor.name

		console.log(message, statusCode)
		this.message = message || 'Unknown error'
		this.statusCode = statusCode
	}

	static fromError (err) {
		if (err instanceof APIError) return err

		const newError = new APIError(err.message)
		newError.previous = err
		newError.stack = err.stack
		return newError
	}

	toString (): string {
		return `${this.constructor.name}: ${this.message}`
	}

	toJSON () {
		return {
			title: this.message,
			status_code: this.statusCode,
		}
	}
}

require('util').inherits(APIError, Error)

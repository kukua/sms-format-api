require('dotenv').config()

export default {
	port: 8080,

	logPath: process.env.LOG_PATH,

	navifeed: {
		url: process.env.NAVIFEED_URL,
		cacheTime: 10 * 60 * 1000, // ms
	},
}

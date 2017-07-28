import path from 'path'
import Bunyan from 'bunyan'
import bunyanDebugStream from 'bunyan-debug-stream'
import RotatingFileStream from 'bunyan-rotating-file-stream'
import config from './config'

const log = Bunyan.createLogger({
	name: 'sms-format-api',
	streams: [
		{
			level: 'info',
			type: 'raw',
			stream: bunyanDebugStream({
				basepath: path.resolve('.'),
				forceColor: true,
			}),
		},
		{
			level: 'debug',
			type: 'raw',
			stream: new RotatingFileStream({
				path: config.logPath,
				period: '1d',
				rotateExisting: true,
				threshold: '100m',
			}),
		},
	],
})

log.level('debug')

export default log

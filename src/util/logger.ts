const { createLogger, format, transports } = require('winston');
import { ENVIRONMENT } from '../settings';

const logger = createLogger({
  transports: [
    new transports.Console({
      level: ENVIRONMENT === 'production' ? 'error' : 'debug',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(
          (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
    new transports.File({ filename: 'debug.log', level: 'debug' }),
  ],
});

if (ENVIRONMENT !== 'production') {
  logger.info('Logging initialized at debug level');
}

export default logger;

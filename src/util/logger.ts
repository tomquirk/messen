const { createLogger, format, transports } = require('winston');
import { ENVIRONMENT } from '../settings';

const getlogger = (name: string) =>
  createLogger({
    transports: [
      new transports.Console({
        level: ENVIRONMENT === 'production' ? 'error' : 'debug',
        format: format.combine(
          format.timestamp(),
          format.colorize(),
          format.printf(
            (info: any) =>
              `${name} (${info.timestamp} ${info.level}): ${info.message}`,
          ),
        ),
      }),
      // new transports.File({ filename: `${name}.debug.log`, level: 'debug' }),
    ],
  });

export default getlogger;

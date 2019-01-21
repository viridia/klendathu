// import './env';
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: format.combine(
    format.splat(),
    format.colorize(),
    format.simple(),
  ),
  transports: [new transports.Console()],
});

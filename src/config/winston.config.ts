import { registerAs } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const winstonConfig = registerAs('winston', () => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logDir = process.env.LOG_DIR || 'logs';
  
  // Create format for console logging
  const consoleFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
    }),
  );

  // Create format for file logging
  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  // Transport configuration
  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      level: logLevel,
      format: consoleFormat,
    }),

    // File transport for all logs
    new winston.transports.DailyRotateFile({
      level: logLevel,
      dirname: logDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),

    // File transport for error logs only
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),

    // File transport for HTTP requests
    new winston.transports.DailyRotateFile({
      level: 'http',
      dirname: `${logDir}/http`,
      filename: 'http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: fileFormat,
    }),
  ];

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    ),
    transports,
    exitOnError: false,
    silent: process.env.NODE_ENV === 'test',
  };
});

export default winstonConfig;

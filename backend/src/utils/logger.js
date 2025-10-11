import winston from 'winston';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  verbose: 'blue',
  debug: 'green',
  silly: 'rainbow'
};

winston.addColors(customColors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}${stackStr}`;
  })
);

// const loggerFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.errors({ stack: true }),
//   winston.format.json()
// );

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: winston.config.npm.levels,
  defaultMeta: { 
    service: 'Ressume Analyzer',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    }),
    // new winston.transports.File({
    //   filename: path.join(__dirname, '../logs/error.log'),
    //   level: 'error',
    //   format: loggerFormat
    // }),
    // new winston.transports.File({
    //   filename: path.join(__dirname, '../logs/combined.log'),
    //   format: loggerFormat
    // })
  ],
  exitOnError: false
});

logger.stream = {
  write: (message) => logger.http(message.trim())
};

// Helper log methods
const createLogMethod = (level) => (message, meta = {}) => logger[level](message, meta);

export const error = createLogMethod('error');
export const warn = createLogMethod('warn');
export const info = createLogMethod('info');
export const http = createLogMethod('http');
export const verbose = createLogMethod('verbose');
export const debug = createLogMethod('debug');
export const silly = createLogMethod('silly');

export const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  next();
};

export const time = (label) => console.time(label);
export const timeEnd = (label) => console.timeEnd(label);

export const dbQuery = (query, duration, error = null) => {
  if (error) {
    logger.error('Database query failed', { query, duration, error: error.message });
  } else {
    logger.debug('Database query executed', { query, duration });
  }
};

export const apiResponse = (endpoint, statusCode, responseTime, data = null) => {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
  logger[level]('API Response', {
    endpoint,
    statusCode,
    responseTime: `${responseTime}ms`,
    ...(data && { data })
  });
};

export { logger };
export default logger;

import winston from 'winston';

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
    })
  ],
  exitOnError: false
});

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

const createLogMethod = (level) => {
  return (message, meta = {}) => {
    logger[level](message, meta);
  };
};

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
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${method} ${url}`, {
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

export const time = (label) => {
  console.time(label);
};

export const timeEnd = (label) => {
  console.timeEnd(label);
};

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

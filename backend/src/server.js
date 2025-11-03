import express from 'express';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { CorsInitialisation } from './utils/cors.setup.js';
import dbConnect from './config/dbConnect.js';
import userRouter from './routes/user.route.js';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import { RedisStore } from 'rate-limit-redis';
import { globalErrorHandler } from './middleware/errorHandler.js';
import resumeRouter from './routes/resume.route.js';
import planRouter from './routes/plan.route.js'
import jobRouter from './routes/job.route.js';
import resumeParserRouter from './routes/resumeParser.route.js';
import atsRouter from './routes/ats.route.js';
import chatRouter from './routes/chat.route.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import passportConfig from './config/passport.js';
passportConfig(passport);

if (process.env.NODE_ENV !== 'test') {
    import('../jobs/testRunner.job.js');
}
import bodyParser from 'body-parser';
import morganBody from 'morgan-body';
// import { apiVersioning } from './middleware/errorHandler.js';

const app = express();

dotenv.config();
export default app;

const PORT = process.env.PORT || 3000;
const redisClient = new Redis(
    process.env.REDIS_URI || 'redis://localhost:6379'
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(CorsInitialisation);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGOOSE_URI, collectionName: 'sessions' }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false, // Allow in dev for cross-origin
        sameSite: 'none' // Allow cross-origin in dev
    }
}))

app.use(passport.initialize());
app.use(passport.session())

if (process.env.NODE_ENV !== 'test') {
    app.use(bodyParser.json());
    morganBody(app);
}

app.use((req, res, next) => {
    logger.info(`url: ${req.originalUrl} method: ${req.method}`);
    logger.info(`ip: ${req.ip} userAgent: ${req.get('User-Agent')}`);
    logger.info(`body: ${JSON.stringify(req.body)}`);
    next();
})

const limitExceeded = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests, please try again later.',
        status: 429,
        success: false,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        return res.status(429).json({
            message: 'Too many requests, please try again later.',
            status: 429,
            success: false,
        });
    },
    // store: new RedisStore({
	// 	sendCommand: (...args) => redisClient.sendCommand(args),
	// }),
});

// app.use(apiVersioning('v1'));

app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
})

app.use('/api/v1/user/auth/profile', limitExceeded);
app.use('/api/v1/user/auth/update-profile', limitExceeded);
app.use('/api/v1/user/auth/reset-password', limitExceeded);
app.use('/api/v1/user/auth/login', limitExceeded);
app.use('/api/v1/user/auth/logout', limitExceeded);

app.use('/api/v1/resume', limitExceeded);

app.use('/api/v1/user/auth', userRouter);
app.use('/api/v1/resume', resumeRouter);
app.use('/api/v1/plan', planRouter);
app.use('/api/v1/job', jobRouter);
app.use('/api/v1/resume-parser', resumeParserRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/ats', atsRouter);

app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
    dbConnect();
    app.listen(PORT, () => {
    logger.info(`Server is running on PORT: ${PORT}`);
    logger.info(`Redis is running on URI: ${process.env.REDIS_URI}`);
    })
}

import express from 'express';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { CorsInitialisation } from './utils/cors.setup.js';
import dbConnect from './config/dbConnect.js';

const app = express();

dotenv.config();
dbConnect();

const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(CorsInitialisation);

app.listen(PORT, () => {
    logger.info(`Server is running on PORT: ${PORT}`);
})
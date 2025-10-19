import mongoose from "mongoose";
import dotenv from 'dotenv';
import logger from "../utils/logger.js";
import { ApiError } from "../utils/errorFormat.js";

dotenv.config();

const MONGO_URI = process.env.MONGOOSE_URI;
if (!MONGO_URI) logger.error(`Mongose uri not found`);

if (process.env.NODE_ENV === 'test') {
    logger.error("Skipping real MongoDB connection (using in-memory Mongo)");
    throw new ApiError({ message: "Skipping real MongoDB connection (using in-memory Mongo)", status: 500 });
}

const dbConnect = async () => {
    try {
        const connct = await mongoose.connect(MONGO_URI);
        logger.info(`MongoDB connected: ${connct.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default dbConnect;
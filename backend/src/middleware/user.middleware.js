import logger from "../utils/logger.js";
import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/errorFormat.js";

const getUser = (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        // console.log(token)
        if (!token) {
            logger.error('token not found');
            throw new ApiError({ message: 'Token not found', status: 401 });
        }
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                logger.error('token is invalid');
                throw new ApiError({ message: 'Token is invalid or expired', status: 401 });
            }
            req.user = user;
            next();
        })
    } catch (error) {
        logger.error (`Cannot get the user, Error: ${error.message}`);
        res.status(error.status || 500).json({
            message: error?.message || 'Internal Server Error',
            statusCode: error.status || 500,
            success: false
        })
    }
}

export {
    getUser
}
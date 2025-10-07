import logger from "../utils/logger.js";
import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/errorFormat.js";

const getUser = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    // console.log(token)
    if (!token) {
        logger.error('token not found');
        const apiError = new ApiError({ message: 'Token not found', status: 401 });
        return res.status(401).json({
            ...apiError
        })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            logger.error('token is invalid');
            const apiError = new ApiError({ message: 'Token is invalid or expired', status: 401 });
            return res.status(401).json({
                ...apiError
            })
        }
        req.user = user;
        next();
    })
}

export {
    getUser
}
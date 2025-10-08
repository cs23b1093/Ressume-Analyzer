import logger from "../utils/logger.js";
import { ApiError } from "../utils/errorFormat.js";

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// export const apiVersioning = ('v1') = (req, res, next) => {
//     const url = req.originalUrl;
//     const version = url.split('/')[1];
//     if (version !== apiVersioning) {
//         const apiError = new ApiError({ message: 'Invalid API version', status: 404 });
//         return res.status(404).json({
//             ...apiError
//         })
//     } else {
//         next();
//     }
// }

export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : (err.statusCode || 500);

    logger.error('Request failed', {
        path: req.originalUrl,
        method: req.method,
        statusCode,
        errorMessage: err.message,
        stack: err.stack,
    });

    if (err instanceof ApiError) {
        return res.status(statusCode).json({
            success: false,
            message: err.message,
            error: err.error,
            statusCode,
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'validation error',
            error: err.message,
            statusCode: 400,
            stack: err.stack,
        });
    }

    return res.status(500).json({
        success: false,
        message: 'internal server error',
        error: err.message,
        statusCode: 500,
        stack: err.stack,
    });
};
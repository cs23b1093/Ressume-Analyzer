import { ApiError } from "./errorFormat.js";

const apiVersioning = ('v1') = (req, res, next) => {
    const url = req.originalUrl;
    const version = url.split('/')[1];
    if (version !== apiVersioning) {
        const apiError = new ApiError({ message: 'Invalid API version', status: 404 });
        return res.status(404).json({
            ...apiError
        })
    } else {
        next();
    }
}

export default apiVersioning;
import jwt from 'jsonwebtoken';
import { argon2d } from 'argon2';
import crypto from 'crypto';
import { RefreshToken } from '../models/refreshToken.js';

const generateToken = async (user_id) => {
    const accessToken = jwt.sign({
        user_id
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: '15m'
    })

    const refreshToken = jwt.sign({
        user_id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: '7d'
    })

    await RefreshToken.create({
        token: refreshToken,
        user_id,
        expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    return {
        accessToken,
        refreshToken
    }
}

export default generateToken;
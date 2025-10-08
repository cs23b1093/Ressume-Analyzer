import { asyncHandler } from '../middleware/errorHandler.js';
import { User } from '../models/user.model.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/errorFormat.js';
import { ValidateNewUserData, ValidateLoginData } from '../utils/user.validate.js';
import generateToken from '../utils/generateToken.js'
import sendEmail from '../config/resend.setup.js';
import { otpGen } from '../utils/otpgenerator.js';
import { RefreshToken } from '../models/refreshToken.js';
import jwt from 'jsonwebtoken';

const redisKey = process.env.redisKey;

const removeCache = (redisClient, key) => {
	redisClient.del(key)
	logger.warn('user cache removed');
}

const registerUser = asyncHandler(async (req, res, next) => {
	try {
		const { error } = ValidateNewUserData(req.body);
		if (error) {
			logger.error(error.details.map(d => d.message).join(", "));
			const apiError = new ApiError({ 
				message: error.details[0].message, 
				status: 400, 
				error 
			});
			return res.status(400).json(apiError);
		}
		const { username, email } = req.body;

		const userExists = await User.findOne({ $or: [{ username }, { email }] });
		if (userExists) {
			logger.error('user already exists');
			const apiError = new ApiError({ message: 'User already exists', status: 400 })
			return res.status(400).json({
				...apiError
			})
		}

		const otp = otpGen();
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Verification code',
			html: `<h2>Your verification code is ${otp}</h2>`
		}
		try {
			await sendEmail(mailOptions);
		} catch (error) {
			logger.error(`email not sent and Error: ${error?.message}}`);
			const apiError = new ApiError({ message: `Email not sent and Error: ${error?.message}`, status: 500 })
			return res.status(500).json({
				...apiError
			})
		}
		logger.info('email sent');

		const user = new User({
			...req.body,
			verifyCode: otp
		})
		await user.save();
		logger.info('user saved');
		removeCache(req.redisClient);

		const userData = user.toObject();
		delete userData.password;
		res.status(201).json({
			message: 'User created successfully',
			user: userData
		})
	} catch (error) {
		logger.error(`Register failed: unexpected error: ${error.message}}`, {
			errorMessage: error?.message,
			stack: error?.stack,
			path: req.originalUrl,
			method: req.method,
			bodyKeys: Object.keys(req.body || {})
		})
		res.status(500).json({
			message: `Internal server error while registering user: ${error.message}}`
		})
	}
})

const loginUser = asyncHandler(async (req, res, next) => {
	try {
		const { error } = ValidateLoginData(req.body);
		if (error) {
			logger.error(error.details.map(d => d.message).join(", "));
			throw new ApiError({ message: error.details[0].message, status: 400 });
		}

		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			logger.error('user not found');
			throw new ApiError({ message: 'User not found', status: 404 });
		}

		const isPasswordCorrect = await user.comparePassword(password);
		if (!isPasswordCorrect) {
			logger.error('password is incorrect');
			throw new ApiError({ message: 'Password is incorrect', status: 401 });
		}

		const { accessToken, refreshToken } = await generateToken(user._id);
		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000
		}

		res.cookie('refreshToken', refreshToken, options);
		res.cookie('accessToken', accessToken, options);

		const userData = user.toObject();
		delete userData.password;

		logger.info('user logged in');
		removeCache(req.redisClient, `user:${user._id}`);

		res.status(200).json({
			message: 'User logged in successfully',
			user: userData,
			success: true,
			statusCode: 200,
			accessToken,
			refreshToken
		})
	} catch (error) {
		logger.error(`Login failed: unexpected error: ${error.message}`, {
			errorMessage: error?.message,
			stack: error?.stack,
			path: req.originalUrl,
			method: req.method,
			bodyKeys: Object.keys(req.body || {})
		})
		res.status(500).json({
			message: `Internal server error while logging in user: ${error.message}`
		})
	}
})

const logoutUser = asyncHandler(async (req, res) => {
	try {
		logger.info('hit logout user...');
		const userId = req.user.user_id;
		console.log(userId)
		if (!userId) {
			logger.error('user not found');
			return res.status(404).json({
				message: 'User not found'
			})
		}

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 10
		}
		
		removeCache(req.redisClient, `user:${userId}`);
		res.clearCookie('accessToken', options);
		res.clearCookie('refreshToken', options);
	
		logger.info('user logged out');

		res.status(200).json({
			message: 'User logged out successfully'
		})
	} catch (error) {
		logger.error(`Logout failed: unexpected error: ${error.message}}`)
		res.status(500).json({
			message: `Internal server error while logging out user: ${error.message}}`
		})
	}
})

const resetPassword = asyncHandler(async (req, res, next) => {
    try {
		//TODO: add password reset email
        logger.info('hit reset password...');
		const userId = req.user?.user_id;
		if (!userId) {
			logger.error('user not found');
			return res.status(404).json({
				message: 'User not found'
			})
		}
		const user = await User.findById(userId);
		if (!user) {
			logger.error('user not found');
			return res.status(404).json({
				message: 'User not found'
			})
		}
		const { newPassword } = req.body;
		user.password = newPassword;
		await user.save();
		logger.info('password reset');
		removeCache(req.redisClient);

		res.status(200).json({
			message: 'Password reset successfully'
		})

    } catch (error) {
        logger.error(`Reset password failed: unexpected error: ${error.message}}`);
        res.status(500).json({
            message: `Internal server error while resetting password: ${error.message}}`
        })
    }
});

const getProfile = asyncHandler(async (req, res, next) => {
	logger.info('hit get profile...');
	const userId = req.user?.user_id;
	if (!userId) {
		throw new ApiError({ message: 'User not found from token', status: 404 });
	}

	const userCacheKey = `user:${userId}`;
	const cachedUser = await req.redisClient.get(userCacheKey);

	if (cachedUser) {
		logger.warn('user found in cache');
		return res.status(200).json({
			message: 'User found successfully (from cache)',
			user: JSON.parse(cachedUser),
			success: true,
			statusCode: 200
		});
	}

	const user = await User.findById(userId).select('-password');
	if (!user) {
		throw new ApiError({ message: 'User not found in database', status: 404 });
	}

	const userData = user.toObject();
	logger.info('user found in db, caching...');
	await req.redisClient.set(userCacheKey, JSON.stringify(userData), 'EX', 3600);

	res.status(200).json({
		message: 'User found successfully',
		success: true,
		statusCode: 200,
		user: userData
	});
})

const updateProfile = asyncHandler(async (req, res, next) => {
	try {
		logger.info('hit update profile...');
		const userId = req.user?.user_id;
		if (!userId) {
			logger.error('user not found');
			return res.status(404).json({
				message: 'User not found'
			})
		}
		const user = await User.findById(userId);
		if (!user) {
			logger.error('user not found');
			throw new ApiError({ message: 'User not found', status: 404 })
		}
		const { username, email, fullName, password } = req.body || {};
		if (username && username !== user.username) {
			const exists = await User.findOne({ username, _id: { $ne: userId } });
			if (exists) {
				logger.error('username already in use');
				return res.status(400).json({ message: 'Username already in use' });
			}
			user.username = username;
		}
		if (email && email !== user.email) {
			const exists = await User.findOne({ email, _id: { $ne: userId } });
			if (exists) {
				logger.error('email already in use');
				return res.status(400).json({ message: 'Email already in use' });
			}
			user.email = email;
		}
		if (typeof fullName !== 'undefined') {
			user.fullName = fullName;
		}
		if (typeof password !== 'undefined' && password) {
			user.password = password;
		}
		await user.save();
		const userData = user.toObject();
		delete userData.password;
		logger.info('user updated');
		removeCache(req.redisClient);

		res.status(200).json({
			message: 'User updated successfully',
			user: userData
		})
	} catch (error) {
		logger.error(`Update profile failed: unexpected error: ${error.message}}`);
		res.status(500).json({
			message: `Internal server error while updating profile: ${error.message}}`
		})
	}
})

const getNewAccessToken = asyncHandler(async (req, res) => {
    logger.info('hit get new access token...');
    const refreshTokenFromCookie = req.cookies.refreshToken || req.headers.authorization?.split(' ')[1];

    if (!refreshTokenFromCookie) {
        throw new ApiError({ message: "Refresh token not found", status: 401 });
    }

    const nowTime = new Date();
    const tokenInDb = await RefreshToken.findOne({
        token: refreshTokenFromCookie,
        expiredAt: { $gt: nowTime }
    });
    
    if (!tokenInDb) {
        logger.warn('refresh token not found or expired in db');
        throw new ApiError({ message: "Refresh token is invalid or expired", status: 401 });
    }

    try {
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        logger.info('refresh token verified');

        const newAccessToken = jwt.sign(
            { user_id: decoded.user_id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        res.cookie('accessToken', newAccessToken, options);

        return res.status(200).json({
            accessToken: newAccessToken,
            success: true,
            statusCode: 200,
        });
    } catch (error) {
        throw new ApiError({ message: "Refresh token is invalid or expired", status: 401 });
    }
});

export {
	registerUser,
	loginUser,
	logoutUser,
    resetPassword,
	getProfile,
	updateProfile,
	getNewAccessToken
}
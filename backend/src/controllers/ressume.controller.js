import { ApiError } from "../utils/errorFormat.js";
import { Resume } from "../models/resume.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";
import { ValidateResumeData } from "../utils/validateResumeData.js";

const createResume = asyncHandler(async (req, res, next) => {
    logger.info('hit create resume...');
    const { error } = ValidateResumeData(req.body);
    if (error) {
        throw new ApiError({ message: error.details[0].message, status: 400, error });
    }

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }

    const isAlreadyExisting = await Resume.findOne({ user_id });
    if (isAlreadyExisting) {
        throw new ApiError({ message: 'Resume already exists', status: 400 });
    }

    const resume = new Resume({
        ...req.body,
        user_id,
    });

    await resume.save();
    logger.info('resume created');

    // Invalidate the cache
    const resumeCacheKey = `resume:${user_id}`;
    await req.redisClient.del(resumeCacheKey);
    logger.warn('resume cache removed');

    res.status(201).json({
        message: 'Resume created successfully',
        resume,
        success: true,
        statusCode: 201
    });
})

const getResume = asyncHandler(async (req, res, next) => {
    logger.info('hit get resume...');

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }

    const resumeCacheKey = `resume:${user_id}`;
    const cachedResume = await req.redisClient.get(resumeCacheKey);

    if (cachedResume) {
        logger.warn('resume found in cache');
        return res.status(200).json({
            message: 'Resume found successfully (from cache)',
            resume: JSON.parse(cachedResume),
            success: true,
            statusCode: 200
        });
    }

    const resume = await Resume.findOne({ user_id });
    if (!resume) {
        throw new ApiError({ message: 'Resume not found in database', status: 404 });
    }

    logger.info('resume found in db, caching...');
    await req.redisClient.set(resumeCacheKey, JSON.stringify(resume), 'EX', 3600);

    res.status(200).json({
        message: 'Resume found successfully',
        resume,
        success: true,
        statusCode: 200
    });
})

export {
    createResume,
    getResume
}
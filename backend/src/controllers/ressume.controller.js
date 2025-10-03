import { ApiError } from "../utils/errorFormat.js";
import { Resume } from "../models/resume.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";
import { ValidateResumeData } from "../utils/validateResumeData.js";

const createResume = asyncHandler(async (req, res, next) => {
    try {
        logger.info('hit create resume...');
        const { error } = ValidateResumeData(req.body);
        if (error) {
            logger.error(`error details: ${error.details}`);
            const apiError = new ApiError({
                message: error.details[0].message,
                status: 400,
                error
            });
            res.status(400).json({
                ...apiError
            });
        }

        const isAlreadyExisting = await Resume.findOne({ user_id: req.user.user_id });
        if (isAlreadyExisting) {
            logger.error('resume already exists');
            const apiError = new ApiError({
                message: 'Resume already exists',
                status: 400,
            });
            res.status(400).json({
                ...apiError
            });
        }

        const user_id = req.user.user_id;
        const { address, phone, email, achievements, objective, summary, links, social_media, interests, languages, hobbies, references, awards, certifications, projects, skills, experience, education } = req.body;
        let resume;
        try {
            resume = new Resume({
                user_id,
                address,
                phone,
                email,
                achievements,
                objective,
                summary,
                links,
                social_media,
                interests,
                languages,
                experience,
                hobbies,
                references,
                awards,
                certifications,
                projects,
                skills,
                education
            });
            const p = resume.save();
            const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('SAVE TIMEOUT')), 8000));
            await Promise.race([p, timeout]);

        } catch (error) {
            logger.error(`error: ${error.message}`);
        }

        delete resume.address;
        delete resume.phone;
        delete resume.email;

        logger.info('resume created');
        res.status(201).json({
            message: 'Resume created successfully',
            resume,
            success: true,
            statusCode: 201
        });
    } catch (error) {
        logger.error(`error: ${error.message}`);
        const apiError = new ApiError({
            message: error.message,
            status: 500,
            error
        });
        res.status(500).json({
            ...apiError
        });
    }
})

const getResume = asyncHandler(async (req, res, next) => {
    try {
        logger.info('hit get resume...');

        const user_id = req.user.user_id;
        if (!user_id) {
            const apiError = new ApiError({
                message: 'User not found',
                success: false,
                statusCode: 404,
            });
            res.status(404).json({
                ...apiError
            });
        }

        const resume = await Resume.findOne({ user_id });
        if (!resume) {
            const apiError = new ApiError({
                message: 'Resume not found',
                success: false,
                statusCode: 404,
            });
            res.status(404).json({
                ...apiError
            });
        }

        logger.info('resume found');
        res.status(200).json({
            message: 'Resume found successfully',
            resume,
            success: true,
            statusCode: 200
        })
    } catch (error) {
        logger.error(`error: ${error.message}`);
        const apiError = new ApiError({
            message: error.message,
            statusCode: 500,
            error,
            success: false,
        });
        res.status(500).json({
            ...apiError
        });
    }
})

export {
    createResume,
    getResume
}
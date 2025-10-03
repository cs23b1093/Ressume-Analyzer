import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/errorFormat.js';
import { Plan } from '../models/plan.model.js';
import { validatePlan } from '../utils/validatePlan.js';

const getPlan = asyncHandler(async (req, res, next) => {
    try {
        logger.info('hit get plans...');

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

        const plans = await Plan.find({ user_id });
        if (!plans) {
            const apiError = new ApiError({
                message: 'Plans not found',
                success: false,
                statusCode: 404
            })
            res.status(404).json({
                ...apiError
            })
        }

        logger.info('plan found');
        res.status(200).json({
            message: 'Plans found successfully',
            plans,
            success: true,
            statusCode: 200
        })
    } catch (error) {
        logger.error(`Error: ${error.message}`)
        const apiError = new ApiError({
            message: error.message,
            stack: error.stack,
            statusCode: 500,
            success: false
        })
        res.status(500).json({
            ...apiError
        })
    }
})

const createPlan = asyncHandler(async (req, res, next) => {
    try {
        logger.info('hit create plan...');

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

        const findExitingPlan = await Plan.findOne({ user_id });
        if (findExitingPlan) {
            const apiError = new ApiError({
                message: 'Plan already exists',
                success: false,
                statusCode: 400,
            });
            res.status(400).json({
                ...apiError
            })
        }

        const { error } = validatePlan(req.body);
        if (error) {
            const apiError = new ApiError({
                message: error.details[0].message,
                success: false,
                statusCode: 400,
            });
            res.status(400).json({
                ...apiError
            })
        }

        const newPlan = new Plan({
            ...req.body,
            user_id
        })
        logger.info('plan created');
        await newPlan.save();
        res.status(201).json({
            message: 'Plan created successfully',
            plan: newPlan,
            success: true,
            statusCode: 201
        })
    } catch (error) {
        logger.error(`Error: ${error.message}`)
        const apiError = new ApiError({
            message: error.message,
            stack: error.stack,
            statusCode: 500
        });
        res.status(500).json({
            ...apiError
        });
    }
})

const updatePlan = asyncHandler(async (req, res, next) => {
    try {
        logger.info('hit update plan...');

        const user_id = req.user.user_id;
        if (!user_id) {
            const apiError = new ApiError({
                message: 'User not found',
                success: false,
                statusCode: 404,
            });
            return res.status(404).json({
                ...apiError
            });
        }

        const existing = await Plan.findOne({ user_id });
        if (!existing) {
            const apiError = new ApiError({
                message: 'Plan not found',
                success: false,
                statusCode: 404,
            });
            return res.status(404).json({
                ...apiError
            });
        }

        const { error } = validatePlan(req.body);
        if (error) {
            const apiError = new ApiError({
                message: error.details[0].message,
                success: false,
                statusCode: 400,
            });
            return res.status(400).json({
                ...apiError
            });
        }

        const updates = { ...req.body };
        const now = new Date();

        // handle free trial updates
        if (typeof updates.isFreeTrial === 'boolean') {
            if (updates.isFreeTrial && typeof updates.freeTrialDays === 'number') {
                const expiry = new Date(now);
                expiry.setDate(expiry.getDate() + updates.freeTrialDays);
                updates.freeTrialExpiry = expiry;
                updates.remainingDays = updates.freeTrialDays;
            }
            if (!updates.isFreeTrial) {
                updates.freeTrialExpiry = null;
            }
        }

        // recompute remainingDays from planExpiry if provided
        if (updates.planExpiry) {
            const expiry = new Date(updates.planExpiry);
            const diffMs = expiry.getTime() - now.getTime();
            const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            updates.remainingDays = days;
        }

        updates.updatedAt = now;

        const updatedPlan = await Plan.findOneAndUpdate(
            { user_id },
            { $set: updates },
            { new: true }
        );

        logger.info('plan updated');
        return res.status(200).json({
            message: 'Plan updated successfully',
            plan: updatedPlan,
            success: true,
            statusCode: 200
        });
    } catch (error) {
        logger.error(`Error: ${error.message}`)
        const apiError = new ApiError({
            message: error.message,
            stack: error.stack,
            statusCode: 500,
            success: false
        })
        return res.status(500).json({
            ...apiError
        })
    }
})

export { 
    getPlan,
    createPlan,
    updatePlan 
};
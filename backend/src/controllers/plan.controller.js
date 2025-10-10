import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/errorFormat.js';
import { Plan } from '../models/plan.model.js';
import { validatePlan } from '../utils/validatePlan.js';

const getPlan = asyncHandler(async (req, res, next) => {
    logger.info('hit get plans...');

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }

    const planCacheKey = `plan:${user_id}`;
    const cachedPlan = await req.redisClient.get(planCacheKey);

    if (cachedPlan) {
        logger.warn('plan found in cache');
        return res.status(200).json({
            message: 'Plan found successfully (from cache)',
            plan: JSON.parse(cachedPlan),
            success: true,
            statusCode: 200
        });
    }

    const plan = await Plan.findOne({ user_id });
    if (!plan) {
        throw new ApiError({ message: 'Plan not found in database', status: 404 });
    }

    logger.info('plan found in db, caching...');
    await req.redisClient.set(planCacheKey, JSON.stringify(plan), 'EX', 3600);

    res.status(200).json({
        message: 'Plan found successfully',
        plan,
        success: true,
        statusCode: 200
    });
})

const createPlan = asyncHandler(async (req, res, next) => {
    logger.info('hit create plan...');

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }

    const findExitingPlan = await Plan.findOne({ user_id });
    if (findExitingPlan) {
        throw new ApiError({ message: 'Plan already exists', status: 400 });
    }

    const { error } = validatePlan(req.body);
    if (error) {
        throw new ApiError({ message: error.details[0].message, status: 400 });
    }

    const newPlan = new Plan({
        ...req.body,
        user_id
    })

    await newPlan.save();

    // Invalidate the cache
    const planCacheKey = `plan:${user_id}`;
    await req.redisClient.del(planCacheKey);
    logger.warn('plan cache removed after creation');
    logger.info('plan created');

    res.status(201).json({
        message: 'Plan created successfully',
        plan: newPlan,
        success: true,
        statusCode: 201
    });
})

const updatePlan = asyncHandler(async (req, res, next) => {
    logger.info('hit update plan...');

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }

    const existing = await Plan.findOne({ user_id });
    if (!existing) {
        throw new ApiError({ message: 'Plan not found', status: 404 });
    }

    const { error } = validatePlan(req.body);
    if (error) {
        throw new ApiError({ message: error.details[0].message, status: 400 });
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

    // Invalidate the cache
    const planCacheKey = `plan:${user_id}`;
    await req.redisClient.del(planCacheKey);
    logger.warn('plan cache removed');

    logger.info('plan updated');
    return res.status(200).json({
        message: 'Plan updated successfully',
        plan: updatedPlan,
        success: true,
        statusCode: 200
    });
})

const deletePlan = asyncHandler(async (req, res, next) => {
    logger.info('hit delete plan...');

    const user_id = req.user.user_id;
    if (!user_id) {
        throw new ApiError({ message: 'User not found from token', status: 404 });
    }

    const deletedPlan = await Plan.findOneAndDelete({ user_id });

    if (!deletedPlan) {
        throw new ApiError({ message: 'Plan not found to delete', status: 404 });
    }

    const planCacheKey = `plan:${user_id}`;
    await req.redisClient.del(planCacheKey);
    logger.warn('plan cache removed after deletion');

    res.status(200).json({ message: 'Plan deleted successfully', success: true, statusCode: 200 });
});

export { 
    getPlan,
    createPlan,
    updatePlan 
};
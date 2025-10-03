import Joi from "joi";

// validation schema for plan updates/creation
const validatePlan = (data) => {
    const schema = Joi.object({
        plan: Joi.string().valid('free', 'pro'),
        isFreeTrial: Joi.boolean(),
        freeTrialDays: Joi.number().integer().min(0).allow(null),
        freeTrialExpiry: Joi.date().allow(null),
        planExpiry: Joi.date().allow(null),
        remainingDays: Joi.number().integer().min(0).allow(null),
        maxUsers: Joi.number().integer().min(1).allow(null),
        paymentDetails: Joi.string().hex().length(24).allow(null),
        status: Joi.string().valid('active', 'inactive')
    });
    return schema.validate(data, { abortEarly: false });
};

export { validatePlan };
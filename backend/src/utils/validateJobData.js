import Joi from 'joi';

export const validateJobData = (data) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        company_name: Joi.string().required(),
        company_details: Joi.string().required(),
        location: Joi.string().required(),
    });
    return schema.validate(data);
};
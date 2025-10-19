import Joi from 'joi';

export const validateJobData = (data) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        company_name: Joi.string().required(),
        company_details: Joi.string().required(),
        location: Joi.string().required(),
        salary: Joi.number().optional(),
        experience: Joi.number().optional(),
        skills: Joi.array().items(Joi.string()).optional(),
        applications: Joi.number().optional(),
        job_adder: Joi.string().optional(),
    });
    return schema.validate(data);
};

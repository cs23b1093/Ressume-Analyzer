import Joi from "joi";

const ValidateResumeData = (data) => {
    const schema = Joi.object({
        address: Joi.string()
            .min(10)
            .max(200)
            .required()
            .messages({
                "string.empty": "Address is required",
                "string.min": "Address must be at least 10 characters long",
                "string.max": "Address must be at most 200 characters long"
            }),

        phone: Joi.string()
            .pattern(/^[\+]?[1-9][\d]{0,15}$/)
            .min(10)
            .max(15)
            .required()
            .messages({
                "string.empty": "Phone number is required",
                "string.pattern.base": "Invalid phone number format",
                "string.min": "Phone number must be at least 10 digits",
                "string.max": "Phone number must be at most 15 digits"
            }),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } })
            .required()
            .messages({
                "string.empty": "Email is required",
                "string.email": "Invalid email format"
            }),

        education: Joi.string()
            .min(10)
            .max(1000)
            .required()
            .messages({
                "string.empty": "Education information is required",
                "string.min": "Education information must be at least 10 characters long",
                "string.max": "Education information must be at most 1000 characters long"
            }),

        experience: Joi.string()
            .min(20)
            .max(2000)
            .messages({
                "string.min": "Experience information must be at least 20 characters long",
                "string.max": "Experience information must be at most 2000 characters long"
            }),

        skills: Joi.array()
            .items(Joi.string().min(2).max(50))
            .min(1)
            .max(20)
            .messages({
                "array.min": "At least one skill is required",
                "array.max": "Maximum 20 skills allowed",
                "string.min": "Each skill must be at least 2 characters long",
                "string.max": "Each skill must be at most 50 characters long"
            }),

        projects: Joi.array()
            .items(Joi.string().min(10).max(200))
            .min(1)
            .max(10)
            .messages({
                "array.min": "At least one project is required",
                "array.max": "Maximum 10 projects allowed",
                "string.min": "Each project description must be at least 10 characters long",
                "string.max": "Each project description must be at most 200 characters long"
            }),

        certifications: Joi.array()
            .items(Joi.string().min(5).max(100))
            .min(1)
            .max(15)
            .messages({
                "array.min": "At least one certification is required",
                "array.max": "Maximum 15 certifications allowed",
                "string.min": "Each certification must be at least 5 characters long",
                "string.max": "Each certification must be at most 100 characters long"
            }),

        awards: Joi.array()
            .items(Joi.string().min(5).max(100))
            .min(1)
            .max(10)
            .messages({
                "array.min": "At least one award is required",
                "array.max": "Maximum 10 awards allowed",
                "string.min": "Each award must be at least 5 characters long",
                "string.max": "Each award must be at most 100 characters long"
            }),

        references: Joi.array()
            .items(Joi.string().min(10).max(150))
            .min(1)
            .max(5)
            .required()
            .messages({
                "array.empty": "References are required",
                "array.min": "At least one reference is required",
                "array.max": "Maximum 5 references allowed",
                "string.min": "Each reference must be at least 10 characters long",
                "string.max": "Each reference must be at most 150 characters long"
            }),

        hobbies: Joi.array()
            .items(Joi.string().min(3).max(50))
            .min(1)
            .max(10)
            .messages({
                "array.min": "At least one hobby is required",
                "array.max": "Maximum 10 hobbies allowed",
                "string.min": "Each hobby must be at least 3 characters long",
                "string.max": "Each hobby must be at most 50 characters long"
            }),

        languages: Joi.array()
            .items(Joi.string().min(2).max(30))
            .min(1)
            .max(10)
            .required()
            .messages({
                "array.empty": "Languages are required",
                "array.min": "At least one language is required",
                "array.max": "Maximum 10 languages allowed",
                "string.min": "Each language must be at least 2 characters long",
                "string.max": "Each language must be at most 30 characters long"
            }),

        interests: Joi.array()
            .items(Joi.string().min(3).max(50))
            .min(1)
            .max(10)
            .messages({
                "array.min": "At least one interest is required",
                "array.max": "Maximum 10 interests allowed",
                "string.min": "Each interest must be at least 3 characters long",
                "string.max": "Each interest must be at most 50 characters long"
            }),

        social_media: Joi.array()
            .items(Joi.string().uri())
            .min(1)
            .max(5)
            .required()
            .messages({
                "array.empty": "Social media links are required",
                "array.min": "At least one social media link is required",
                "array.max": "Maximum 5 social media links allowed",
                "string.uri": "Each social media link must be a valid URL"
            }),

        links: Joi.array()
            .items(Joi.string().uri())
            .min(1)
            .max(5)
            .required()
            .messages({
                "array.empty": "Links are required",
                "array.min": "At least one link is required",
                "array.max": "Maximum 5 links allowed",
                "string.uri": "Each link must be a valid URL"
            }),

        summary: Joi.string()
            .min(50)
            .max(500)
            .messages({
                "string.min": "Summary must be at least 50 characters long",
                "string.max": "Summary must be at most 500 characters long"
            }),

        objective: Joi.string()
            .min(30)
            .max(300)
            .required()
            .messages({
                "string.empty": "Objective is required",
                "string.min": "Objective must be at least 30 characters long",
                "string.max": "Objective must be at most 300 characters long"
            }),

        achievements: Joi.array()
            .items(Joi.string().min(10).max(150))
            .min(1)
            .max(10)
            .messages({
                "array.min": "At least one achievement is required",
                "array.max": "Maximum 10 achievements allowed",
                "string.min": "Each achievement must be at least 10 characters long",
                "string.max": "Each achievement must be at most 150 characters long"
            })
    });

    return schema.validate(data, { abortEarly: false });
};

export { ValidateResumeData };
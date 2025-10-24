import joi from 'joi';

const ValidateNewUserData = (data) => {
    const schema = joi.object({
         username: joi.string()
                     .min(3)
                     .max(15)
                     .regex(/^[a-zA-Z0-9_]+$/)
                     .required()
                     .messages({
                        "string.empty": "Username is required",
                        "string.min": "Username must be at least 3 characters long",
                        "string.max": "Username must be at most 15 characters long",
                        "string.pattern.base": "Username must contain only letters, numbers, and underscores"
                     }),

        email: joi.string()
                  .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
                  .required()
                  .messages({
                    "string.empty": "Email is required",
                    "string.email": "Invalid email format"
                  }),

        password: joi.string()
                     .min(8)
                     .max(64)
                     .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
                     .required()
                     .messages({
                        "string.empty": "Password is required",
                        "string.min": "Password must be at least 8 characters long",
                        "string.max": "Password must be at most 64 characters long",
                        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                     }),

        fullName: joi.string()
                     .min(3)
                     .max(50)
                     .required()
                     .messages({
                        "string.empty": "Full name is required",
                        "string.min": "Full name must be at least 3 characters long",
                        "string.max": "Full name must be at most 50 characters long"
                     }),
                     
        role: joi.string()
                 .valid('admin', 'user')
                 .optional()
                 .messages({
                    "any.only": "Role must be either 'admin' or 'user'"
                 }),
    });
    return schema.validate(data, { abortEarly: false });
}

const ValidateLoginData = (data) => {
   const schema = joi.object({
       username: joi.string()
           .min(3)
           .max(15)
           .regex(/^[a-zA-Z0-9_]+$/)
           .required()
           .messages({
               "string.empty": "Username is required",
               "string.min": "Username must be at least 3 characters long",
               "string.max": "Username must be at most 15 characters long",
               "string.pattern.base": "Username must contain only letters, numbers, and underscores"
           }),
       password: joi.string()
           .required()
           .messages({
               "string.empty": "Password is required",
           }),
   });
   return schema.validate(data, { abortEarly: false });
};

export {
    ValidateNewUserData,
    ValidateLoginData
}
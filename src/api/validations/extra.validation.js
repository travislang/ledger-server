const { Joi } = require('celebrate')

module.exports = {
    // POST /v1/extra/feedback
    feedback: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            name: Joi.string()
                .min(3)
                .max(128)
                .required(),
            message: Joi.string()
                .min(10)
                .max(1000)
                .required(),
        }),
    },
}

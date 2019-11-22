const { Joi } = require('celebrate')

module.exports = {
    // POST /v1/auth/register
    register: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .required()
                .min(6)
                .max(128),
            name: Joi.string().max(128),
        }),
    },

    // POST /v1/auth/login
    login: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .required()
                .max(128),
        }).unknown(),
    },

    // POST /v1/auth/facebook
    // POST /v1/auth/google
    oAuth: {
        body: Joi.object({
            access_token: Joi.string().required(),
        }).unknown(),
    },

    // POST /v1/auth/refresh
    refresh: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            refreshToken: Joi.string().required(),
        }),
    },

    // POST /v1/auth/send-password-reset
    sendPasswordReset: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
        }).unknown(),
    },

    // POST /v1/auth/reset-password
    resetPassword: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .required()
                .min(6)
                .max(128),
            resetToken: Joi.string().required(),
        }),
    },
}

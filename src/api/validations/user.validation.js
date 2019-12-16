const { Joi } = require('celebrate')
const { roleTypes } = require('../../config/accessControl')

module.exports = {
    // GET /v1/users
    listUsers: {
        query: Joi.object({
            page: Joi.number().min(1),
            perPage: Joi.number()
                .min(1)
                .max(100),
            name: Joi.string(),
            email: Joi.string().email(),
        }),
    },

    // POST /v1/users
    createUser: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .min(6)
                .max(128)
                .required(),
            name: Joi.string()
                .min(1)
                .max(128),
            role: Joi.string().valid(roleTypes.FREE, roleTypes.PAID, roleTypes.ADMIN),
        }),
    },

    // PATCH /v1/users/:userId
    updateUser: {
        body: Joi.object({
            email: Joi.string().email(),
            password: Joi.string()
                .min(6)
                .max(128),
            name: Joi.string().max(128),
            role: Joi.string().valid(roleTypes.FREE, roleTypes.PAID, roleTypes.ADMIN),
        }),
        params: Joi.object({
            userId: Joi.string()
                .regex(/^[a-fA-F0-9]{24}$/)
                .required(),
        }),
    },
    // PATCH /v1/users/profile
    updateCurrentUser: {
        body: Joi.object({
            email: Joi.string().email(),
            password: Joi.string()
                .min(6)
                .max(128),
            name: Joi.string().max(128),
            gender: Joi.string().valid('male', 'female'),
            age: Joi.number()
                .min(1)
                .max(99)
                .allow(null),
            height: Joi.number().allow(null),
            weight: Joi.number().allow(null),
            role: Joi.string().valid(roleTypes.FREE, roleTypes.PAID, roleTypes.ADMIN),
        }),
    },
}

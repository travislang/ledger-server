const { Joi } = require('celebrate')
const { roleTypes } = require('../../config/accessControl')

module.exports = {
    // POST /v1/workouts
    addWorkout: {
        body: Joi.object({
            name: Joi.string()
                .min(1)
                .max(50)
                .required(),
            exercises: Joi.array().items(
                Joi.object({
                    id: Joi.string(),
                    name: Joi.string().required(),
                    type: Joi.string().required(),
                    sets: Joi.array().items(
                        Joi.object({
                            id: Joi.string(),
                            _id: Joi.string(),
                            reps: Joi.number()
                                .min(0)
                                .max(99)
                                .required(),
                            weight: Joi.number()
                                .min(0)
                                .max(999)
                                .required(),
                        }).required(),
                    ),
                }).required(),
            ),
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

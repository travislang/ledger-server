const { Joi } = require('celebrate')
const { roleTypes } = require('../../config/accessControl')

module.exports = {
    // GET /v1/workouts
    listWorkouts: {
        query: Joi.object().keys({
            limit: Joi.number()
                .min(1)
                .max(999),
        }),
    },
    // POST /v1/workouts
    addWorkout: {
        body: Joi.object().keys({
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
    // DELETE /v1/workouts
    deleteWorkout: {
        body: Joi.object().keys({
            workoutId: Joi.string()
                .regex(/^[a-fA-F0-9]{24}$/)
                .required(),
        }),
    },
}

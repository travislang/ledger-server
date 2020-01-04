const { Joi } = require('celebrate')

module.exports = {
    // GET /v1/workouts
    listWorkouts: {
        query: Joi.object().keys({
            limit: Joi.number()
                .min(1)
                .max(999),
        }),
    },
    // POST /v1/log/workout
    addWorkoutLog: {
        body: Joi.object({
            startTime: Joi.date().required(),
            endTime: Joi.date().required(),
            workoutId: Joi.string()
                .regex(/^[a-fA-F0-9]{24}$/)
                .required(),
            exercises: Joi.object().unknown(),
        }),
    },
    // POST /v1/log/weight
    addWeightLog: {
        body: Joi.object({
            weight: Joi.number().required(),
        }),
    },
}

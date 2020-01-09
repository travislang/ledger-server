const { Joi } = require('celebrate')

module.exports = {
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
    // GET /v1/log/workouts
    listWorkoutLogs: {
        query: Joi.object().keys({
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
        }),
    },
    // GET /v1/log/weight
    listWeightLogs: {
        query: Joi.object().keys({
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
        }),
    },
    // POST /v1/log/weight
    addWeightLog: {
        body: Joi.object({
            weight: Joi.number().required(),
            date: Joi.date(),
        }),
    },
    // PATCH /v1/log/weight
    updateWeightLog: {
        body: Joi.object({
            weight: Joi.number().required(),
            id: Joi.string()
                .regex(/^[a-fA-F0-9]{24}$/)
                .required(),
        }),
    },
}

const httpStatus = require('http-status')
const Workout = require('../models/workout.model')
const WorkoutLog = require('../models/workoutLog.model')

exports.addWorkoutLog = async (req, res, next) => {
    try {
        const workout = await Workout.get(req.body.workoutId)

        if (workout.userId.toString() !== req.user.id) res.status(httpStatus.UNAUTHORIZED).end()

        const workoutObj = {
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            workoutId: req.body.workoutId,
            exercises: Object.keys(req.body.exercises).map(key => {
                return {
                    exerciseId: key,
                    sets: req.body.exercises[key].map(set => {
                        return {
                            setId: set.id,
                            reps: set.reps,
                            weight: set.weight,
                        }
                    }),
                }
            }),
        }

        const workoutLog = new WorkoutLog(workoutObj)

        const savedWorkoutLog = await workoutLog.save()
        console.log('saved log', savedWorkoutLog)
        res.status(httpStatus.OK).end()
        // res.json(savedWorkout.transform())
    } catch (err) {
        next(err)
    }
}

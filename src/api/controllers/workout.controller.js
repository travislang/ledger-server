const httpStatus = require('http-status')
const Workout = require('../models/workout.model')

exports.listWorkouts = async (req, res, next) => {
    try {
        const limit = req.query.limit || 200
        const workouts = await Workout.list(req.user.id, limit)

        const transformedWorkouts = workouts.map(workout => workout.transform())

        res.status(httpStatus.OK)
        res.json(transformedWorkouts)
    } catch (err) {
        next(err)
    }
}

exports.addWorkout = async (req, res, next) => {
    const mergedObj = Object.assign(req.body, { userId: req.user.id })
    try {
        const workout = new Workout(mergedObj)

        const savedWorkout = await workout.save()

        res.status(httpStatus.CREATED)
        res.json(savedWorkout.transform())
    } catch (err) {
        next(err)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const { workoutId } = req.body
        const workout = await Workout.findById(workoutId)

        if (workout.userId.toString() === req.user.id) {
            console.log('does match')
            await Workout.findByIdAndDelete(workoutId)
            res.status(httpStatus.NO_CONTENT).end()
        } else {
            console.log('does not match')
            res.status(httpStatus.UNAUTHORIZED).end()
        }
    } catch (err) {
        next(err)
    }
}

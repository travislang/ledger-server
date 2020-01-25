const httpStatus = require('http-status')
const Workout = require('../models/workout.model')

exports.load = async (req, res, next, id) => {
    try {
        const workout = await Workout.get(id)
        req.locals = { workout }
        return next()
    } catch (error) {
        return next(error)
    }
}

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
            await Workout.findByIdAndDelete(workoutId)
            res.status(httpStatus.NO_CONTENT).end()
        } else {
            res.status(httpStatus.UNAUTHORIZED).json(
                'you do not have permission to delete this workout',
            )
        }
    } catch (err) {
        next(err)
    }
}

exports.updateWorkout = async (req, res, next) => {
    try {
        const { workout } = req.locals

        if (workout.userId.toString() === req.user.id) {
            const { name, exercises } = req.body

            workout.name = name

            workout.exercises.forEach(exerciseObj => {
                const newExercise = exercises.find(newExer => newExer.id === exerciseObj.id)
                if (newExercise) {
                    exerciseObj.sets.forEach(setObj => {
                        const newSet = newExercise.sets.find(newS => newS.id === setObj.id)
                        if (newSet) {
                            setObj.reps = newSet.reps
                            setObj.weight = newSet.weight
                        } else {
                            exerciseObj.sets.id(setObj.id).remove()
                        }
                    })
                    newExercise.sets.forEach(newSetObj => {
                        if (!newSetObj.id) {
                            exerciseObj.sets.push(newSetObj)
                        }
                    })
                } else {
                    workout.exercises.id(exerciseObj.id).remove()
                }
            })

            exercises.forEach((newExerciseObj, i) => {
                const oldExerciseObj = workout.exercises.id(newExerciseObj.id)
                if (!oldExerciseObj) {
                    workout.exercises.push(newExerciseObj)
                    // workout.exercises.push({
                    //     $each: [newExerciseObj],
                    //     $position: i,
                    // })
                }
            })

            const updatedWorkout = await workout.save()
            res.status(httpStatus.OK).json(updatedWorkout.transform())
        } else {
            res.status(httpStatus.UNAUTHORIZED).end()
        }
    } catch (err) {
        next(err)
    }
}

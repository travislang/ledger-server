const httpStatus = require('http-status')
const moment = require('moment')

const Workout = require('../models/workout.model')
const WorkoutLog = require('../models/workoutLog.model')
const WeightLog = require('../models/weightLog.model')

exports.listWorkoutLogs = async (req, res, next) => {
    try {
        const { startDate, endDate, workoutId } = req.query

        const newStartDate = moment(startDate)
            .startOf('day')
            .toDate()
        const newEndDate = moment(endDate)
            .endOf('day')
            .toDate()

        const workoutLogs = await WorkoutLog.find({ userId: req.user.id, workoutId })
            .where('date')
            .gte(newStartDate)
            .lte(newEndDate)

        const transformedLogs = workoutLogs.map(log => {
            const transformedLog = log.transform()
            transformedLog.duration = moment(transformedLog.endTime).diff(
                moment(transformedLog.startTime),
            )
            return transformedLog
        })

        res.status(httpStatus.OK)
        res.json(transformedLogs)
    } catch (err) {
        next(err)
    }
}

exports.addWorkoutLog = async (req, res, next) => {
    try {
        const workout = await Workout.get(req.body.workoutId)

        if (workout.userId.toString() !== req.user.id) res.status(httpStatus.UNAUTHORIZED).end()

        Object.keys(req.body.exercises).forEach(exerciseId => {
            req.body.exercises[exerciseId].forEach(setLogObj => {
                const workoutExercise = workout.exercises.find(
                    exerciseObj => exerciseObj.id === exerciseId,
                )
                const exerciseSet = workoutExercise.sets.find(setObj => setObj.id === setLogObj.id)

                if (exerciseSet) {
                    if (setLogObj.reps) exerciseSet.reps = setLogObj.reps
                    if (setLogObj.weight) exerciseSet.weight = setLogObj.weight
                } else {
                    workoutExercise.sets.push({
                        reps: setLogObj.reps,
                        weight: setLogObj.weight,
                    })
                    setLogObj.id = workoutExercise.sets[workoutExercise.sets.length - 1].id
                }
            })
        })

        workout.exercises.forEach(exerciseObj => {
            const exerciseLog = req.body.exercises[exerciseObj.id]
            exerciseObj.sets = exerciseObj.sets.filter(setObj => {
                const exerciseLogSet = exerciseLog.find(logSet => logSet.id === setObj.id)
                if (exerciseLogSet) return true
                return false
            })
        })

        await workout.save()

        const workoutObj = {
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            averageRestTime: req.body.averageRestTime,
            workoutId: req.body.workoutId,
            userId: req.user.id,
            exercises: Object.keys(req.body.exercises).map(key => {
                const workoutExercise = workout.exercises.find(exer => exer.id === key)
                return {
                    exerciseId: key,
                    muscleType: workoutExercise ? workoutExercise.type : null,
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
        res.status(httpStatus.CREATED)
        res.json(savedWorkoutLog.transform())
    } catch (err) {
        next(err)
    }
}

exports.listAllWorkoutLogs = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query

        const newStartDate = moment(startDate)
            .startOf('day')
            .toDate()
        const newEndDate = moment(endDate)
            .endOf('day')
            .toDate()

        const workoutLogs = await WorkoutLog.find({ userId: req.user.id })
            .where('date')
            .gte(newStartDate)
            .lte(newEndDate)

        const transformedLogs = workoutLogs.map(log => {
            const transformedLog = log.transform()
            transformedLog.duration = moment(transformedLog.endTime).diff(
                moment(transformedLog.startTime),
            )
            return transformedLog
        })

        res.status(httpStatus.OK)
        res.json(transformedLogs)
    } catch (err) {
        next(err)
    }
}

exports.listAllWorkoutTotals = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query

        const newStartDate = moment(startDate)
            .startOf('day')
            .toDate()
        const newEndDate = moment(endDate)
            .endOf('day')
            .toDate()

        const workoutLogs = await WorkoutLog.find({ userId: req.user.id })
            .where('date')
            .gte(newStartDate)
            .lte(newEndDate)

        res.status(httpStatus.OK)
        res.json({ totalWorkouts: workoutLogs.length })
    } catch (err) {
        next(err)
    }
}

exports.listWeightLog = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query

        const newStartDate = moment(startDate)
            .startOf('day')
            .toDate()
        const newEndDate = moment(endDate)
            .endOf('day')
            .toDate()

        const weightLogs = await WeightLog.find({ userId: req.user.id })
            .where('date')
            .gte(newStartDate)
            .lte(newEndDate)

        const transformedLogs = weightLogs.map(log => log.transform())

        res.status(httpStatus.OK)
        res.json(transformedLogs)
    } catch (err) {
        next(err)
    }
}

exports.addWeightLog = async (req, res, next) => {
    try {
        const weightLogEntry = new WeightLog({
            weight: req.body.weight,
            userId: req.user.id,
            date: req.body.date || Date.now(),
        })

        const updatedWeightLog = await weightLogEntry.save()
        res.status(httpStatus.CREATED).json(updatedWeightLog.transform())
    } catch (err) {
        next(err)
    }
}

exports.updateWeightLog = async (req, res, next) => {
    try {
        const weightLogEntry = await WeightLog.findById(req.body.id)

        if (weightLogEntry.userId.toString() !== req.user.id)
            res.status(httpStatus.UNAUTHORIZED).end()

        weightLogEntry.weight = req.body.weight

        const savedWeightLog = await weightLogEntry.save()

        res.status(httpStatus.OK)
        res.json(savedWeightLog.transform())
    } catch (err) {
        next(err)
    }
}
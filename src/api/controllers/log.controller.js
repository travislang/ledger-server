const httpStatus = require('http-status')
const moment = require('moment')

const Workout = require('../models/workout.model')
const WorkoutLog = require('../models/workoutLog.model')
const WeightLog = require('../models/weightLog.model')

exports.listWorkoutLogs = async (req, res, next) => {
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

        console.log('this is the workout logs', workoutLogs)

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

        const workoutObj = {
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            workoutId: req.body.workoutId,
            userId: req.user.id,
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

exports.listWeightLog = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query

        const newStartDate = moment(startDate)
            .startOf('day')
            .toDate()
        const newEndDate = moment(endDate)
            .endOf('day')
            .toDate()

        const WeightLogs = await WeightLog.find({ userId: req.user.id })
            .where('date')
            .gte(newStartDate)
            .lte(newEndDate)

        const transformedLogs = WeightLogs.map(log => log.transform())

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

        const savedweightLog = await weightLogEntry.save()
        console.log('saved weight log', savedweightLog)
        res.status(httpStatus.CREATED).end()
        // res.json(savedWorkout.transform())
    } catch (err) {
        next(err)
    }
}

exports.updateWeightLog = async (req, res, next) => {
    try {
        console.log('in update')
        const weightLogEntry = await WeightLog.findById(req.body.id)

        if (weightLogEntry.userId.toString() !== req.user.id)
            res.status(httpStatus.UNAUTHORIZED).end()

        weightLogEntry.weight = req.body.weight

        const savedweightLog = await weightLogEntry.save()

        console.log('saved weight log', savedweightLog.transform())
        res.status(httpStatus.OK)
        res.json(savedweightLog.transform())
    } catch (err) {
        next(err)
    }
}

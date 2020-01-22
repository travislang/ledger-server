const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/log.controller')
const { authorize, authenticate } = require('../../middlewares/auth')
const { roleTypes } = require('../../../config/accessControl')
const {
    addWorkoutLog,
    addWeightLog,
    listWeightLogs,
    listWorkoutLogs,
    listAllWorkoutLogs,
    listAllWorkoutTotals,
    updateWeightLog,
    workoutStreak,
} = require('../../validations/log.validation')

const router = express.Router()

router
    .route('/workout')
    .all(authenticate())
    .get(celebrate(listWorkoutLogs), controller.listWorkoutLogs)
    .post(celebrate(addWorkoutLog), controller.addWorkoutLog)

router
    .route('/workouts/total')
    .all(authenticate())
    .get(celebrate(listAllWorkoutTotals), controller.listAllWorkoutTotals)

router
    .route('/workouts/streak')
    .all(authenticate())
    .get(celebrate(workoutStreak), controller.workoutStreak)

router
    .route('/workouts')
    .all(authenticate())
    .get(celebrate(listAllWorkoutLogs), controller.listAllWorkoutLogs)

router
    .route('/weight')
    .all(authenticate())
    .get(celebrate(listWeightLogs), controller.listWeightLog)
    .post(celebrate(addWeightLog), controller.addWeightLog)
    .patch(celebrate(updateWeightLog), controller.updateWeightLog)

module.exports = router

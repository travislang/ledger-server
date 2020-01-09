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
    updateWeightLog,
} = require('../../validations/log.validation')

const router = express.Router()

router
    .route('/workout')
    .all(authenticate())
    .post(celebrate(addWorkoutLog), controller.addWorkoutLog)

router
    .route('/workouts')
    .all(authenticate())
    .get(celebrate(listWorkoutLogs), controller.listWorkoutLogs)

router
    .route('/weight')
    .all(authenticate())
    .get(celebrate(listWeightLogs), controller.listWeightLog)
    .post(celebrate(addWeightLog), controller.addWeightLog)
    .patch(celebrate(updateWeightLog), controller.updateWeightLog)

module.exports = router

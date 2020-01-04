const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/log.controller')
const { authorize, authenticate } = require('../../middlewares/auth')
const { roleTypes } = require('../../../config/accessControl')
const { addWorkoutLog } = require('../../validations/log.validation')

const router = express.Router()

router
    .route('/workout')
    .all(authenticate())
    .post(celebrate(addWorkoutLog), controller.addWorkoutLog)

module.exports = router

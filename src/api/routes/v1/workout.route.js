const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/workout.controller')
const { authorize, authenticate } = require('../../middlewares/auth')
const { roleTypes } = require('../../../config/accessControl')
const { addWorkout } = require('../../validations/workout.validation')

const router = express.Router()

router
    .route('/')
    .all(authenticate())
    // .get(celebrate(listUsers), controller.list)
    .post(celebrate(addWorkout), controller.addWorkout)

module.exports = router

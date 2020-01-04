const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/workout.controller')
const { authorize, authenticate } = require('../../middlewares/auth')
const { roleTypes } = require('../../../config/accessControl')
const { listWorkouts, addWorkout, deleteWorkout } = require('../../validations/workout.validation')

const router = express.Router()

router
    .route('/')
    .all(authenticate())
    .get(celebrate(listWorkouts), controller.listWorkouts)
    .post(celebrate(addWorkout), controller.addWorkout)
    .delete(celebrate(deleteWorkout), controller.remove)

module.exports = router

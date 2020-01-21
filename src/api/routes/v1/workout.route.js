const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/workout.controller')
const { authorize, authenticate } = require('../../middlewares/auth')
const { roleTypes } = require('../../../config/accessControl')
const {
    listWorkouts,
    addWorkout,
    deleteWorkout,
    updateWorkout,
} = require('../../validations/workout.validation')

const router = express.Router()

router.param('workoutId', controller.load)

router
    .route('/')
    .all(authenticate())
    .get(celebrate(listWorkouts), controller.listWorkouts)
    .post(celebrate(addWorkout), controller.addWorkout)
    .delete(celebrate(deleteWorkout), controller.remove)

router
    .route('/:workoutId')
    .all(authenticate())
    .patch(celebrate(updateWorkout), controller.updateWorkout)

module.exports = router

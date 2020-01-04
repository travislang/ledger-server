const express = require('express')

const authRoutes = require('./auth.route')
const userRoutes = require('./user.route')
const workoutRoutes = require('./workout.route')
const logRoutes = require('./log.route')

const router = express.Router()

router.get('/status', (req, res) => res.status(200).send('OK'))

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/workouts', workoutRoutes)
router.use('/log', logRoutes)

module.exports = router

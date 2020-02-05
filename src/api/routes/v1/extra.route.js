const express = require('express')
const { celebrate } = require('celebrate')
const { authenticate } = require('../../middlewares/auth')
const controller = require('../../controllers/extra.controller')
const { feedback } = require('../../validations/extra.validation')

const rateLimit = require('express-rate-limit')

const feedbackLimiter = rateLimit({
    windowMs: 60 * 60 * 24000, // 24 hour window
    max: 3, // start blocking after 5 requests
    message: 'Too many feedback forms submitted',
})

const router = express.Router()

router
    .route('/feedback')
    .all(authenticate())
    .post(celebrate(feedback), feedbackLimiter, controller.feedback)

module.exports = router

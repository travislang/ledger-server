const express = require('express')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../config/keys')
const rateLimit = require('express-rate-limit')

const contactUsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 3, // start blocking after 5 requests
    message: 'Too many forms submitted from this IP, please try again after an hour',
})

const router = express.Router()

const transporter = nodemailer.createTransport({
    port: emailConfig.port,
    host: emailConfig.host,
    auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
    },
    secure: false, // upgrades later with STARTTLS
})

router.route('/contact').post(contactUsLimiter, async (req, res) => {
    const mailOpts = {
        from: req.body.email,
        to: emailConfig.username,
        subject: 'New message from contact form at ledger-app.com',
        text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`,
    }

    transporter.sendMail(mailOpts, error => {
        if (error) {
            console.log('error', error)
            res.redirect('/contact/error.html')
        } else {
            res.redirect('/contact/thank-you.html')
        }
    })
})

module.exports = router

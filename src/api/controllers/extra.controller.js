const httpStatus = require('http-status')

const nodemailer = require('nodemailer')
const { emailConfig } = require('../../config/keys')

const transporter = nodemailer.createTransport({
    port: emailConfig.port,
    host: emailConfig.host,
    auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
    },
    secure: false, // upgrades later with STARTTLS
})

exports.feedback = async (req, res, next) => {
    try {
        const { name, email, message } = req.body

        const mailOpts = {
            from: email,
            to: emailConfig.username,
            subject: 'New feedback message from Ledger App!',
            text: `${name} (${email}) says: ${message}`,
        }

        await transporter.sendMail(mailOpts)

        res.status(httpStatus.NO_CONTENT).end()
    } catch (err) {
        next(err)
    }
}

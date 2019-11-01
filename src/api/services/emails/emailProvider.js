const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../config/keys')
const Email = require('email-templates')

const transporter = nodemailer.createTransport({
    port: emailConfig.port,
    host: emailConfig.host,
    auth: {
        user: emailConfig.email,
        pass: emailConfig.password
    },
    secure: true
})

// verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('error with email connection', error)
    } else {
        console.log('Server is ready to take our emails')
    }
})

exports.sendPasswordReset = async passwordResetObject => {
    const email = new Email({
        views: { root: __dirname },
        message: {
            from: 'support@ledger.com'
        },
        // uncomment below to send emails in development/test env:
        send: true,
        transport: transporter
    })

    email
        .send({
            template: 'passwordReset',
            message: {
                to: passwordResetObject.email
            },
            locals: {
                productName: 'Ledger',
                // passwordResetUrl should be a URL to your app that displays a view where they
                // can enter a new password along with passing the resetToken in the params
                passwordResetUrl: `https://your-app/new-password/view?resetToken=${passwordResetObject.resetToken}`
            }
        })
        .then(console.log('sent email hopefully....'))
        .catch(console.error('error sending email'))
}

exports.sendPasswordChangeEmail = async user => {
    const email = new Email({
        views: { root: __dirname },
        message: {
            from: 'test@gmail.com'
        },
        // uncomment below to send emails in development/test env:
        send: true,
        transport: transporter
    })

    email
        .send({
            template: 'passwordChange',
            message: {
                to: user.email
            },
            locals: {
                productName: 'Ledger',
                name: user.name
            }
        })
        .then(console.log('sent email hopefully....'))
        .catch(console.error('error sending email'))
}

const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../config/keys')
const Email = require('email-templates')

const transporter = nodemailer.createTransport({
    port: emailConfig.port,
    host: emailConfig.host,
    auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
    },
    secure: false, // upgrades later with STARTTLS
})

// verify connection configuration
transporter.verify(error => {
    if (error) console.log('error with email connection', error)
})

exports.sendPasswordReset = async passwordResetObject => {
    const email = new Email({
        views: { root: __dirname },
        message: {
            from: 'support@ledger.com',
        },
        // uncomment below to send emails in development/test env:
        send: true,
        transport: transporter,
    })

    email
        .send({
            template: 'passwordReset',
            message: {
                to: passwordResetObject.userEmail,
            },
            locals: {
                productName: 'Ledger',
                // passwordResetUrl should be a URL to your app that displays a view where they
                // can enter a new password along with passing the resetToken in the params
                passwordResetUrl: `https://your-app/new-password/view?resetToken=${passwordResetObject.resetToken}`,
            },
        })
        .catch(err => console.error('error sending email', err))
}

exports.sendPasswordChangeEmail = async user => {
    const email = new Email({
        views: { root: __dirname },
        message: {
            from: 'support@ledger.com',
        },
        // uncomment below to send emails in development/test env:
        send: true,
        transport: transporter,
    })

    email
        .send({
            template: 'passwordChange',
            message: {
                to: user.email,
            },
            locals: {
                productName: 'Ledger',
                name: user.name,
            },
        })
        .catch(err => console.error('error sending email', err))
}

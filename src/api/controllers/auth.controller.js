const httpStatus = require('http-status')
const User = require('../models/user.model')
const RefreshToken = require('../models/refreshToken.model')
const PasswordResetToken = require('../models/passwordResetToken.model')
const moment = require('moment')
const { jwtExpirationInterval } = require('../../config/keys')
const omit = require('lodash/omit')
const APIError = require('../utils/APIError')
const emailProvider = require('../services/emails/emailProvider')

async function generateTokenResponse(user, accessToken) {
    const tokenType = 'Bearer'
    const { token } = await RefreshToken.generate(user)
    const expiresIn = moment()
        .add(jwtExpirationInterval, 'minutes')
        .toDate()
    return {
        tokenType,
        accessToken,
        refreshToken: token,
        expiresIn
    }
}

exports.register = async (req, res, next) => {
    try {
        const userData = omit(req.body, 'role')
        const user = await new User(userData).save()

        const userObj = user.transform()

        const token = await generateTokenResponse(user, user.token())
        res.status(httpStatus.CREATED)
        return res.json({ token, user: userObj })
    } catch (error) {
        return next(User.checkDuplicateEmail(error))
    }
}

exports.login = async (req, res, next) => {
    try {
        const { user, accessToken } = await User.findAndGenerateToken(req.body)
        const token = await generateTokenResponse(user, accessToken)
        const userObj = user.transform()
        return res.json({ token, user: userObj })
    } catch (error) {
        return next(error)
    }
}

exports.oAuth = async (req, res, next) => {
    try {
        const { user } = req
        const accessToken = user.token()
        const token = await generateTokenResponse(user, accessToken)
        const userTransformed = user.transform()
        return res.json({ token, user: userTransformed })
    } catch (error) {
        return next(error)
    }
}

exports.refresh = async (req, res, next) => {
    try {
        const { email, refreshToken } = req.body
        const refreshObject = await RefreshToken.findOneAndRemove({
            userEmail: email,
            token: refreshToken
        })
        const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject })
        const response = await generateTokenResponse(user, accessToken)
        return res.json(response)
    } catch (error) {
        return next(error)
    }
}

exports.sendPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email }).exec()

        if (user) {
            const passwordResetObj = await PasswordResetToken.generate(user)
            emailProvider.sendPasswordReset(passwordResetObj)
            res.status(httpStatus.OK)
            return res.json('success')
        }
        throw new APIError({
            status: httpStatus.UNAUTHORIZED,
            message: 'No account found with that email'
        })
    } catch (error) {
        return next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, password, resetToken } = req.body
        const resetTokenObject = await PasswordResetToken.findOneAndRemove({
            userEmail: email,
            resetToken
        })
        const err = {
            status: httpStatus.UNAUTHORIZED,
            isPublic: true
        }
        if (!resetTokenObject) {
            err.message = 'Cannot find matching reset token'
            throw new APIError(err)
        }
        if (moment().isAfter(resetTokenObject.expires)) {
            err.message = 'Reset token is expired'
            throw new APIError(err)
        }
        const user = await User.findOne({ email: resetTokenObject.userEmail }).exec()
        user.password = password
        await user.save()
        emailProvider.sendPasswordChangeEmail(user)
        res.status(httpStatus.OK)
        return res.json('Password Updated')
    } catch (error) {
        return next(error)
    }
}

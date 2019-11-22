const passport = require('passport')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')

const { roles } = require('../../config/accessControl')

const authorizeRequest = (authorizedRoles = roles) => (req, res, next) => {
    let convertedRoles = []

    if (typeof authorizedRoles === 'string') {
        convertedRoles.push(authorizedRoles)
    } else {
        convertedRoles = authorizedRoles
    }

    if (!convertedRoles.includes(req.user.role)) {
        const apiError = new APIError({
            message: 'Forbidden',
            status: httpStatus.FORBIDDEN,
        })
        return next(apiError)
    }
    return next()
}

const authenticateCallback = (req, res, next) => async (err, user, info) => {
    const error = err || info
    const apiError = new APIError({
        message: error ? error.message : 'Unauthorized',
        status: httpStatus.UNAUTHORIZED,
        stack: error ? error.stack : undefined,
    })
    if (error || !user) {
        return next(apiError)
    }
    req.user = user
    return next()
}

exports.authenticate = () => (req, res, next) =>
    passport.authenticate('jwt', { session: false }, authenticateCallback(req, res, next))(
        req,
        res,
        next,
    )

exports.authorize = authorizeRequest

exports.oAuth = service => passport.authenticate(service, { session: false })

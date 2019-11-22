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

// const getPermission = (str, resource, userRole) => {
//     switch (str) {
//         case 'read':
//             return accessControl.can(userRole).readAny(resource)
//         case 'create':
//             return accessControl.can(userRole).createAny(resource)
//         case 'update':
//             return accessControl.can(userRole).updateAny(resource)
//         case 'delete':
//             return accessControl.can(userRole).deleteAny(resource)
//         default: {
//             return {}
//         }
//     }
// }

// const verifyGrants = resources => (req, res, next) => {
//     const resourcesArr = resources.split(':')
//     const resource = resourcesArr[0]
//     const permissionTypeStr = resourcesArr[1]

//     const permissionType = getPermission(permissionTypeStr, resource, req.user.role)

//     console.log('permissions', resource, permissionTypeStr, permissionType.granted)

//     if (!permissionType.granted) {
//         const apiError = new APIError({
//             message: 'Forbidden',
//             status: httpStatus.FORBIDDEN,
//         })
//         return next(apiError)
//     }
//     return next()
// }

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
// exports.verifyGrants = verifyGrants

exports.oAuth = service => passport.authenticate(service, { session: false })

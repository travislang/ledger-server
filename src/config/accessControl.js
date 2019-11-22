const AccessControl = require('accesscontrol')

const ROLES = ['free', 'paid', 'admin']

const roleTypes = {
    FREE: 'free',
    PAID: 'paid',
    ADMIN: 'admin',
}

const ac = new AccessControl()

ac.grant('free')
    .readAny('basicAnalytic')
    .readOwn('user')
ac.grant('paid')
    .extend('free')
    .readAny('advancedAnalytic')
ac.grant('admin')
    .extend(['free', 'paid'])
    .deleteAny('basicAnalytic')
    .deleteAny('advancedAnalytic')
    .createAny('user')
    .readAny('user')
    .updateAny('user')
    .deleteAny('user')

exports.accessControl = ac
exports.roles = ROLES
exports.roleTypes = roleTypes

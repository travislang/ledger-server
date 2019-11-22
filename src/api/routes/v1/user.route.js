const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/user.controller')
const { authorize, authenticate, verifyGrants } = require('../../middlewares/auth')
const { roleTypes } = require('../../../config/accessControl')
const {
    listUsers,
    createUser,
    updateUser,
    updateCurrentUser,
} = require('../../validations/user.validation')

const router = express.Router()

router.param('userId', controller.load)

router
    .route('/')
    .all(authenticate(), authorize(roleTypes.ADMIN))
    .get(celebrate(listUsers), controller.list)
    .post(celebrate(createUser), controller.create)

router
    .route('/profile')
    .get(authenticate(), controller.currentUser)
    .patch(authenticate(), celebrate(updateCurrentUser), controller.updateCurrentUser)

router
    .route('/:userId')
    .all(authenticate())
    .get(verifyGrants('user:read'), controller.get)
    .patch(verifyGrants('user:update'), celebrate(updateUser), controller.update)
    .delete(verifyGrants('user:delete'), controller.remove)

module.exports = router

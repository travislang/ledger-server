const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/user.controller')
const { authorize, authenticate } = require('../../middlewares/auth')
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
    .route('/totals')
    .all(authenticate(), authorize(roleTypes.ADMIN))
    .get(controller.userTotals)

router
    .route('/profile')
    .get(authenticate(), controller.currentUser)
    .patch(authenticate(), celebrate(updateCurrentUser), controller.updateCurrentUser)
    .delete(authenticate(), controller.deleteCurrentUser)

router
    .route('/:userId')
    .all(authenticate(), authorize(roleTypes.ADMIN))
    .get(controller.get)
    .patch(celebrate(updateUser), controller.update)
    .delete(controller.remove)

module.exports = router

const express = require('express')
const { celebrate } = require('celebrate')
const controller = require('../../controllers/auth.controller')
const oAuthLogin = require('../../middlewares/auth').oAuth
const {
    login,
    register,
    oAuth,
    refresh,
    sendPasswordReset,
    resetPassword,
} = require('../../validations/auth.validation')

const router = express.Router()

router.route('/register').post(celebrate(register), controller.register)

router.route('/login').post(celebrate(login), controller.login)

router.route('/refresh-token').post(celebrate(refresh), controller.refresh)

router
    .route('/send-password-reset')
    .post(celebrate(sendPasswordReset), controller.sendPasswordReset)

router.route('/reset-password').post(celebrate(resetPassword), controller.resetPassword)

router.route('/facebook').post(celebrate(oAuth), oAuthLogin('facebook'), controller.oAuth)

router.route('/google').post(celebrate(oAuth), oAuthLogin('google'), controller.oAuth)

router.route('/apple').post(celebrate(oAuth), oAuthLogin('apple'), controller.oAuth)

module.exports = router

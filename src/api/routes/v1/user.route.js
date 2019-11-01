const express = require('express');
const { celebrate } = require('celebrate')
const controller = require('../../controllers/user.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const {
    listUsers,
    createUser,
    replaceUser,
    updateUser,
} = require('../../validations/user.validation');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);


router
    .route('/')
    .get(authorize(ADMIN), celebrate(listUsers), controller.list)
    .post(authorize(ADMIN), celebrate(createUser), controller.create);

router
    .route('/profile')
    .get(authorize(), controller.loggedIn);


router
    .route('/:userId')
    .get(authorize(LOGGED_USER), controller.get)
    .put(authorize(LOGGED_USER), celebrate(replaceUser), controller.replace)
    .patch(authorize(LOGGED_USER), celebrate(updateUser), controller.update)
    .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;

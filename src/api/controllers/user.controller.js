const httpStatus = require('http-status')
const { omit } = require('lodash')
const User = require('../models/user.model')

exports.load = async (req, res, next, id) => {
    try {
        const user = await User.get(id)
        req.locals = { user }
        return next()
    } catch (error) {
        return next(error)
    }
}

exports.currentUser = async (req, res) => res.json(await req.user.transform())

exports.list = async (req, res, next) => {
    try {
        const users = await User.list(req.query)
        const transformedUsers = users.map(user => user.transform())
        res.json(transformedUsers)
    } catch (error) {
        next(error)
    }
}

exports.create = async (req, res, next) => {
    try {
        const user = new User(req.body)
        const savedUser = await user.save()
        res.status(httpStatus.CREATED)
        res.json(savedUser.transform())
    } catch (error) {
        next(User.checkDuplicateEmail(error))
    }
}

exports.get = (req, res) => res.json(req.locals.user.transform())

exports.update = async (req, res, next) => {
    try {
        const user = Object.assign(req.locals.user, req.body)

        const savedUser = await user.save()

        res.status(httpStatus.OK)
        res.json(savedUser.transform())
    } catch (err) {
        next(User.checkDuplicateEmail(err))
    }
}

exports.remove = async (req, res, next) => {
    try {
        const { user } = req.locals
        await user.remove()

        res.status(httpStatus.NO_CONTENT).end()
    } catch (err) {
        next(err)
    }
}

exports.deleteCurrentUser = async (req, res, next) => {
    try {
        const { user } = req
        await user.remove()

        res.status(httpStatus.NO_CONTENT).end()
    } catch (err) {
        next(err)
    }
}

exports.updateCurrentUser = async (req, res, next) => {
    try {
        const omitRole = req.user.role !== 'admin' ? 'role' : ''
        const updatedUser = omit(req.body, omitRole)
        const user = Object.assign(req.user, updatedUser)

        const savedUser = await user.save()

        res.status(httpStatus.OK)
        res.json(await savedUser.transform())
    } catch (err) {
        next(User.checkDuplicateEmail(err))
    }
}

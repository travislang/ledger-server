const httpStatus = require('http-status')

exports.addWorkout = async (req, res, next) => {
    try {
        req.user.workouts.push(req.body)

        const savedUser = await req.user.save()

        res.status(httpStatus.OK)
        res.json(savedUser.workouts)
    } catch (err) {
        next(err)
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

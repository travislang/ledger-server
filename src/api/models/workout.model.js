const mongoose = require('mongoose')
const crypto = require('crypto')
const moment = require('moment')

const exerciseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    sets: [
        {
            reps: { type: Number, required: true },
            weight: { type: Number, required: true },
        },
    ],
})

const WorkoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    exercises: {
        type: 'String',
        ref: 'User',
        required: true,
    },
    expires: { type: Date },
})

// passwordResetTokenSchema.statics = {
//     async generate(user) {
//         const userId = user._id
//         const userEmail = user.email
//         const resetToken = `${userId}.${crypto.randomBytes(40).toString('hex')}`
//         const expires = moment()
//             .add(2, 'hours')
//             .toDate()
//         const ResetTokenObject = new PasswordResetToken({
//             resetToken,
//             userId,
//             userEmail,
//             expires,
//         })
//         await ResetTokenObject.save()
//         return ResetTokenObject
//     },
// }

// const Workout = mongoose.model('Workout', WorkoutSchema)
// module.exports = Workout

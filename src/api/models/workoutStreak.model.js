const mongoose = require('mongoose')

const workoutStreakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    streak: {
        type: Number,
        required: true,
    },
    dateLastChecked: {
        type: Date,
        required: true,
    },
})
workoutStreakSchema.method({
    transform() {
        const transformed = {}
        const fields = ['id', 'streak', 'dateLastChecked']

        fields.forEach(field => {
            transformed[field] = this[field]
        })

        return transformed
    },
})

const workoutStreak = mongoose.model('workoutStreak', workoutStreakSchema)

module.exports = workoutStreak

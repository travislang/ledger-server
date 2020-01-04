const mongoose = require('mongoose')

const weightLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

const weightLog = mongoose.model('weightLog', weightLogSchema)

module.exports = weightLog

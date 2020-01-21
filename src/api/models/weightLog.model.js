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
weightLogSchema.method({
    transform() {
        const transformed = {}
        const fields = ['id', 'date', 'weight']

        fields.forEach(field => {
            transformed[field] = this[field]
        })

        return transformed
    },
})

const weightLog = mongoose.model('weightLog', weightLogSchema)

module.exports = weightLog

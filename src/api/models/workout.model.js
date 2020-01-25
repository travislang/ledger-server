const mongoose = require('mongoose')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')

const SetsSchema = new mongoose.Schema({
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
})
SetsSchema.method({
    transform() {
        const transformed = {}
        const fields = ['id', 'reps', 'weight']

        fields.forEach(field => {
            transformed[field] = this[field]
        })

        return transformed
    },
})

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    sets: [SetsSchema],
})
ExerciseSchema.method({
    transform() {
        const transformed = {}
        const fields = ['id', 'name', 'type', 'sets']

        fields.forEach(field => {
            if (field === 'sets') {
                transformed[field] = this[field].map(set => set.transform())
            } else {
                transformed[field] = this[field]
            }
        })

        return transformed
    },
})

const WorkoutSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minLength: 1,
            maxlength: 50,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        exercises: [ExerciseSchema],
    },
    { timestamps: true },
)

WorkoutSchema.method({
    transform() {
        const transformed = {}
        const fields = ['id', 'name', 'exercises', 'createdAt']

        fields.forEach(field => {
            if (field === 'exercises') {
                transformed[field] = this[field].map(exercise => exercise.transform())
            } else {
                transformed[field] = this[field]
            }
        })

        return transformed
    },
})

WorkoutSchema.statics.list = async function list(userId, limit) {
    return this.find({ userId })
        .limit(limit)
        .exec()
}
WorkoutSchema.statics.get = async function get(workoutId) {
    let workout

    if (mongoose.Types.ObjectId.isValid(workoutId)) {
        // user = await this.findById(id).exec()
        workout = await this.findById(workoutId).exec()
    }
    if (workout) {
        return workout
    }

    throw new APIError({
        message: 'Workout does not exist',
        status: httpStatus.NOT_FOUND,
    })
}

const Workout = mongoose.model('Workout', WorkoutSchema)
module.exports = Workout

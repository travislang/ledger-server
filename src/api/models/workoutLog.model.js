const mongoose = require('mongoose')

const SetsLogSchema = new mongoose.Schema({
    setId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout.exercises.sets',
        required: true,
        index: true,
    },
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
})
SetsLogSchema.method({
    transform() {
        const transformed = {}
        const fields = ['id', 'reps', 'weight']

        fields.forEach(field => {
            transformed[field] = this[field]
        })

        return transformed
    },
})

const ExerciseLogSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout.exercises',
        required: true,
        index: true,
    },
    sets: [SetsLogSchema],
})
ExerciseLogSchema.method({
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

const WorkoutLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    workoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        required: true,
        index: true,
    },
    exercises: [ExerciseLogSchema],
})

WorkoutLogSchema.method({
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

WorkoutLogSchema.statics.list = async function list(userId, limit) {
    return this.find({ userId })
        .limit(limit)
        .exec()
}

const WorkoutLog = mongoose.model('WorkoutLog', WorkoutLogSchema)
module.exports = WorkoutLog

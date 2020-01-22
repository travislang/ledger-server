/* eslint-disable no-unused-expressions */
const request = require('supertest')
const httpStatus = require('http-status')
const { expect } = require('chai')
const bcrypt = require('bcryptjs')
const { app } = require('../../../index')
const moment = require('moment')
const User = require('../../models/user.model')
const Workout = require('../../models/workout.model')
const WeightLog = require('../../models/weightLog.model')
const WorkoutLog = require('../../models/workoutLog.model')

describe('Logs API', () => {
    let userAccessToken
    let dbUsers
    let dbWorkouts
    let dbWorkoutLogs
    let dbWeightLogs
    let workout
    let workoutLog
    let weightLog

    const password = '123456'

    beforeEach(async () => {
        dbUsers = {
            travisLang: {
                email: 'tlang505@gmail.com',
                password: await bcrypt.hash(password, 1),
                name: 'Travis Lang',
            },
            jimmySmith: {
                email: 'jimmysmith@gmail.com',
                password: await bcrypt.hash(password, 1),
                name: 'Jimmy Smith',
            },
        }

        dbWorkouts = {
            test: {
                name: 'test workout 1',
                exercises: [
                    {
                        id: 'f52071fb-c4b6-4a73-ab28-d08cea7c9627',
                        name: 'ab roller',
                        type: 'abdominals',
                        sets: [
                            { reps: 5, weight: 50 },
                            { reps: 8, weight: 55 },
                        ],
                    },
                    {
                        id: '99433ea8-4044-4094-9b42-fbd007980314',
                        name: 'ab roller',
                        type: 'abdominals',
                        sets: [
                            { reps: 5, weight: 50 },
                            { reps: 8, weight: 55 },
                        ],
                    },
                ],
            },
            test2: {
                name: 'test workout 2',
                exercises: [
                    {
                        id: 'f52071fb-c4b6-4a73-ab28-d08cea7c9627',
                        name: 'ab roller',
                        type: 'abdominals',
                        sets: [
                            { reps: 5, weight: 50 },
                            { reps: 8, weight: 55 },
                        ],
                    },
                    {
                        id: '99433ea8-4044-4094-9b42-fbd007980314',
                        name: 'ab roller',
                        type: 'abdominals',
                        sets: [
                            { reps: 5, weight: 50 },
                            { reps: 8, weight: 55 },
                        ],
                    },
                ],
            },
        }

        dbWorkoutLogs = {
            log1: {
                startTime: moment()
                    .subtract(45, 'minutes')
                    .toISOString(),
                endTime: moment().toISOString(),
                averageRestTime: 123000,
            },
        }

        dbWeightLogs = {
            log1: {
                date: Date.now(),
                weight: 195,
            },
            log2: {
                date: Date.now(),
                weight: 180,
            },
        }

        workout = {
            name: 'test workout 3',
            exercises: [
                {
                    id: 'f52071fb-c4b6-4a73-ab28-d08cea7c9627',
                    name: 'ab roller',
                    type: 'abdominals',
                    sets: [
                        { reps: 5, weight: 50 },
                        { reps: 8, weight: 55 },
                    ],
                },
                {
                    id: '99433ea8-4044-4094-9b42-fbd007980314',
                    name: 'ab roller',
                    type: 'abdominals',
                    sets: [
                        { reps: 5, weight: 50 },
                        { reps: 8, weight: 55 },
                    ],
                },
            ],
        }

        weightLog = {
            date: Date.now(),
            weight: 192,
        }

        workoutLog = {
            startTime: moment()
                .subtract(45, 'minutes')
                .toISOString(),
            endTime: moment().toISOString(),
            averageRestTime: 128000,
        }

        await User.deleteMany({})
        await Workout.deleteMany({})

        await User.insertMany([dbUsers.travisLang, dbUsers.jimmySmith])

        const user1FromDb = await User.findOne({
            email: 'tlang505@gmail.com',
        })
        const user2FromDb = await User.findOne({
            email: 'jimmysmith@gmail.com',
        })
        dbWorkouts.test.userId = user1FromDb.id
        dbWeightLogs.log1.userId = user1FromDb.id
        dbWorkouts.test2.userId = user2FromDb.id
        dbWeightLogs.log2.userId = user2FromDb.id

        await Workout.insertMany([dbWorkouts.test, dbWorkouts.test2])
        await WeightLog.insertMany([dbWeightLogs.log1, dbWeightLogs.log2])

        const workoutLog1FromDb = await Workout.findOne({
            userId: user1FromDb.id,
        })

        const transformedWorkoutLog = workoutLog1FromDb.transform()

        // create workout log
        dbWorkoutLogs.log1.exercises = transformedWorkoutLog.exercises.map(exercise => ({
            exerciseId: exercise.id,
            muscleType: exercise.type,
            sets: exercise.sets.map(set => ({
                setId: set.id,
                reps: 5,
                weight: 50,
            })),
        }))
        dbWorkoutLogs.log1.userId = user1FromDb.id
        dbWorkoutLogs.log1.workoutId = transformedWorkoutLog.id

        await WorkoutLog.insertMany([dbWorkoutLogs.log1])

        // eslint-disable-next-line require-atomic-updates
        dbUsers.travisLang.password = password

        userAccessToken = (await User.findAndGenerateToken(dbUsers.travisLang)).accessToken
    })

    describe('POST /v1/log/weight', () => {
        it('should create a new weight log when request is ok', () => {
            return request(app)
                .post('/v1/log/weight')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(weightLog)
                .expect(httpStatus.CREATED)
        })

        it('should report error when weight is empty', () => {
            delete weightLog.weight

            return request(app)
                .post('/v1/log/weight')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(weightLog)
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('weight')
                    expect(location).to.be.equal('body')
                    expect(messages).to.include('"weight" is required')
                })
        })
    })

    describe('GET /v1/log/weight', () => {
        it('should get all users weight logs for date range', () => {
            const dateRange = {
                startDate: moment()
                    .subtract(1, 'day')
                    .toISOString(),
                endDate: moment()
                    .add(1, 'day')
                    .toISOString(),
            }
            return request(app)
                .get(`/v1/log/weight?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.OK)
                .then(async res => {
                    res.body[0].date = new Date(res.body[0].date).getTime()

                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(1)
                    expect(res.body[0]).to.have.property('date')
                    expect(res.body[0].date).to.be.equal(dbWeightLogs.log1.date)
                    expect(res.body[0]).to.have.property('weight')
                    expect(res.body[0].weight).to.be.equal(dbWeightLogs.log1.weight)
                })
        })
        it('should return error if date range is not given', async () => {
            return request(app)
                .get(`/v1/log/weight`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.BAD_REQUEST)
                .then(async res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('startDate')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"startDate" is required')
                })
        })
    })

    describe('PATCH /v1/log/weight', () => {
        it('should update weight log', async () => {
            const user1FromDb = await User.findOne({
                email: 'tlang505@gmail.com',
            })
            const weightLogFromDb = await WeightLog.findOne({ userId: user1FromDb.id })
            const transformedWeightLog = weightLogFromDb.transform()

            const clonedWeightLog = {
                id: transformedWeightLog.id,
                weight: 210,
            }

            return request(app)
                .patch(`/v1/log/weight`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(clonedWeightLog)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.weight).to.be.equal(210)
                    expect(res.body.id).to.be.equal(transformedWeightLog.id)
                })
        })
        it('should return error if weight log ID is not given', async () => {
            const clonedWeightLog = {
                weight: 210,
            }

            return request(app)
                .patch(`/v1/log/weight`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(clonedWeightLog)
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('id')
                    expect(location).to.be.equal('body')
                    expect(messages).to.include('"id" is required')
                })
        })
        it('should return error if weight log is not owned by user', async () => {
            const user2FromDb = await User.findOne({
                email: 'jimmysmith@gmail.com',
            })
            const weightLogFromDb = await WeightLog.findOne({ userId: user2FromDb.id })
            const transformedWeightLog = weightLogFromDb.transform()

            const clonedWeightLog = {
                id: transformedWeightLog.id,
                weight: 210,
            }

            return request(app)
                .patch(`/v1/log/weight`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(clonedWeightLog)
                .expect(httpStatus.UNAUTHORIZED)
        })
    })

    describe('GET /v1/log/workouts', () => {
        it('should get all users workout logs for date range', () => {
            const dateRange = {
                startDate: moment()
                    .subtract(1, 'day')
                    .toISOString(),
                endDate: moment()
                    .add(1, 'day')
                    .toISOString(),
            }
            return request(app)
                .get(
                    `/v1/log/workouts?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                )
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.OK)
                .then(async res => {
                    const user1FromDb = await User.findOne({
                        email: 'tlang505@gmail.com',
                    })
                    const workoutLogFromDb = await WorkoutLog.findOne({ userId: user1FromDb.id })
                    const transformedWorkoutLog = workoutLogFromDb.transform()

                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(1)
                    expect(res.body[0]).to.have.property('id')
                    expect(res.body[0].id).to.be.equal(transformedWorkoutLog.id)
                    expect(res.body[0]).to.have.property('exercises')
                    expect(res.body[0].exercises).to.have.lengthOf(2)
                })
        })
        it('should return error if date range is not given', async () => {
            return request(app)
                .get(`/v1/log/workouts`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.BAD_REQUEST)
                .then(async res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('startDate')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"startDate" is required')
                })
        })
    })

    describe('POST /v1/log/workout', () => {
        it('should add new workout log for user', async () => {
            const user1FromDb = await User.findOne({
                email: 'tlang505@gmail.com',
            })
            const workout1FromDb = await Workout.findOne({
                userId: user1FromDb.id,
            })

            const transformedWorkout = workout1FromDb.transform()

            const log = {}
            // eslint-disable-next-line no-restricted-syntax
            for (const exercise of transformedWorkout.exercises) {
                log[exercise.id] = exercise.sets.map(set => ({
                    ...set,
                    reps: 8,
                    weight: 75,
                }))
            }

            // create workout log
            workoutLog.exercises = log
            workoutLog.workoutId = transformedWorkout.id
            return request(app)
                .post(`/v1/log/workout`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(workoutLog)
                .expect(httpStatus.CREATED)
                .then(async res => {
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('id')
                })
        })
        it("should return not found if workout doesn't exist", async () => {
            const user1FromDb = await User.findOne({
                email: 'tlang505@gmail.com',
            })
            const workout1FromDb = await Workout.findOne({
                userId: user1FromDb.id,
            })

            const transformedWorkout = workout1FromDb.transform()

            const log = {}
            // eslint-disable-next-line no-restricted-syntax
            for (const exercise of transformedWorkout.exercises) {
                log[exercise.id] = exercise.sets.map(set => ({
                    ...set,
                    reps: 8,
                    weight: 75,
                }))
            }

            // create workout log
            workoutLog.exercises = log
            workoutLog.workoutId = '5e1019898eb81144fb7aa1ce'
            return request(app)
                .post(`/v1/log/workout`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(workoutLog)
                .expect(httpStatus.NOT_FOUND)
        })
        it("should return error if user doesn't own workout", async () => {
            const user2FromDb = await User.findOne({
                email: 'jimmysmith@gmail.com',
            })
            const workout2FromDb = await Workout.findOne({
                userId: user2FromDb.id,
            })

            const transformedWorkout = workout2FromDb.transform()

            const log = {}
            // eslint-disable-next-line no-restricted-syntax
            for (const exercise of transformedWorkout.exercises) {
                log[exercise.id] = exercise.sets.map(set => ({
                    ...set,
                    reps: 8,
                    weight: 75,
                }))
            }

            // create workout log
            workoutLog.exercises = log
            workoutLog.workoutId = transformedWorkout.id
            return request(app)
                .post(`/v1/log/workout`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(workoutLog)
                .expect(httpStatus.UNAUTHORIZED)
        })
    })

    describe('GET /v1/log/workout', () => {
        it('should get all users workout logs for workout for date range', async () => {
            const user1FromDb = await User.findOne({
                email: 'tlang505@gmail.com',
            })
            const workout1FromDb = await Workout.findOne({
                userId: user1FromDb.id,
            })

            const dateRange = {
                startDate: moment()
                    .subtract(1, 'day')
                    .toISOString(),
                endDate: moment()
                    .add(1, 'day')
                    .toISOString(),
            }
            return request(app)
                .get(
                    `/v1/log/workout?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&workoutId=${workout1FromDb.id}`,
                )
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.OK)
                .then(async res => {
                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(1)
                    expect(res.body[0]).to.have.property('workoutId')
                    expect(res.body[0].workoutId).to.be.equal(workout1FromDb.id)
                    expect(res.body[0]).to.have.property('exercises')
                    expect(res.body[0].exercises).to.have.lengthOf(2)
                })
        })
        it('should return error if date range is not given', async () => {
            const user1FromDb = await User.findOne({
                email: 'tlang505@gmail.com',
            })
            const workout1FromDb = await Workout.findOne({
                userId: user1FromDb.id,
            })
            return request(app)
                .get(`/v1/log/workout?workoutId=${workout1FromDb.id}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.BAD_REQUEST)
                .then(async res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('startDate')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"startDate" is required')
                })
        })
        it('should return error if workout ID is not given', async () => {
            const dateRange = {
                startDate: moment()
                    .subtract(1, 'day')
                    .toISOString(),
                endDate: moment()
                    .add(1, 'day')
                    .toISOString(),
            }
            return request(app)
                .get(
                    `/v1/log/workout?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                )
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.BAD_REQUEST)
                .then(async res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('workoutId')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"workoutId" is required')
                })
        })
    })

    describe('GET /v1/log/workouts/total', () => {
        it('should get total workout logs for user for date range', async () => {
            const dateRange = {
                startDate: moment()
                    .subtract(1, 'day')
                    .toISOString(),
                endDate: moment()
                    .add(1, 'day')
                    .toISOString(),
            }
            return request(app)
                .get(
                    `/v1/log/workouts/total?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                )
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.OK)
                .then(async res => {
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('totalWorkouts')
                    expect(res.body.totalWorkouts).to.be.equal(1)
                })
        })
        it('should return error if date range is not given', async () => {
            return request(app)
                .get(`/v1/log/workouts/total`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.BAD_REQUEST)
                .then(async res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('startDate')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"startDate" is required')
                })
        })
    })
    // after(() => {
    //     disconnect()
    //     server.close()
    // })
})

/* eslint-disable no-unused-expressions */
const request = require('supertest')
const httpStatus = require('http-status')
const { disconnect } = require('../../../config/mongoose')
const { expect } = require('chai')
const sinon = require('sinon')
const bcrypt = require('bcryptjs')
const { omitBy, isNil } = require('lodash')
const { app, server } = require('../../../index')
const User = require('../../models/user.model')
const Workout = require('../../models/workout.model')

describe('Workouts API', () => {
    let userAccessToken
    let dbUsers
    let dbWorkouts
    let workout

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

        await User.deleteMany({})
        await Workout.deleteMany({})
        await User.insertMany([dbUsers.travisLang, dbUsers.jimmySmith])
        const user1FromDb = await User.findOne({ email: 'tlang505@gmail.com' })
        const user2FromDb = await User.findOne({ email: 'jimmysmith@gmail.com' })
        dbWorkouts.test.userId = user1FromDb.id
        dbWorkouts.test2.userId = user2FromDb.id
        await Workout.insertMany([dbWorkouts.test, dbWorkouts.test2])
        // eslint-disable-next-line require-atomic-updates
        dbUsers.travisLang.password = password

        userAccessToken = (await User.findAndGenerateToken(dbUsers.travisLang)).accessToken
    })

    describe('POST /v1/workouts', () => {
        it('should create a new workout when request is ok', () => {
            return request(app)
                .post('/v1/workouts')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(workout)
                .expect(httpStatus.CREATED)
                .then(res => {
                    expect(res.body.name).to.be.equal(workout.name)
                    expect(res.body).to.have.property('id')
                    expect(res.body).to.have.property('exercises')
                })
        })

        it('should report error when name is empty', () => {
            // const newWorkout = {
            //     ...workout
            // }
            delete workout.name

            return request(app)
                .post('/v1/workouts')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(workout)
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('name')
                    expect(location).to.be.equal('body')
                    expect(messages).to.include('"name" is required')
                })
        })
    })

    describe('GET /v1/workouts', () => {
        it('should get all users workouts', () => {
            return request(app)
                .get('/v1/workouts')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.OK)
                .then(async res => {
                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(1)
                    expect(res.body[0].name).to.be.equal(dbWorkouts.test.name)
                    expect(res.body[0]).to.have.property('id')
                    expect(res.body[0]).to.have.property('exercises')
                })
        })
    })

    describe('DELETE /v1/workouts', () => {
        it('should delete workout if user owns it', async () => {
            const { id } = await Workout.findOne({ name: dbWorkouts.test.name })
            return request(app)
                .delete(`/v1/workouts`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ workoutId: id })
                .expect(httpStatus.NO_CONTENT)
        })
        it("should not delete workout if user doesn't own it", async () => {
            const { id } = await Workout.findOne({ name: dbWorkouts.test2.name })
            return request(app)
                .delete(`/v1/workouts`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ workoutId: id })
                .expect(httpStatus.UNAUTHORIZED)
                .then(res => {
                    expect(res.body).to.be.equal(
                        'you do not have permission to delete this workout',
                    )
                })
        })
    })

    describe('PATCH /v1/workouts/:workoutId', () => {
        it('should update workout', async () => {
            const workoutFromDb = await Workout.findOne({ name: dbWorkouts.test.name })
            const transformedWorkout = workoutFromDb.transform()

            const clonedWorkout = {
                name: 'updated workout name',
                exercises: [transformedWorkout.exercises[0]],
            }

            return request(app)
                .patch(`/v1/workouts/${workoutFromDb.id}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(clonedWorkout)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.be.equal(clonedWorkout.name)
                    expect(res.body.id).to.be.equal(transformedWorkout.id)
                    expect(res.body.exercises).to.be.an('array')
                    expect(res.body.exercises).to.have.lengthOf(1)
                })
        })

        it('should report error "Workout does not exist" when workout does not exists', () => {
            const clonedWorkout = {
                name: 'updated workout name',
                exercises: [workout.exercises[0]],
            }

            return request(app)
                .patch('/v1/workouts/randomInvalidId1925')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(clonedWorkout)
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.NOT_FOUND)
                    expect(res.body.message).to.be.equal('Workout does not exist')
                })
        })
    })
    after(() => {
        disconnect()
        server.close()
    })
})

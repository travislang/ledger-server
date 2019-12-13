/* eslint-disable no-unused-expressions */
const request = require('supertest')
const httpStatus = require('http-status')
const { disconnect } = require('../../../config/mongoose')
const { expect } = require('chai')
const sinon = require('sinon')
const bcrypt = require('bcryptjs')
const { some, omitBy, isNil } = require('lodash')
const { app, server } = require('../../../index')
const User = require('../../models/user.model')
const JWT_EXPIRATION = require('../../../config/keys').jwtExpirationInterval
const { roleTypes } = require('../../../config/accessControl')

async function format(user) {
    const formated = user

    // delete password
    delete formated.password

    // get user from database
    const dbUser = (await User.findOne({ email: user.email })).transform()

    // remove null and undefined properties
    return omitBy(dbUser, isNil)
}

describe('Users API', () => {
    let adminAccessToken
    let userAccessToken
    let dbUsers
    let user
    let admin

    const password = '123456'

    beforeEach(async () => {
        dbUsers = {
            branStark: {
                email: 'branstark@gmail.com',
                password: await bcrypt.hash(password, 1),
                name: 'Bran Stark',
                role: 'admin',
            },
            jonSnow: {
                email: 'jonsnow@gmail.com',
                password: await bcrypt.hash(password, 1),
                name: 'Jon Snow',
            },
        }

        user = {
            email: 'tlang505@gmail.com',
            password,
            name: 'Travis Lang',
        }

        admin = {
            email: 'tlang505@gmail.com',
            password,
            name: 'Travis Lang',
            role: 'admin',
        }

        await User.deleteMany({})
        await User.insertMany([dbUsers.branStark, dbUsers.jonSnow])
        // eslint-disable-next-line require-atomic-updates
        dbUsers.branStark.password = password
        // eslint-disable-next-line require-atomic-updates
        dbUsers.jonSnow.password = password

        adminAccessToken = (await User.findAndGenerateToken(dbUsers.branStark)).accessToken
        userAccessToken = (await User.findAndGenerateToken(dbUsers.jonSnow)).accessToken
    })

    describe('POST /v1/users', () => {
        it('should create a new user when request is ok', () => {
            return request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(admin)
                .expect(httpStatus.CREATED)
                .then(res => {
                    delete admin.password
                    expect(res.body).to.include(admin)
                })
        })

        it('should create a new user and set default role to "free"', () => {
            return request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.CREATED)
                .then(res => {
                    expect(res.body.role).to.be.equal(roleTypes.FREE)
                })
        })

        it('should report error when email already exists', () => {
            user.email = dbUsers.branStark.email

            return request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.CONFLICT)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('email')
                    expect(location).to.be.equal('body')
                    expect(messages).to.include('"email" already exists')
                })
        })

        it('should report error when email is not provided', () => {
            delete user.email

            return request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('email')
                    expect(location).to.be.equal('body')
                    expect(messages).to.include('"email" is required')
                })
        })

        it('should report error when password length is less than 6', () => {
            user.password = '12345'

            return request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]

                    expect(field).to.be.equal('password')
                    expect(location).to.be.equal('body')
                    expect(messages).to.include(
                        '"password" length must be at least 6 characters long',
                    )
                })
        })

        it('should report error when user is not an admin', () => {
            return request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send(user)
                .expect(httpStatus.FORBIDDEN)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN)
                    expect(res.body.message).to.be.equal('Forbidden')
                })
        })
    })

    describe('GET /v1/users', () => {
        it('should get all users', () => {
            return request(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.OK)
                .then(async res => {
                    const bran = await format(dbUsers.branStark)
                    const john = await format(dbUsers.jonSnow)
                    // before comparing it is necessary to convert String to Date
                    res.body[0].createdAt = new Date(res.body[0].createdAt)
                    res.body[1].createdAt = new Date(res.body[1].createdAt)

                    const includesBranStark = some(res.body, bran)
                    const includesjonSnow = some(res.body, john)

                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(2)
                    expect(includesBranStark).to.be.true
                    expect(includesjonSnow).to.be.true
                })
        })

        it('should get all users with pagination', () => {
            return request(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ page: 2, perPage: 1 })
                .expect(httpStatus.OK)
                .then(async res => {
                    delete dbUsers.jonSnow.password
                    const john = await format(dbUsers.jonSnow)

                    // before comparing it is necessary to convert String to Date
                    res.body[0].createdAt = new Date(res.body[0].createdAt)

                    const includesjonSnow = some(res.body, john)

                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(1)
                    expect(includesjonSnow).to.be.true
                })
        })

        it('should filter users', () => {
            return request(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ email: dbUsers.jonSnow.email })
                .expect(httpStatus.OK)
                .then(async res => {
                    delete dbUsers.jonSnow.password
                    const john = await format(dbUsers.jonSnow)

                    // before comparing it is necessary to convert String to Date
                    res.body[0].createdAt = new Date(res.body[0].createdAt)

                    const includesjonSnow = some(res.body, john)

                    expect(res.body).to.be.an('array')
                    expect(res.body).to.have.lengthOf(1)
                    expect(includesjonSnow).to.be.true
                })
        })

        it("should report error when pagination's 'page' parameter is not a number", () => {
            return request(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ page: '?', perPage: 5 })
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('page')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"page" must be a number')
                })
        })

        it("should report error when pagination's 'perPage' parameter is not a number", () => {
            return request(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({ page: 1, perPage: 'what' })
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    const { field, location, messages } = res.body.errors[0]
                    expect(field).to.be.equal('perPage')
                    expect(location).to.be.equal('query')
                    expect(messages).to.include('"perPage" must be a number')
                })
        })

        it('should report error if user is not an admin', () => {
            return request(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.FORBIDDEN)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN)
                    expect(res.body.message).to.be.equal('Forbidden')
                })
        })
    })

    describe('GET /v1/users/:userId', () => {
        it('should get user by queried userId', async () => {
            const id = (await User.findOne({}))._id
            delete dbUsers.branStark.password

            return request(app)
                .get(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.include(dbUsers.branStark)
                })
        })

        it('should report error "User does not exist" when user does not exists', () => {
            return request(app)
                .get('/v1/users/56c787ccc67fc16ccc1a5e92')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.NOT_FOUND)
                    expect(res.body.message).to.be.equal('User does not exist')
                })
        })

        it('should report error "User does not exist" when id is not a valid ObjectID', () => {
            return request(app)
                .get('/v1/users/invalidOjectId1914')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.NOT_FOUND)
                    expect(res.body.message).to.equal('User does not exist')
                })
        })

        it('should report error if requesting user is not an admin', async () => {
            const id = (await User.findOne({ email: dbUsers.branStark.email }))._id

            return request(app)
                .get(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.FORBIDDEN)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN)
                    expect(res.body.message).to.be.equal('Forbidden')
                })
        })
    })

    describe('PATCH /v1/users/:userId', () => {
        it('should update user', async () => {
            delete dbUsers.branStark.password
            const id = (await User.findOne(dbUsers.branStark))._id
            const { name } = user

            return request(app)
                .patch(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({ name })
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.be.equal(name)
                    expect(res.body.email).to.be.equal(dbUsers.branStark.email)
                })
        })

        it('should not update user when no parameters were given', async () => {
            delete dbUsers.branStark.password
            const id = (await User.findOne(dbUsers.branStark))._id

            return request(app)
                .patch(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send()
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.include(dbUsers.branStark)
                })
        })

        it('should report error "User does not exist" when user does not exists', () => {
            return request(app)
                .patch('/v1/users/randomInvalidId1925')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.NOT_FOUND)
                    expect(res.body.message).to.be.equal('User does not exist')
                })
        })

        it('should report error when requesting user is not an admin', async () => {
            const id = (await User.findOne({ email: dbUsers.branStark.email }))._id

            return request(app)
                .patch(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.FORBIDDEN)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN)
                    expect(res.body.message).to.be.equal('Forbidden')
                })
        })
    })

    describe('DELETE /v1/users', () => {
        it('should delete user', async () => {
            const id = (await User.findOne({}))._id

            return request(app)
                .delete(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.NO_CONTENT)
                .then(() => request(app).get('/v1/users'))
                .then(async () => {
                    const users = await User.find({})
                    expect(users).to.have.lengthOf(1)
                })
        })

        it('should report error "User does not exist" when user does not exists', () => {
            return request(app)
                .delete('/v1/users/invalidOjectId1950')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(httpStatus.NOT_FOUND)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.NOT_FOUND)
                    expect(res.body.message).to.be.equal('User does not exist')
                })
        })

        it('should report error when requesting user is not an admin', async () => {
            const id = (await User.findOne({ email: dbUsers.branStark.email }))._id

            return request(app)
                .delete(`/v1/users/${id}`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.FORBIDDEN)
                .then(res => {
                    expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN)
                    expect(res.body.message).to.be.equal('Forbidden')
                })
        })
    })

    describe('GET /v1/users/profile', () => {
        it("should get the requesting user's info", () => {
            delete dbUsers.jonSnow.password

            return request(app)
                .get('/v1/users/profile')
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.include(dbUsers.jonSnow)
                })
        })

        // it('should report error without stacktrace when accessToken is expired', async () => {
        //     // fake time
        //     const clock = sinon.useFakeTimers()
        //     const expiredAccessToken = (await User.findAndGenerateToken(dbUsers.branStark))
        //         .accessToken

        //     // move clock forward by minutes set in config + 1 minute
        //     clock.tick(JWT_EXPIRATION * 60000 + 60000)

        //     return request(app)
        //         .get('/v1/users/profile')
        //         .set('Authorization', `Bearer ${expiredAccessToken}`)
        //         .expect(httpStatus.UNAUTHORIZED)
        //         .then(res => {
        //             expect(res.body.code).to.be.equal(httpStatus.UNAUTHORIZED)
        //             expect(res.body.message).to.be.equal('jwt expired')
        //             expect(res.body).to.not.have.a.property('stack')
        //         })
        // })
    })

    describe('PATCH /v1/users/profile', () => {
        it('should update current user', async () => {
            delete dbUsers.jonSnow.password
            const { name } = user

            return request(app)
                .patch(`/v1/users/profile`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ name })
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.be.equal(name)
                    expect(res.body.email).to.be.equal(dbUsers.jonSnow.email)
                })
        })

        it('should not update user when no parameters were given', async () => {
            delete dbUsers.jonSnow.password

            return request(app)
                .patch(`/v1/users/profile`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send()
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body).to.include(dbUsers.jonSnow)
                })
        })

        it('should not update the role of the user if they are not an admin', async () => {
            delete dbUsers.jonSnow.password
            const role = 'admin'

            return request(app)
                .patch(`/v1/users/profile`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ role })
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.role).to.not.be.equal(role)
                })
        })
    })

    describe('DELETE /v1/users/profile', () => {
        it('should delete current user', async () => {
            delete dbUsers.jonSnow.password

            return request(app)
                .delete(`/v1/users/profile`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(httpStatus.NO_CONTENT)
                .then(() => request(app).get('/v1/users'))
                .then(async () => {
                    const users = await User.find({})
                    expect(users).to.have.lengthOf(1)
                })
        })
    })

    after(() => {
        disconnect()
        server.close()
    })
})

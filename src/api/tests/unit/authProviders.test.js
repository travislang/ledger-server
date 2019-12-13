/* eslint-disable no-unused-expressions */
const axios = require('axios')
const { expect } = require('chai')
const sinon = require('sinon')
const authProviders = require('../../services/authProviders')
const jwt = require('jsonwebtoken')

const sandbox = sinon.createSandbox()

describe('AuthProviders Functions', () => {
    let accessToken

    beforeEach(async () => {
        accessToken =
            '5947397b323ae82d8c3a333b.c69d0435e62c9f4953af912442a3d064e20291f0d228c0552ed4be473e7d191ba40b18c2c47e8b9d'
    })

    afterEach(() => sandbox.restore())

    describe('AuthProviders.facebook()', () => {
        it('should return oAuth data when called', async () => {
            const facebookResponse = {
                data: {
                    service: 'facebook',
                    id: '123',
                    name: 'user',
                    email: 'test@test.com',
                    picture: {
                        data: {
                            url: 'test.jpg',
                        },
                    },
                    data: {},
                },
            }
            const facebookOauthResponse = {
                service: 'facebook',
                id: '123',
                name: 'user',
                email: 'test@test.com',
                avatar: 'test.jpg',
            }

            sandbox.stub(axios, 'get').callsFake(() => Promise.resolve(facebookResponse))
            sandbox.spy(authProviders, 'facebook')

            const oAuthResponse = await authProviders.facebook(accessToken)

            expect(axios.get.calledTwice).to.be.true
            expect(authProviders.facebook.calledOnce).to.be.true
            expect(oAuthResponse).to.include(facebookOauthResponse)
        })
    })

    describe('AuthProviders.google()', () => {
        it('should return oAuth data when called', async () => {
            const googleResponse = {
                data: {
                    sub: '123',
                    name: 'user',
                    email: 'test@test.com',
                    picture: 'test.jpg',
                },
            }
            const googleOauthResponse = {
                service: 'google',
                id: '123',
                name: 'user',
                email: 'test@test.com',
                avatar: 'test.jpg',
            }

            sandbox.stub(axios, 'get').callsFake(() => Promise.resolve(googleResponse))
            sandbox.spy(authProviders, 'google')

            const oAuthResponse = await authProviders.google(accessToken)

            expect(axios.get.calledOnce).to.be.true
            expect(authProviders.google.calledOnce).to.be.true
            expect(oAuthResponse).to.include(googleOauthResponse)
        })
    })

    describe('AuthProviders.apple()', () => {
        it('should return oAuth data when called', async () => {
            const appleOauthResponse = {
                service: 'apple',
                id: '123',
                email: 'test@test.com',
            }
            const jwtDecoded = {
                sub: '123',
                email: 'test@test.com',
            }

            sandbox.stub(jwt, 'decode').returns(jwtDecoded)
            sandbox.spy(authProviders, 'apple')

            const oAuthResponse = await authProviders.apple(accessToken)

            expect(jwt.decode.calledOnce).to.be.true
            expect(authProviders.apple.calledOnce).to.be.true
            expect(oAuthResponse).to.include(appleOauthResponse)
        })
    })
})

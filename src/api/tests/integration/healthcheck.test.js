/* eslint-disable no-unused-expressions */
const request = require('supertest')
const httpStatus = require('http-status')
const { expect } = require('chai')
const { app } = require('../../../index')

describe('Healthcheck API', () => {
    describe('GET /v1/status', () => {
        it('should return ok', () => {
            return request(app)
                .get('/v1/status')
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.text).to.be.equal('OK')
                })
        })
    })
})

/* eslint-disable no-unused-expressions */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const moment = require('moment')
const emailProvider = require('../../services/emails/emailProvider')
const Email = require('email-templates')

// eslint-disable-next-line prefer-destructuring
const expect = chai.expect
chai.use(sinonChai)

const sandbox = sinon.createSandbox()

describe('Email Provider module', () => {
    let passwordResetObj

    beforeEach(async () => {
        passwordResetObj = {
            resetToken:
                '5947397b323ae82d8c3a333b.c69d0435e62c9f4953af912442a3d064e20291f0d228c0552ed4be473e7d191ba40b18c2c47e8b9d',
            userId: '5947397b323ae82d8c3a333b',
            userEmail: 'tlang505@gmail.com',
            expires: moment()
                .add(2, 'hours')
                .toDate(),
        }
    })

    afterEach(() => sandbox.restore())

    describe('sendPasswordReset function', () => {
        it('should send passport reset email when called', async () => {
            const emailStub = sandbox
                .stub(Email.prototype, 'send')
                .callsFake(() => Promise.resolve('email sent'))

            const emailProviderSpy = sandbox.spy(emailProvider, 'sendPasswordReset')

            await emailProvider.sendPasswordReset(passwordResetObj)

            expect(emailProviderSpy).to.have.been.calledOnceWith(passwordResetObj)
            expect(emailStub).to.have.been.calledOnce
        })
        it('should catch any error', async () => {
            const emailStub = sandbox.stub(Email.prototype, 'send').throws()

            const emailProviderSpy = sandbox.spy(emailProvider, 'sendPasswordReset')

            try {
                await emailProvider.sendPasswordReset(passwordResetObj)
            } catch (err) {
                expect(emailStub).to.throw
            }

            expect(emailProviderSpy).to.have.been.calledOnceWith(passwordResetObj)
            expect(emailStub).to.have.been.calledOnce
        })
    })

    describe('sendPasswordChangeEmail function', () => {
        it('should send passport change email when called', async () => {
            const emailStub = sandbox
                .stub(Email.prototype, 'send')
                .callsFake(() => Promise.resolve('email sent'))

            const emailProviderSpy = sandbox.spy(emailProvider, 'sendPasswordChangeEmail')

            await emailProvider.sendPasswordChangeEmail(passwordResetObj)

            expect(emailProviderSpy).to.have.been.calledOnceWith(passwordResetObj)
            expect(emailStub).to.have.been.calledOnce
        })
        it('should catch any error', async () => {
            const emailStub = sandbox.stub(Email.prototype, 'send').throws()

            const emailProviderSpy = sandbox.spy(emailProvider, 'sendPasswordChangeEmail')

            try {
                await emailProvider.sendPasswordChangeEmail(passwordResetObj)
            } catch (err) {
                expect(emailStub).to.throw
            }

            expect(emailProviderSpy).to.have.been.calledOnceWith(passwordResetObj)
            expect(emailStub).to.have.been.calledOnce
        })
    })
})

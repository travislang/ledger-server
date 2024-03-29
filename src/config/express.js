const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compress = require('compression')
const methodOverride = require('method-override')
const cors = require('cors')
const helmet = require('helmet')
const passport = require('passport')
const routes = require('../api/routes/v1')
const staticRoutes = require('../static/routes')
const { logs } = require('./keys')
const strategies = require('./passport')
const error = require('../api/middlewares/error')

/**
 * Express instance
 * @public
 */
const app = express()

// request logging. dev: console | production: file
if (process.env.NODE_ENV !== 'test') app.use(morgan(logs))

app.set('trust proxy', 1)

// parse body params and attach them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// gzip compression
app.use(compress())

// allow HTTP verbs client side
app.use(methodOverride())

// set various HTTP security headers
app.use(helmet())

// enable CORS - Cross Origin Resource Sharing
app.use(cors())

// enable authentication
app.use(passport.initialize())
passport.use('jwt', strategies.jwt)
passport.use('facebook', strategies.facebook)
passport.use('google', strategies.google)
passport.use('apple', strategies.apple)

// add favicon support
app.use('/favicon.ico', express.static('public/images/favicon.ico'))

// mount api v1 routes
app.use('/v1', routes)

// mount contact routes
app.use('/static-routes', staticRoutes)

// default page
app.use('/', express.static('public'))

// if error is not an instanceOf APIError, convert it.
app.use(error.converter)

// catch 404 and forward to error handler
app.use(error.notFound)

// error handler, send stacktrace only during development
app.use(error.handler)

module.exports = app

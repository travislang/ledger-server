const { port, env } = require('./config/keys')
const logger = require('./config/logger')
const app = require('./config/express')
const mongoose = require('./config/mongoose')

// open mongoose connection
mongoose.connect()

// listen to requests
const server = app.listen(port, () => logger.info(`server started on port ${port} (${env})`))

exports.app = app
exports.server = server

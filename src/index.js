const { port, env } = require('./config/keys')
const logger = require('./config/logger')
const app = require('./config/express')
const mongoose = require('./config/mongoose')
// const seedDb = require('./seed')

process.env.TZ = 'America/New_York'

const d = new Date()
console.log('date', d, d.toLocaleTimeString())

// open mongoose connection
mongoose.connect()

// seedDb.run('5e31ca99fb2bab3d8e1c1d39')

// listen to requests
const server = app.listen(port, () => logger.info(`server started on port ${port} (${env})`))

exports.app = app
exports.server = server

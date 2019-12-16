/* eslint-disable function-paren-newline */
const mongoose = require('mongoose')
const logger = require('./../config/logger')
const { mongo, env } = require('./keys')

// Exit application on failed reconnect
mongoose.connection.on('error', err => {
    logger.error(`MongoDB connection error: ${err}.  Trying to reconnect...`)
    process.exit(1)
})

mongoose.connection.once('open', () => {
    logger.info('connected to mongoDB')
})
mongoose.connection.once('close', () => {
    logger.info('disconnected from mongoDB')
})

// print mongoose logs in dev env
if (env === 'development') {
    mongoose.set('debug', true)
}

exports.connect = () => {
    mongoose
        .connect(mongo.uri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        .catch(error => logger.error(`MongoDB initial connection error: ${error}`))
    return mongoose.connection
}

exports.disconnect = () => {
    mongoose.disconnect(err => {
        if (err) logger.error(`error closing mongoDB connections, ${err}`)
    })
}

const mongoose = require('mongoose')
const logger = require('./../config/logger')
const { mongo, env } = require('./keys')

// Exit application on error
mongoose.connection.on('error', err => {
    logger.error(`MongoDB connection error: ${err}`)
    process.exit(-1)
})

mongoose.connection.once('opem', () => {
    logger.info('connected to mongoDB')
})

// print mongoose logs in dev env
if (env === 'development') {
    mongoose.set('debug', true)
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
    mongoose
        .connect(mongo.uri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        .catch(error => logger.error(`MongoDB initial connection error: ${error}`));
    return mongoose.connection;
};

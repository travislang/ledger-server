const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment');
// const jwt = require('jwt-simple');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const APIError = require('../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/keys');

const roles = ['user', 'admin'];

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            // match: /^\S+@\S+\.\S+$/,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 128
        },
        name: {
            type: String,
            maxlength: 128,
            index: true,
            trim: true
        },
        services: {
            google: String,
            apple: String,
            facebook: String,
            twitter: String
        },
        role: {
            type: String,
            enum: roles,
            default: 'user'
        },
        avatar: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre('save', async function save(next) {
    try {
        if (!this.isModified('password')) return next();

        const saltRounds = env === 'test' ? 1 : 12;

        const hash = await bcrypt.hash(this.password, saltRounds)
        this.password = hash;

        return next();
    } catch (error) {
        return next(error);
    }
});

userSchema.method({
    transform() {
        const transformed = {};
        const fields = ['id', 'name', 'email', 'avatar', 'role', 'createdAt'];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },

    token() {
        const payload = {
            exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
            iat: moment().unix(),
            sub: this._id,
        };
        return jwt.sign(payload, jwtSecret);
    },

    async passwordMatches(password) {
        return bcrypt.compare(password, this.password);
    },
});

userSchema.statics = {

    roles,

    async get(id) {
        // eslint-disable-next-line no-useless-catch
        try {
            let user;

            if (mongoose.Types.ObjectId.isValid(id)) {
                user = await this.findById(id).exec();
            }
            if (user) {
                return user;
            }

            throw new APIError({
                message: 'User does not exist',
                status: httpStatus.NOT_FOUND,
            });
        } catch (error) {
            throw error;
        }
    },

    async findAndGenerateToken(options) {
        const { email, password, refreshObject } = options;
        if (!email) throw new APIError({ message: 'An email is required to generate a token' });

        const user = await this.findOne({ email }).exec();
        const err = {
            status: httpStatus.UNAUTHORIZED,
            isPublic: true,
        };
        if (password) {
            if (user && await user.passwordMatches(password)) {
                return { user, accessToken: user.token() };
            }
            err.message = 'Incorrect email or password';
        } else if (refreshObject && refreshObject.userEmail === email) {
            if (moment(refreshObject.expires).isBefore()) {
                err.message = 'Invalid refresh token.';
            } else {
                return { user, accessToken: user.token() };
            }
        } else {
            err.message = 'Incorrect email or refreshToken';
        }
        throw new APIError(err);
    },

    list({
        page = 1, perPage = 30, name, email, role,
    }) {
        const options = omitBy({ name, email, role }, isNil);

        return this.find(options)
            .sort({ createdAt: -1 })
            .skip(perPage * (page - 1))
            .limit(perPage)
            .exec();
    },

    checkDuplicateEmail(error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return new APIError({
                message: 'Validation Error',
                errors: [{
                    field: 'email',
                    location: 'body',
                    messages: ['"email" already exists'],
                }],
                status: httpStatus.CONFLICT,
                isPublic: true,
                stack: error.stack,
            });
        }
        return error;
    },

    async oAuthLogin({
        service, id, email, name, picture,
    }) {
        const user = await this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] });
        if (user) {
            user.services[service] = id;
            if (!user.name) user.name = name;
            if (!user.picture) user.picture = picture;
            return user.save();
        }
        const password = uuidv4();
        return this.create({
            services: { [service]: id }, email, password, name, picture,
        });
    },
};

module.exports = mongoose.model('User', userSchema);

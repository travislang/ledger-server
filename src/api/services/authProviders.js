/* eslint-disable camelcase */
const axios = require('axios')
const jwt = require('jsonwebtoken')

exports.facebook = async access_token => {
    const fields = 'id, name, email, picture'
    const url = 'https://graph.facebook.com/me'
    const params = { access_token, fields }
    const response = await axios.get(url, { params })
    const { id, name, email, picture } = response.data
    const avatarResponse = await axios.get(`${url}/picture`, {
        params: {
            access_token,
            width: 200,
            height: 200,
            redirect: 0,
        },
    })
    const { data } = avatarResponse.data
    return {
        service: 'facebook',
        avatar: data.url ? data.url : picture.data.url,
        id,
        name,
        email,
    }
}

exports.google = async access_token => {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
    const params = { access_token }
    const response = await axios.get(url, { params })
    const { sub, name, email, picture } = response.data
    return {
        service: 'google',
        avatar: picture,
        id: sub,
        name,
        email,
    }
}

exports.apple = async access_token => {
    const decodedJwt = jwt.decode(access_token)
    const { email, sub } = decodedJwt
    return {
        service: 'apple',
        id: sub,
        email,
    }
}

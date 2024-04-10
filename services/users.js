import http from './http'

export default class User {
    static async login(opts) {
        if (!opts.email || !opts.password) {
            return null
        }
        try {
            // login route will return a user if the email/password is valid
            const { data } = await http.post('/login', opts)
            return data
        } catch (e) {
            throw e
        }
    }

    static async update(id, payload) {
        try {
            // so we know who is making the request
            const lsUser = JSON.parse(localStorage.getItem('mcdoodle.user'))
            const { data } = await http.put(`/users/${id}`, payload, {
                headers: {
                    'x-mcdoodle-user-id': lsUser.id,
                },
            })
            return data
        } catch (e) {
            throw e
        }
    }

    static async register(payload) {
        try {
            const { data } = await http.post('/users', payload)
            return data
        } catch (e) {
            throw e
        }
    }
}

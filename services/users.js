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
}

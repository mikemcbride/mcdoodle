import http from './http'

type LoginOpts = {
    email: string;
    password: string;
}

export default class User {
    static async list() {
        try {
            const { data } = await http.get('/users')
            return data
        } catch (e) {
            console.error('unable to fetch users', e)
            return []
        }
    }

    static async login(opts: LoginOpts) {
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

    static async update(id: string | undefined, payload: any) {
        // the caller's identity comes from the session cookie; no header needed.
        const { data } = await http.put('/users', { id, ...payload })
        return data
    }

    static async register(payload: { firstName: string; lastName: string; email: string; password: string }) {
        try {
            const { data } = await http.post('/users', payload)
            return data
        } catch (e) {
            throw e
        }
    }
}

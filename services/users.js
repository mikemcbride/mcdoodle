import http from './http'
const BASE_URL = 'users'

let userCache = null
let currentUser = null

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

    static setCurrentUser(user) {
        currentUser = user
    }

    static getCurrentUser() {
        return currentUser
    }

    static async findById(id) {
        if (!userCache) {
            await User.list()
        }
        let found = userCache.find(user => user.id === id)
        if (found) {
            return found
        }
        const { data } = await http.get(BASE_URL, { params: { id } })
        return data
    }

    static async findByUserId(id) {
        if (!userCache) {
            await User.list()
        }
        let found = userCache.find(user => user.user_id === id)
        if (found) {
            return found
        }
        const { data } = await http.get(BASE_URL, { params: { userId: id } })
        return data
    }

    static async findByEmail(email) {
        let found = null
        if (userCache) {
            found = userCache.find(user => user.email.toLowerCase() === email.toLowerCase())
        }
        if (found) return found
        const { data } = await http.get(BASE_URL, { params: { email } })
        return data
    }

    static async list() {
        if (userCache) return userCache
        const { data: users } = await http.get(BASE_URL)
        userCache = users
        return users
    }

    static async update(payload) {
        if (!payload.id) {
            // can't update a user without an id
            return new Error('Cannot update user without id')
        }
        try {
            const { data } = await http.put(BASE_URL, payload)
            // update the cache when a user changes
            if (userCache) {
                userCache = userCache.map(user => {
                    return user.id === data.id ? data : user
                })
            }
            return data
        } catch (e) {
            return e
        }
    }
}

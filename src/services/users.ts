import http from './http'
import type { AuthUser, User as UserType } from '../types'

type LoginOpts = {
    email: string;
    password: string;
}

// Fields a caller may send on a profile update. The server whitelists again —
// this is just the client-side shape.
type UpdateUserPayload = Partial<Pick<UserType, 'email' | 'firstName' | 'lastName' | 'isAdmin' | 'isVerified'>> & {
    currentPassword?: string;
    newPassword?: string;
}

export default class User {
    static async list(): Promise<UserType[]> {
        try {
            const { data } = await http.get<UserType[]>('/users')
            return data
        } catch (e) {
            console.error('unable to fetch users', e)
            return []
        }
    }

    static async login(opts: LoginOpts): Promise<AuthUser | null> {
        if (!opts.email || !opts.password) {
            return null
        }
        // login route will return a user if the email/password is valid
        const { data } = await http.post<AuthUser>('/login', opts)
        return data
    }

    static async update(id: string | undefined, payload: UpdateUserPayload): Promise<AuthUser> {
        // the caller's identity comes from the session cookie; no header needed.
        const { data } = await http.put<AuthUser>('/users', { id, ...payload })
        return data
    }

    static async register(payload: { firstName: string; lastName: string; email: string; password: string }): Promise<UserType> {
        const { data } = await http.post<UserType>('/users', payload)
        return data
    }
}

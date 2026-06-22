import http from './http'
import { Poll } from '../types'

let pollCache: Poll[] | null = null

export default class Polls {
    static async list() {
        if (pollCache) return pollCache
        try {
            const { data } = await http.get('/polls')
            pollCache = data
            return data
        } catch (e) {
            console.error('unable to fetch polls', e)
            pollCache = []
            return []
        }
    }

    static async bustCache() {
        pollCache = null
        await Polls.list()
    }

    static async findById(id: string, bustCache: boolean = false) {
        if (!pollCache) {
            await Polls.list()
        }
        
        if (bustCache) {
            const { data: poll } = await http.get('/polls', { params: { id: id }})
            if (pollCache) {
                let seen = false
                pollCache = pollCache.map(p => {
                    if (p.id === poll.id) {
                        seen = true
                        return poll
                    }
                    return p
                })
                if (!seen) {
                    pollCache.push(poll)
                }
            }
            return poll
        }

        const found = pollCache?.find((it) => it.id === id)
        if (found) return found
        return null
    }

    // Composed fetch: poll + questions + submissions (with responses) in one request.
    static async findFull(id: string) {
        const { data } = await http.get('/polls', { params: { id, full: true } })
        return data
    }

    static async create(payload: any) {
        // create requires an authenticated session (enforced server-side via cookie).
        const { data } = await http.post('/polls', payload)
        if (pollCache) {
            pollCache.push(data)
        } else {
            pollCache = await Polls.list()
        }
        return data
    }

    static async setStatus(pollId: string, status: 'open' | 'closed') {
        // auth is enforced server-side via the session cookie.
        const { data } = await http.put('/polls', { id: pollId, status })
        if (pollCache) {
            pollCache = pollCache.map(p => p.id === pollId ? { ...p, status } : p)
        }
        return data
    }

    static async remove(pollId: string) {
        // delete requires an authenticated session (enforced server-side via cookie).
        const { data } = await http.delete('/polls', { params: { id: pollId } })
        if (pollCache) {
            pollCache = pollCache.filter(it => it.id !== pollId)
        }
        return data
    }
}

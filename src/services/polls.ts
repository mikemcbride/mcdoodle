import http from './http'

export default class Polls {
    // List view: polls with a server-computed submissionCount.
    static async listWithCounts() {
        const { data } = await http.get('/polls', { params: { withCounts: true } })
        return data
    }

    // Composed fetch: poll + questions + submissions (with responses) in one request.
    static async findFull(id: string) {
        const { data } = await http.get('/polls', { params: { id, full: true } })
        return data
    }

    static async create(payload: any) {
        // create requires an authenticated session (enforced server-side via cookie).
        const { data } = await http.post('/polls', payload)
        return data
    }

    static async remove(pollId: string) {
        // delete requires an authenticated session (enforced server-side via cookie).
        const { data } = await http.delete('/polls', { params: { id: pollId } })
        return data
    }

    static async setStatus(pollId: string, status: 'open' | 'closed') {
        // auth is enforced server-side via the session cookie.
        const { data } = await http.put('/polls', { id: pollId, status })
        return data
    }
}

import http from './http'

let pollCache = null

export default class Polls {
    static async list() {
        if (pollCache) return pollCache
        try {
            let { data } = await http.get('/polls')
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

    static async findById(id, bustCache = false) {
        if (!pollCache) {
            await Polls.list()
        }
        
        if (bustCache) {
            let { data: poll } = await http.get('/polls', { params: { id: id }})
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

        let found = pollCache.find((it) => it.id === id)
        if (found) return found
        return null
    }

    static async create(payload) {
        // create and remove require you to be logged in.
        const apiKey = window.localStorage.getItem('mcdoodle.apiKey')
        if (!apiKey) return
        let { data } = await http.post('/polls', payload, { headers: { 'x-mcdoodle-api-key': apiKey }})
        if (pollCache) {
            pollCache.push(data)
        } else {
            pollCache = await Polls.list()
        }
        return data
    }

    static async remove(pollId) {
        const apiKey = window.localStorage.getItem('mcdoodle.apiKey')
        if (!apiKey) return
        let { data } = await http.delete('/polls', { params: { id: pollId }, headers: { 'x-mcdoodle-api-key': apiKey }})
        if (pollCache) {
            pollCache = pollCache.filter(it => it.id !== pollId)
        }
        return data
    }
}

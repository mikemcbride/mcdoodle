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
        let { data } = await http.post('/polls', payload)
        if (pollCache) {
            pollCache.push(data)
        } else {
            pollCache = await Polls.list()
        }
        return data
    }

    static async update(payload) {
        let updateFields = {
            id: payload.id,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            questions: payload.questions,
            submissions: payload.submissions,
        }
        let { data } = await http.put('/polls', updateFields)

        // update the pollCache with updated poll value
        if (pollCache) {
            pollCache = pollCache.map((it) => {
                if (it.id === data.id) {
                    return data
                }
                return it
            })
        }

        return data
    }
}

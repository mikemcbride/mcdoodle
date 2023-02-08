import http from './http'

export default class Submissions {
    static async find(params) {
        try {
            let { data } = await http.get('/submissions', { params })
            return data
        } catch (e) {
            console.error('unable to fetch submissions', e)
            return []
        }
    }

    static async findById(id) {
        try {
            let { data } = await http.get('/submissions', { params: { id } })
            return data
        } catch (e) {
            console.error('unable to fetch submission by id', e)
            return null
        }
    }

    static async create(payload) {
        let { data } = await http.post('/submissions', payload)
        return data
    }

    static async update(payload) {
        let updateFields = {
            id: payload.id,
            person: payload.person,
            poll_id: payload.poll_id,
        }
        let { data } = await http.put('/submissions', updateFields)
        return data
    }
}

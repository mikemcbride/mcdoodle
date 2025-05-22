import http from './http'

export default class Submissions {
    static async find(params = {}) {
        try {
            const { data } = await http.get('/submissions', { params })
            return data
        } catch (e) {
            console.error('unable to fetch submissions', e)
            return []
        }
    }

    static async findById(id: string) {
        try {
            const { data } = await http.get('/submissions', { params: { id } })
            return data
        } catch (e) {
            console.error('unable to fetch submission by id', e)
            return null
        }
    }

    // TODO: add type for payload
    static async create(payload: any) {
        const { data } = await http.post('/submissions', payload)
        return data
    }

    // TODO: add type for payload
    static async update(payload: any) {
        const updateFields = {
            id: payload.id,
            person: payload.person,
            poll_id: payload.poll_id,
        }
        const { data } = await http.put('/submissions', updateFields)
        return data
    }
}

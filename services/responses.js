import http from './http'

export default class Responses {
    static async find(params) {
        try {
            let { data } = await http.get('/responses', { params })
            return data
        } catch (e) {
            console.error('unable to fetch responses', e)
            return []
        }
    }

    static async findById(id) {
        try {
            let { data } = await http.get('/responses', { params: { id }})
            return data
        } catch (e) {
            console.error('unable to fetch response by id', e)
            return null
        }
    }

    static async create(payload) {
        let { data } = await http.post('/responses', payload)
        return data
    }

    static async update(payload) {
        let updateFields = {
            id: payload.id,
            value: payload.value,
            question_id: payload.question,
            submission_id: payload.submission || [],
        }
        let { data } = await http.put('/responses', updateFields)
        return data
    }
}

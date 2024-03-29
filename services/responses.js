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
            let { data } = await http.get('/responses', { params: { id } })
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
        if (Array.isArray(payload)) {
            payload = payload.map(item => {
                return {
                    id: item.id,
                    value: item.value,
                    question_id: item.question_id,
                    submission_id: item.submission_id,
                    poll_id: item.poll_id,
                }
            })
        } else {
            payload = {
                id: payload.id,
                value: payload.value,
                question_id: payload.question_id,
                submission_id: payload.submission_id,
                poll_id: payload.poll_id,
            }
        }
        let { data } = await http.put('/responses', payload)
        return data
    }
}

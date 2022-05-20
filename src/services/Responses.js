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

    static async getMultiple(ids) {
        let promises = ids.map(id => Responses.findById(id))
        let res = await Promise.allSettled(promises)
        return res.filter(it => it.status === 'fulfilled' && !!it.value).map(it => it.value)
    }

    static async create(payload) {
        if (!Array.isArray(payload.question)) {
            payload.question = [payload.question]
        }
        if (!Array.isArray(payload.submission)) {
            payload.submission = [payload.submission]
        }
        let { data } = await http.post('/responses', payload)
        return data
    }

    static async update(payload) {
        let updateFields = {
            id: payload.id,
            value: payload.value,
            question: payload.question,
            submission: payload.submission || [],
        }
        if (!Array.isArray(updateFields.question)) {
            updateFields.question = [updateFields.question]
        }
        if (!Array.isArray(updateFields.submission)) {
            updateFields.submission = [updateFields.submission]
        }
        let { data } = await http.put('/responses', updateFields)
        return data
    }
}

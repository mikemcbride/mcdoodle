import http from './http'

export default class Questions {
    static async find(params) {
        try {
            let { data } = await http.get('/questions', { params })
            return data
        } catch (e) {
            console.error('unable to fetch questions', e)
            return []
        }
    }

    static async findById(id) {
        try {
            let { data } = await http.get('/questions', { params: { id }})
            return data
        } catch (e) {
            console.error('unable to fetch question by id', e)
            return null
        }
    }

    static async getMultiple(ids) {
        let promises = ids.map(id => Questions.findById(id))
        let res = await Promise.allSettled(promises)
        return res.filter(it => it.status === 'fulfilled' && !!it.value).map(it => it.value)
    }

    static async create(payload) {
        let { data } = await http.post('/questions', payload)
        return data
    }

    static async update(payload) {
        let updateFields = {
            id: payload.id,
            value: payload.value,
            poll: payload.poll,
            responses: payload.responses || [],
        }
        let { data } = await http.put('/questions', updateFields)
        return data
    }
}

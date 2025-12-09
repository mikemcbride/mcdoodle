import http from './http'

export default class Questions {
    static async find(params: any) {
        try {
            const { data } = await http.get('/questions', { params })
            return data
        } catch (e) {
            console.error('unable to fetch questions', e)
            return []
        }
    }

    static async findById(id: string) {
        try {
            const { data } = await http.get('/questions', { params: { id }})
            return data
        } catch (e) {
            console.error('unable to fetch question by id', e)
            return null
        }
    }

    static async getMultiple(ids: string[]) {
        const promises = ids.map(id => Questions.findById(id))
        const res = await Promise.allSettled(promises)
        return res.filter((it: any) => it.status === 'fulfilled' && !!it.value).map((it: any) => it.value)
    }

    static async create(payload: any) {
        const { data } = await http.post('/questions', payload)
        return data
    }
}

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
            let { data } = await http.get('/submissions', { params: { id }})
            return data
        } catch (e) {
            console.error('unable to fetch submission by id', e)
            return null
        }
    }

    static async getMultiple(ids) {
        let promises = ids.map(id => Submissions.findById(id))
        let res = await Promise.allSettled(promises)
        return res.filter(it => it.status === 'fulfilled' && !!it.value).map(it => it.value)
    }

    static async create(payload) {
        if (!Array.isArray(payload.poll)) {
            payload.poll = [payload.poll]
        }
        let { data } = await http.post('/submissions', payload)
        return data
    }

    static async update(payload) {
        let updateFields = {
            id: payload.id,
            person: payload.person,
            poll: payload.poll,
            responses: payload.responses || [],
        }
        // poll needs to be an Array, even though it only allows a single value.
        if (!Array.isArray(updateFields.poll)) {
            updateFields.poll = [updateFields.poll]
        }
        updateFields.responses = updateFields.responses.map(response => {
            if (typeof response !== 'string') {
                // we have an object - likely an inflated response object. grab the id.
                if (response.id) {
                    return response.id
                }
                return null // TODO: throw an error?
            }
        })
        let { data } = await http.put('/submissions', updateFields)
        return data
    }
}

import http from './http'
import { Response, ResponseQueryParams } from '../types';

// A response that hasn't been persisted yet (no id).
export type NewResponse = Omit<Response, 'id'>

export default class Responses {
    static async find(params: ResponseQueryParams): Promise<Response[]> {
        try {
            const { data } = await http.get<Response[]>('/responses', { params })
            return data
        } catch (e) {
            console.error('unable to fetch responses', e)
            return []
        }
    }

    static async findById(id: string): Promise<Response | null> {
        try {
            const { data } = await http.get<Response>('/responses', { params: { id } })
            return data
        } catch (e) {
            console.error('unable to fetch response by id', e)
            return null
        }
    }

    static async create(payload: NewResponse[]): Promise<Response[]> {
        const { data } = await http.post<Response[]>('/responses', payload)
        return data
    }

    static async update(payload: Response[]): Promise<Response[]> {
        // only id + value are updatable server-side
        const updateFields = payload.map(item => ({
            id: item.id,
            value: item.value,
        }))
        const { data } = await http.put<Response[]>('/responses', updateFields)
        return data
    }
}

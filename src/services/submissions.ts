import http from './http'
import type { Submission } from '../types'

type SubmissionQueryParams = {
    id?: string;
    poll_id?: string;
}

export default class Submissions {
    static async find(params: SubmissionQueryParams = {}): Promise<Submission[]> {
        try {
            const { data } = await http.get<Submission[]>('/submissions', { params })
            return data
        } catch (e) {
            console.error('unable to fetch submissions', e)
            return []
        }
    }

    static async findById(id: string): Promise<Submission | null> {
        try {
            const { data } = await http.get<Submission>('/submissions', { params: { id } })
            return data
        } catch (e) {
            console.error('unable to fetch submission by id', e)
            return null
        }
    }

    static async create(payload: { person: string; poll_id: string }): Promise<Submission> {
        const { data } = await http.post<Submission>('/submissions', payload)
        return data
    }

    static async update(payload: Pick<Submission, 'id' | 'person'>): Promise<Submission> {
        // only the display name is updatable server-side
        const updateFields = {
            id: payload.id,
            person: payload.person,
        }
        const { data } = await http.put<Submission>('/submissions', updateFields)
        return data
    }
}

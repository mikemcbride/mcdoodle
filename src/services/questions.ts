import http from './http'
import type { Question } from '../types'

// A question that hasn't been persisted yet (no id).
export type NewQuestion = Omit<Question, 'id'>

type QuestionQueryParams = {
    id?: string;
    poll_id?: string;
}

export default class Questions {
    static async find(params: QuestionQueryParams): Promise<Question[]> {
        try {
            const { data } = await http.get<Question[]>('/questions', { params })
            return data
        } catch (e) {
            console.error('unable to fetch questions', e)
            return []
        }
    }

    static async findById(id: string): Promise<Question | null> {
        try {
            const { data } = await http.get<Question>('/questions', { params: { id }})
            return data
        } catch (e) {
            console.error('unable to fetch question by id', e)
            return null
        }
    }

    static async getMultiple(ids: string[]): Promise<Question[]> {
        const promises = ids.map(id => Questions.findById(id))
        const res = await Promise.allSettled(promises)
        return res
            .filter((it): it is PromiseFulfilledResult<Question> => it.status === 'fulfilled' && !!it.value)
            .map((it) => it.value)
    }

    static async create(payload: NewQuestion | NewQuestion[]): Promise<Question[]> {
        const { data } = await http.post<Question[]>('/questions', payload)
        return data
    }
}

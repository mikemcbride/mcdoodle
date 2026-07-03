import http from './http'
import type { Poll, PollStatus } from '../types'

type CreatePollPayload = {
    title: string;
    description?: string;
    status?: PollStatus;
    allowIfNeeded?: boolean;
    requiresAccount?: boolean;
}

export default class Polls {
    // List view: polls with a server-computed submissionCount.
    static async listWithCounts(): Promise<Poll[]> {
        const { data } = await http.get<Poll[]>('/polls', { params: { withCounts: true } })
        return data
    }

    // Composed fetch: poll + questions + submissions (with responses) in one request.
    static async findFull(id: string): Promise<Poll> {
        const { data } = await http.get<Poll>('/polls', { params: { id, full: true } })
        return data
    }

    static async create(payload: CreatePollPayload): Promise<Poll> {
        // create requires an authenticated session (enforced server-side via cookie).
        const { data } = await http.post<Poll>('/polls', payload)
        return data
    }

    static async remove(pollId: string): Promise<{ message: string; deletedId: string }> {
        // delete requires an authenticated session (enforced server-side via cookie).
        const { data } = await http.delete<{ message: string; deletedId: string }>('/polls', { params: { id: pollId } })
        return data
    }

    static async setStatus(pollId: string, status: PollStatus): Promise<Poll> {
        // auth is enforced server-side via the session cookie.
        const { data } = await http.put<Poll>('/polls', { id: pollId, status })
        return data
    }
}

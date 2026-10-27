import { describe, it, expect } from 'vitest'
import {
  buildQuestions,
  isValidDate,
  normalizeTimes,
  sortQuestions,
  formatQuestionDate,
  formatQuestionTime,
  questionLabel,
} from '../src/lib/questions'

describe('buildQuestions', () => {
  it('with no times, produces one all-day option per date (sorted)', () => {
    const qs = buildQuestions(['2026-02-10', '2026-01-05'], { mode: 'shared', shared: [], perDate: {} })
    expect(qs).toEqual([
      { value: '2026-01-05', time: null, order: 0 },
      { value: '2026-02-10', time: null, order: 1 },
    ])
  })

  it('shared mode applies the same times to every date', () => {
    const qs = buildQuestions(['2026-01-06', '2026-01-05'], { mode: 'shared', shared: ['13:00', '09:00'], perDate: {} })
    expect(qs.map((q) => [q.value, q.time, q.order])).toEqual([
      ['2026-01-05', '09:00', 0],
      ['2026-01-05', '13:00', 1],
      ['2026-01-06', '09:00', 2],
      ['2026-01-06', '13:00', 3],
    ])
  })

  it('per-date mode uses each date’s own list; dates without times stay all-day', () => {
    const qs = buildQuestions(['2026-01-05', '2026-01-06', '2026-01-07'], {
      mode: 'per-date',
      shared: ['11:00'], // ignored in per-date mode
      perDate: { '2026-01-05': ['10:00'], '2026-01-07': ['15:00', '16:00'] },
    })
    expect(qs.map((q) => [q.value, q.time])).toEqual([
      ['2026-01-05', '10:00'],
      ['2026-01-06', null],
      ['2026-01-07', '15:00'],
      ['2026-01-07', '16:00'],
    ])
  })

  it('drops blank/invalid/duplicate times and invalid dates', () => {
    const qs = buildQuestions(['2026-01-05', 'garbage', '2026-01-05'], {
      mode: 'shared',
      shared: ['', '09:00', '09:00', 'nope'],
      perDate: {},
    })
    expect(qs).toEqual([{ value: '2026-01-05', time: '09:00', order: 0 }])
  })

  it('drops impossible calendar dates rather than letting them roll over', () => {
    const qs = buildQuestions(['2026-02-31', '2026-02-28'], { mode: 'shared', shared: [], perDate: {} })
    expect(qs).toEqual([{ value: '2026-02-28', time: null, order: 0 }])
  })
})

describe('isValidDate', () => {
  it('accepts real dates including leap days', () => {
    for (const d of ['2026-01-01', '2024-02-29', '2000-02-29', '2026-12-31']) {
      expect(isValidDate(d), d).toBe(true)
    }
  })

  it('rejects impossible dates that still match YYYY-MM-DD', () => {
    for (const d of ['2026-02-31', '2026-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00', '2026-01-32']) {
      expect(isValidDate(d), d).toBe(false)
    }
  })

  it('rejects malformed strings', () => {
    for (const d of ['2026-1-1', '20260101', 'tomorrow', '']) {
      expect(isValidDate(d), d).toBe(false)
    }
  })
})

describe('normalizeTimes', () => {
  it('filters, dedupes, and sorts', () => {
    expect(normalizeTimes(['12:30', '', '08:00', '12:30', '25:00'])).toEqual(['08:00', '12:30'])
  })
})

describe('sortQuestions', () => {
  it('orders by date, then all-day first, then time', () => {
    const sorted = sortQuestions([
      { value: '2026-01-06', time: '09:00' },
      { value: '2026-01-05', time: '14:00' },
      { value: '2026-01-05', time: null },
      { value: '2026-01-05', time: '09:00' },
    ])
    expect(sorted.map((q) => `${q.value} ${q.time ?? 'all-day'}`)).toEqual([
      '2026-01-05 all-day',
      '2026-01-05 09:00',
      '2026-01-05 14:00',
      '2026-01-06 09:00',
    ])
  })
})

describe('formatting', () => {
  it('formats dates in local time (no off-by-one)', () => {
    expect(formatQuestionDate('2026-01-01')).toBe('Thu, Jan 1, 2026')
  })

  it('formats 24h times as 12h', () => {
    expect(formatQuestionTime('09:05')).toBe('9:05 AM')
    expect(formatQuestionTime('13:30')).toBe('1:30 PM')
    expect(formatQuestionTime('00:00')).toBe('12:00 AM')
  })

  it('builds a combined label', () => {
    expect(questionLabel('2026-01-01')).toBe('Thu, Jan 1, 2026')
    expect(questionLabel('2026-01-01', '13:30')).toBe('Thu, Jan 1, 2026 · 1:30 PM')
  })
})

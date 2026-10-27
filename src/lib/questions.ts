import { format } from 'date-fns/format'
import type { Question, TimeSelection } from '../types'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// Shape *and* calendar validity: `2026-02-31` matches the regex but isn't a
// real date, and `parseLocalDate` would silently roll it into March 3.
// Mirrors `isCalendarDate` in worker/schemas.ts.
export function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  if (m < 1 || m > 12 || d < 1) return false
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
  return d <= daysInMonth
}
export const isValidTime = (s: string) => TIME_RE.test(s)

// Parse a YYYY-MM-DD string as a *local* date. `new Date('2026-01-01')` is
// parsed as UTC midnight, which displays as the previous day anywhere west of
// Greenwich — the source of the old `addDays(..., 1)` hack.
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatQuestionDate(date: string): string {
  return format(parseLocalDate(date), 'EEE, MMM d, yyyy')
}

// "09:00" -> "9:00 AM"
export function formatQuestionTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  return format(new Date(2000, 0, 1, h, m), 'h:mm a')
}

// Single-line label, e.g. "Wed, Jan 1, 2026 · 9:00 AM"
export function questionLabel(date: string, time?: string | null): string {
  const d = formatQuestionDate(date)
  return time ? `${d} · ${formatQuestionTime(time)}` : d
}

// Chronological: by date, then all-day options first, then by time.
export function sortQuestions<T extends Pick<Question, 'value' | 'time'>>(questions: T[]): T[] {
  return [...questions].sort((a, b) => {
    if (a.value !== b.value) return a.value < b.value ? -1 : 1
    const at = a.time ?? ''
    const bt = b.time ?? ''
    if (at === bt) return 0
    return at < bt ? -1 : 1
  })
}

// Drop blanks/invalid entries, dedupe, and sort a list of HH:mm strings.
export function normalizeTimes(times: string[]): string[] {
  return [...new Set(times.filter(isValidTime))].sort()
}

export type NewQuestionInput = {
  value: string
  time: string | null
  order: number
}

// Expand selected dates × times into the flat list of questions to create.
// A date with no times becomes a single all-day option (time: null), so a poll
// with no times at all behaves exactly like the date-only polls did before.
export function buildQuestions(dates: string[], times: TimeSelection): NewQuestionInput[] {
  const sortedDates = [...new Set(dates.filter(isValidDate))].sort()
  const shared = normalizeTimes(times.shared)

  const out: NewQuestionInput[] = []
  for (const date of sortedDates) {
    const forDate = times.mode === 'shared' ? shared : normalizeTimes(times.perDate[date] ?? [])
    if (forDate.length === 0) {
      out.push({ value: date, time: null, order: out.length })
    } else {
      for (const time of forDate) {
        out.push({ value: date, time, order: out.length })
      }
    }
  }
  return out
}

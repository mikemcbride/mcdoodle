// Minimal fetch-based HTTP client for the same-origin /api routes.
// Keeps the axios-style surface the services/components already use:
//   - `const { data } = await http.get(url, { params })`
//   - errors throw with `e.response.data` / `e.response.status`
// The session cookie rides along automatically (same-origin).

type Params = Record<string, string | number | boolean | undefined>

type RequestConfig = {
  params?: Params
}

export class HttpError extends Error {
  response: { data: unknown; status: number }

  constructor(status: number, data: unknown) {
    super(`Request failed with status code ${status}`)
    this.name = 'HttpError'
    this.response = { data, status }
  }
}

function buildUrl(url: string, params?: Params): string {
  const full = `/api${url}`
  if (!params) return full
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const qs = search.toString()
  if (!qs) return full
  return full + (full.includes('?') ? '&' : '?') + qs
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<{ data: T; status: number }> {
  const res = await fetch(buildUrl(url, config?.params), {
    method,
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  })

  const data = (await res.json().catch(() => null)) as T

  if (!res.ok) {
    throw new HttpError(res.status, data)
  }

  return { data, status: res.status }
}

const http = {
  get: <T = any>(url: string, config?: RequestConfig) => request<T>('GET', url, undefined, config),
  post: <T = any>(url: string, body?: unknown, config?: RequestConfig) => request<T>('POST', url, body, config),
  put: <T = any>(url: string, body?: unknown, config?: RequestConfig) => request<T>('PUT', url, body, config),
  delete: <T = any>(url: string, config?: RequestConfig) => request<T>('DELETE', url, undefined, config),
}

export default http

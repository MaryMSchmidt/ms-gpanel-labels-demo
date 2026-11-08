export type Label = {
  id: string
  name: string
  type: 'system' | 'user'
  messageListVisibility: string | null
  labelListVisibility: string | null
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new ApiError(response.status, problem?.detail ?? `Request failed (HTTP ${response.status})`)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json()
}

export function fetchLabels(): Promise<Label[]> {
  return request('/api/labels')
}

export function fetchLabel(id: string): Promise<Label> {
  return request(`/api/labels/${encodeURIComponent(id)}`)
}

export function createLabel(name: string): Promise<Label> {
  return request('/api/labels', 'POST', { name })
}

export function updateLabel(id: string, name: string): Promise<Label> {
  return request(`/api/labels/${encodeURIComponent(id)}`, 'PATCH', { name })
}

export function deleteLabel(id: string): Promise<void> {
  return request(`/api/labels/${encodeURIComponent(id)}`, 'DELETE')
}

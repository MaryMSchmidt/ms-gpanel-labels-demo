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

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new ApiError(response.status, problem?.detail ?? `Request failed (HTTP ${response.status})`)
  }
  return response.json()
}

export function fetchLabels(): Promise<Label[]> {
  return request('/api/labels')
}

export function fetchLabel(id: string): Promise<Label> {
  return request(`/api/labels/${encodeURIComponent(id)}`)
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import type { Label } from '../api/labels'
import App from '../App'

export const inbox: Label = {
  id: 'INBOX',
  name: 'INBOX',
  type: 'system',
  messageListVisibility: null,
  labelListVisibility: null,
}

export const receipts: Label = {
  id: 'Label_1',
  name: 'Receipts',
  type: 'user',
  messageListVisibility: 'show',
  labelListVisibility: 'labelShow',
}

export function jsonResponse(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// A tiny in-memory stand-in for the backend, so page tests run the real api, hooks and components.
export function fakeBackend(initial: Label[]) {
  let labels = [...initial]
  const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    const id = input.startsWith('/api/labels/') ? decodeURIComponent(input.slice('/api/labels/'.length)) : null
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    const found = labels.find((label) => label.id === id)

    if (id === null && method === 'GET') return jsonResponse(200, labels)
    if (id === null && method === 'POST') {
      const created: Label = { ...receipts, id: `Label_${labels.length + 1}`, name: body.name }
      labels = [...labels, created]
      return jsonResponse(201, created)
    }
    if (!found) return jsonResponse(404, { detail: 'Label not found.' })
    if (method === 'GET') return jsonResponse(200, found)
    if (method === 'PATCH') {
      const updated = { ...found, name: body.name }
      labels = labels.map((label) => (label.id === id ? updated : label))
      return jsonResponse(200, updated)
    }
    labels = labels.filter((label) => label.id !== id)
    return jsonResponse(204)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function renderApp(route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, receipts } from '../test/utils'
import { ApiError, createLabel, deleteLabel, fetchLabel, fetchLabels, updateLabel } from './labels'

// A Response body can only be read once, so build a fresh one for every call.
function stubFetch(response: () => Response) {
  const fetchMock = vi.fn<typeof fetch>(async () => response())
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('labels api', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns the JSON body on success', async () => {
    const fetchMock = stubFetch(() => jsonResponse(200, [receipts]))

    await expect(fetchLabels()).resolves.toEqual([receipts])
    expect(fetchMock).toHaveBeenCalledWith('/api/labels', expect.objectContaining({ method: 'GET' }))
  })

  it('encodes the id in the URL', async () => {
    const fetchMock = stubFetch(() => jsonResponse(200, receipts))

    await fetchLabel('a/b')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/labels/a%2Fb')
  })

  it('sends the name as JSON when creating and updating', async () => {
    const fetchMock = stubFetch(() => jsonResponse(201, receipts))

    await createLabel('Receipts')
    await updateLabel('Label_1', 'Bills')

    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Receipts"}',
    })
    expect(fetchMock.mock.calls[1][0]).toBe('/api/labels/Label_1')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PATCH', body: '{"name":"Bills"}' })
  })

  it('returns nothing for 204 No Content', async () => {
    stubFetch(() => new Response(null, { status: 204 }))

    await expect(deleteLabel('Label_1')).resolves.toBeUndefined()
  })

  it("throws an ApiError with the server's status and detail", async () => {
    stubFetch(() => jsonResponse(409, { detail: 'A label with this name already exists.' }))

    const error = await createLabel('Receipts').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, message: 'A label with this name already exists.' })
  })

  it('falls back to a generic message when the error has no JSON body', async () => {
    stubFetch(() => new Response('Bad Gateway', { status: 502 }))

    await expect(fetchLabels()).rejects.toThrow('Request failed (HTTP 502)')
  })
})

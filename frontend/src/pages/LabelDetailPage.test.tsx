import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { fakeBackend, inbox, jsonResponse, receipts, renderApp } from '../test/utils'

describe('LabelDetailPage', () => {
  it("shows the label's details", async () => {
    fakeBackend([receipts])
    renderApp('/labels/Label_1')

    expect(await screen.findByRole('heading', { name: 'Receipts' })).toBeInTheDocument()
    expect(screen.getByText('Label_1')).toBeInTheDocument()
    expect(screen.getByText('labelShow')).toBeInTheDocument()
  })

  it('shows Default for missing visibility and disables changes to system labels', async () => {
    fakeBackend([inbox])
    renderApp('/labels/INBOX')

    expect(await screen.findByRole('heading', { name: 'INBOX' })).toBeInTheDocument()
    expect(screen.getAllByText('Default')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('shows an error for an unknown label', async () => {
    fakeBackend([])
    renderApp('/labels/Label_999')

    expect(await screen.findByRole('alert')).toHaveTextContent('Label not found.')
  })

  it('renames the label in place', async () => {
    fakeBackend([receipts])
    renderApp('/labels/Label_1')

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const name = screen.getByLabelText('Name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Bills')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('heading', { name: 'Bills' })).toBeInTheDocument()
  })

  it('closes the dialogs on Cancel without changing anything', async () => {
    const fetchMock = fakeBackend([receipts])
    renderApp('/labels/Label_1')

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Receipts' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.every(([, init]) => init?.method === 'GET')).toBe(true)
  })

  it('goes back to the list after deleting', async () => {
    const fetchMock = fakeBackend([receipts])
    renderApp('/labels/Label_1')

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('heading', { name: 'Gmail labels' })).toBeInTheDocument()
    expect(screen.queryByText('Receipts')).not.toBeInTheDocument()
    // Only the first load: the deleted label is never fetched again.
    const detailGets = fetchMock.mock.calls.filter(([url, init]) => url === '/api/labels/Label_1' && init?.method === 'GET')
    expect(detailGets).toHaveLength(1)
  })

  it('shows the error in the dialog when delete fails', async () => {
    const fetchMock = fakeBackend([receipts])
    renderApp('/labels/Label_1')

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    fetchMock.mockImplementationOnce(async () => jsonResponse(404, { detail: 'Label not found.' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }))

    expect(await within(screen.getByRole('dialog')).findByText('Label not found.')).toBeInTheDocument()
  })
})

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { fakeBackend, inbox, jsonResponse, receipts, renderApp } from '../test/utils'

function row(name: string) {
  return screen.getByRole('row', { name: new RegExp(name) })
}

describe('LabelsPage', () => {
  it('lists labels and disables changes to system labels', async () => {
    fakeBackend([inbox, receipts])
    renderApp('/')

    expect(await screen.findByText('Receipts')).toBeInTheDocument()
    expect(within(row('INBOX')).getByRole('button', { name: 'Edit' })).toBeDisabled()
    expect(within(row('INBOX')).getByRole('button', { name: 'Delete' })).toBeDisabled()
    expect(within(row('Receipts')).getByRole('button', { name: 'Edit' })).toBeEnabled()
  })

  it('explains that system labels are read-only', async () => {
    fakeBackend([inbox])
    renderApp('/')

    expect(
      screen.getByText('System labels are maintained by Gmail and cannot be modified or deleted.'),
    ).toBeInTheDocument()
  })

  it('lists user labels first, then system labels, each A to Z', async () => {
    const zeta = { ...receipts, id: 'Label_2', name: 'Zeta' }
    fakeBackend([zeta, inbox, receipts, { ...inbox, id: 'SENT', name: 'SENT' }])
    renderApp('/')

    await screen.findByText('Zeta')
    const names = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('gridcell')[0].textContent)
    expect(names).toEqual(['Receipts', 'Zeta', 'INBOX', 'SENT'])
  })

  it('shows the error when labels fail to load', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(502, { detail: 'Gmail request failed. Try again.' })))
    renderApp('/')

    expect(await screen.findByRole('alert')).toHaveTextContent('Gmail request failed. Try again.')
  })

  it('opens the detail page when a row is clicked', async () => {
    fakeBackend([inbox, receipts])
    renderApp('/')

    await userEvent.click(await screen.findByText('Receipts'))

    expect(await screen.findByRole('heading', { name: 'Receipts' })).toBeInTheDocument()
    expect(screen.getByText('Label_1')).toBeInTheDocument()
  })

  it('creates a label', async () => {
    const fetchMock = fakeBackend([inbox])
    renderApp('/')

    await userEvent.click(await screen.findByRole('button', { name: 'New label' }))
    await userEvent.type(screen.getByLabelText('Name'), 'Invoices')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Invoices')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/labels', expect.objectContaining({ method: 'POST' }))
  })

  it('keeps the dialog open with the server message when create fails', async () => {
    const fetchMock = fakeBackend([inbox])
    fetchMock.mockImplementationOnce(async () => jsonResponse(200, [inbox]))
    fetchMock.mockImplementationOnce(async () =>
      jsonResponse(409, { detail: 'A label with this name already exists.' }),
    )
    renderApp('/')

    await userEvent.click(await screen.findByRole('button', { name: 'New label' }))
    await userEvent.type(screen.getByLabelText('Name'), 'INBOX')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('A label with this name already exists.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Reopening starts clean: the old error and name are gone.
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: 'New label' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('renames a label from the grid without opening the detail page', async () => {
    fakeBackend([inbox, receipts])
    renderApp('/')

    await userEvent.click(within(await screen.findByRole('row', { name: /Receipts/ })).getByRole('button', { name: 'Edit' }))
    const name = screen.getByLabelText('Name')
    expect(name).toHaveValue('Receipts')
    await userEvent.clear(name)
    await userEvent.type(name, 'Bills')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Bills')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Gmail Label Manager' })).toBeInTheDocument()
  })

  it('deletes a label only after confirming', async () => {
    fakeBackend([inbox, receipts])
    renderApp('/')

    await userEvent.click(within(await screen.findByRole('row', { name: /Receipts/ })).getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Receipts')).toBeInTheDocument()

    await userEvent.click(within(row('Receipts')).getByRole('button', { name: 'Delete' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByText('Receipts')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Gmail Label Manager' })).toBeInTheDocument()
  })
})

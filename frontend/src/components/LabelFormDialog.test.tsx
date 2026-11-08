import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LabelFormDialog from './LabelFormDialog'

function renderDialog(props: Partial<Parameters<typeof LabelFormDialog>[0]> = {}) {
  const onSubmit = vi.fn()
  const onClose = vi.fn()
  render(<LabelFormDialog title="New label" isSubmitting={false} onSubmit={onSubmit} onClose={onClose} {...props} />)
  return { onSubmit, onClose }
}

describe('LabelFormDialog', () => {
  it('shows an error and does not submit a blank name', async () => {
    const { onSubmit } = renderDialog()

    await userEvent.type(screen.getByLabelText('Name'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Name is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the trimmed name', async () => {
    const { onSubmit } = renderDialog()

    await userEvent.type(screen.getByLabelText('Name'), '  Receipts  ')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith('Receipts')
  })

  it('starts with the initial name and closes on Cancel', async () => {
    const { onClose } = renderDialog({ title: 'Edit label', initialName: 'Receipts' })

    expect(screen.getByRole('heading', { name: 'Edit label' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Receipts')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('shows the server error and disables Save while submitting', () => {
    renderDialog({ errorMessage: 'A label with this name already exists.', isSubmitting: true })

    expect(screen.getByRole('alert')).toHaveTextContent('A label with this name already exists.')
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})

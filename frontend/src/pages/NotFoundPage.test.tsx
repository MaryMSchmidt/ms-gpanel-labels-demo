import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { fakeBackend, receipts, renderApp } from '../test/utils'

describe('NotFoundPage', () => {
  it('shows for an unknown address and links back to the labels', async () => {
    fakeBackend([receipts])
    renderApp('/not-a-page')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Back to labels' }))

    expect(await screen.findByText('Receipts')).toBeInTheDocument()
  })
})

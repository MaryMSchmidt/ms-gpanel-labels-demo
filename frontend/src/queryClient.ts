import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api/labels'

// A 4xx won't fix itself, so only retry server and network errors.
export function shouldRetry(failureCount: number, error: Error) {
  return !(error instanceof ApiError && error.status < 500) && failureCount < 3
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: shouldRetry } },
})

import { useQuery } from '@tanstack/react-query'
import { fetchLabel } from '../api/labels'

export function useLabel(id: string) {
  return useQuery({ queryKey: ['labels', id], queryFn: () => fetchLabel(id) })
}

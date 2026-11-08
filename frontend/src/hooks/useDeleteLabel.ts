import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteLabel } from '../api/labels'

export function useDeleteLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: (_data, id) => {
      // Drop the deleted label's cache so an open detail page doesn't refetch it and 404.
      queryClient.removeQueries({ queryKey: ['labels', id] })
      return queryClient.invalidateQueries({ queryKey: ['labels'], exact: true })
    },
  })
}

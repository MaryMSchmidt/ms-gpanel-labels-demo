import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateLabel } from '../api/labels'

export function useUpdateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateLabel(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labels'] }),
  })
}

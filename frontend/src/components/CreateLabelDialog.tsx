import { useCreateLabel } from '../hooks/useCreateLabel'
import LabelFormDialog from './LabelFormDialog'

type CreateLabelDialogProps = {
  onClose: () => void
}

function CreateLabelDialog({ onClose }: CreateLabelDialogProps) {
  const createLabel = useCreateLabel()

  return (
    <LabelFormDialog
      title="New label"
      isSubmitting={createLabel.isPending}
      errorMessage={createLabel.error?.message}
      onSubmit={(name) => createLabel.mutate(name, { onSuccess: onClose })}
      onClose={onClose}
    />
  )
}

export default CreateLabelDialog

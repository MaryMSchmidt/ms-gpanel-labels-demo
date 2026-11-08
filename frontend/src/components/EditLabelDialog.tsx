import type { Label } from '../api/labels'
import { useUpdateLabel } from '../hooks/useUpdateLabel'
import LabelFormDialog from './LabelFormDialog'

type EditLabelDialogProps = {
  label: Label
  onClose: () => void
}

function EditLabelDialog({ label, onClose }: EditLabelDialogProps) {
  const updateLabel = useUpdateLabel()

  return (
    <LabelFormDialog
      title="Edit label"
      initialName={label.name}
      isSubmitting={updateLabel.isPending}
      errorMessage={updateLabel.error?.message}
      onSubmit={(name) => updateLabel.mutate({ id: label.id, name }, { onSuccess: onClose })}
      onClose={onClose}
    />
  )
}

export default EditLabelDialog

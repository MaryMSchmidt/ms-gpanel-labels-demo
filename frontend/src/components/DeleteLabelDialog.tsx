import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import type { Label } from '../api/labels'
import { useDeleteLabel } from '../hooks/useDeleteLabel'

type DeleteLabelDialogProps = {
  label: Label
  onClose: () => void
  onDeleted?: () => void
}

function DeleteLabelDialog({ label, onClose, onDeleted }: DeleteLabelDialogProps) {
  const deleteLabel = useDeleteLabel()

  // When onDeleted leaves the page, closing first would re-render it and refetch the deleted label.
  const confirm = () => deleteLabel.mutate(label.id, { onSuccess: onDeleted ?? onClose })

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete label</DialogTitle>
      <DialogContent>
        {deleteLabel.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deleteLabel.error.message}
          </Alert>
        )}
        <DialogContentText>Delete "{label.name}"? This can't be undone.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" disabled={deleteLabel.isPending} onClick={confirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteLabelDialog

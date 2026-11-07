import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { Controller, useForm } from 'react-hook-form'

type LabelFormValues = { name: string }

type LabelFormDialogProps = {
  title: string
  initialName?: string
  isSubmitting: boolean
  errorMessage?: string
  onSubmit: (name: string) => void
  onClose: () => void
}

function LabelFormDialog({
  title,
  initialName = '',
  isSubmitting,
  errorMessage,
  onSubmit,
  onClose,
}: LabelFormDialogProps) {
  const { control, handleSubmit } = useForm<LabelFormValues>({ defaultValues: { name: initialName } })

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form noValidate onSubmit={handleSubmit((values) => onSubmit(values.name.trim()))}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Controller
            name="name"
            control={control}
            rules={{ validate: (value) => value.trim() !== '' || 'Name is required.' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                autoFocus
                fullWidth
                margin="dense"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default LabelFormDialog

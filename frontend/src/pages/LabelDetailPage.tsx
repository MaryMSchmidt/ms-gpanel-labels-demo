import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import DeleteLabelDialog from '../components/DeleteLabelDialog'
import EditLabelDialog from '../components/EditLabelDialog'
import { useLabel } from '../hooks/useLabel'

function LabelDetailPage() {
  const { id = '' } = useParams()
  const { data: label, isPending, error } = useLabel(id)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  return (
    <Container sx={{ py: 4 }}>
      <Button component={RouterLink} to="/" sx={{ mb: 2, color: 'common.white' }}>
        Back to labels
      </Button>
      {isPending && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}
      {label && (
        <>
          <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              {label.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" disabled={label.type === 'system'} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={label.type === 'system'}
                onClick={() => setIsDeleting(true)}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
          <Paper variant="outlined">
            <Table>
              <TableBody>
                <DetailRow name="ID" value={label.id} />
                <DetailRow name="Type" value={label.type} />
                <DetailRow name="Message list visibility" value={label.messageListVisibility} />
                <DetailRow name="Label list visibility" value={label.labelListVisibility} />
              </TableBody>
            </Table>
          </Paper>
          {isEditing && <EditLabelDialog label={label} onClose={() => setIsEditing(false)} />}
          {isDeleting && (
            <DeleteLabelDialog label={label} onClose={() => setIsDeleting(false)} onDeleted={() => navigate('/')} />
          )}
        </>
      )}
    </Container>
  )
}

function DetailRow({ name, value }: { name: string; value: string | null }) {
  return (
    <TableRow>
      <TableCell component="th" sx={{ width: 240 }}>
        {name}
      </TableCell>
      <TableCell>{value ?? 'Default'}</TableCell>
    </TableRow>
  )
}

export default LabelDetailPage

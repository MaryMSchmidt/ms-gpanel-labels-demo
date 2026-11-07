import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useParams } from 'react-router'
import { useLabel } from '../hooks/useLabel'

function LabelDetailPage() {
  const { id = '' } = useParams()
  const { data: label, isPending, error } = useLabel(id)

  return (
    <Container sx={{ py: 4 }}>
      <Button component={RouterLink} to="/" sx={{ mb: 2 }}>
        Back to labels
      </Button>
      {isPending && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}
      {label && (
        <>
          <Typography variant="h4" component="h1" gutterBottom>
            {label.name}
          </Typography>
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

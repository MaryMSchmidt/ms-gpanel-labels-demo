import Alert from '@mui/material/Alert'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import type { Label } from '../api/labels'
import { useLabels } from '../hooks/useLabels'

const columns: GridColDef<Label>[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'type', headerName: 'Type', width: 120 },
]

function LabelsPage() {
  const { data, isPending, error } = useLabels()

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gmail labels
      </Typography>
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <DataGrid rows={data ?? []} columns={columns} loading={isPending} autoHeight />
      )}
    </Container>
  )
}

export default LabelsPage

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Label } from '../api/labels'
import CreateLabelDialog from '../components/CreateLabelDialog'
import DeleteLabelDialog from '../components/DeleteLabelDialog'
import EditLabelDialog from '../components/EditLabelDialog'
import { useLabels } from '../hooks/useLabels'

// User labels first, then system labels, each A to Z. Clicking a column header sorts by that column instead.
function userLabelsFirst(a: Label, b: Label) {
  if (a.type !== b.type) {
    return a.type === 'user' ? -1 : 1
  }
  return a.name.localeCompare(b.name)
}

function LabelsPage() {
  const { data, isPending, error } = useLabels()
  const [isCreating, setIsCreating] = useState(false)
  const [editing, setEditing] = useState<Label | null>(null)
  const [deleting, setDeleting] = useState<Label | null>(null)
  const navigate = useNavigate()
  const rows = useMemo(() => [...(data ?? [])].sort(userLabelsFirst), [data])

  const columns: GridColDef<Label>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          <Button
            size="small"
            disabled={row.type === 'system'}
            onClick={(event) => {
              event.stopPropagation()
              setEditing(row)
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            disabled={row.type === 'system'}
            onClick={(event) => {
              event.stopPropagation()
              setDeleting(row)
            }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ]

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1">
            Gmail Label Manager
          </Typography>
          <Typography sx={{ color: 'common.white', mt: 0.5 }}>
            System labels are maintained by Gmail and cannot be modified or deleted.
          </Typography>
        </div>
        <Button variant="contained" onClick={() => setIsCreating(true)}>
          New label
        </Button>
      </Stack>
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isPending}
          autoHeight
          onRowClick={(params) => navigate(`/labels/${encodeURIComponent(params.row.id)}`)}
          sx={{
            bgcolor: 'background.paper',
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-footerContainer': {
              bgcolor: 'primary.main',
            },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
          }}
        />
      )}
      {isCreating && <CreateLabelDialog onClose={() => setIsCreating(false)} />}
      {editing && <EditLabelDialog label={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteLabelDialog label={deleting} onClose={() => setDeleting(null)} />}
    </Container>
  )
}

export default LabelsPage

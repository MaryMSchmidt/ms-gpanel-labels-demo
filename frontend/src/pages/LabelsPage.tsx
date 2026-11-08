import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Label } from '../api/labels'
import DeleteLabelDialog from '../components/DeleteLabelDialog'
import EditLabelDialog from '../components/EditLabelDialog'
import LabelFormDialog from '../components/LabelFormDialog'
import { useCreateLabel } from '../hooks/useCreateLabel'
import { useLabels } from '../hooks/useLabels'

function LabelsPage() {
  const { data, isPending, error } = useLabels()
  const createLabel = useCreateLabel()
  const [isCreating, setIsCreating] = useState(false)
  const [editing, setEditing] = useState<Label | null>(null)
  const [deleting, setDeleting] = useState<Label | null>(null)
  const navigate = useNavigate()

  const closeCreate = () => {
    setIsCreating(false)
    createLabel.reset()
  }

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
        <Typography variant="h4" component="h1">
          Gmail labels
        </Typography>
        <Button variant="contained" onClick={() => setIsCreating(true)}>
          New label
        </Button>
      </Stack>
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <DataGrid
          rows={data ?? []}
          columns={columns}
          loading={isPending}
          autoHeight
          onRowClick={(params) => navigate(`/labels/${encodeURIComponent(params.row.id)}`)}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      )}
      {isCreating && (
        <LabelFormDialog
          title="New label"
          isSubmitting={createLabel.isPending}
          errorMessage={createLabel.error?.message}
          onSubmit={(name) => createLabel.mutate(name, { onSuccess: closeCreate })}
          onClose={closeCreate}
        />
      )}
      {editing && <EditLabelDialog label={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteLabelDialog label={deleting} onClose={() => setDeleting(null)} />}
    </Container>
  )
}

export default LabelsPage

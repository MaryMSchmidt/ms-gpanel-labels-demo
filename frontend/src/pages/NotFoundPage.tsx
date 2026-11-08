import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'

function NotFoundPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Page not found
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to labels
      </Button>
    </Container>
  )
}

export default NotFoundPage

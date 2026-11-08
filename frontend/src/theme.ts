import { createTheme } from '@mui/material/styles'

// Colors from promevo.com: navy page background, mint buttons with navy text.
const navy = '#233166'
const mint = '#6FC6AC'

export const theme = createTheme({
  palette: {
    primary: { main: mint, contrastText: navy },
    background: { default: navy },
  },
  components: {
    MuiButton: {
      // Mint text is hard to read on white, so text-only buttons use navy.
      variants: [{ props: { variant: 'text', color: 'primary' }, style: { color: navy } }],
    },
  },
  typography: {
    // Page titles sit on the navy background.
    h4: { color: '#fff' },
  },
})

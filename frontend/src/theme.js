import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3a5a80', // muted blue
      light: '#98c1d9',
      dark: '#29394d',
      contrastText: '#fff',
    },
    secondary: {
      main: '#e0e1dd', // soft gray
      light: '#f7f7fa',
      dark: '#bfc0c0',
      contrastText: '#222',
    },
    background: {
      default: '#f7f7fa', // very light gray
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 600, letterSpacing: '-1px' },
    h2: { fontWeight: 500, letterSpacing: '-0.5px' },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: '0.2px' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#fff',
          boxShadow: '0 1px 4px 0 rgba(60,72,88,0.04)',
          borderRadius: 10,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#fff',
          color: '#3a5a80',
          boxShadow: '0 1px 4px 0 rgba(60,72,88,0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#fff',
          boxShadow: '0 1.5px 8px 0 rgba(60,72,88,0.06)',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          boxShadow: 'none',
          background: '#3a5a80',
          color: '#fff',
          '&:hover': {
            background: '#29394d',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: '#f7f7fa',
          color: '#222',
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme; 
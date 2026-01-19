import { createTheme } from '@mui/material/styles';

// Brand Colors matching Flutter app
export const colors = {
  // Brand Colors
  brandRed: '#D71920',
  brandDarkRed: '#B01418',
  brandWhite: '#FFFFFF',
  brandBlack: '#000000',

  // Background Colors
  backgroundLight: '#F5F5F5',
  backgroundDark: '#121212',
  cardBackground: '#FFFFFF',

  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#666666',
  textHint: '#999999',
  textWhite: '#FFFFFF',

  // Status Colors
  success: '#4CAF50',
  error: '#D71920',
  warning: '#FF9800',
  info: '#2196F3',

  // UI Colors
  divider: '#E0E0E0',
  border: '#CCCCCC',
  shadow: '#1A000000',
};

// Create Material-UI theme with Poppins font
export const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: -0.8,
    },
    h2: {
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: -0.8,
    },
    h3: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: -0.8,
    },
    h4: {
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: -0.5,
    },
    h5: {
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: -0.5,
    },
    h6: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3,
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
    },
    button: {
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: colors.brandRed,
      dark: colors.brandDarkRed,
      contrastText: colors.brandWhite,
    },
    secondary: {
      main: colors.brandBlack,
      contrastText: colors.brandWhite,
    },
    success: {
      main: colors.success,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    background: {
      default: colors.backgroundLight,
      paper: colors.cardBackground,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.brandRed} 0%, ${colors.brandDarkRed} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.brandDarkRed} 0%, ${colors.brandRed} 100%)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: `${colors.backgroundLight}4D`,
            '& fieldset': {
              borderColor: `${colors.divider}26`,
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderColor: colors.brandRed,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.brandRed,
              borderWidth: 2.5,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: `0 4px 6px ${colors.shadow}`,
        },
      },
    },
  },
});

// Constants matching Flutter app
export const constants = {
  // Route Names
  routes: {
    login: '/login',
    dashboard: '/dashboard',
    fixtures: '/fixtures',
    users: '/users',
    predictions: '/predictions',
    leaderboard: '/leaderboard',
    rewards: '/rewards',
    notifications: '/notifications',
    content: '/content',
    polls: '/polls',
    referrals: '/referrals',
    logs: '/logs',
    settings: '/settings',
  },
  // Side Menu Width
  sideMenuWidth: 260,
  sideMenuCollapsedWidth: 80,
  // Top Bar Height
  topBarHeight: 80,
  topBarHeightMobile: 64,
  // Breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 1024,
    desktop: 1440,
  },
};

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  CssBaseline,
} from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        padding: 2,
      }}
    >
      <CssBaseline />
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {/* Logo/Brand */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 1,
              }}
            >
              AVGC Tender
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Management Platform
            </Typography>
          </Box>

          {/* Auth Form Content */}
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} AVGC Tender Management Platform
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

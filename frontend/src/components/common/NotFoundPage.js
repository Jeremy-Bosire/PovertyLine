import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

/**
 * NotFoundPage component for 404 errors
 * Mobile-first design as required in PLANNING.md
 */
const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h1" component="h1" sx={{ 
            fontSize: { xs: '4rem', sm: '6rem' },
            fontWeight: 700,
            color: 'primary.main'
          }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" sx={{ mt: 2, mb: 4 }}>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            component={RouterLink}
            to="/"
            sx={{ borderRadius: 8 }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;

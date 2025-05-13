import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Grid, useMediaQuery, useTheme } from '@mui/material';

/**
 * Footer component with links and copyright information
 * Mobile-first design as required in PLANNING.md
 */
const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const footerLinks = [
    { title: 'About', path: '/about' },
    { title: 'Privacy Policy', path: '/privacy' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Contact', path: '/contact' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              PovertyLine
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bridging the gap between individuals living in poverty and available support services.
            </Typography>
          </Grid>
          
          {!isMobile && (
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Quick Links
              </Typography>
              <Box>
                {footerLinks.map((link) => (
                  <Box key={link.title} sx={{ mb: 1 }}>
                    <Link
                      component={RouterLink}
                      to={link.path}
                      color="text.secondary"
                      underline="hover"
                    >
                      {link.title}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@povertyline.org
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +1 (123) 456-7890
            </Typography>
          </Grid>
          
          {isMobile && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {footerLinks.map((link) => (
                  <Link
                    key={link.title}
                    component={RouterLink}
                    to={link.path}
                    color="text.secondary"
                    underline="hover"
                    sx={{ mr: 2, mb: 1 }}
                  >
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {'© '}
            {new Date().getFullYear()}
            {' PovertyLine. All rights reserved.'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This platform is designed to be accessible on all devices, with a focus on mobile access.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

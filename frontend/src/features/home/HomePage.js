import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Handshake,
  Assessment,
} from '@mui/icons-material';

/**
 * HomePage component serving as the landing page
 * Mobile-first design as required in PLANNING.md
 */
const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Features section data
  const features = [
    {
      title: 'Create Your Profile',
      description: 'Establish a verified digital profile to increase your visibility to support services.',
      icon: <PersonAdd fontSize="large" color="primary" />,
      action: isAuthenticated ? '/profile' : '/register',
      actionText: isAuthenticated ? 'View Profile' : 'Sign Up',
    },
    {
      title: 'Find Resources',
      description: 'Search and filter through available support services based on your specific needs.',
      icon: <Search fontSize="large" color="primary" />,
      action: '/resources',
      actionText: 'Browse Resources',
    },
    {
      title: 'Connect with Providers',
      description: 'Apply for resources and connect directly with service providers.',
      icon: <Handshake fontSize="large" color="primary" />,
      action: '/resources',
      actionText: 'Get Connected',
    },
    {
      title: 'Track Progress',
      description: 'Monitor your applications and track your progress towards stability.',
      icon: <Assessment fontSize="large" color="primary" />,
      action: isAuthenticated ? '/profile' : '/login',
      actionText: isAuthenticated ? 'View Dashboard' : 'Sign In',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 6, md: 12 },
          borderRadius: { xs: 0, md: 2 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Bridging the Gap to Support Services
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 4, fontWeight: 400 }}
              >
                Connect with resources, establish your digital profile, and find the support you need.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to={isAuthenticated ? '/profile' : '/register'}
                  sx={{ px: 4, py: 1.5, fontWeight: 600 }}
                >
                  {isAuthenticated ? 'View Profile' : 'Get Started'}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/resources"
                  sx={{ px: 4, py: 1.5, fontWeight: 600 }}
                >
                  Browse Resources
                </Button>
              </Box>
            </Grid>
            {!isMobile && (
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src="/placeholder-hero.jpg"
                  alt="People supporting each other"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          sx={{ mb: 6, fontWeight: 600 }}
        >
          How PovertyLine Works
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    pt: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    {feature.title}
                  </Typography>
                  <Typography align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    size="medium"
                    color="primary"
                    component={RouterLink}
                    to={feature.action}
                  >
                    {feature.actionText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'secondary.light',
          py: { xs: 6, md: 8 },
          borderRadius: { xs: 0, md: 2 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Ready to Connect with Resources?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
          >
            Join our community today and get matched with the support services you need.
          </Typography>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to={isAuthenticated ? '/profile' : '/register'}
            >
              {isAuthenticated ? 'Complete Your Profile' : 'Create an Account'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/resources"
            >
              Explore Resources
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;

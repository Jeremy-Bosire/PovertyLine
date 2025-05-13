import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

import { fetchProfile } from './profileSlice';
import { addAlert } from '../ui/uiSlice';

/**
 * ProfilePage component for viewing and managing user profile
 * Mobile-first design as required in PLANNING.md
 */
const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data: profile, isLoading, error, completionPercentage } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = React.useState(0);
  
  // Fetch profile data when component mounts
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    // This would navigate to edit profile page in a full implementation
    dispatch(addAlert({
      type: 'info',
      message: 'Profile editing will be implemented in a future update',
    }));
  };
  
  // If loading, show loading indicator
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => dispatch(fetchProfile())}>
          Retry
        </Button>
      </Container>
    );
  }
  
  // If no profile exists yet, show create profile message
  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body1" paragraph>
            To get the most out of PovertyLine, please complete your profile. This will help us match you with relevant resources and services.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleEditProfile}
          >
            Create Profile
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Profile Completion Progress */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" gutterBottom>
              Profile Completion: {completionPercentage}%
            </Typography>
            <Box sx={{ position: 'relative', pt: 1 }}>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'grey.300',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '8px',
                  left: 0,
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'primary.main',
                  width: `${completionPercentage}%`,
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {completionPercentage < 100 
                ? 'Complete your profile to improve your resource matches' 
                : 'Your profile is complete!'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Profile Content */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Profile Header */}
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h4">
            {profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : user.username}
          </Typography>
          <Typography variant="subtitle1">
            {user.role === 'user' ? 'Individual' : 'Resource Provider'}
          </Typography>
        </Box>
        
        {/* Profile Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Personal Info" />
            <Tab label="Education & Employment" />
            <Tab label="Needs & Resources" />
            <Tab label="Applications" />
          </Tabs>
        </Box>
        
        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* Personal Info Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {user.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {profile.phone_number || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {profile.date_of_birth || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1">
                  {profile.gender || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {profile.address ? (
                    <>
                      {profile.address.street}, {profile.address.city}, {profile.address.state} {profile.address.zip}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </Typography>
              </Grid>
            </Grid>
          )}
          
          {/* Education & Employment Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Education Level
                </Typography>
                <Typography variant="body1">
                  {profile.education_level || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Employment
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Employment Status
                </Typography>
                <Typography variant="body1">
                  {profile.employment_status || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Income Level
                </Typography>
                <Typography variant="body1">
                  {profile.income_level ? `$${profile.income_level}/month` : 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Skills
                </Typography>
                <Typography variant="body1">
                  {profile.skills && profile.skills.length > 0
                    ? profile.skills.join(', ')
                    : 'No skills listed'}
                </Typography>
              </Grid>
            </Grid>
          )}
          
          {/* Needs & Resources Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Household Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Household Size
                </Typography>
                <Typography variant="body1">
                  {profile.household_size || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dependents
                </Typography>
                <Typography variant="body1">
                  {profile.dependents || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Needs
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body1">
                  {profile.needs && profile.needs.length > 0
                    ? profile.needs.join(', ')
                    : 'No specific needs listed'}
                </Typography>
              </Grid>
            </Grid>
          )}
          
          {/* Applications Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Applications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                You haven't applied for any resources yet. Browse available resources to find support services that match your needs.
              </Alert>
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                href="/resources"
              >
                Browse Resources
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;

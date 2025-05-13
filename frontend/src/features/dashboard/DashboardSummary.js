import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Handshake as HandshakeIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { addAlert } from '../../features/ui/uiSlice';
import { useDispatch } from 'react-redux';

/**
 * Dashboard summary component showing key metrics and recent activity
 * Mobile-first design as required in PLANNING.md
 */
const DashboardSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/admin/dashboard');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
        dispatch(addAlert({
          type: 'error',
          message: 'Failed to load dashboard data',
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dispatch]);
  
  // Handle navigation to different sections
  const handleNavigation = (route) => {
    navigate(route);
  };
  
  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                bgcolor: 'primary.main',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Users
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {dashboardData?.summary?.users || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboardData?.summary?.profiles || 0} with profiles
            </Typography>
          </Paper>
        </Grid>
        
        {/* Resources Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                bgcolor: 'secondary.main',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HandshakeIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Resources
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {dashboardData?.summary?.resources || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboardData?.summary?.pending_resources || 0} pending approval
            </Typography>
          </Paper>
        </Grid>
        
        {/* Applications Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                bgcolor: 'success.main',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DescriptionIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Applications
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {dashboardData?.summary?.applications || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboardData?.summary?.pending_applications || 0} pending review
            </Typography>
          </Paper>
        </Grid>
        
        {/* Pending Actions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                bgcolor: 'warning.main',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <NotificationsIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Pending Actions
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {(dashboardData?.summary?.pending_resources || 0) + 
               (dashboardData?.summary?.pending_applications || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items requiring your attention
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pending Resources */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Pending Resources
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {dashboardData?.summary?.pending_resources > 0 ? (
                <>
                  <Typography variant="body2" paragraph>
                    You have {dashboardData.summary.pending_resources} resources waiting for approval.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resources must be approved before they become visible to users.
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No resources are pending approval at this time.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                onClick={() => handleNavigation('/dashboard/resources')}
              >
                Review Resources
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Pending Applications */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Pending Applications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {dashboardData?.summary?.pending_applications > 0 ? (
                <>
                  <Typography variant="body2" paragraph>
                    You have {dashboardData.summary.pending_applications} applications waiting for review.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Users are waiting for responses to their resource applications.
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No applications are pending review at this time.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                onClick={() => handleNavigation('/dashboard/applications')}
              >
                Review Applications
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Recent Users
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData?.recent_activity?.users && 
             dashboardData.recent_activity.users.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {dashboardData.recent_activity.users.map((user) => (
                  <ListItem key={user.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.username}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {user.email}
                          </Typography>
                          {` — Role: ${user.role}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent user activity.
              </Typography>
            )}
            
            <Button 
              size="small" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => handleNavigation('/dashboard/users')}
            >
              View All Users
            </Button>
          </Paper>
        </Grid>
        
        {/* Recent Resources */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Recent Resources
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData?.recent_activity?.resources && 
             dashboardData.recent_activity.resources.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {dashboardData.recent_activity.resources.map((resource) => (
                  <ListItem key={resource.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <HandshakeIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={resource.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {resource.provider_name}
                          </Typography>
                          {` — Status: ${resource.status}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent resource activity.
              </Typography>
            )}
            
            <Button 
              size="small" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => handleNavigation('/dashboard/resources')}
            >
              View All Resources
            </Button>
          </Paper>
        </Grid>
        
        {/* Recent Applications */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Recent Applications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData?.recent_activity?.applications && 
             dashboardData.recent_activity.applications.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {dashboardData.recent_activity.applications.map((application) => (
                  <ListItem key={application.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Application #${application.id.substring(0, 8)}`}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {`User ID: ${application.user_id.substring(0, 8)}`}
                          </Typography>
                          {` — Status: ${application.status}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent application activity.
              </Typography>
            )}
            
            <Button 
              size="small" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => handleNavigation('/dashboard/applications')}
            >
              View All Applications
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSummary;

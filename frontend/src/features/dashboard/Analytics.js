import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PeopleAlt as UsersIcon,
  Inventory as ResourcesIcon,
  Assignment as ApplicationsIcon,
  LocationOn as RegionsIcon,
} from '@mui/icons-material';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { addAlert } from '../ui/uiSlice';

/**
 * Analytics component for admin dashboard
 * Displays key metrics and visualizations to help administrators understand system usage
 * Mobile-first design as required in PLANNING.md
 */
const Analytics = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for time period filter
  const [timePeriod, setTimePeriod] = useState('month');
  
  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(`/api/admin/analytics?period=${timePeriod}`);
      
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics data');
      dispatch(addAlert({
        type: 'error',
        message: 'Failed to load analytics data',
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch analytics data when component mounts or time period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timePeriod]);
  
  // Handle time period change
  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Render summary metrics
  const renderSummaryMetrics = () => {
    if (!analyticsData) return null;
    
    const { summary } = analyticsData;
    
    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <UsersIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Users
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {formatNumber(summary.total_users)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.new_users} new this {timePeriod}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <ResourcesIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Resources
              </Typography>
              <Typography variant="h4" component="div" color="secondary">
                {formatNumber(summary.total_resources)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.pending_resources} pending approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <ApplicationsIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Applications
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {formatNumber(summary.total_applications)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.pending_applications} pending review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <RegionsIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div" gutterBottom>
                Regions
              </Typography>
              <Typography variant="h4" component="div" color="info.main">
                {formatNumber(summary.total_regions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.active_regions} active regions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // User growth chart unavailable due to missing recharts
  const renderUserGrowthChart = () => (
    <Alert severity="info" sx={{ mb: 4 }}>
      Analytics charts are currently unavailable.
    </Alert>
  );

  // Resource categories chart unavailable due to missing recharts
  const renderResourceCategoriesChart = () => (
    <Alert severity="info" sx={{ mb: 4 }}>
      Analytics charts are currently unavailable.
    </Alert>
  );

  // Application status chart unavailable due to missing recharts
  const renderApplicationStatusChart = () => (
    <Alert severity="info" sx={{ mb: 4 }}>
      Analytics charts are currently unavailable.
    </Alert>
  );

  // Regional distribution chart unavailable due to missing recharts
  const renderRegionalDistributionChart = () => (
    <Alert severity="info" sx={{ mb: 4 }}>
      Analytics charts are currently unavailable.
    </Alert>
  );

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Analytics Dashboard
          </Typography>
          
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              id="time-period"
              value={timePeriod}
              label="Time Period"
              onChange={handleTimePeriodChange}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading spinner */}
        {isLoading ? (
          <LoadingSpinner message="Loading analytics data..." />
        ) : (
          <>
            {/* Summary metrics */}
            {renderSummaryMetrics()}
            
            {/* Charts */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                {renderUserGrowthChart()}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderResourceCategoriesChart()}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderApplicationStatusChart()}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderRegionalDistributionChart()}
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Analytics;

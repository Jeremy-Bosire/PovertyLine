import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Drawer,
  Tabs,
  Tab,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardSidebar from './DashboardSidebar';
import DashboardSummary from './DashboardSummary';
import UserManagement from './UserManagement';
import ResourceApproval from './ResourceApproval';
import ApplicationReview from './ApplicationReview';
import Analytics from './Analytics';
import { addAlert } from '../ui/uiSlice';

/**
 * Main dashboard page component
 * Displays summary metrics and provides navigation to other dashboard sections
 * Mobile-first design as required in PLANNING.md
 */
const DashboardPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // State for mobile sidebar
  const [mobileOpen, setMobileOpen] = useState(false);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
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

  // Fetch dashboard data when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Close mobile drawer when route changes
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;

    if (path.endsWith('/users')) return 'User Management';
    if (path.endsWith('/resources')) return 'Resource Approval';
    if (path.endsWith('/applications')) return 'Application Review';
    if (path.endsWith('/analytics')) return 'Analytics';
    return 'Dashboard';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile app bar */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 0
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {getPageTitle()}
          </Typography>
        </Paper>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 240,
                mt: '56px'
              },
            }}
          >
            <DashboardSidebar />
          </Drawer>
        )}

        {/* Desktop drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 240,
                position: 'relative',
                height: '100vh',
                border: 'none'
              },
            }}
            open
          >
            <DashboardSidebar />
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          mt: { xs: '56px', md: 0 },
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              isLoading ? (
                <LoadingSpinner message="Loading dashboard..." />
              ) : error ? (
                <Paper
                  elevation={3}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', borderRadius: 2 }}
                >
                  <Typography color="error" gutterBottom>
                    {error}
                  </Typography>
                  <Typography variant="body2">
                    Please try refreshing the page or contact support if the problem persists.
                  </Typography>
                </Paper>
              ) : (
                <DashboardSummary data={dashboardData} />
              )
            }
          />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/resources" element={<ResourceApproval />} />
          <Route path="/applications" element={<ApplicationReview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardPage;

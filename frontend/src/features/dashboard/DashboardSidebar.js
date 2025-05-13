import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as ResourcesIcon,
  Assignment as ApplicationsIcon,
  BarChart as AnalyticsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

/**
 * Dashboard sidebar component
 * Provides navigation to different sections of the admin dashboard
 * Mobile-first design as required in PLANNING.md
 */
const DashboardSidebar = () => {
  const location = useLocation();
  const theme = useTheme();
  
  // Navigation items
  const navItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      text: 'User Management',
      icon: <PeopleIcon />,
      path: '/admin/users',
    },
    {
      text: 'Resource Approval',
      icon: <ResourcesIcon />,
      path: '/admin/resources',
    },
    {
      text: 'Application Review',
      icon: <ApplicationsIcon />,
      path: '/admin/applications',
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/admin/analytics',
    },
  ];
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" component="div" align="center" gutterBottom>
          Admin Dashboard
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <List>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/admin' && location.pathname === '/admin/');
          
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isActive ? theme.palette.primary.main : 'inherit',
                  minWidth: '40px'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Logout option */}
      <List>
        <ListItem
          button
          component={Link}
          to="/logout"
          sx={{ borderRadius: 1 }}
        >
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );
};

export default DashboardSidebar;

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Home,
  Person,
  Logout,
  Login,
  PersonAdd,
  Dashboard,
  Handshake,
} from '@mui/icons-material';

import { logout } from '../../features/auth/authSlice';
import { resetProfile } from '../../features/profile/profileSlice';
import { addAlert } from '../../features/ui/uiSlice';

/**
 * Header component with navigation and user menu
 */
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle drawer toggle
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetProfile());
    dispatch(addAlert({
      type: 'success',
      message: 'You have been logged out successfully',
    }));
    handleMenuClose();
    navigate('/');
  };
  
  // Navigation links based on authentication status
  const navLinks = isAuthenticated
    ? [
        { text: 'Home', icon: <Home />, path: '/' },
        { text: 'Resources', icon: <Handshake />, path: '/resources' },
        { text: 'Profile', icon: <Person />, path: '/profile' },
        ...(user?.role === 'admin' ? [{ text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' }] : []),
      ]
    : [
        { text: 'Home', icon: <Home />, path: '/' },
        { text: 'Resources', icon: <Handshake />, path: '/resources' },
        { text: 'Login', icon: <Login />, path: '/login' },
        { text: 'Register', icon: <PersonAdd />, path: '/register' },
      ];
  
  // Drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          PovertyLine
        </Typography>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem button key={link.text} component={RouterLink} to={link.path}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="fixed">
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {drawerContent}
            </Drawer>
          </>
        ) : null}
        
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          PovertyLine
        </Typography>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Button
                key={link.text}
                color="inherit"
                component={RouterLink}
                to={link.path}
                startIcon={link.icon}
                sx={{ mx: 1 }}
              >
                {link.text}
              </Button>
            ))}
            
            {isAuthenticated && (
              <>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                    Profile
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
                      Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

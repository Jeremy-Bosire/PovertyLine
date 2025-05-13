import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, useMediaQuery, useTheme } from '@mui/material';

import Header from './Header';
import Footer from './Footer';
import AlertManager from '../common/AlertManager';
import { setMobileView } from '../../features/ui/uiSlice';

/**
 * Main layout component that wraps all pages
 * Includes header, footer, and alert manager
 */
const Layout = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Update mobile view state when screen size changes
  useEffect(() => {
    dispatch(setMobileView(isMobile));
  }, [isMobile, dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3 },
        mt: '64px', // Height of the fixed header
      }}>
        <Outlet />
      </Box>
      
      <Footer />
      
      {/* Global alert manager */}
      <AlertManager />
    </Box>
  );
};

export default Layout;

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';

import Layout from './components/layout/Layout';
import HomePage from './features/home/HomePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProfilePage from './features/profile/ProfilePage';
import ResourcesPage from './features/resources/ResourcesPage';
import ResourceDetailPage from './features/resources/ResourceDetailPage';
import DashboardPage from './features/dashboard/DashboardPage';
import NotFoundPage from './components/common/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { checkAuthStatus } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Check authentication status when app loads
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    // You could add a loading spinner here
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile" />} />
          <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/profile" />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="resources/:id" element={<ResourceDetailPage />} />
          
          {/* Protected routes */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="dashboard/*" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Container>
  );
}

export default App;

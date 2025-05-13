import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { login, clearError } from './authSlice';
import { addAlert } from '../ui/uiSlice';

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username or email is required'),
  password: Yup.string()
    .required('Password is required'),
});

/**
 * LoginPage component for user authentication
 * Mobile-first design as required in PLANNING.md
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isLoading } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    await dispatch(login(values));
    setSubmitting(false);
    
    // If no error, show success message
    if (!error) {
      dispatch(addAlert({
        type: 'success',
        message: 'Login successful! Welcome back.',
      }));
      navigate('/profile');
    }
  };
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, mt: 4, borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form style={{ width: '100%' }}>
                <Field
                  as={TextField}
                  name="username"
                  label="Username or Email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                  disabled={isLoading}
                  autoFocus
                />
                
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isLoading || isSubmitting}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Link component={RouterLink} to="/forgot-password" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                    <Link component={RouterLink} to="/register" variant="body2">
                      Don't have an account? Sign Up
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;

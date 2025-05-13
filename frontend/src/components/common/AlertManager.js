import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar, Stack } from '@mui/material';
import { removeAlert } from '../../features/ui/uiSlice';

/**
 * AlertManager component to display notifications to users
 * Supports multiple alerts with different severity levels
 */
const AlertManager = () => {
  const dispatch = useDispatch();
  const { alerts } = useSelector((state) => state.ui);

  // Auto-close alerts after 6 seconds if autoClose is true
  useEffect(() => {
    const autoCloseAlerts = alerts.filter((alert) => alert.autoClose);
    
    if (autoCloseAlerts.length > 0) {
      const timers = autoCloseAlerts.map((alert) => {
        return setTimeout(() => {
          dispatch(removeAlert(alert.id));
        }, 6000);
      });
      
      // Clean up timers on unmount
      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }
  }, [alerts, dispatch]);

  // Handle closing an alert
  const handleClose = (id) => () => {
    dispatch(removeAlert(id));
  };

  return (
    <Stack spacing={2} sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 2000,
      maxWidth: { xs: 'calc(100% - 32px)', sm: 400 }
    }}>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ position: 'relative', mt: 1 }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleClose(alert.id)}
            severity={alert.type}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default AlertManager;

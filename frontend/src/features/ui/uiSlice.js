import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  alerts: [],
  isDrawerOpen: false,
  isMobileView: window.innerWidth < 600,
  theme: 'light',
};

// Generate a unique ID for alerts
const generateAlertId = () => `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Add a new alert
    addAlert: (state, action) => {
      const { type = 'info', message, autoClose = true } = action.payload;
      const newAlert = {
        id: generateAlertId(),
        type,
        message,
        autoClose,
      };
      state.alerts.push(newAlert);
    },
    
    // Remove an alert by ID
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    
    // Clear all alerts
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    // Toggle drawer open/closed
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    
    // Set drawer state
    setDrawerOpen: (state, action) => {
      state.isDrawerOpen = action.payload;
    },
    
    // Set mobile view state
    setMobileView: (state, action) => {
      state.isMobileView = action.payload;
    },
    
    // Toggle theme between light and dark
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Set theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const {
  addAlert,
  removeAlert,
  clearAlerts,
  toggleDrawer,
  setDrawerOpen,
  setMobileView,
  toggleTheme,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;

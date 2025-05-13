import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import profileReducer from '../features/profile/profileSlice';
import resourcesReducer from '../features/resources/resourcesSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    resources: resourcesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess', 'profile/fetchProfileSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.token', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'profile.data'],
      },
    }),
});

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import bookingReducer from './slices/bookingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Make store accessible in console for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.__REDUX_STORE__ = store;
  console.log('🎯 Redux Store initialized! Access via: window.__REDUX_STORE__.getState()');
}

export default store;

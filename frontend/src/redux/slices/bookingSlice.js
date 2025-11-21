import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

// Initial state
const initialState = {
  myBookings: [],
  propertyBookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  actionLoading: {},
};

// Async thunks
export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.create(bookingData);
      if (response.data.success) {
        return response.data.booking;
      }
      return rejectWithValue('Failed to create booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const getMyBookings = createAsyncThunk(
  'booking/getMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        return response.data.bookings || [];
      }
      return rejectWithValue('Failed to fetch bookings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const getPropertyBookings = createAsyncThunk(
  'booking/getPropertyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getPropertyBookings();
      if (response.data.success) {
        return response.data.bookings || [];
      }
      return rejectWithValue('Failed to fetch property bookings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property bookings');
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getById(id);
      if (response.data.success) {
        return response.data.booking;
      }
      return rejectWithValue('Booking not found');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking not found');
    }
  }
);

export const acceptBooking = createAsyncThunk(
  'booking/accept',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.accept(id);
      if (response.data.success) {
        return response.data.booking;
      }
      return rejectWithValue('Failed to accept booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept booking');
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'booking/reject',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.reject(id);
      if (response.data.success) {
        return response.data.booking;
      }
      return rejectWithValue('Failed to reject booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancel(id);
      if (response.data.success) {
        return response.data.booking;
      }
      return rejectWithValue('Failed to cancel booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

// Booking slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Create Booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings.push(action.payload);
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get My Bookings
    builder
      .addCase(getMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Property Bookings
    builder
      .addCase(getPropertyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPropertyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyBookings = action.payload;
      })
      .addCase(getPropertyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Booking By ID
    builder
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Accept Booking
    builder
      .addCase(acceptBooking.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        const index = state.propertyBookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.propertyBookings[index] = action.payload;
        }
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      });

    // Reject Booking
    builder
      .addCase(rejectBooking.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        const index = state.propertyBookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.propertyBookings[index] = action.payload;
        }
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      });

    // Cancel Booking
    builder
      .addCase(cancelBooking.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        const index = state.myBookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectMyBookings = (state) => state.booking.myBookings;
export const selectPropertyBookings = (state) => state.booking.propertyBookings;
export const selectCurrentBooking = (state) => state.booking.currentBooking;
export const selectBookingLoading = (state) => state.booking.loading;
export const selectBookingError = (state) => state.booking.error;
export const selectActionLoading = (bookingId) => (state) =>
  state.booking.actionLoading[bookingId] || false;

export const { clearError, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;


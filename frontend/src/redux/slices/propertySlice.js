import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyAPI, favoritesAPI } from '../../services/api';

// Initial state
const initialState = {
  properties: [],
  ownerProperties: [],
  currentProperty: null,
  favorites: [],
  searchResults: [],
  loading: false,
  error: null,
  searchLoading: false,
  favoriteLoading: {},
};

// Async thunks
export const searchProperties = createAsyncThunk(
  'property/search',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.search(searchParams);
      if (response.data.success) {
        return response.data.properties || [];
      }
      return rejectWithValue('Search failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getPropertyById = createAsyncThunk(
  'property/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getById(id);
      if (response.data.success) {
        return response.data.property;
      }
      return rejectWithValue('Property not found');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Property not found');
    }
  }
);

export const getOwnerProperties = createAsyncThunk(
  'property/getOwnerProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getOwnerProperties();
      if (response.data.success) {
        return response.data.properties || [];
      }
      return rejectWithValue('Failed to fetch properties');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const createProperty = createAsyncThunk(
  'property/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.create(formData);
      if (response.data.success) {
        return response.data.property;
      }
      return rejectWithValue('Failed to create property');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.update(id, data);
      if (response.data.success) {
        return response.data.property;
      }
      return rejectWithValue('Failed to update property');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.delete(id);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue('Failed to delete property');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

// Favorites
export const getFavorites = createAsyncThunk(
  'property/getFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.getAll();
      if (response.data.success) {
        return response.data.favorites || [];
      }
      return rejectWithValue('Failed to fetch favorites');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

export const addFavorite = createAsyncThunk(
  'property/addFavorite',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.add(propertyId);
      if (response.data.success) {
        return { propertyId, favorite: response.data.favorite };
      }
      return rejectWithValue('Failed to add favorite');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add favorite');
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'property/removeFavorite',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await favoritesAPI.remove(propertyId);
      if (response.data.success) {
        return propertyId;
      }
      return rejectWithValue('Failed to remove favorite');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove favorite');
    }
  }
);

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Search Properties
    builder
      .addCase(searchProperties.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });

    // Get Property By ID
    builder
      .addCase(getPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProperty = action.payload;
      })
      .addCase(getPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Owner Properties
    builder
      .addCase(getOwnerProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOwnerProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerProperties = action.payload;
      })
      .addCase(getOwnerProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Property
    builder
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerProperties.push(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Property
    builder
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ownerProperties.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.ownerProperties[index] = action.payload;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Property
    builder
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerProperties = state.ownerProperties.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Favorites
    builder
      .addCase(getFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Favorite
    builder
      .addCase(addFavorite.pending, (state, action) => {
        state.favoriteLoading[action.meta.arg] = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favoriteLoading[action.payload.propertyId] = false;
        if (action.payload.favorite) {
          state.favorites.push(action.payload.favorite);
        }
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.favoriteLoading[action.meta.arg] = false;
        state.error = action.payload;
      });

    // Remove Favorite
    builder
      .addCase(removeFavorite.pending, (state, action) => {
        state.favoriteLoading[action.meta.arg] = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favoriteLoading[action.payload] = false;
        state.favorites = state.favorites.filter(
          (f) => f.property_id !== action.payload
        );
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.favoriteLoading[action.meta.arg] = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectProperties = (state) => state.property.properties;
export const selectOwnerProperties = (state) => state.property.ownerProperties;
export const selectCurrentProperty = (state) => state.property.currentProperty;
export const selectSearchResults = (state) => state.property.searchResults;
export const selectFavorites = (state) => state.property.favorites;
export const selectPropertyLoading = (state) => state.property.loading;
export const selectSearchLoading = (state) => state.property.searchLoading;
export const selectPropertyError = (state) => state.property.error;
export const selectFavoriteLoading = (propertyId) => (state) =>
  state.property.favoriteLoading[propertyId] || false;
export const selectIsFavorite = (propertyId) => (state) =>
  state.property.favorites.some((f) => f.property_id === propertyId);

export const { clearError, clearCurrentProperty, clearSearchResults } = propertySlice.actions;
export default propertySlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for resources actions
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, perPage = 20, category, search } = params;
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('per_page', perPage);
      
      if (category) {
        queryParams.append('category', category);
      }
      
      if (search) {
        queryParams.append('search', search);
      }
      
      const response = await axios.get(`/api/resources/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch resources'
      );
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (resourceId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch resource'
      );
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/createResource',
  async (resourceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/resources/', resourceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create resource'
      );
    }
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ resourceId, resourceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/resources/${resourceId}`, resourceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update resource'
      );
    }
  }
);

export const applyForResource = createAsyncThunk(
  'resources/applyForResource',
  async ({ resourceId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/resources/${resourceId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to apply for resource'
      );
    }
  }
);

// Initial state
const initialState = {
  resources: [],
  currentResource: null,
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    category: null,
    search: '',
  },
};

// Resources slice
const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearResourcesError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: null,
        search: '',
      };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload.resources;
        state.pagination = {
          page: action.payload.page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          pages: action.payload.pages,
        };
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Resource By ID
      .addCase(fetchResourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResource = action.payload.resource;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Resource
      .addCase(createResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResource = action.payload.resource;
        // Add to resources list if it's not already there
        if (!state.resources.find(r => r.id === action.payload.resource.id)) {
          state.resources.unshift(action.payload.resource);
        }
      })
      .addCase(createResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Resource
      .addCase(updateResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResource = action.payload.resource;
        // Update in resources list
        const index = state.resources.findIndex(r => r.id === action.payload.resource.id);
        if (index !== -1) {
          state.resources[index] = action.payload.resource;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Apply For Resource
      .addCase(applyForResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyForResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload.application;
        state.applications.unshift(action.payload.application);
      })
      .addCase(applyForResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearResourcesError,
  setFilters,
  resetFilters,
  setPage,
} = resourcesSlice.actions;

export default resourcesSlice.reducer;

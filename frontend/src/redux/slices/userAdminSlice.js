import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get all users with advanced filtering
export const getAllUsers = createAsyncThunk(
  'adminUsers/getAllUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/admin/users?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// Get single user details
export const getUserDetails = createAsyncThunk(
  'adminUsers/getUserDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/user/${id}`);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

// Update user profile
export const updateUser = createAsyncThunk(
  'adminUsers/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/user/${id}`, userData);
      return { id, user: data.user, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

// Block user
export const blockUser = createAsyncThunk(
  'adminUsers/blockUser',
  async ({ id, blockReason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/user/${id}/block`, { block: true, blockReason });
      return { id, user: data.user, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block user');
    }
  }
);

// Unblock user
export const unblockUser = createAsyncThunk(
  'adminUsers/unblockUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/user/${id}/block`, { block: false });
      return { id, user: data.user, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock user');
    }
  }
);

// Toggle user block status
export const toggleUserBlock = createAsyncThunk(
  'adminUsers/toggleUserBlock',
  async ({ id, block, blockReason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/user/${id}/block`, { block, blockReason });
      return { id, user: data.user, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

// Update user role
export const updateUserRole = createAsyncThunk(
  'adminUsers/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/user/${id}/role`, { role });
      return { id, role, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

// Delete user (soft delete)
export const deleteUser = createAsyncThunk(
  'adminUsers/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/user/${id}`);
      return { id, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// Add user note
export const addUserNote = createAsyncThunk(
  'adminUsers/addUserNote',
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/admin/user/${id}/note`, { note });
      return { id, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

// Get user activity logs
export const getUserActivityLogs = createAsyncThunk(
  'adminUsers/getUserActivityLogs',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/user/${id}/activity-logs`);
      return { id, activityLogs: data.activityLogs };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

// Get user analytics
export const getUserAnalytics = createAsyncThunk(
  'adminUsers/getUserAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users/analytics');
      return data.analytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Bulk update users
export const bulkUpdateUsers = createAsyncThunk(
  'adminUsers/bulkUpdateUsers',
  async ({ userIds, action, value }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/admin/users/bulk-update', { userIds, action, value });
      return { message: data.message, updatedCount: data.updatedCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update users');
    }
  }
);

// Export users
export const exportUsers = createAsyncThunk(
  'adminUsers/exportUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users/export');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export users');
    }
  }
);

const initialState = {
  users: [],
  user: {},
  activityLogs: [],
  analytics: {
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    verifiedUsers: 0,
    monthlyData: [],
    topSpenders: [],
    recentUsers: []
  },
  usersCount: 0,
  resultPerPage: 12,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  isUpdated: false,
  isDeleted: false,
  bulkUpdateSuccess: false,
  message: null
};

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetUserStatus: (state) => {
      state.isUpdated = false;
      state.isDeleted = false;
      state.bulkUpdateSuccess = false;
      state.message = null;
    },
    clearUserDetails: (state) => {
      state.user = {};
      state.activityLogs = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // GetAllUsers
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.usersCount = action.payload.usersCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.analytics = action.payload.analytics;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetUserDetails
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UpdateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message;
        state.user = action.payload.user;
        // Update user in the users list
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.user };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // BlockUser
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message;
        state.user = action.payload.user;
        // Update user in the users list
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.user };
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UnblockUser
      .addCase(unblockUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message;
        state.user = action.payload.user;
        // Update user in the users list
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.user };
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ToggleUserBlock
      .addCase(toggleUserBlock.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message;
        state.user = action.payload.user;
        // Update user in the users list
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.user };
        }
      })
      .addCase(toggleUserBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UpdateUserRole
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message;
        // Update user in the users list
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index].role = action.payload.role;
        }
        // Update current user details if it's the same user
        if (state.user._id === action.payload.id) {
          state.user.role = action.payload.role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DeleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeleted = true;
        state.message = action.payload.message;
        state.users = state.users.filter(user => user._id !== action.payload.id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // AddUserNote
      .addCase(addUserNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUserNote.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message;
      })
      .addCase(addUserNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetUserActivityLogs
      .addCase(getUserActivityLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.activityLogs = action.payload.activityLogs;
      })
      .addCase(getUserActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetUserAnalytics
      .addCase(getUserAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getUserAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // BulkUpdateUsers
      .addCase(bulkUpdateUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkUpdateSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(bulkUpdateUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ExportUsers
      .addCase(exportUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportUsers.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(exportUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearErrors, resetUserStatus, clearUserDetails } = adminUserSlice.actions;
export default adminUserSlice.reducer;

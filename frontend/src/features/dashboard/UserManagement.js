import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { addAlert } from '../ui/uiSlice';

/**
 * UserManagement component for admin dashboard
 * Allows administrators to view, filter, and manage users
 * Mobile-first design as required in PLANNING.md
 */
const UserManagement = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for users data
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // State for filters
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });
  
  // State for user verification dialog
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // State for user deletion dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch users data
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1, // API uses 1-indexed pages
        per_page: rowsPerPage,
      });
      
      if (filters.role) {
        params.append('role', filters.role);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const response = await axios.get(`/api/admin/users?${params.toString()}`);
      
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
      dispatch(addAlert({
        type: 'error',
        message: 'Failed to load users',
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch users when component mounts or filters/pagination change
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, filters]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0); // Reset to first page when filters change
  };
  
  // Handle search
  const handleSearch = (event) => {
    event.preventDefault();
    // Search is already handled by the useEffect dependency on filters
  };
  
  // Handle verify dialog open
  const handleVerifyDialogOpen = (user) => {
    setSelectedUser(user);
    setNewStatus(user.verification_status);
    setVerifyDialogOpen(true);
  };
  
  // Handle verify dialog close
  const handleVerifyDialogClose = () => {
    setVerifyDialogOpen(false);
    setSelectedUser(null);
    setNewStatus('');
  };
  
  // Handle user verification status update
  const handleVerifyUser = async () => {
    try {
      await axios.put(`/api/admin/users/${selectedUser.id}/verify`, {
        status: newStatus,
      });
      
      dispatch(addAlert({
        type: 'success',
        message: `User verification status updated to ${newStatus}`,
      }));
      
      // Refresh users data
      fetchUsers();
      
      // Close dialog
      handleVerifyDialogClose();
    } catch (err) {
      dispatch(addAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update user verification status',
      }));
    }
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/users/${selectedUser.id}`);
      
      dispatch(addAlert({
        type: 'success',
        message: 'User deleted successfully',
      }));
      
      // Refresh users data
      fetchUsers();
      
      // Close dialog
      handleDeleteDialogClose();
    } catch (err) {
      dispatch(addAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete user',
      }));
    }
  };
  
  // Get color for verification status chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Get icon for verification status chip
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      case 'pending':
        return <HourglassIcon fontSize="small" />;
      default:
        return <BlockIcon fontSize="small" />;
    }
  };
  
  // Render mobile card view for users
  const renderMobileView = () => {
    return (
      <Box>
        {users.map((user) => (
          <Card key={user.id} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(user.verification_status)}
                    label={user.verification_status}
                    color={getStatusColor(user.verification_status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleVerifyDialogOpen(user)}
              >
                Verify
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteDialogOpen(user)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  };
  
  // Render desktop table view for users
  const renderDesktopView = () => {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Verification Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell component="th" scope="row">
                  {user.username}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(user.verification_status)}
                    label={user.verification_status}
                    color={getStatusColor(user.verification_status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Verify User">
                    <IconButton
                      color="primary"
                      onClick={() => handleVerifyDialogOpen(user)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteDialogOpen(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          User Management
        </Typography>
        
        {/* Filters and Search */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter"
                name="role"
                value={filters.role}
                label="Role"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="provider">Provider</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Verification Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                name="status"
                value={filters.status}
                label="Verification Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <form onSubmit={handleSearch}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  size="small"
                  name="search"
                  label="Search username or email"
                  variant="outlined"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ ml: 1 }}
                >
                  <SearchIcon />
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading spinner */}
        {isLoading ? (
          <LoadingSpinner message="Loading users..." />
        ) : (
          <>
            {/* Users list */}
            {users.length === 0 ? (
              <Alert severity="info">
                No users found matching the selected filters.
              </Alert>
            ) : (
              <>
                {/* Responsive view based on screen size */}
                {isMobile ? renderMobileView() : renderDesktopView()}
                
                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={totalUsers}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Verify User Dialog */}
      <Dialog open={verifyDialogOpen} onClose={handleVerifyDialogClose}>
        <DialogTitle>Update User Verification Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update verification status for user: <strong>{selectedUser?.username}</strong>
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="new-status-label">Verification Status</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status"
              value={newStatus}
              label="Verification Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="unverified">Unverified</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerifyDialogClose}>Cancel</Button>
          <Button onClick={handleVerifyUser} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{selectedUser?.username}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

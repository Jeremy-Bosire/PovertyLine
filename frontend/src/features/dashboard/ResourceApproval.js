import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Grid,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { addAlert } from '../ui/uiSlice';

/**
 * ResourceApproval component for admin dashboard
 * Allows administrators to review and approve/reject pending resources
 * Mobile-first design as required in PLANNING.md
 */
const ResourceApproval = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for resources data
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalResources, setTotalResources] = useState(0);
  
  // State for approval dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  
  // Fetch pending resources
  const fetchPendingResources = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1, // API uses 1-indexed pages
        per_page: rowsPerPage,
      });
      
      const response = await axios.get(`/api/admin/resources/pending?${params.toString()}`);
      
      setResources(response.data.resources);
      setTotalResources(response.data.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending resources');
      dispatch(addAlert({
        type: 'error',
        message: 'Failed to load pending resources',
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch resources when component mounts or pagination changes
  useEffect(() => {
    fetchPendingResources();
  }, [page, rowsPerPage]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle approval dialog open
  const handleApprovalDialogOpen = (resource, initialStatus) => {
    setSelectedResource(resource);
    setApprovalStatus(initialStatus);
    setApprovalNotes('');
    setApprovalDialogOpen(true);
  };
  
  // Handle approval dialog close
  const handleApprovalDialogClose = () => {
    setApprovalDialogOpen(false);
    setSelectedResource(null);
    setApprovalStatus('');
    setApprovalNotes('');
  };
  
  // Handle resource approval/rejection
  const handleResourceApproval = async () => {
    try {
      await axios.put(`/api/admin/resources/${selectedResource.id}/approve`, {
        status: approvalStatus,
        notes: approvalNotes,
      });
      
      const statusText = approvalStatus === 'active' ? 'approved' : 'rejected';
      
      dispatch(addAlert({
        type: 'success',
        message: `Resource ${statusText} successfully`,
      }));
      
      // Refresh resources data
      fetchPendingResources();
      
      // Close dialog
      handleApprovalDialogClose();
    } catch (err) {
      dispatch(addAlert({
        type: 'error',
        message: err.response?.data?.error || `Failed to ${approvalStatus} resource`,
      }));
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render resource card
  const renderResourceCard = (resource) => {
    return (
      <Card key={resource.id} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {resource.title}
          </Typography>
          
          <Chip
            label={resource.category}
            color="primary"
            size="small"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" paragraph>
            {resource.description.length > 200
              ? `${resource.description.substring(0, 200)}...`
              : resource.description}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Provider
              </Typography>
              <Typography variant="body2" gutterBottom>
                {resource.provider_name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted
              </Typography>
              <Typography variant="body2" gutterBottom>
                {formatDate(resource.created_at)}
              </Typography>
            </Grid>
            
            {resource.start_date && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available From
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {formatDate(resource.start_date)}
                </Typography>
              </Grid>
            )}
            
            {resource.end_date && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Available Until
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {formatDate(resource.end_date)}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="resource-details-content"
              id="resource-details-header"
            >
              <Typography>View More Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {resource.location && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {resource.location.city}, {resource.location.state}
                    </Typography>
                  </Grid>
                )}
                
                {resource.eligibility_criteria && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Eligibility Criteria
                    </Typography>
                    <List dense>
                      {Object.entries(resource.eligibility_criteria).map(([key, value]) => (
                        <ListItem key={key} sx={{ py: 0 }}>
                          <ListItemText
                            primary={`${key}: ${value}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {resource.application_process && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Application Process
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {resource.application_process}
                    </Typography>
                  </Grid>
                )}
                
                {resource.required_documents && resource.required_documents.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Required Documents
                    </Typography>
                    <List dense>
                      {resource.required_documents.map((doc, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText primary={doc} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {resource.provider_contact && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Provider Contact
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {resource.provider_contact.email && `Email: ${resource.provider_contact.email}`}
                      {resource.provider_contact.phone && `, Phone: ${resource.provider_contact.phone}`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
        
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => handleApprovalDialogOpen(resource, 'active')}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => handleApprovalDialogOpen(resource, 'inactive')}
          >
            Reject
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Resource Approval
          </Typography>
          
          <Chip
            icon={<InfoIcon />}
            label={`${totalResources} pending resources`}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading spinner */}
        {isLoading ? (
          <LoadingSpinner message="Loading pending resources..." />
        ) : (
          <>
            {/* Resources list */}
            {resources.length === 0 ? (
              <Alert severity="info">
                No resources are pending approval at this time.
              </Alert>
            ) : (
              <>
                {/* Resource cards */}
                {resources.map((resource) => renderResourceCard(resource))}
                
                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={totalResources}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={handleApprovalDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalStatus === 'active' ? 'Approve Resource' : 'Reject Resource'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {approvalStatus === 'active'
              ? 'Are you sure you want to approve this resource? It will become visible to all users.'
              : 'Are you sure you want to reject this resource? It will not be visible to users.'}
          </DialogContentText>
          
          {selectedResource && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedResource.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provider: {selectedResource.provider_name}
              </Typography>
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Notes (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApprovalDialogClose}>Cancel</Button>
          <Button
            onClick={handleResourceApproval}
            color={approvalStatus === 'active' ? 'success' : 'error'}
            variant="contained"
          >
            {approvalStatus === 'active' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceApproval;

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
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { addAlert } from '../ui/uiSlice';

/**
 * ApplicationReview component for admin dashboard
 * Allows administrators to review and approve/reject pending applications
 * Mobile-first design as required in PLANNING.md
 */
const ApplicationReview = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for applications data
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalApplications, setTotalApplications] = useState(0);
  
  // State for review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Fetch pending applications
  const fetchPendingApplications = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1, // API uses 1-indexed pages
        per_page: rowsPerPage,
      });
      
      const response = await axios.get(`/api/admin/applications/pending?${params.toString()}`);
      
      setApplications(response.data.applications);
      setTotalApplications(response.data.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending applications');
      dispatch(addAlert({
        type: 'error',
        message: 'Failed to load pending applications',
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch applications when component mounts or pagination changes
  useEffect(() => {
    fetchPendingApplications();
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
  
  // Handle review dialog open
  const handleReviewDialogOpen = (application, initialStatus) => {
    setSelectedApplication(application);
    setReviewStatus(initialStatus);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };
  
  // Handle review dialog close
  const handleReviewDialogClose = () => {
    setReviewDialogOpen(false);
    setSelectedApplication(null);
    setReviewStatus('');
    setReviewNotes('');
  };
  
  // Handle application review (approve/reject)
  const handleApplicationReview = async () => {
    try {
      await axios.put(`/api/admin/applications/${selectedApplication.id}/review`, {
        status: reviewStatus,
        notes: reviewNotes,
      });
      
      const statusText = reviewStatus === 'approved' ? 'approved' : 'rejected';
      
      dispatch(addAlert({
        type: 'success',
        message: `Application ${statusText} successfully`,
      }));
      
      // Refresh applications data
      fetchPendingApplications();
      
      // Close dialog
      handleReviewDialogClose();
    } catch (err) {
      dispatch(addAlert({
        type: 'error',
        message: err.response?.data?.error || `Failed to ${reviewStatus} application`,
      }));
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Render application card
  const renderApplicationCard = (application) => {
    return (
      <Card key={application.id} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <PersonIcon />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" component="div">
                {application.user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {application.user.email}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={application.status}
                color={getStatusColor(application.status)}
                size="small"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resource: {application.resource.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {application.resource.description.length > 150
                ? `${application.resource.description.substring(0, 150)}...`
                : application.resource.description}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted
              </Typography>
              <Typography variant="body2" gutterBottom>
                {formatDate(application.created_at)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Need Level
              </Typography>
              <Typography variant="body2" gutterBottom>
                {application.need_level || 'Not specified'}
              </Typography>
            </Grid>
          </Grid>
          
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="application-details-content"
              id="application-details-header"
            >
              <Typography>View Application Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {application.reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reason for Application
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {application.reason}
                    </Typography>
                  </Grid>
                )}
                
                {application.documents && application.documents.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Submitted Documents
                    </Typography>
                    <List dense>
                      {application.documents.map((doc, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={doc.name} 
                            secondary={`Uploaded: ${formatDate(doc.uploaded_at)}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {application.user.profile && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Profile Information
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {application.user.profile.income && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Income Level:
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {application.user.profile.income}
                          </Typography>
                        </Grid>
                      )}
                      
                      {application.user.profile.household_size && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Household Size:
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {application.user.profile.household_size}
                          </Typography>
                        </Grid>
                      )}
                      
                      {application.user.profile.location && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Location:
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {application.user.profile.location.city}, {application.user.profile.location.state}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )}
                
                {application.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Additional Notes
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {application.notes}
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
            onClick={() => handleReviewDialogOpen(application, 'approved')}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => handleReviewDialogOpen(application, 'rejected')}
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
            Application Review
          </Typography>
          
          <Chip
            icon={<AssignmentIcon />}
            label={`${totalApplications} pending applications`}
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
          <LoadingSpinner message="Loading pending applications..." />
        ) : (
          <>
            {/* Applications list */}
            {applications.length === 0 ? (
              <Alert severity="info">
                No applications are pending review at this time.
              </Alert>
            ) : (
              <>
                {/* Application cards */}
                {applications.map((application) => renderApplicationCard(application))}
                
                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={totalApplications}
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
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleReviewDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewStatus === 'approved' ? 'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {reviewStatus === 'approved'
              ? 'Are you sure you want to approve this application? The user will be notified and granted access to the resource.'
              : 'Are you sure you want to reject this application? The user will be notified that their application was not approved.'}
          </DialogContentText>
          
          {selectedApplication && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                User: {selectedApplication.user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Resource: {selectedApplication.resource.title}
              </Typography>
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Review Notes (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Provide feedback or reasons for your decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewDialogClose}>Cancel</Button>
          <Button
            onClick={handleApplicationReview}
            color={reviewStatus === 'approved' ? 'success' : 'error'}
            variant="contained"
          >
            {reviewStatus === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationReview;

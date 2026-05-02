// components/TeamManagement/EditMemberModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const departments = [
  'Mechanical',
  'Electrical',
  'Safety',
  'HVAC',
  'Civil',
  'Environmental',
];

const roles = [
  { value: 'inspector', label: 'Inspector' },
  { value: 'senior_inspector', label: 'Senior Inspector' },
  { value: 'junior_inspector', label: 'Junior Inspector' },
  { value: 'lead_inspector', label: 'Lead Inspector' },
  { value: 'supervisor', label: 'Supervisor' },
];

const locations = [
  'Warehouse A',
  'Warehouse B',
  'Production Floor',
  'Building A',
  'Building B',
  'Rooftop',
  'Main Office',
];

const statusOptions = [
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'inactive', label: 'Inactive', color: '#94a3b8' },
];

const EditMemberModal = ({ open, onClose, onSubmit, member, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        role: member.role || 'inspector',
        department: member.department || '',
        location: member.location || '',
        status: member.status || 'active',
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit(member?.id || member?._id, formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, overflow: 'hidden' }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: { xs: 2, sm: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600} fontSize={{ xs: '1rem', sm: '1.1rem' }}>
              Edit Team Member
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Update team member information
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ fontSize: '0.9rem' }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                size="small"
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: '0.9rem' }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ fontSize: '0.9rem' }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                select
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon sx={{ fontSize: '0.9rem' }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              >
                {roles.map(role => (
                  <MenuItem key={role.value} value={role.value} sx={{ fontSize: '0.9rem' }}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                select
                name="department"
                label="Department"
                value={formData.department}
                onChange={handleChange}
                error={!!errors.department}
                helperText={errors.department}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ fontSize: '0.9rem' }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              >
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept} sx={{ fontSize: '0.9rem' }}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                select
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ fontSize: '0.9rem' }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              >
                {locations.map(loc => (
                  <MenuItem key={loc} value={loc} sx={{ fontSize: '0.9rem' }}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{width:"250px"}}>
              <TextField
                fullWidth
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.9rem' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: opt.color }} />
                      {opt.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.7rem', py: 0.75 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              backgroundColor: '#0d4a5c',
              fontSize: '0.7rem',
              py: 0.75,
              px: 2.5,
              '&:hover': { backgroundColor: '#0a3a46' },
            }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditMemberModal;
// pages/InspectionHistory.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, InputAdornment,
  Select, MenuItem, FormControl, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, alpha, Modal, Backdrop, Fade, Divider,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContexts';
import axios from 'axios';
import InspectionReportPage from './Inspectionreportpage';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: '#0f4c61',
  ink: '#1a2e3b',
  muted: '#64748b',
  ghost: '#94a3b8',
  border: '#e8edf2',
  surface: '#f8fafc',
  white: '#ffffff',
  green: '#22c55e',
  greenDk: '#16a34a',
  greenIcon: '#22c55e',
  red: '#ef4444',
  redDk: '#dc2626',
  amber: '#f59e0b',
  blue: '#3b82f6',
  bg: '#f3f5f8',
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

// ─── Styled Components ─────────────────────────────────────────────────────────
const PageWrap = styled(Box)({
  minHeight: '100vh',
  padding: '28px 32px 48px',
  fontFamily: '"DM Sans","Segoe UI",sans-serif',
  '@media (max-width: 600px)': {
    padding: '16px',
  },
});

const SearchBar = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    background: C.white,
    fontSize: '0.82rem',
    height: 44,
    '& fieldset': { borderColor: C.border },
    '&:hover fieldset': { borderColor: alpha(C.navy, 0.3) },
    '&.Mui-focused fieldset': { borderColor: C.navy, borderWidth: 1.5 }
  },
  '& .MuiInputBase-input': {
    fontSize: '0.82rem',
    color: C.muted,
    '&::placeholder': { color: C.ghost, opacity: 1 }
  },
});

const StatusSelect = styled(Select)({
  borderRadius: 10,
  background: C.white,
  height: 44,
  fontSize: '0.82rem',
  color: C.muted,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(C.navy, 0.3) },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.navy, borderWidth: 1.5 },
  '& .MuiSelect-select': { paddingTop: '10px', paddingBottom: '10px' },
});

const StatCard = styled(Paper)({
  borderRadius: 10,
  background: C.white,
  border: `1px solid ${C.border}`,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  padding: '20px 24px',
  height: '100%',
  width:"268px",
  '@media (max-width: 600px)': {
    padding: '16px',
  },
});

const StyledTable = styled(TableContainer)({
  borderRadius: 14,
  background: C.white,
  border: `1px solid ${C.border}`,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  overflow: 'hidden',
  overflowX: 'auto',
});

const HeadCell = styled(TableCell)({
  fontSize: '0.72rem',
  fontWeight: 700,
  color: C.ink,
  background: C.white,
  borderBottom: `1.5px solid ${C.border}`,
  padding: '13px 20px',
  whiteSpace: 'nowrap',
});

const BodyCell = styled(TableCell)({
  fontSize: '0.8rem',
  color: C.ink,
  borderBottom: `1px solid ${C.border}`,
  padding: '14px 20px',
  verticalAlign: 'middle',
});

const StatusChip = ({ status, small }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'reviewed':
        return { bg: C.navy, color: C.white, label: 'Approved' };
      case 'pending_review':
      case 'under_review':
        return { bg: alpha(C.blue, 0.12), color: C.blue, label: 'Under Review' };
      case 'needs_revision':
      case 'rejected':
        return { bg: C.red, color: C.white, label: 'Needs Revision' };
      case 'submitted':
        return { bg: alpha(C.amber, 0.12), color: C.amber, label: 'Submitted' };
      default:
        return { bg: alpha(C.ghost, 0.12), color: C.muted, label: status || 'Unknown' };
    }
  };
  
  const config = getStatusConfig(status);
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: small ? '0.68rem' : '0.72rem',
        height: small ? 26 : 28,
        borderRadius: '20px',
        '& .MuiChip-label': { px: small ? '10px' : '12px' },
      }}
    />
  );
};

const ScoreText = ({ score }) => {
  if (!score && score !== 0) return <Typography sx={{ fontSize: '0.8rem', color: C.ghost }}>–</Typography>;
  const color = score >= 90 ? C.greenDk : score >= 75 ? C.amber : C.redDk;
  return <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color }}>{score}%</Typography>;
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const InspectionHistory = () => {
  const { token, isAuthenticated } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [modalRow, setModalRow] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch recent inspections
  const fetchRecentInspections = async () => {
    if (!token || !isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/team/me/recent-inspections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.success) {
        // Transform the response data
        const inspectionsList = Object.values(response.data).filter(
          item => item && typeof item === 'object' && item._id
        );
        setInspections(inspectionsList);
      } else {
        setError(response.data.message || 'Failed to fetch inspections');
      }
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError(err.response?.data?.message || 'Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentInspections();
  }, [token, isAuthenticated]);

  // Transform inspection data for display
  const transformedInspections = useMemo(() => {
    return inspections.map(inspection => ({
      id: inspection._id,
      asset: inspection.assetName || 'N/A',
      formType: inspection.checklist?.name || 'Inspection Form',
      date: inspection.submittedAt ? new Date(inspection.submittedAt).toLocaleDateString() : 'N/A',
      status: inspection.submissionStatus || inspection.status,
      score: inspection.overallRating ? (inspection.overallRating * 20) : null,
      inspector: inspection.primaryMember?.name || 'Unknown',
      isNew: new Date(inspection.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rawData: inspection
    }));
  }, [inspections]);

  // Filter inspections
  const filtered = useMemo(() => {
    return transformedInspections.filter(item => {
      const matchesSearch = !search || 
        item.asset.toLowerCase().includes(search.toLowerCase()) ||
        item.formType.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transformedInspections, search, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const scores = transformedInspections.filter(i => i.score !== null).map(i => i.score);
    return {
      total: transformedInspections.length,
      approved: transformedInspections.filter(i => i.status === 'approved' || i.status === 'reviewed').length,
      review: transformedInspections.filter(i => i.status === 'pending_review' || i.status === 'under_review').length,
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    };
  }, [transformedInspections]);

  const handleRefresh = () => {
    fetchRecentInspections();
  };

  const handleViewReport = (row) => {
    setReportData(row.rawData);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading state
  if (loading && inspections.length === 0) {
    return (
      <PageWrap sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: C.navy }} />
      </PageWrap>
    );
  }

  // Show report page if navigated
  if (reportData) {
    return (
      <InspectionReportPage 
        report={reportData} 
        onBack={() => setReportData(null)} 
        token={token}
      />
    );
  }

  return (
    <PageWrap>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.45rem' }, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>
            Inspection History
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: C.muted, mt: 0.3 }}>
            View your submitted inspection forms
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{
            borderRadius: 2,
            borderColor: C.border,
            color: C.navy,
            textTransform: 'none',
            '&:hover': { borderColor: C.navy, bgcolor: C.surface }
          }}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2.5,
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        p: '12px 16px',
        flexWrap: 'wrap',
      }}>
        <SearchBar
          fullWidth
          placeholder="Search submissions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1rem', color: C.ghost }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: '100%', sm: 300 } }}
        />
        <FormControl sx={{ minWidth: 140 }}>
          <StatusSelect value={statusFilter} onChange={e => setStatus(e.target.value)} displayEmpty IconComponent={KeyboardArrowDownIcon}>
            <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>All Status</MenuItem>
            <MenuItem value="approved" sx={{ fontSize: '0.8rem' }}>Approved</MenuItem>
            <MenuItem value="reviewed" sx={{ fontSize: '0.8rem' }}>Reviewed</MenuItem>
            <MenuItem value="pending_review" sx={{ fontSize: '0.8rem' }}>Pending Review</MenuItem>
            <MenuItem value="submitted" sx={{ fontSize: '0.8rem' }}>Submitted</MenuItem>
            <MenuItem value="needs_revision" sx={{ fontSize: '0.8rem' }}>Needs Revision</MenuItem>
          </StatusSelect>
        </FormControl>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Submissions', value: stats.total, color: C.ink },
          { label: 'Approved', value: stats.approved, color: C.green },
          { label: 'Under Review', value: stats.review, color: C.red },
          { label: 'Avg Rating', value: `${stats.avg}%`, color: C.ink },
        ].map(({ label, value, color }) => (
          <Grid item xs={6} sm={6} md={3} key={label}>
            <StatCard>
              <Typography sx={{ fontSize: '0.72rem', color: C.muted, mb: 1.5, fontWeight: 500 }}>{label}</Typography>
              <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <StyledTable component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['Asset', 'Form Type', 'Submitted Date', 'Status', 'Rating', 'Actions'].map(h => (
                <HeadCell key={h}>{h}</HeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row => (
              <TableRow key={row.id} sx={{
                '&:last-child td': { borderBottom: 'none' },
                '&:hover': { background: alpha(C.navy, 0.02) },
                transition: 'background 0.15s ease',
              }}>
                <BodyCell>
                  <Typography sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: C.navy,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}>
                    {row.asset}
                  </Typography>
                </BodyCell>
                <BodyCell><Typography sx={{ fontSize: '0.8rem', color: C.muted }}>{row.formType}</Typography></BodyCell>
                <BodyCell><Typography sx={{ fontSize: '0.8rem', color: C.muted }}>{row.date}</Typography></BodyCell>
                <BodyCell><StatusChip status={row.status} small /></BodyCell>
                <BodyCell><ScoreText score={row.score} /></BodyCell>
                <BodyCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: '0.85rem !important' }} />}
                      onClick={() => setModalRow(row)}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: C.ink,
                        textTransform: 'none',
                        minWidth: 0,
                        px: 0.5,
                        '&:hover': { background: 'transparent', color: C.navy }
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </BodyCell>
              </TableRow>
            ))}
            {filtered.length === 0 && !loading && (
              <TableRow>
                <BodyCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: C.ghost }}>
                  No inspection records found
                </BodyCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTable>

      {/* Detail Modal */}
      <InspectionDetailModal
        open={Boolean(modalRow)}
        onClose={() => setModalRow(null)}
        row={modalRow}
        onViewReport={handleViewReport}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageWrap>
  );
};

// ─── Inspection Detail Modal ────────────────────────────────────────────────────
const InspectionDetailModal = ({ open, onClose, row, onViewReport }) => {
  if (!row) return null;
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 200, sx: { bgcolor: 'rgba(15,30,45,0.45)', backdropFilter: 'blur(3px)' } } }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '92vw', sm: 560 },
          maxHeight: '92vh',
          overflowY: 'auto',
          bgcolor: C.white,
          borderRadius: 3,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          outline: 'none',
          p: 3,
          fontFamily: '"DM Sans","Segoe UI",sans-serif',
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>
                Inspection Details
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: C.muted, mt: 0.3 }}>
                {row.formType} - {row.asset}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: C.ghost, '&:hover': { color: C.ink, bgcolor: C.surface } }}>
              <CloseIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Box>

          {/* Status + Score */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sx={{width:"233px"}}>
              <Paper sx={{ borderRadius: 2, border: `1px solid ${C.border}`, boxShadow: 'none', p: '20px 22px 22px' }}>
                <Typography sx={{ fontSize: '0.72rem', color: C.muted }}>Status</Typography>
                <Box sx={{ mt: 1 }}><StatusChip status={row.status} /></Box>
              </Paper>
            </Grid>
            <Grid item xs={6} sx={{width:"233px"}}>
              <Paper sx={{ borderRadius: 2, border: `1px solid ${C.border}`, boxShadow: 'none', p: '20px 22px 22px' }}>
                <Typography sx={{ fontSize: '0.72rem', color: C.muted }}>Rating</Typography>
                {row.score
                  ? <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: C.navy, mt: 1 }}>{row.score}%</Typography>
                  : <Typography sx={{ fontSize: '0.8rem', color: C.ghost, mt: 1 }}>–</Typography>
                }
              </Paper>
            </Grid>
          </Grid>

          {/* Details */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: C.navy, mb: 1.5 }}>
              Submission Details
            </Typography>
            {[
              { label: 'Asset:', value: row.asset },
              { label: 'Form Type:', value: row.formType },
              { label: 'Submitted:', value: row.date },
              { label: 'Inspector:', value: row.inspector },
            ].map(({ label, value }) => (
              <Box key={label} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                py: 1.6, borderBottom: `1px solid ${C.border}`,
                '&:last-child': { borderBottom: 'none' },
              }}>
                <Typography sx={{ fontSize: '0.82rem', color: C.muted }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { onClose(); onViewReport(row); }}
              sx={{
                borderRadius: 2.5,
                bgcolor: C.navy,
                color: C.white,
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'none',
                py: 1.2,
                boxShadow: `0 4px 12px ${alpha(C.navy, 0.25)}`,
                '&:hover': { bgcolor: alpha(C.navy, 0.88) },
              }}
            >
              View Full Report
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default InspectionHistory;
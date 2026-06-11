// src/pages/InspectionHistory.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  Pagination,
  Skeleton,
  Fade,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Grid,
  Card,
  CardContent,
  Rating,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Clear as ClearIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentContext";

const theme = createTheme({
  palette: {
    primary: { main: "#0d4a5c" },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
  },
  shape: { borderRadius: 12 },
});

const REVIEW_STATUS_CFG = {
  pending_review: { label: "Pending Review", color: "#f59e0b", bg: "#fffbeb" },
  approved: { label: "Approved", color: "#10b981", bg: "#ecfdf5" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "#fef2f2" },
  needs_revision: { label: "Needs Revision", color: "#8b5cf6", bg: "#f5f3ff" },
};

const ReviewStatusChip = ({ status }) => {
  const cfg =
    REVIEW_STATUS_CFG[status?.toLowerCase()] ||
    REVIEW_STATUS_CFG.pending_review;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700 }}
    />
  );
};

export default function InspectionHistory() {
  const navigate = useNavigate();
  const { fetchInspectionHistory, exportInspection, loading } =
    useTeamAssignment();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [inspections, setInspections] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const toast = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );

  const loadInspections = useCallback(
    async (page = 1) => {
      const result = await fetchInspectionHistory(page, 10);
      if (result.success) {
        setInspections(result.inspections);
        setPagination(result.pagination);
      } else {
        toast(result.error, "error");
      }
    },
    [fetchInspectionHistory, toast],
  );

  useEffect(() => {
    loadInspections();
  }, []);

  // FIXED: Proper ID handling and navigation
  const handleViewInspection = (submissionId) => {
    console.log("Navigating to inspection details with ID:", submissionId);
    if (
      submissionId &&
      submissionId !== "undefined" &&
      submissionId !== "null"
    ) {
      navigate(`/team/inspection/${submissionId}`);
    } else {
      console.error("Invalid inspection ID:", submissionId);
      toast("Invalid inspection ID", "error");
    }
  };

  // FIXED: Proper export handling
  const handleExport = async (submissionId, format) => {
    console.log(`Exporting inspection ${submissionId} as ${format}`);
    if (
      !submissionId ||
      submissionId === "undefined" ||
      submissionId === "null"
    ) {
      toast("Invalid inspection ID", "error");
      return;
    }
    const result = await exportInspection(submissionId, format);
    if (result.success && result.url) {
      window.open(result.url, "_blank");
    } else {
      toast(result.error || "Export failed", "error");
    }
  };

  const filteredInspections = inspections.filter((insp) => {
    if (
      search &&
      !insp.inspectionId?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter && insp.reviewStatus !== statusFilter) return false;
    return true;
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh"}}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3.5 } }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
                Inspection History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View all your completed inspections and submissions
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => loadInspections(pagination.page)}
                  disabled={loading}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "white",
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Stats Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3} sx={{ width:"278px"}}>
              <Paper sx={{ p: 2, textAlign: "center", borderRadius: 1}}>
                <Typography variant="h5" fontWeight={800}>
                  {pagination.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Inspections
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width:"278px"}}>
              <Paper sx={{ p: 2, textAlign: "center", borderRadius: 1 }}>
                <Typography variant="h5" fontWeight={800} color="#10b981">
                  {
                    inspections.filter((i) => i.reviewStatus === "approved")
                      .length
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approved
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width:"278px"}}>
              <Paper sx={{ p: 2, textAlign: "center", borderRadius: 1 }}>
                <Typography variant="h5" fontWeight={800} color="#f59e0b">
                  {
                    inspections.filter(
                      (i) => i.reviewStatus === "pending_review",
                    ).length
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending Review
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width:"278px"}}>
              <Paper sx={{ p: 2, textAlign: "center", borderRadius: 1 }}>
                <Typography variant="h5" fontWeight={800} color="#ef4444">
                  {
                    inspections.filter((i) => i.reviewStatus === "rejected")
                      .length
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rejected
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ mb: 2, p: 2, borderRadius: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
            >
              <TextField
                size="small"
                placeholder="Search by Inspection ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 2, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <ClearIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Status</MenuItem>
                  {Object.entries(REVIEW_STATUS_CFG).map(([k, cfg]) => (
                    <MenuItem key={k} value={k}>
                      {cfg.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Inspections Table */}
          {loading ? (
            <Paper sx={{ p: 4, borderRadius: 1 }}>
              <CircularProgress
                size={40}
                sx={{ display: "block", mx: "auto" }}
              />
              <Skeleton height={52} sx={{ mt: 2 }} />
              <Skeleton height={52} />
              <Skeleton height={52} />
            </Paper>
          ) : filteredInspections.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
              <Fade in>
                <Box>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: alpha("#0d4a5c", 0.07),
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <AssignmentIcon
                      sx={{ fontSize: 40, color: "#0d4a5c", opacity: 0.4 }}
                    />
                  </Avatar>
                  <Typography
                    fontWeight={700}
                    color="text.secondary"
                    variant="h6"
                  >
                    No inspections found
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    You haven't completed any inspections yet.
                  </Typography>
                </Box>
              </Fade>
            </Paper>
          ) : (
            <Paper sx={{ overflow: "hidden", borderRadius: 1 }}>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f9fafb" }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Inspection ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Checklist
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Asset
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Submitted At
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Review Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Rating
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInspections.map((insp, idx) => (
                      <Fade
                        in
                        timeout={200 + idx * 40}
                        key={insp._id || insp.id}
                      >
                        <TableRow hover>
                          <TableCell>
                            <Typography fontWeight={600} variant="body2">
                              {insp.inspectionId || insp._id?.slice(-8)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {insp.checklistName || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {insp.assetTag || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {insp.submittedAt
                                ? new Date(
                                    insp.submittedAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <ReviewStatusChip status={insp.reviewStatus} />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Rating
                                value={insp.performanceRating || 0}
                                readOnly
                                size="small"
                                precision={0.5}
                              />
                              <Typography variant="caption">
                                ({insp.performanceRating || 0})
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="center"
                            >
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleViewInspection(insp._id || insp.id)
                                  }
                                  sx={{
                                    borderRadius: 1.5,
                                    bgcolor: alpha("#0d4a5c", 0.08),
                                  }}
                                >
                                  <VisibilityIcon
                                    sx={{ fontSize: 17, color: "#0d4a5c" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Export PDF">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleExport(insp._id || insp.id, "pdf")
                                  }
                                  sx={{ borderRadius: 1.5 }}
                                >
                                  <PdfIcon
                                    sx={{ fontSize: 17, color: "#ef4444" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Export Excel">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleExport(insp._id || insp.id, "excel")
                                  }
                                  sx={{ borderRadius: 1.5 }}
                                >
                                  <ExcelIcon
                                    sx={{ fontSize: 17, color: "#10b981" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {pagination.totalPages > 1 && (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={(_, p) => loadInspections(p)}
                    color="primary"
                  />
                </Box>
              )}
            </Paper>
          )}
        </Container>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack({ ...snack, open: false })}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

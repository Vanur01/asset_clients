import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  alpha,
  Modal,
  Backdrop,
  Fade,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Pagination,
  Menu,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../context/AuthContexts";
import axios from "axios";
import InspectionReportPage from "./Inspectionreportpage";
import * as XLSX from "xlsx";

// Icons - Fixed duplicate import
import SearchIcon from "@mui/icons-material/Search";
import DateRangeIcon from "@mui/icons-material/DateRange";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // Only one import

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0f4c61",
  ink: "#1a2e3b",
  muted: "#64748b",
  ghost: "#94a3b8",
  border: "#e8edf2",
  surface: "#f8fafc",
  white: "#ffffff",
  green: "#22c55e",
  greenDk: "#16a34a",
  greenIcon: "#22c55e",
  red: "#ef4444",
  redDk: "#dc2626",
  amber: "#f59e0b",
  blue: "#3b82f6",
  bg: "#f3f5f8",
};

const API_BASE_URL = "http://localhost:9001/api/v1";

// ─── Styled Components ─────────────────────────────────────────────────────────
const PageWrap = styled(Box)({
  minHeight: "100vh",
  padding: "28px 32px 48px",
  fontFamily: '"DM Sans","Segoe UI",sans-serif',
  "@media (max-width: 600px)": {
    padding: "16px",
  },
});

const SearchBar = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    background: C.white,
    fontSize: "0.82rem",
    height: 44,
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: alpha(C.navy, 0.3) },
    "&.Mui-focused fieldset": { borderColor: C.navy, borderWidth: 1.5 },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.82rem",
    color: C.muted,
    "&::placeholder": { color: C.ghost, opacity: 1 },
  },
});

const StatusSelect = styled(Select)({
  borderRadius: 10,
  background: C.white,
  height: 44,
  fontSize: "0.82rem",
  color: C.muted,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(C.navy, 0.3),
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: C.navy,
    borderWidth: 1.5,
  },
  "& .MuiSelect-select": { paddingTop: "10px", paddingBottom: "10px" },
});

const StatCard = styled(Paper)({
  borderRadius: 10,
  background: C.white,
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  padding: "20px 24px",
  width:"280px",
  height: "100%",
  "@media (max-width: 600px)": {
    padding: "16px",
  },
});

const StyledTable = styled(TableContainer)({
  borderRadius: 14,
  background: C.white,
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  overflow: "hidden",
  overflowX: "auto",
});

const HeadCell = styled(TableCell)({
  fontSize: "0.72rem",
  fontWeight: 700,
  color: C.ink,
  background: C.white,
  borderBottom: `1.5px solid ${C.border}`,
  padding: "13px 20px",
  whiteSpace: "nowrap",
});

const BodyCell = styled(TableCell)({
  fontSize: "0.8rem",
  color: C.ink,
  borderBottom: `1px solid ${C.border}`,
  padding: "14px 20px",
  verticalAlign: "middle",
});

const StatusChip = ({ status, small }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          bg: C.green,
          color: C.white,
          label: "Approved",
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />,
        };
      case "reviewed":
        return {
          bg: C.green,
          color: C.white,
          label: "Approved",
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />,
        };
      case "pending_review":
      case "under_review":
        return {
          bg: alpha(C.blue, 0.12),
          color: C.blue,
          label: "Under Review",
          icon: <InfoOutlinedIcon sx={{ fontSize: 14 }} />,
        };
      case "needs_revision":
      case "rejected":
        return {
          bg: C.red,
          color: C.white,
          label: "Needs Revision",
          icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} />,
        };
      case "submitted":
        return {
          bg: alpha(C.amber, 0.12),
          color: C.amber,
          label: "Submitted",
          icon: <InfoOutlinedIcon sx={{ fontSize: 14 }} />,
        };
      default:
        return {
          bg: alpha(C.ghost, 0.12),
          color: C.muted,
          label: status || "Unknown",
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Chip
      label={config.label}
      size="small"
      icon={config.icon}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: small ? "0.68rem" : "0.72rem",
        height: small ? 26 : 28,
        borderRadius: "20px",
        "& .MuiChip-label": { px: small ? "10px" : "12px" },
        "& .MuiChip-icon": { fontSize: 14, color: config.color, ml: 0.5 },
      }}
    />
  );
};

const ScoreText = ({ score }) => {
  if (!score && score !== 0)
    return (
      <Typography sx={{ fontSize: "0.8rem", color: C.ghost }}>–</Typography>
    );
  const color = score >= 90 ? C.greenDk : score >= 75 ? C.amber : C.redDk;
  return (
    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color }}>
      {score}%
    </Typography>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const InspectionHistory = () => {
  const { token, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [modalRow, setModalRow] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    underReview: 0,
    avgScore: 0,
  });
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // Fetch inspection history from API
  const fetchInspectionHistory = useCallback(
    async (page = 1) => {
      if (!token || !isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/assignments/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: {
              page: page,
              limit: pagination.limit,
              status: statusFilter !== "all" ? statusFilter : undefined,
            },
          },
        );

        if (response.data.success) {
          setSubmissions(response.data.submissions || []);
          setStats(
            response.data.stats || {
              total: 0,
              approved: 0,
              underReview: 0,
              avgScore: 0,
            },
          );
          setPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
            },
          );
        } else {
          setError(
            response.data.message || "Failed to fetch inspection history",
          );
        }
      } catch (err) {
        console.error("Error fetching inspections:", err);
        setError(
          err.response?.data?.message || "Failed to fetch inspection history",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, isAuthenticated, statusFilter, pagination.limit],
  );

  useEffect(() => {
    fetchInspectionHistory(pagination.page);
  }, [fetchInspectionHistory, pagination.page]);

  // Transform inspection data for display
  const transformedInspections = useMemo(() => {
    return submissions.map((inspection) => {
      // Get asset name from assets array or checklist
      const asset =
        inspection.assets?.[0]?.assetName ||
        inspection.checklist?.name ||
        "N/A";

      // Calculate score from completion rate or overall rating
      let score = null;
      if (inspection.completionRate) {
        score = Math.round(inspection.completionRate);
      } else if (inspection.overallRating) {
        score = Math.round(inspection.overallRating * 20);
      }

      // Get inspector name from team members
      const inspector =
        inspection.assignedToTeamMembers?.[0]?.name ||
        inspection.assignedBy?.name ||
        "Unknown";

      return {
        id: inspection._id,
        asset: asset,
        formType: inspection.checklistName || "Inspection Form",
        date: inspection.submittedAt
          ? new Date(inspection.submittedAt).toLocaleDateString()
          : "N/A",
        status: inspection.submissionStatus || inspection.status,
        score: score,
        inspector: inspector,
        isNew:
          new Date(inspection.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rawData: inspection,
      };
    });
  }, [submissions]);

  // Filter inspections locally for search (server filtering for status)
  const filtered = useMemo(() => {
    if (!search) return transformedInspections;
    return transformedInspections.filter(
      (item) =>
        item.asset.toLowerCase().includes(search.toLowerCase()) ||
        item.formType.toLowerCase().includes(search.toLowerCase()) ||
        item.inspector.toLowerCase().includes(search.toLowerCase()),
    );
  }, [transformedInspections, search]);

  const handleRefresh = () => {
    fetchInspectionHistory(1);
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewReport = (row) => {
    setReportData(row.rawData);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = filtered.map((item) => ({
        Asset: item.asset,
        "Form Type": item.formType,
        "Submitted Date": item.date,
        Status: item.status === "pending_review" ? "Under Review" : item.status,
        Score: item.score ? `${item.score}%` : "N/A",
        Inspector: item.inspector,
        "Inspection ID": item.id,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inspection History");
      XLSX.writeFile(
        workbook,
        `inspection_history_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      setSnackbar({
        open: true,
        message: "Excel file downloaded successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to export Excel file",
        severity: "error",
      });
    }
    setExportAnchorEl(null);
  };

  // Export to PDF (using html2pdf)
  const exportToPDF = async () => {
    try {
      const element = document.getElementById("inspection-table-container");
      if (!element) return;

      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `inspection_history_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      };

      await html2pdf().set(opt).from(element).save();

      setSnackbar({
        open: true,
        message: "PDF downloaded successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      setSnackbar({
        open: true,
        message: "Failed to generate PDF",
        severity: "error",
      });
    }
    setExportAnchorEl(null);
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  // Show loading state
  if (loading && submissions.length === 0) {
    return (
      <PageWrap
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
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
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.45rem" },
              fontWeight: 800,
              color: C.ink,
              lineHeight: 1.2,
            }}
          >
            Inspection History
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: C.muted, mt: 0.3 }}>
            View and manage your submitted inspection forms
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderRadius: 2,
              borderColor: C.border,
              color: C.navy,
              textTransform: "none",
              "&:hover": { borderColor: C.navy, bgcolor: C.surface },
            }}
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            startIcon={<GetAppIcon />}
            onClick={handleExportClick}
            sx={{
              borderRadius: 2,
              bgcolor: C.navy,
              color: C.white,
              textTransform: "none",
              "&:hover": { bgcolor: alpha(C.navy, 0.88) },
            }}
            variant="contained"
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={exportToExcel}>
              <DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />
              Export to Excel
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <PictureAsPdfIcon sx={{ mr: 1, fontSize: 20 }} />
              Export to PDF
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2.5,
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          p: "12px 16px",
          flexWrap: "wrap",
        }}
      >
        <SearchBar
          placeholder="Search by asset, form type, or inspector..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "1rem", color: C.ghost }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, maxWidth: { xs: "100%", sm: 350 } }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <StatusSelect
            value={statusFilter}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
          >
            <MenuItem value="all" sx={{ fontSize: "0.8rem" }}>
              All Status
            </MenuItem>
            <MenuItem value="approved" sx={{ fontSize: "0.8rem" }}>
              Approved
            </MenuItem>
            <MenuItem value="pending_review" sx={{ fontSize: "0.8rem" }}>
              Under Review
            </MenuItem>
            <MenuItem value="submitted" sx={{ fontSize: "0.8rem" }}>
              Submitted
            </MenuItem>
            <MenuItem value="rejected" sx={{ fontSize: "0.8rem" }}>
              Needs Revision
            </MenuItem>
          </StatusSelect>
        </FormControl>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Total Submissions",
            value: stats.total,
            color: C.ink,
            icon: <FileDownloadOutlinedIcon />,
          },
          {
            label: "Approved",
            value: stats.approved,
            color: C.green,
            icon: <CheckCircleOutlineIcon />,
          },
          {
            label: "Under Review",
            value: stats.underReview,
            color: C.blue,
            icon: <InfoOutlinedIcon />,
          },
          {
            label: "Avg Rating",
            value: stats.avgScore ? `${stats.avgScore}%` : "0%",
            color: C.ink,
            icon: <StarIcon />,
          },
        ].map(({ label, value, color, icon }) => (
          <Grid item xs={6} sm={6} md={3} key={label}>
            <StatCard>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{ fontSize: "0.72rem", color: C.muted, fontWeight: 500 }}
                >
                  {label}
                </Typography>
                <Box sx={{ color: alpha(color, 0.6) }}>{icon}</Box>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color,
                  lineHeight: 1,
                }}
              >
                {value}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <div id="inspection-table-container">
        <StyledTable component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Asset",
                  "Form Type",
                  "Submitted Date",
                  "Status",
                  "Score",
                  "Inspector",
                  "Actions",
                ].map((h) => (
                  <HeadCell key={h}>{h}</HeadCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:last-child td": { borderBottom: "none" },
                    "&:hover": { background: alpha(C.navy, 0.02) },
                    transition: "background 0.15s ease",
                  }}
                >
                  <BodyCell>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: C.navy,
                      }}
                    >
                      {row.asset}
                    </Typography>
                  </BodyCell>
                  <BodyCell>
                    <Typography sx={{ fontSize: "0.8rem", color: C.muted }}>
                      {row.formType}
                    </Typography>
                  </BodyCell>
                  <BodyCell>
                    <Typography sx={{ fontSize: "0.8rem", color: C.muted }}>
                      {row.date}
                    </Typography>
                  </BodyCell>
                  <BodyCell>
                    <StatusChip status={row.status} small />
                  </BodyCell>
                  <BodyCell>
                    <ScoreText score={row.score} />
                  </BodyCell>
                  <BodyCell>
                    <Typography sx={{ fontSize: "0.8rem", color: C.muted }}>
                      {row.inspector}
                    </Typography>
                  </BodyCell>
                  <BodyCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setModalRow(row)}
                          sx={{
                            color: C.navy,
                            "&:hover": { bgcolor: alpha(C.navy, 0.08) },
                          }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Full Report">
                        <IconButton
                          size="small"
                          onClick={() => handleViewReport(row)}
                          sx={{
                            color: C.navy,
                            "&:hover": { bgcolor: alpha(C.navy, 0.08) },
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </BodyCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <BodyCell
                    colSpan={7}
                    sx={{ textAlign: "center", py: 5, color: C.ghost }}
                  >
                    No inspection records found
                  </BodyCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTable>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: C.navy,
                  color: C.white,
                  "&:hover": { bgcolor: alpha(C.navy, 0.88) },
                },
              },
            }}
          />
        </Box>
      )}

      {/* Detail Modal */}
      <InspectionDetailModal
        open={Boolean(modalRow)}
        onClose={() => setModalRow(null)}
        row={modalRow}
        onViewReport={handleViewReport}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
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
      slotProps={{
        backdrop: {
          timeout: 200,
          sx: { bgcolor: "rgba(15,30,45,0.45)", backdropFilter: "blur(3px)" },
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "92vw", sm: 560 },
            maxHeight: "92vh",
            overflowY: "auto",
            bgcolor: C.white,
            borderRadius: 3,
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            outline: "none",
            p: 3,
            fontFamily: '"DM Sans","Segoe UI",sans-serif',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: C.ink,
                  lineHeight: 1.2,
                }}
              >
                Inspection Details
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: C.muted, mt: 0.3 }}>
                {row.formType} - {row.asset}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: C.ghost,
                "&:hover": { color: C.ink, bgcolor: C.surface },
              }}
            >
              <CloseIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Box>

          {/* Status + Score */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${C.border}`,
                  boxShadow: "none",
                  p: "20px 22px 22px",
                }}
              >
                <Typography sx={{ fontSize: "0.72rem", color: C.muted }}>
                  Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip status={row.status} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${C.border}`,
                  boxShadow: "none",
                  p: "20px 22px 22px",
                }}
              >
                <Typography sx={{ fontSize: "0.72rem", color: C.muted }}>
                  Score
                </Typography>
                {row.score ? (
                  <Typography
                    sx={{
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: C.navy,
                      mt: 1,
                    }}
                  >
                    {row.score}%
                  </Typography>
                ) : (
                  <Typography
                    sx={{ fontSize: "0.8rem", color: C.ghost, mt: 1 }}
                  >
                    –
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Details */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: C.navy,
                mb: 1.5,
              }}
            >
              Submission Details
            </Typography>
            {[
              { label: "Asset:", value: row.asset },
              { label: "Form Type:", value: row.formType },
              { label: "Submitted:", value: row.date },
              { label: "Inspector:", value: row.inspector },
              { label: "Inspection ID:", value: row.id },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.6,
                  borderBottom: `1px solid ${C.border}`,
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ fontSize: "0.82rem", color: C.muted }}>
                  {label}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.82rem", fontWeight: 600, color: C.navy }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onClose();
                onViewReport(row);
              }}
              sx={{
                borderRadius: 2.5,
                bgcolor: C.navy,
                color: C.white,
                fontWeight: 600,
                fontSize: "0.82rem",
                textTransform: "none",
                py: 1.2,
                boxShadow: `0 4px 12px ${alpha(C.navy, 0.25)}`,
                "&:hover": { bgcolor: alpha(C.navy, 0.88) },
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

// pages/admin/TeamManagement.js
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../context/TeamContext";
import AddMemberModal from "./AddMemberModal";
import EditMemberModal from "./EditMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e8f2f5",
  success: "#2e7d32",
  successBg: "#e8f5e9",
  warning: "#b45309",
  warningBg: "#fef3c7",
  error: "#d32f2f",
  errorBg: "#ffebea",
  surface: "#f1f4f8",
  card: "#ffffff",
  border: "#e2e8f0",
  text: { primary: "#1e293b", secondary: "#64748b", disabled: "#94a3b8" },
};

// ─── Role options ──────────────────────────────────────────────────────────
const ROLE_OPTIONS = ["Inspector", "Senior Inspector", "Supervisor", "Manager", "Admin"];
const STATUS_OPTIONS = ["active", "inactive", "onLeave"];

// ─── Status helpers ──────────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return { bg: C.primary, color: "#fff", label: "Active" };
    case "inactive":
      return { bg: C.errorBg, color: C.error, label: "Inactive" };
    case "onleave":
    case "on leave":
      return { bg: "#dbeafe", color: "#1d4ed8", label: "On Leave" };
    default:
      return { bg: C.border, color: C.text.disabled, label: status || "—" };
  }
};

const getPerformanceColor = (score) => {
  if (score >= 80) return C.primary;
  if (score >= 60) return "#0891b2";
  if (score >= 40) return C.warning;
  return C.error;
};


// ─── Filter Bar Component ───────────────────────────────────────────────────
function FilterBar({ filters, onFilterChange, onClearFilters, activeFilterCount }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setLocalFilters(filters);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    handleClose();
  };

  const handleReset = () => {
    const resetFilters = { role: "", status: "", performanceMin: "", performanceMax: "" };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    handleClose();
  };

  return (
    <>
      <Button
        variant={activeFilterCount > 0 ? "contained" : "outlined"}
        startIcon={
          <Badge badgeContent={activeFilterCount} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem", height: 18, minWidth: 18 } }}>
            <FilterIcon sx={{ fontSize: "1.1rem" }} />
          </Badge>
        }
        onClick={handleOpen}
        sx={{
          textTransform: "none",
          fontSize: "0.85rem",
          borderRadius: 2,
          borderColor: C.border,
          color: activeFilterCount > 0 ? "#fff" : C.text.primary,
          bgcolor: activeFilterCount > 0 ? C.primary : "transparent",
          "&:hover": {
            bgcolor: activeFilterCount > 0 ? C.primaryDark : C.surface,
            borderColor: C.primary,
          },
          px: 1.5,
          py: 0.8,
        }}
      >
        Filters
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { width: 280, p: 2, borderRadius: 2, mt: 1, border: `1px solid ${C.border}` },
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 2 }}>
          Filter Team Members
        </Typography>

        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Role</InputLabel>
          <Select
            value={localFilters.role}
            label="Role"
            onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value })}
            sx={{ fontSize: "0.85rem" }}
          >
            <MenuItem value="" sx={{ fontSize: "0.85rem" }}>All Roles</MenuItem>
            {ROLE_OPTIONS.map(role => (
              <MenuItem key={role} value={role} sx={{ fontSize: "0.85rem" }}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Status</InputLabel>
          <Select
            value={localFilters.status}
            label="Status"
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
            sx={{ fontSize: "0.85rem" }}
          >
            <MenuItem value="" sx={{ fontSize: "0.85rem" }}>All Statuses</MenuItem>
            {STATUS_OPTIONS.map(status => (
              <MenuItem key={status} value={status} sx={{ fontSize: "0.85rem" }}>
                {status === "active" ? "Active" : status === "inactive" ? "Inactive" : "On Leave"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          fullWidth
          type="number"
          label="Min Performance (%)"
          value={localFilters.performanceMin}
          onChange={(e) => setLocalFilters({ ...localFilters, performanceMin: e.target.value })}
          sx={{ mb: 2, "& input": { fontSize: "0.85rem" }, "& label": { fontSize: "0.8rem" } }}
        />

        <TextField
          size="small"
          fullWidth
          type="number"
          label="Max Performance (%)"
          value={localFilters.performanceMax}
          onChange={(e) => setLocalFilters({ ...localFilters, performanceMax: e.target.value })}
          sx={{ mb: 2, "& input": { fontSize: "0.85rem" }, "& label": { fontSize: "0.8rem" } }}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth
            startIcon={<ClearIcon sx={{ fontSize: "1rem" }} />}
            sx={{ textTransform: "none", fontSize: "0.8rem", borderRadius: 1.5 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            fullWidth
            sx={{ textTransform: "none", fontSize: "0.8rem", borderRadius: 1.5, bgcolor: C.primary }}
          >
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamManagement() {
  const navigate = useNavigate();

  const {
    teamMembers,
    teamStats,
    loading,
    actionLoading,
    error,
    pagination,
    fetchTeamMembers,
    fetchTeamStats,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    updateFilters,
    changePage,
    clearError,
  } = useTeam();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "", performanceMin: "", performanceMax: "" });
  const searchRef = useRef(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const showToast = (msg, sev = "success") =>
    setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  // Fetch on mount
  useEffect(() => {
    fetchTeamMembers();
    fetchTeamStats();
  }, []);

  // Apply filters and search
  useEffect(() => {
    const combinedFilters = {
      search: searchTerm,
      role: filters.role,
      status: filters.status,
      performanceMin: filters.performanceMin,
      performanceMax: filters.performanceMax,
      page: currentPage + 1,
      limit: rowsPerPage,
    };
    updateFilters(combinedFilters);
  }, [searchTerm, filters, currentPage, rowsPerPage]);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => v !== "" && v !== null && v !== undefined).length;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({ role: "", status: "", performanceMin: "", performanceMax: "" });
    setCurrentPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleAddMember = async (formData) => {
    const result = await addTeamMember(formData);
    if (result.success) { showToast(result.message); setAddModalOpen(false); }
    else showToast(result.error, "error");
    return result;
  };

  const handleEditMember = async (memberId, updateData) => {
    const result = await updateTeamMember(memberId, updateData);
    if (result.success) { showToast(result.message); setEditModalOpen(false); setSelectedMember(null); }
    else showToast(result.error, "error");
    return result;
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    const result = await deleteTeamMember(selectedMember.id, true);
    if (result.success) { showToast(result.message); setDeleteModalOpen(false); setSelectedMember(null); }
    else showToast(result.error, "error");
    return result;
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl" disableGutters>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: C.text.primary, mb: 0.5, fontSize: "1.6rem" }}>
              Team Management
            </Typography>
            <Typography variant="body2" sx={{ color: C.text.secondary, fontSize: "0.88rem" }}>
              Manage your inspection team and track performance
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{
              bgcolor: C.primary,
              "&:hover": { bgcolor: C.primaryDark },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 2.5,
              py: 1,
            }}
          >
            Add Team Member
          </Button>
        </Box>

        {/* ── Search and Filter Bar ── */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: `1px solid ${C.border}`, mb: 2.5, p: 1.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search team members by name, email, or role..."
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: C.text.disabled, fontSize: "1.2rem", mr: 0.5 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <CloseIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { fontSize: "0.9rem", color: C.text.primary, py: 0.8 },
              }}
            />
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
            />
            {(searchTerm || activeFilterCount > 0) && (
              <Button
                variant="text"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchTerm("");
                  handleClearFilters();
                }}
                sx={{ textTransform: "none", fontSize: "0.8rem", color: C.text.secondary, whiteSpace: "nowrap" }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Paper>

        {/* ── Error ── */}
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2, borderRadius: 2, fontSize: "0.85rem" }}>
            {error}
          </Alert>
        )}

        {/* ── Body: Table + Chart ── */}
        {loading && !teamMembers.length ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: C.primary }} />
          </Box>
        ) : teamMembers.length === 0 ? (
          <Paper sx={{ textAlign: "center", py: 8, borderRadius: 3 }}>
            <Typography sx={{ color: C.text.secondary, fontSize: "0.95rem" }}>
              No team members found
            </Typography>
            <Button onClick={() => setAddModalOpen(true)} sx={{ mt: 2, fontSize: "0.85rem" }}>
              Add your first team member
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>

            {/* ── Table ── */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: C.surface }}>
                      {["Member", "Role", "Assigned", "Completed", "Performance", "Status", "Actions"].map((h) => (
                        <TableCell
                          key={h}
                          align={h === "Actions" ? "center" : "left"}
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.88rem",
                            color: C.text.secondary,
                            py: 1.8,
                            borderBottom: `1px solid ${C.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {teamMembers.map((member, idx) => {
                      const statusStyle = getStatusStyle(member.status);
                      const perfColor = getPerformanceColor(member.performanceScore);

                      return (
                        <TableRow
                          key={member.id}
                          hover
                          sx={{
                            "&:last-child td": { border: 0 },
                            "& td": { borderBottom: `1px solid ${C.border}` },
                            "&:hover": { bgcolor: "#f8fafc" },
                          }}
                        >
                          {/* Member */}
                          <TableCell sx={{ py: 1.8 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: C.primaryLight,
                                  color: C.primary,
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {member.initials}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: C.text.primary }}>
                                  {member.name}
                                </Typography>
                                <Typography sx={{ fontSize: "0.82rem", color: C.text.secondary }}>
                                  {member.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Role */}
                          <TableCell sx={{ fontSize: "0.92rem", color: C.text.primary, py: 1.8 }}>
                            {member.role}
                          </TableCell>

                          {/* Assigned */}
                          <TableCell sx={{ fontSize: "0.92rem", color: C.text.primary, py: 1.8 }}>
                            {member.assigned ?? "—"}
                          </TableCell>

                          {/* Completed */}
                          <TableCell sx={{ fontSize: "0.92rem", color: C.text.primary, py: 1.8 }}>
                            {member.completed ?? "—"}
                          </TableCell>

                          {/* Performance */}
                          <TableCell sx={{ py: 1.8 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <Box sx={{ width: 80, position: "relative" }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={member.performanceScore ?? 0}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: C.border,
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: C.primary,
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{ fontWeight: 600, fontSize: "0.9rem", color: perfColor }}
                              >
                                {member.performanceScore}%
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 1.8 }}>
                            <Chip
                              label={statusStyle.label}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 600,
                                fontSize: "0.78rem",
                                height: 26,
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center" sx={{ py: 1.8 }}>
                            <Stack direction="row" spacing={0.8} justifyContent="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/admin/team-details/${member.id}`)}
                                sx={{
                                  fontSize: "0.8rem",
                                  textTransform: "none",
                                  borderColor: C.border,
                                  color: C.text.primary,
                                  borderRadius: 1.5,
                                  py: 0.5,
                                  px: 1.8,
                                  minWidth: 0,
                                  "&:hover": { borderColor: C.primary, color: C.primary },
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => { setSelectedMember(member); setEditModalOpen(true); }}
                                sx={{
                                  fontSize: "0.8rem",
                                  textTransform: "none",
                                  borderColor: C.border,
                                  color: C.text.primary,
                                  borderRadius: 1.5,
                                  py: 0.5,
                                  px: 1.8,
                                  minWidth: 0,
                                  "&:hover": { borderColor: C.primary, color: C.primary },
                                }}
                              >
                                Edit
                              </Button>
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedMember(member); setDeleteModalOpen(true); }}
                                sx={{ color: C.text.disabled, "&:hover": { color: C.error } }}
                              >
                                <DeleteIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Enhanced Pagination */}
              <Box sx={{ borderTop: `1px solid ${C.border}`, py: 1, px: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.8rem", color: C.text.secondary }}>
                    Rows per page:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    size="small"
                    sx={{
                      fontSize: "0.8rem",
                      minWidth: 60,
                      "& .MuiSelect-select": { py: 0.5 },
                    }}
                  >
                    {[5, 10, 20, 50].map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: "0.8rem" }}>{option}</MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "0.8rem", color: C.text.secondary }}>
                    Showing {teamMembers.length > 0 ? currentPage * rowsPerPage + 1 : 0} - {Math.min((currentPage + 1) * rowsPerPage, pagination.total)} of {pagination.total}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      disabled={currentPage === 0}
                      onClick={() => handleChangePage(null, currentPage - 1)}
                      sx={{ color: C.text.secondary }}
                    >
                      ←
                    </IconButton>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage < 2) {
                        pageNum = i + 1;
                      } else if (currentPage > pagination.pages - 3) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = currentPage + i - 1;
                      }
                      if (pageNum >= 1 && pageNum <= pagination.pages) {
                        return (
                          <Button
                            key={pageNum}
                            size="small"
                            variant={currentPage + 1 === pageNum ? "contained" : "outlined"}
                            onClick={() => handleChangePage(null, pageNum - 1)}
                            sx={{
                              minWidth: 32,
                              height: 32,
                              fontSize: "0.8rem",
                              borderRadius: 1.5,
                              bgcolor: currentPage + 1 === pageNum ? C.primary : "transparent",
                              "&:hover": { bgcolor: currentPage + 1 === pageNum ? C.primaryDark : C.surface },
                            }}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    <IconButton
                      size="small"
                      disabled={currentPage + 1 >= pagination.pages}
                      onClick={() => handleChangePage(null, currentPage + 1)}
                      sx={{ color: C.text.secondary }}
                    >
                      →
                    </IconButton>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Container>

      {/* ── Modals ── */}
      <AddMemberModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddMember}
        loading={actionLoading}
      />
      <EditMemberModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedMember(null); }}
        member={selectedMember}
        onSubmit={handleEditMember}
        loading={actionLoading}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedMember(null); }}
        member={selectedMember}
        onConfirm={handleDeleteMember}
        loading={actionLoading}
      />

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontSize: "0.85rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
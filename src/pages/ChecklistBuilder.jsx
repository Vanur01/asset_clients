// pages/admin/ChecklistPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import PublicIcon from "@mui/icons-material/Public";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import { useAssignment } from "../context/AssignmentContext";
import { useAuth } from "../context/AuthContexts";
import axios from "axios";
import AssignChecklistDialog from "./AssignChecklistDialog";

// ─── Simple Theme ────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a4a5c" },
    background: { default: "#f9fafb", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: 13,
          borderRadius: 6,
          padding: "6px 14px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: 12,
          color: "#6b7280",
          padding: "12px 16px",
        },
        body: {
          fontSize: 13,
          padding: "12px 16px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: 11,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
});

// ─── Checklist Types for Modal ──────────────────────────────────────────────
const CHECKLIST_TYPES = [
  {
    icon: <ArticleOutlinedIcon sx={{ fontSize: 20 }} />,
    label: "Custom Checklist",
    desc: "Submit to Super Admin for approval",
    redirectTo: "/create-checklist/custom",
  },
  {
    icon: <PublicIcon sx={{ fontSize: 20 }} />,
    label: "Global Checklist",
    desc: "Submit to Super Admin for approval",
    redirectTo: "/create-checklist/global",
  },
  {
    icon: <TableChartIcon sx={{ fontSize: 20 }} />,
    label: "Import from Excel",
    desc: "Upload Excel to generate fields",
    redirectTo: "/import-checklist/excel",
  },
];

// ─── Create Checklist Modal ───────────────────────────────────────────────────
function CreateChecklistModal({ open, onClose }) {
  const navigate = useNavigate();

  const handleTypeClick = (type) => {
    onClose();
    if (type.redirectTo) {
      navigate(type.redirectTo);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ p: 2.5, pb: 1, bgcolor: "#1a4a5c", color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            Create New Checklist
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: 13, color: "#ffffffcc", mt: 0.5 }}>
          Choose the type of checklist you want to create
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {CHECKLIST_TYPES.map((item, i) => (
            <Box
              key={i}
              onClick={() => handleTypeClick(item)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 2,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": {
                  borderColor: "#1a4a5c",
                  bgcolor: "#e8f4f8",
                },
              }}
            >
              <Box sx={{ color: "#1a4a5c" }}>{item.icon}</Box>
              <Box flex={1}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.25 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  {item.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <Divider />
      <Box sx={{ p: 2.5, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ──────────────────────────────────────────────
function DeleteConfirmDialog({ open, onClose, onConfirm, checklistName }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ p: 2.5, pb: 1 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
          Delete Checklist
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: "#374151" }}>
          Are you sure you want to delete "{checklistName}"? This action cannot
          be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          size="small"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── View Checklist Details Dialog ──────────────────────────────────────────
function ViewChecklistDialog({ open, onClose, checklist }) {
  if (!checklist) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 2.5, pb: 1, bgcolor: "#1a4a5c", color: "#fff" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {checklist.name}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: 13, color: "#ffffffcc", mt: 0.5 }}>
          {checklist.description || "No description provided"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <Chip label={`Type: ${checklist.type || "N/A"}`} size="small" variant="outlined" />
          <Chip label={`Category: ${checklist.category || "N/A"}`} size="small" variant="outlined" />
          <Chip
            label={`Status: ${checklist.status || "N/A"}`}
            size="small"
            sx={{
              bgcolor: checklist.status === "active" ? "#dcfce7" : checklist.status === "draft" ? "#fed7aa" : "#f3f4f6",
              color: checklist.status === "active" ? "#166534" : checklist.status === "draft" ? "#9a3412" : "#374151",
            }}
          />
          <Chip label={`Version: ${checklist.version || "v1.0"}`} size="small" variant="outlined" />
          <Chip label={`Total Fields: ${checklist.totalFields || 0}`} size="small" variant="outlined" />
          {checklist.isApproved && (
            <Chip label="Approved" size="small" sx={{ bgcolor: "#dbeafe", color: "#1d4ed8" }} />
          )}
        </Box>

        <Box mb={3}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", mb: 1 }}>Created By</Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#1a4a5c" }}>
              {checklist.createdBy?.name?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                {checklist.createdBy?.name || "Unknown"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                {checklist.createdBy?.email || ""} • Role: {checklist.createdByRole || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Sections & Fields</Typography>

        {checklist.sections?.map((section, idx) => (
          <Box key={idx} mb={3}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f9fafb" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>
                {section.sectionTitle || `Section ${idx + 1}`}
              </Typography>
              {section.sectionDescription && (
                <Typography sx={{ fontSize: 11, color: "#6b7280", mb: 1.5 }}>
                  {section.sectionDescription}
                </Typography>
              )}
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {section.fields?.map((field, fIdx) => (
                  <Typography component="li" key={fIdx} sx={{ fontSize: 12, py: 0.5 }}>
                    {field.label}
                    {field.isRequired && <span style={{ color: "red" }}> *</span>}
                    <Chip
                      label={field.fieldType?.replace(/_/g, " ") || "text"}
                      size="small"
                      sx={{ ml: 1, height: 20, fontSize: 10 }}
                    />
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Box>
        ))}

        <Box mt={2} pt={1}>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Created: {new Date(checklist.createdAt).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Last Updated: {new Date(checklist.updatedAt).toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Status Chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const colors = {
    active: { bg: "#dcfce7", color: "#166534" },
    draft: { bg: "#fed7aa", color: "#9a3412" },
    archived: { bg: "#f3f4f6", color: "#374151" },
  };
  const style = colors[status?.toLowerCase()] || colors.draft;

  return (
    <Chip
      label={status || "Draft"}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        height: 24,
        fontSize: 11,
        fontWeight: 500,
      }}
    />
  );
}

// ─── Action Buttons ──────────────────────────────────────────────────────────
function ActionButtons({ checklist, onView, onDelete, onAssign }) {
  return (
    <Box display="flex" gap={0.5}>
      <Tooltip title="View Details">
        <Button size="small" startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />} onClick={() => onView(checklist)}>
          View
        </Button>
      </Tooltip>
      <Tooltip title="Assign Checklist">
        <Button size="small" startIcon={<AssignmentIcon sx={{ fontSize: 15 }} />} onClick={() => onAssign(checklist)}>
          Assign
        </Button>
      </Tooltip>
      <Tooltip title="Delete Checklist">
        <Button size="small" startIcon={<DeleteIcon sx={{ fontSize: 15 }} />} onClick={() => onDelete(checklist)} sx={{ color: '#dc2626' }}>
          Delete
        </Button>
      </Tooltip>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChecklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getAllChecklists,
    deleteChecklist,
    loading: checklistLoading,
    error,
    success,
    clearMessages,
  } = useChecklistBuilder();
  const {
    assignToAdmin,
    assignToTeam,
    loading: assignmentLoading,
    clearMessages: clearAssignmentMessages,
  } = useAssignment();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [checklistToAssign, setChecklistToAssign] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const isSuperAdmin = user?.role === "super_admin";
  const token = localStorage.getItem("accessToken");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoadingAdmins(true);
    try {
      const response = await axios.get("https://assset-management-backend-4.onrender.com/api/v1/user/clients", getAuthHeaders());
      if (response.data?.success && response.data?.clients) {
        const adminList = response.data.clients.map((client) => ({
          _id: client._id,
          name: client.customerName || client.email,
          email: client.email,
          clientName: client.customerName,
          status: client.status,
          membershipPlan: client.membershipPlan,
        }));
        setAdmins(adminList);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoadingAdmins(false);
    }
  }, [isSuperAdmin, token]);

  const fetchTeamMembers = useCallback(async () => {
    if (isSuperAdmin) return;
    setLoadingTeam(true);
    try {
      const response = await axios.get("https://assset-management-backend-4.onrender.com/api/v1/user/team", getAuthHeaders());
      if (response.data?.success && response.data?.members) {
        const teamList = response.data.members.map((member) => ({
          _id: member.id,
          name: member.firstName ? `${member.firstName} ${member.lastName || ""}` : member.email,
          email: member.email,
          role: member.role,
          department: member.department,
          status: member.status,
        }));
        setTeamMembers(teamList);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoadingTeam(false);
    }
  }, [isSuperAdmin, token]);

  const fetchAssets = useCallback(async () => {
    if (isSuperAdmin) return;
    setLoadingAssets(true);
    try {
      const response = await axios.get("https://assset-management-backend-4.onrender.com/api/v1/asset", getAuthHeaders());
      if (response.data?.success && response.data?.assets) {
        setAssets(response.data.assets);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoadingAssets(false);
    }
  }, [isSuperAdmin, token]);

  useEffect(() => {
    if (assignDialogOpen && checklistToAssign) {
      if (isSuperAdmin) {
        fetchAdmins();
      } else {
        fetchTeamMembers();
        fetchAssets();
      }
    }
  }, [assignDialogOpen, checklistToAssign, isSuperAdmin, fetchAdmins, fetchTeamMembers, fetchAssets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchChecklists = useCallback(async () => {
    const filters = { page: pagination.page, limit: pagination.limit };
    if (debouncedSearch) filters.search = debouncedSearch;
    const result = await getAllChecklists(filters);
    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        setChecklists(result.data);
      } else if (result.data.checklists) {
        setChecklists(result.data.checklists);
        if (result.data.pagination) {
          setPagination({
            page: result.data.pagination.page || pagination.page,
            limit: result.data.pagination.limit || pagination.limit,
            total: result.data.pagination.total || 0,
            totalPages: result.data.pagination.totalPages || 1,
          });
        }
      }
    }
  }, [getAllChecklists, debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  useEffect(() => {
    if (success) {
      setSnackbarMessage(success);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      clearMessages();
      fetchChecklists();
    }
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      clearMessages();
    }
  }, [success, error, clearMessages, fetchChecklists]);

  const handleViewChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setViewDialogOpen(true);
  };

  const handleAssignClick = (checklist) => {
    setChecklistToAssign(checklist);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async (assignmentData) => {
    let result;
    if (isSuperAdmin) {
      result = await assignToAdmin(assignmentData);
    } else {
      result = await assignToTeam(assignmentData);
    }
    if (result.success) {
      setSnackbarMessage("Checklist assigned successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setAssignDialogOpen(false);
      setChecklistToAssign(null);
    } else {
      setSnackbarMessage(result.error || "Failed to assign checklist");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = (checklist) => {
    setChecklistToDelete(checklist);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (checklistToDelete) {
      const result = await deleteChecklist(checklistToDelete._id);
      if (result.success) {
        setSnackbarMessage("Checklist deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchChecklists();
      } else {
        setSnackbarMessage(result.error || "Failed to delete checklist");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      setDeleteDialogOpen(false);
      setChecklistToDelete(null);
    }
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  const isLoading = checklistLoading || assignmentLoading;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600&display=swap');`}</style>
      <Box sx={{ p: 3, bgcolor: "#f9fafb", minHeight: "100vh" }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#1a4a5c", mb: 0.25 }}>Checklists</Typography>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Manage inspection checklists and assignments</Typography>
          </Box>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/admin/checklists/clone")}
              sx={{ borderColor: "#1a4a5c", color: "#1a4a5c" }}
            >
              Clone Checklist
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setCreateOpen(true)}
              sx={{ bgcolor: "#1a4a5c", "&:hover": { bgcolor: "#2d7a9a" } }}
            >
              Create Checklist
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search checklists by name, category, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, bgcolor: "#fff" }}
        />

        {/* Table */}
        <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb", boxShadow: "none" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Checklist Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Total Fields</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} sx={{ color: "#1a4a5c" }} />
                  </TableCell>
                </TableRow>
              ) : checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography sx={{ color: "#6b7280" }}>
                      {debouncedSearch ? "No checklists match your search" : "No checklists found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                checklists.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {row.name}
                      {row.isApproved && (
                        <Chip label="Approved" size="small" sx={{ ml: 1, height: 20, fontSize: 10, bgcolor: "#dbeafe", color: "#1d4ed8" }} />
                      )}
                      {row.importedFromExcel && (
                        <Chip label="Imported" size="small" sx={{ ml: 1, height: 20, fontSize: 10, bgcolor: "#e0e7ff", color: "#3730a3" }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={row.type || "custom"} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
                    </TableCell>
                    <TableCell>{row.category || "—"}</TableCell>
                    <TableCell>
                      <Chip label={row.totalFields || 0} size="small" sx={{ bgcolor: "#eff6ff", color: "#2563eb" }} />
                    </TableCell>
                    <TableCell><StatusChip status={row.status} /></TableCell>
                    <TableCell>
                      <ActionButtons
                        checklist={row}
                        onView={handleViewChecklist}
                        onDelete={handleDeleteClick}
                        onAssign={handleAssignClick}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="small"
              sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: "#1a4a5c", color: "#fff" } }}
            />
          </Box>
        )}
      </Box>

      {/* Modals */}
      <CreateChecklistModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ViewChecklistDialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} checklist={selectedChecklist} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        checklistName={checklistToDelete?.name || ""}
      />
      <AssignChecklistDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setChecklistToAssign(null);
        }}
        checklist={checklistToAssign}
        userRole={user?.role}
        admins={admins}
        teamMembers={teamMembers}
        assets={assets}
        onAssign={handleAssignSubmit}
        loading={assignmentLoading || loadingAdmins || loadingTeam || loadingAssets}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
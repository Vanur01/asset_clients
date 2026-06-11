// pages/admin/Checklist.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Card,
  CardContent,
  alpha,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  Add as AddIcon,
  RemoveRedEye as EyeIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  UploadFile as UploadIcon,
  CheckCircleOutline,
  RadioButtonUnchecked,
  FileCopy as FileCopyIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useChecklist } from "../context/ChecklistContext";
import CreateChecklistModal from "./CreateChecklistModal";
import RequestModal from "./RequestModal";

const TEAL = "#0f4c5c";
const TEAL_LIGHT = "#e6f2f5";
const TEAL_MID = "#1a6a7e";

// ─── Status Chip ─────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    active: { bg: TEAL, color: "#fff", label: "Active" },
    inactive: { bg: "#e2e8f0", color: "#64748b", label: "Inactive" },
    pending: { bg: "#dbeafe", color: "#1d4ed8", label: "Pending" },
    approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    draft: { bg: "#fef9c3", color: "#854d0e", label: "Draft" },
    under_review: { bg: "#ede9fe", color: "#6d28d9", label: "Under Review" },
  };
  const key = (status || "").toLowerCase();
  const s = map[key] || map.inactive;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 26,
        borderRadius: "13px",
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
};

// ─── Type Chip ───────────────────────────────────────────────────
const TypeChip = ({ type }) => {
  const map = {
    global: { bg: TEAL, color: "#fff", variant: "filled" },
    clone: {
      bg: "transparent",
      color: TEAL,
      variant: "outlined",
      border: TEAL,
    },
    custom: { bg: "#f1f5f9", color: "#475569", variant: "filled" },
  };
  const key = (type || "").toLowerCase();
  const s = map[key] || map.custom;
  return (
    <Chip
      label={type || "Custom"}
      size="small"
      sx={{
        bgcolor: s.variant === "filled" ? s.bg : "transparent",
        color: s.color,
        border: s.variant === "outlined" ? `1.5px solid ${s.border}` : "none",
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 26,
        borderRadius: "13px",
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
};

// ─── Action Button ───────────────────────────────────────────────
const ActionBtn = ({
  label,
  startIcon,
  onClick,
  variant = "outlined",
  disabled = false,
}) => (
  <Button
    variant={variant}
    size="small"
    startIcon={startIcon}
    onClick={onClick}
    disabled={disabled}
    sx={{
      textTransform: "none",
      fontWeight: 500,
      fontSize: "0.75rem",
      borderColor: "#e2e8f0",
      color: "#334155",
      borderRadius: "7px",
      px: 1.5,
      py: 0.5,
      whiteSpace: "nowrap",
      minWidth: "auto",
      "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
      ...(variant === "contained" && {
        bgcolor: TEAL,
        color: "#fff",
        border: "none",
        "&:hover": { bgcolor: TEAL_MID },
      }),
    }}
  >
    {label}
  </Button>
);

// ─── Base Modal ──────────────────────────────────────────────────
const BaseModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "sm",
  actions,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={maxWidth}
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: "14px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        m: { xs: 1, sm: 2 },
      },
    }}
  >
    <DialogTitle sx={{ pb: 0.5, pt: 3, px: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              fontSize: { xs: "1rem", sm: "1.125rem" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ color: "#64748b", mt: 0.25, fontSize: "0.8125rem" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "#94a3b8", ml: 1, mt: -0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ px: 3, py: 2.5 }}>{children}</DialogContent>
    {actions && (
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
        {actions}
      </DialogActions>
    )}
  </Dialog>
);

// ─── Assign Modal ────────────────────────────────────────────────
const AssignModal = ({ open, onClose }) => {
  const [f, setF] = useState({
    checklist: "",
    asset: "",
    primary: "",
    secondary: "",
    dueDate: "",
  });
  const s = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Assign Checklist to Team Member"
      subtitle="Select checklist, asset, team member, and due date"
      actions={
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#e2e8f0",
              color: "#334155",
              borderRadius: "8px",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: TEAL,
              "&:hover": { bgcolor: TEAL_MID },
              borderRadius: "8px",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Assign Checklist
          </Button>
        </>
      }
    >
      <Grid container spacing={2}>
        {[
          {
            label: "Select Checklist",
            key: "checklist",
            opts: ["Daily Checklist", "Weekly Report"],
          },
          {
            label: "Select Asset",
            key: "asset",
            opts: ["Generator Unit A-12", "Forklift B-7"],
          },
          {
            label: "Primary Team Member",
            key: "primary",
            opts: ["John Smith", "Jane Doe"],
          },
          {
            label: "Secondary Team Member",
            key: "secondary",
            opts: ["Michael Chen", "Sarah Lee"],
          },
        ].map(({ label, key, opts }) => (
          <Grid item xs={12} sm={6} key={key}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: "0.8125rem" }}>{label}</InputLabel>
              <Select
                value={f[key]}
                onChange={s(key)}
                label={label}
                sx={{ borderRadius: "8px", fontSize: "0.875rem" }}
              >
                {opts.map((o) => (
                  <MenuItem key={o} value={o} sx={{ fontSize: "0.875rem" }}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Due Date"
            type="date"
            value={f.dueDate}
            onChange={s("dueDate")}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: "0.875rem",
              },
            }}
          />
        </Grid>
      </Grid>
    </BaseModal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────
const DeleteModal = ({ open, onClose, checklist, onSuccess }) => {
  const { deleteChecklist, loading } = useChecklist();
  const handleDelete = async () => {
    try {
      await deleteChecklist(checklist?._id);
      onSuccess?.("Checklist deleted successfully.");
      onClose();
    } catch {}
  };
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Delete Checklist"
      subtitle={`Are you sure you want to delete "${checklist?.name}"? This cannot be undone.`}
      actions={
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#e2e8f0",
              color: "#334155",
              borderRadius: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            {loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </>
      }
    >
      <Box />
    </BaseModal>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────
const FilterBar = ({ filters, onChange }) => {
  const types = ["", "custom", "global", "clone"];
  const statuses = ["", "active", "inactive", "draft"];
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel sx={{ fontSize: "0.8rem" }}>Type</InputLabel>
        <Select
          value={filters.type}
          onChange={(e) => onChange("type", e.target.value)}
          label="Type"
          sx={{ borderRadius: "8px", fontSize: "0.8rem" }}
        >
          {types.map((t) => (
            <MenuItem key={t} value={t} sx={{ fontSize: "0.8rem" }}>
              {t ? t.charAt(0).toUpperCase() + t.slice(1) : "All Types"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel sx={{ fontSize: "0.8rem" }}>Status</InputLabel>
        <Select
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
          label="Status"
          sx={{ borderRadius: "8px", fontSize: "0.8rem" }}
        >
          {statuses.map((s) => (
            <MenuItem key={s} value={s} sx={{ fontSize: "0.8rem" }}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Statuses"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

// ─── Empty State ─────────────────────────────────────────────────
const EmptyState = ({ message = "No checklists found" }) => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <AssignmentIcon sx={{ fontSize: "3rem", color: "#cbd5e1", mb: 1.5 }} />
    <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
      {message}
    </Typography>
  </Box>
);

// ─── Loading Skeleton ─────────────────────────────────────────────
const TableLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
    <CircularProgress size={32} sx={{ color: TEAL }} />
  </Box>
);

// ─── Mobile Card ─────────────────────────────────────────────────
const MobileCard = ({ children }) => (
  <Card
    variant="outlined"
    sx={{
      borderColor: "#e2e8f0",
      borderRadius: "10px",
      mb: 1.5,
      "&:last-child": { mb: 0 },
    }}
  >
    <CardContent sx={{ p: "14px 16px !important" }}>{children}</CardContent>
  </Card>
);

// ─── Table Styles ─────────────────────────────────────────────────
const cellSx = {
  fontSize: "0.875rem",
  color: "#1e293b",
  py: 1.75,
  px: 2,
  borderBottom: "1px solid #f1f5f9",
};
const headSx = {
  fontWeight: 700,
  color: "#475569",
  fontSize: "0.75rem",
  py: 1.5,
  px: 2,
  bgcolor: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

// ─── Main Component ───────────────────────────────────────────────
export default function Checklist() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const {
    checklists,
    requests,
    pagination,
    loading,
    error,
    fetchChecklists,
    fetchRequests,
  } = useChecklist();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const [showFilters, setShowFilters] = useState(false);

  const tabs = ["Received Checklist", "My Checklist", "Checklist Requests"];

  // Fetch on mount and when filters/page/search change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tab !== 2) {
        fetchChecklists({
          page,
          limit: 20,
          search,
          type: filters.type,
          status: filters.status,
        });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [page, search, filters, tab, fetchChecklists]);

  useEffect(() => {
    if (tab === 2) {
      fetchRequests({ page, limit: 20, status: "" });
    }
  }, [tab, page, fetchRequests]);

  const handleFilterChange = useCallback((key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(1);
  }, []);

  const handleTabChange = (_, v) => {
    setTab(v);
    setSearch("");
    setPage(1);
  };

  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  // Separate received vs my checklists
  const receivedChecklists = checklists.filter((c) => c.type === "global");
  const myChecklists = checklists.filter((c) => c.type !== "global");

  const renderMobileView = (data, type) => {
    if (!data?.length) return <EmptyState />;
    return data.map((row, i) => (
      <MobileCard key={row._id || i}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.25,
          }}
        >
          <Typography
            sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}
          >
            {row.name || row.checklistName}
          </Typography>
          <StatusChip status={row.status} />
        </Box>
        {type === "my" && (
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <TypeChip type={row.type} />
            <Typography
              variant="caption"
              sx={{ color: "#64748b", alignSelf: "center" }}
            >
              {new Date(row.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        )}
        {type === "received" && (
          <Typography
            variant="caption"
            sx={{ color: "#64748b", display: "block", mb: 1.5 }}
          >
            Assigned by <strong>{row.createdBy?.name || "Super Admin"}</strong>{" "}
            · {new Date(row.createdAt).toLocaleDateString()}
          </Typography>
        )}
        {type === "requests" && (
          <>
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", display: "block", mb: 0.5 }}
            >
              {new Date(row.requestDate).toLocaleDateString()}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem", mb: 1.5 }}
            >
              {row.detailedDescription}
            </Typography>
          </>
        )}
        <Stack direction="row" spacing={1}>
          <ActionBtn
            label="View"
            startIcon={<EyeIcon sx={{ fontSize: "0.875rem" }} />}
            onClick={() => navigate(`/admin/checklists/${row._id}`)}
          />
          {type === "my" && (
            <ActionBtn
              label="Edit"
              startIcon={<EditIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => navigate(`/admin/checklists/${row._id}/edit`)}
            />
          )}
          {type === "received" && (
            <ActionBtn
              label="Assign"
              startIcon={<AssignmentIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => setModal("assign")}
            />
          )}
          {type === "my" && (
            <ActionBtn
              label="Delete"
              startIcon={<DeleteIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => {
                setSelectedChecklist(row);
                setModal("delete");
              }}
            />
          )}
        </Stack>
      </MobileCard>
    ));
  };

  const renderDesktopTable = (data, type) => {
    if (loading) return <TableLoader />;
    if (!data?.length) return <EmptyState />;

    const headers = {
      my: [
        "Checklist Name",
        "Type",
        "Created Date",
        "Fields",
        "Status",
        "Actions",
      ],
      received: [
        "Checklist Name",
        "Created By",
        "Received Date",
        "Fields",
        "Status",
        "Actions",
      ],
      requests: [
        "Checklist Name",
        "Request Date",
        "Category",
        "Urgency",
        "Status",
        "Actions",
      ],
    };

    return (
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: "10px",
          borderColor: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {headers[type].map((h) => (
                <TableCell key={h} sx={headSx}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow
                key={row._id || i}
                sx={{ "&:hover": { bgcolor: "#fafcff" } }}
              >
                {type === "my" && (
                  <>
                    <TableCell sx={{ ...cellSx, fontWeight: 500 }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <TypeChip type={row.type} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={cellSx}>{row.totalFields || 0}</TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Stack direction="row" spacing={1}>
                        <ActionBtn
                          label="View"
                          startIcon={<EyeIcon sx={{ fontSize: "0.875rem" }} />}
                          onClick={() =>
                            navigate(`/admin/checklists/${row._id}`)
                          }
                        />
                        <ActionBtn
                          label="Edit"
                          startIcon={<EditIcon sx={{ fontSize: "0.875rem" }} />}
                          onClick={() =>
                            navigate(`/admin/checklists/${row._id}/edit`)
                          }
                        />
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedChecklist(row);
                              setModal("delete");
                            }}
                            sx={{ color: "#ef4444", p: 0.5 }}
                          >
                            <DeleteIcon sx={{ fontSize: "0.9rem" }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </>
                )}
                {type === "received" && (
                  <>
                    <TableCell sx={{ ...cellSx, fontWeight: 500 }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {row.createdBy?.name || "Super Admin"}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: "#94a3b8" }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={cellSx}>{row.totalFields || 0}</TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Stack direction="row" spacing={1}>
                        <ActionBtn
                          label="View"
                          startIcon={<EyeIcon sx={{ fontSize: "0.875rem" }} />}
                          onClick={() =>
                            navigate(`/admin/checklists/${row._id}`)
                          }
                        />
                        <ActionBtn
                          label="Assign"
                          startIcon={
                            <AssignmentIcon sx={{ fontSize: "0.875rem" }} />
                          }
                          onClick={() => setModal("assign")}
                        />
                      </Stack>
                    </TableCell>
                  </>
                )}
                {type === "requests" && (
                  <>
                    <TableCell sx={{ ...cellSx, fontWeight: 500 }}>
                      {row.checklistName}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: "#64748b" }}>
                      {new Date(row.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={cellSx}>{row.category}</TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={row.urgencyLevel}
                        size="small"
                        sx={{
                          bgcolor:
                            row.urgencyLevel === "high" ||
                            row.urgencyLevel === "critical"
                              ? "#fee2e2"
                              : row.urgencyLevel === "medium"
                                ? "#fef9c3"
                                : "#f1f5f9",
                          color:
                            row.urgencyLevel === "high" ||
                            row.urgencyLevel === "critical"
                              ? "#dc2626"
                              : row.urgencyLevel === "medium"
                                ? "#854d0e"
                                : "#64748b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <ActionBtn
                        label="View Details"
                        onClick={() =>
                          navigate(`/admin/checklists/requests/${row._id}`)
                        }
                      />
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const currentData =
    tab === 0 ? receivedChecklists : tab === 1 ? myChecklists : requests;

  return (
    <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh", pb: 6 }}>
      {/* Modals */}
      <CreateChecklistModal
        open={modal === "create"}
        onClose={() => setModal(null)}
      />
      <RequestModal
        open={modal === "request"}
        onClose={() => setModal(null)}
        onSuccess={(msg) => showSnack(msg, "success")}
      />
      <AssignModal open={modal === "assign"} onClose={() => setModal(null)} />
      <DeleteModal
        open={modal === "delete"}
        onClose={() => setModal(null)}
        checklist={selectedChecklist}
        onSuccess={(msg) => showSnack(msg, "success")}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ borderRadius: "10px" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #e2e8f0",
          borderRadius: 0,
          px: { xs: 2, sm: 3.5 },
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: { xs: "1.125rem", sm: "1.3rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Checklist
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontSize: "0.8125rem" }}
            >
              Manage inspection checklists and assignments
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => fetchChecklists({ page, search, ...filters })}
                sx={{ bgcolor: "#f1f5f9", borderRadius: "8px" }}
              >
                <RefreshIcon sx={{ fontSize: "1rem", color: "#64748b" }} />
              </IconButton>
            </Tooltip>
            <ActionBtn
              label={isMobile ? "Clone" : "Clone Checklist"}
              startIcon={<FileCopyIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => navigate("/admin/clone-checklist")}
            />
            <ActionBtn
              label={isMobile ? "Request" : "Request Checklist"}
              startIcon={<SendIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => setModal("request")}
            />
            <ActionBtn
              label={isMobile ? "Create" : "Create Checklist"}
              startIcon={<AddIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => setModal("create")}
              variant="contained"
            />
            <ActionBtn
              label={isMobile ? "Assign" : "Assign Checklist"}
              startIcon={<AssignmentIcon sx={{ fontSize: "0.875rem" }} />}
              onClick={() => setModal("assign")}
            />
          </Stack>
        </Box>
      </Paper>

      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 3 }}>
        <Stack spacing={2.5}>
          {/* Tabs */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#f1f5f9",
              borderRadius: "30px",
              p: "4px",
              width: "fit-content",
              maxWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Tabs
              value={tab}
              onChange={handleTabChange}
              sx={{
                minHeight: "auto",
                "& .MuiTabs-indicator": { display: "none" },
              }}
            >
              {tabs.map((t, i) => (
                <Tab
                  key={t}
                  label={
                    isMobile && i === 0
                      ? "Received"
                      : isMobile && i === 2
                        ? "Requests"
                        : t
                  }
                  sx={{
                    minHeight: 36,
                    py: 0.75,
                    px: { xs: 1.5, sm: 2.5 },
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    fontWeight: tab === i ? 700 : 500,
                    color: tab === i ? "#0f172a" : "#64748b",
                    bgcolor: tab === i ? "#fff" : "transparent",
                    borderRadius: "26px",
                    textTransform: "none",
                  }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Search + Filter Row */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                borderColor: "#e2e8f0",
                borderRadius: "10px",
                px: 2,
                py: 1.25,
                flex: 1,
                minWidth: 200,
                maxWidth: 480,
              }}
            >
              <TextField
                fullWidth
                placeholder={
                  tab === 0
                    ? "Search received checklists..."
                    : tab === 1
                      ? "Search my checklists..."
                      : "Search requests..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                variant="standard"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: "1rem", color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                  sx: { fontSize: "0.875rem", color: "#334155" },
                }}
              />
            </Paper>
            <Tooltip title="Toggle Filters">
              <IconButton
                onClick={() => setShowFilters((v) => !v)}
                sx={{
                  bgcolor: showFilters ? alpha(TEAL, 0.08) : "#f8fafc",
                  border: `1px solid ${showFilters ? TEAL : "#e2e8f0"}`,
                  borderRadius: "10px",
                  p: 1.25,
                }}
              >
                <FilterIcon
                  sx={{
                    fontSize: "1.1rem",
                    color: showFilters ? TEAL : "#64748b",
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>

          {showFilters && tab !== 2 && (
            <Paper
              variant="outlined"
              sx={{ borderColor: "#e2e8f0", borderRadius: "10px", p: 2 }}
            >
              <FilterBar filters={filters} onChange={handleFilterChange} />
            </Paper>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          {/* Content */}
          {isMobile
            ? renderMobileView(
                currentData,
                tab === 0 ? "received" : tab === 1 ? "my" : "requests",
              )
            : renderDesktopTable(
                currentData,
                tab === 0 ? "received" : tab === 1 ? "my" : "requests",
              )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": { borderRadius: "8px" },
                  "& .Mui-selected": {
                    bgcolor: `${TEAL} !important`,
                    color: "#fff",
                  },
                }}
              />
            </Box>
          )}

          {/* Footer Summary */}
          {!loading && (
            <Typography
              sx={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "right" }}
            >
              Showing {currentData.length} of{" "}
              {pagination.total || currentData.length} items
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// src/pages/RecycleBin.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Alert,
  Pagination,
  Stack,
  Dialog,
  Checkbox,
  Skeleton,
  Badge,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  styled,
  alpha,
} from "@mui/material/styles";

// ── Icons (all verified to exist in @mui/icons-material) ─────────────────────
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

import { useRecycleBin } from "../context/Recyclebincontext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#1a3c5e", light: "#e8f0f9", dark: "#0f2439" },
    error: { main: "#c0392b", light: "#fdf0ef" },
    warning: { main: "#d35400", light: "#fef5ec" },
    success: { main: "#0a7c5c", light: "#eaf7f3" },
    text: {
      primary: "#0f1e2e",
      secondary: "#5a7184",
      disabled: "#a0b4c4",
    },
    background: { default: "#f0f4f8", paper: "#ffffff" },
    divider: "#dde6ee",
  },
  typography: {
    fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 1px 4px rgba(15,30,46,0.07), 0 0 0 1px rgba(15,30,46,0.04)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#eaf0f6", padding: "10px 14px" },
        head: {
          fontWeight: 700,
          fontSize: 11,
          color: "#8fa8bf",
          backgroundColor: "#f7f9fc",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        },
        body: { fontSize: 13 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
  },
});

// ─── Styled ───────────────────────────────────────────────────────────────────
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  minHeight: 48,
  color: theme.palette.text.secondary,
  gap: 6,
  "&.Mui-selected": { color: theme.palette.primary.main },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const STATUS_CFG = {
  pending: { label: "Pending", color: "#b45309", bg: "#fffbeb" },
  in_progress: { label: "In Progress", color: "#1d4ed8", bg: "#eff6ff" },
  submitted: { label: "Submitted", color: "#6d28d9", bg: "#f5f3ff" },
  completed: { label: "Completed", color: "#0a7c5c", bg: "#eaf7f3" },
  approved: { label: "Approved", color: "#0a7c5c", bg: "#eaf7f3" },
  rejected: { label: "Rejected", color: "#c0392b", bg: "#fdf0ef" },
  overdue: { label: "Overdue", color: "#c0392b", bg: "#fdf0ef" },
};

const PRIORITY_CFG = {
  low: { color: "#0a7c5c", bg: "#eaf7f3" },
  medium: { color: "#b45309", bg: "#fffbeb" },
  high: { color: "#c0392b", bg: "#fdf0ef" },
  critical: { color: "#7f1d1d", bg: "#fee2e2" },
};

// ─── useSnack (memory-leak safe) ──────────────────────────────────────────────
const useSnack = () => {
  const [snack, setSnack] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((message, severity = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSnack({ message, severity });
    timerRef.current = setTimeout(() => setSnack(null), 3500);
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { snack, show };
};

// ─── SummaryBar ───────────────────────────────────────────────────────────────
const SummaryBar = ({ items, label, color = "#1a3c5e" }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1.25,
      borderRadius: 2,
      bgcolor: alpha(color, 0.06),
      border: `1px solid ${alpha(color, 0.14)}`,
      mb: 2,
    }}
  >
    <LayersOutlinedIcon sx={{ fontSize: 17, color, opacity: 0.75 }} />
    <Typography fontSize={13} color={color} fontWeight={600}>
      {items} {label} in recycle bin
    </Typography>
  </Box>
);

// ─── BulkBar ──────────────────────────────────────────────────────────────────
const BulkBar = ({ count, onRestore, onDelete, onClear, loading }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      mb: 2,
      px: 2,
      py: 1.25,
      borderRadius: 2,
      bgcolor: alpha("#1a3c5e", 0.05),
      border: `1px dashed ${alpha("#1a3c5e", 0.22)}`,
    }}
  >
    <Typography fontSize={13} fontWeight={700} color="primary.main">
      {count} selected
    </Typography>
    <Button
      size="small"
      variant="outlined"
      color="primary"
      startIcon={<RestoreFromTrashOutlinedIcon sx={{ fontSize: 15 }} />}
      onClick={onRestore}
      disabled={loading}
      sx={{ borderRadius: 2, fontSize: 12 }}
    >
      Restore
    </Button>
    <Button
      size="small"
      variant="outlined"
      color="error"
      startIcon={<DeleteSweepOutlinedIcon sx={{ fontSize: 15 }} />}
      onClick={onDelete}
      disabled={loading}
      sx={{ borderRadius: 2, fontSize: 12 }}
    >
      Delete Permanently
    </Button>
    <Button
      size="small"
      variant="text"
      onClick={onClear}
      sx={{ ml: "auto", fontSize: 12, color: "text.secondary" }}
    >
      Deselect all
    </Button>
  </Box>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ label }) => (
  <TableRow>
    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
      <Box sx={{ color: "text.disabled" }}>
        <RestoreFromTrashOutlinedIcon
          sx={{ fontSize: 44, mb: 1.5, opacity: 0.3 }}
        />
        <Typography fontSize={14} fontWeight={600} color="text.secondary">
          No deleted {label}
        </Typography>
        <Typography fontSize={12} color="text.disabled" sx={{ mt: 0.5 }}>
          Items you soft-delete will appear here
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);

// ─── SkeletonRows ─────────────────────────────────────────────────────────────
const SkeletonRows = ({ cols }) =>
  Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: cols }).map((__, j) => (
        <TableCell key={j}>
          <Skeleton
            variant="text"
            sx={{ fontSize: "0.875rem", borderRadius: 1 }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
// BUG FIX: removed broken Dialog sub-components (DialogTitle etc.) in favour of
// manual layout, and replaced WarningAmberRoundedIcon (doesn't exist) with WarningAmberIcon
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  danger,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { borderRadius: 3, minWidth: 380 } }}
  >
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: danger ? alpha("#c0392b", 0.1) : alpha("#1a3c5e", 0.08),
            color: danger ? "#c0392b" : "#1a3c5e",
            width: 40,
            height: 40,
          }}
        >
          {danger ? (
            <WarningAmberIcon sx={{ fontSize: 22 }} />
          ) : (
            <RestoreOutlinedIcon sx={{ fontSize: 22 }} />
          )}
        </Avatar>
        <Typography fontWeight={700} fontSize={16}>
          {title}
        </Typography>
      </Box>
      <Typography
        color="text.secondary"
        fontSize={13}
        sx={{ mb: 3, pl: "56px" }}
      >
        {description}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={danger ? "error" : "primary"}
          size="small"
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          {confirmLabel}
        </Button>
      </Stack>
    </Box>
  </Dialog>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: Checklists
// ─────────────────────────────────────────────────────────────────────────────
function ChecklistsTab() {
  const {
    deletedChecklists,
    checklistLoading,
    checklistError,
    checklistPagination,
    fetchDeletedChecklists,
    restoreChecklist,
    permanentDeleteChecklist,
    bulkRestoreChecklists,
    bulkPermanentDeleteChecklists,
  } = useRecycleBin();

  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const { snack, show } = useSnack();

  useEffect(() => {
    fetchDeletedChecklists(1, 10);
  }, [fetchDeletedChecklists]);

  const handlePage = (_, p) => {
    setSelected([]);
    fetchDeletedChecklists(p, checklistPagination.limit);
  };
  const toggle = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === deletedChecklists.length
        ? []
        : deletedChecklists.map((c) => c._id),
    );
  const openConfirm = (type, id = null) => setConfirm({ open: true, type, id });
  const closeConfirm = () => setConfirm({ open: false, type: null, id: null });

  const handleConfirm = async () => {
    setActionLoading(true);
    closeConfirm();
    const { type, id } = confirm;
    let result;
    if (type === "restore-single") result = await restoreChecklist(id);
    if (type === "delete-single") result = await permanentDeleteChecklist(id);
    if (type === "restore-bulk") {
      result = await bulkRestoreChecklists(selected);
      if (result.success) setSelected([]);
    }
    if (type === "delete-bulk") {
      result = await bulkPermanentDeleteChecklists(selected);
      if (result.success) setSelected([]);
    }
    setActionLoading(false);
    if (result?.success) {
      show(
        type.includes("restore")
          ? "Restored successfully"
          : "Permanently deleted",
      );
      fetchDeletedChecklists(
        checklistPagination.page,
        checklistPagination.limit,
      );
    } else {
      show(result?.error || "Action failed", "error");
    }
  };

  const isDanger = confirm.type?.includes("delete");

  return (
    <Box>
      {snack && (
        <Alert
          severity={snack.severity}
          sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
          onClose={() => {}}
        >
          {snack.message}
        </Alert>
      )}
      {checklistError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {checklistError}
        </Alert>
      )}

      <SummaryBar
        items={checklistPagination.total ?? deletedChecklists.length}
        label="checklists"
      />

      {selected.length > 0 && (
        <BulkBar
          count={selected.length}
          onRestore={() => openConfirm("restore-bulk")}
          onDelete={() => openConfirm("delete-bulk")}
          onClear={() => setSelected([])}
          loading={actionLoading}
        />
      )}

      {actionLoading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                  <Checkbox
                    size="small"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < deletedChecklists.length
                    }
                    checked={
                      deletedChecklists.length > 0 &&
                      selected.length === deletedChecklists.length
                    }
                    onChange={toggleAll}
                  />
                </TableCell>
                {[
                  "Name",
                  "Type",
                  "Category",
                  "Deleted By",
                  "Deleted At",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {checklistLoading ? (
                <SkeletonRows cols={7} />
              ) : deletedChecklists.length === 0 ? (
                <EmptyState label="checklists" />
              ) : (
                deletedChecklists.map((c) => (
                  <TableRow
                    key={c._id}
                    hover
                    selected={selected.includes(c._id)}
                    sx={{
                      "&.Mui-selected": { bgcolor: alpha("#1a3c5e", 0.03) },
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        size="small"
                        checked={selected.includes(c._id)}
                        onChange={() => toggle(c._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontSize={13}
                        fontWeight={600}
                        noWrap
                        sx={{ maxWidth: 200 }}
                      >
                        {c.name}
                      </Typography>
                      {c.description && (
                        <Typography
                          fontSize={11}
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {c.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.checklistType || "—"}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: 11,
                          height: 22,
                          color:
                            c.checklistType === "global"
                              ? "#0a7c5c"
                              : "#1d4ed8",
                          borderColor:
                            c.checklistType === "global"
                              ? "#0a7c5c"
                              : "#1d4ed8",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {c.category || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <PersonOutlineOutlinedIcon
                          sx={{ fontSize: 13, color: "text.disabled" }}
                        />
                        <Typography fontSize={12} color="text.secondary">
                          {c.deletedBy?.email || "—"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={formatDate(c.deletedAt)} placement="top">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            cursor: "default",
                          }}
                        >
                          <CalendarTodayOutlinedIcon
                            sx={{ fontSize: 12, color: "text.disabled" }}
                          />
                          <Typography fontSize={12} color="text.secondary">
                            {timeAgo(c.deletedAt)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.25}>
                        <Tooltip title="Restore">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openConfirm("restore-single", c._id)}
                            disabled={actionLoading}
                            sx={{ borderRadius: 1.5 }}
                          >
                            <RestoreOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openConfirm("delete-single", c._id)}
                            disabled={actionLoading}
                            sx={{ borderRadius: 1.5 }}
                          >
                            <DeleteForeverOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {checklistPagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
          <Pagination
            count={checklistPagination.pages}
            page={checklistPagination.page}
            onChange={handlePage}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Box>
      )}

      <ConfirmDialog
        open={confirm.open}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={isDanger ? "Permanently Delete?" : "Restore Checklist?"}
        description={
          isDanger
            ? "This action cannot be undone. The checklist will be permanently removed from the system."
            : "The checklist will be restored and moved back to the active list."
        }
        confirmLabel={isDanger ? "Delete Permanently" : "Restore"}
        danger={isDanger}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Checklist Requests
// ─────────────────────────────────────────────────────────────────────────────
function RequestsTab() {
  const {
    deletedRequests,
    requestLoading,
    requestError,
    requestPagination,
    fetchDeletedRequests,
    restoreRequest,
    permanentDeleteRequest,
  } = useRecycleBin();

  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const { snack, show } = useSnack();

  useEffect(() => {
    fetchDeletedRequests(1, 10);
  }, [fetchDeletedRequests]);

  const handlePage = (_, p) => {
    setSelected([]);
    fetchDeletedRequests(p, requestPagination.limit);
  };
  const toggle = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === deletedRequests.length
        ? []
        : deletedRequests.map((r) => r._id),
    );
  const openConfirm = (type, id = null) => setConfirm({ open: true, type, id });
  const closeConfirm = () => setConfirm({ open: false, type: null, id: null });

  const handleConfirm = async () => {
    setActionLoading(true);
    closeConfirm();
    const { type, id } = confirm;
    let result;

    if (type === "restore-single") result = await restoreRequest(id);
    if (type === "delete-single") result = await permanentDeleteRequest(id);

    // BUG FIX: context has no bulk helpers for requests — run individually via Promise.allSettled
    if (type === "restore-bulk") {
      const res = await Promise.allSettled(selected.map(restoreRequest));
      const failed = res.filter(
        (r) => r.status === "rejected" || !r.value?.success,
      );
      result = { success: failed.length === 0 };
      if (result.success) setSelected([]);
    }
    if (type === "delete-bulk") {
      const res = await Promise.allSettled(
        selected.map(permanentDeleteRequest),
      );
      const failed = res.filter(
        (r) => r.status === "rejected" || !r.value?.success,
      );
      result = { success: failed.length === 0 };
      if (result.success) setSelected([]);
    }

    setActionLoading(false);
    if (result?.success) {
      show(
        type.includes("restore")
          ? "Restored successfully"
          : "Permanently deleted",
      );
      fetchDeletedRequests(requestPagination.page, requestPagination.limit);
    } else {
      show(result?.error || "Action failed", "error");
    }
  };

  const isDanger = confirm.type?.includes("delete");

  return (
    <Box>
      {snack && (
        <Alert
          severity={snack.severity}
          sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
          onClose={() => {}}
        >
          {snack.message}
        </Alert>
      )}
      {requestError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {requestError}
        </Alert>
      )}

      <SummaryBar
        items={requestPagination.total ?? deletedRequests.length}
        label="checklist requests"
        color="#6d28d9"
      />

      {selected.length > 0 && (
        <BulkBar
          count={selected.length}
          onRestore={() => openConfirm("restore-bulk")}
          onDelete={() => openConfirm("delete-bulk")}
          onClear={() => setSelected([])}
          loading={actionLoading}
        />
      )}

      {actionLoading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                  <Checkbox
                    size="small"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < deletedRequests.length
                    }
                    checked={
                      deletedRequests.length > 0 &&
                      selected.length === deletedRequests.length
                    }
                    onChange={toggleAll}
                  />
                </TableCell>
                {[
                  "Name",
                  "Type",
                  "Status",
                  "Deleted By",
                  "Deleted At",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {requestLoading ? (
                <SkeletonRows cols={7} />
              ) : deletedRequests.length === 0 ? (
                <EmptyState label="checklist requests" />
              ) : (
                deletedRequests.map((req) => {
                  const status = req.status?.toLowerCase();
                  const statusCfg = STATUS_CFG[status] || {
                    label: req.status || "—",
                    color: "#5a7184",
                    bg: "#f0f4f8",
                  };
                  return (
                    <TableRow
                      key={req._id}
                      hover
                      selected={selected.includes(req._id)}
                      sx={{
                        "&.Mui-selected": { bgcolor: alpha("#1a3c5e", 0.03) },
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        <Checkbox
                          size="small"
                          checked={selected.includes(req._id)}
                          onChange={() => toggle(req._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          fontSize={13}
                          fontWeight={600}
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {req.name || req.checklistName || "—"}
                        </Typography>
                        {req.description && (
                          <Typography
                            fontSize={11}
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {req.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={req.checklistType || req.type || "—"}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 11, height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            bgcolor: statusCfg.bg,
                            color: statusCfg.color,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <PersonOutlineOutlinedIcon
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          />
                          <Typography fontSize={12} color="text.secondary">
                            {req.deletedBy?.email || "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={formatDate(req.deletedAt)}
                          placement="top"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                              cursor: "default",
                            }}
                          >
                            <CalendarTodayOutlinedIcon
                              sx={{ fontSize: 12, color: "text.disabled" }}
                            />
                            <Typography fontSize={12} color="text.secondary">
                              {timeAgo(req.deletedAt)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.25}>
                          <Tooltip title="Restore">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                openConfirm("restore-single", req._id)
                              }
                              disabled={actionLoading}
                              sx={{ borderRadius: 1.5 }}
                            >
                              <RestoreOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Permanently">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                openConfirm("delete-single", req._id)
                              }
                              disabled={actionLoading}
                              sx={{ borderRadius: 1.5 }}
                            >
                              <DeleteForeverOutlinedIcon
                                sx={{ fontSize: 17 }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {requestPagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
          <Pagination
            count={requestPagination.pages}
            page={requestPagination.page}
            onChange={handlePage}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Box>
      )}

      <ConfirmDialog
        open={confirm.open}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={isDanger ? "Permanently Delete?" : "Restore Request?"}
        description={
          isDanger
            ? "This action cannot be undone. The request will be permanently removed from the system."
            : "The request will be restored and moved back to the active list."
        }
        confirmLabel={isDanger ? "Delete Permanently" : "Restore"}
        danger={isDanger}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: Assignments
// ─────────────────────────────────────────────────────────────────────────────
function AssignmentsTab() {
  const {
    deletedAssignments,
    assignmentLoading,
    assignmentError,
    assignmentPagination,
    fetchDeletedAssignments,
    restoreAssignment,
    permanentDeleteAssignment,
    bulkRestoreAssignments,
    bulkPermanentDeleteAssignments,
  } = useRecycleBin();

  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const { snack, show } = useSnack();

  useEffect(() => {
    fetchDeletedAssignments(1, 10);
  }, [fetchDeletedAssignments]);

  // BUG FIX: context uses `totalPages`, not `pages` — normalise here
  const totalPages =
    assignmentPagination.totalPages ?? assignmentPagination.pages ?? 1;
  const handlePage = (_, p) => {
    setSelected([]);
    fetchDeletedAssignments(p, assignmentPagination.limit);
  };
  const toggle = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === deletedAssignments.length
        ? []
        : deletedAssignments.map((a) => a._id),
    );
  const openConfirm = (type, id = null) => setConfirm({ open: true, type, id });
  const closeConfirm = () => setConfirm({ open: false, type: null, id: null });

  const handleConfirm = async () => {
    setActionLoading(true);
    closeConfirm();
    const { type, id } = confirm;
    let result;
    if (type === "restore-single") result = await restoreAssignment(id);
    if (type === "delete-single") result = await permanentDeleteAssignment(id);
    if (type === "restore-bulk") {
      result = await bulkRestoreAssignments(selected);
      if (result.success) setSelected([]);
    }
    if (type === "delete-bulk") {
      result = await bulkPermanentDeleteAssignments(selected);
      if (result.success) setSelected([]);
    }
    setActionLoading(false);
    if (result?.success) {
      show(
        type.includes("restore")
          ? "Assignment restored"
          : "Assignment permanently deleted",
      );
      fetchDeletedAssignments(
        assignmentPagination.page,
        assignmentPagination.limit,
      );
    } else {
      show(result?.error || "Action failed", "error");
    }
  };

  const isDanger = confirm.type?.includes("delete");

  const getAssignedTo = (asgn) => {
    if (asgn.assignedToAdmin?.email) return asgn.assignedToAdmin.email;
    if (asgn.assignedToTeamMembers?.length)
      return `${asgn.assignedToTeamMembers.length} team member${asgn.assignedToTeamMembers.length > 1 ? "s" : ""}`;
    return "—";
  };

  const getChecklistName = (asgn) =>
    asgn.checklistData?.[0]?.name || asgn.checklistIds?.[0]?.name || "—";

  return (
    <Box>
      {snack && (
        <Alert
          severity={snack.severity}
          sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
          onClose={() => {}}
        >
          {snack.message}
        </Alert>
      )}
      {assignmentError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {assignmentError}
        </Alert>
      )}

      <SummaryBar
        items={assignmentPagination.total ?? deletedAssignments.length}
        label="assignments"
        color="#d35400"
      />

      {selected.length > 0 && (
        <BulkBar
          count={selected.length}
          onRestore={() => openConfirm("restore-bulk")}
          onDelete={() => openConfirm("delete-bulk")}
          onClear={() => setSelected([])}
          loading={actionLoading}
        />
      )}

      {actionLoading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                  <Checkbox
                    size="small"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < deletedAssignments.length
                    }
                    checked={
                      deletedAssignments.length > 0 &&
                      selected.length === deletedAssignments.length
                    }
                    onChange={toggleAll}
                  />
                </TableCell>
                {[
                  "Checklist",
                  "Assigned To",
                  "Priority",
                  "Status",
                  "Deleted By",
                  "Deleted At",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assignmentLoading ? (
                <SkeletonRows cols={8} />
              ) : deletedAssignments.length === 0 ? (
                <EmptyState label="assignments" />
              ) : (
                deletedAssignments.map((asgn) => {
                  const status = asgn.status?.toLowerCase();
                  const statusCfg = STATUS_CFG[status] || {
                    label: asgn.status || "—",
                    color: "#5a7184",
                    bg: "#f0f4f8",
                  };
                  const pCfg =
                    PRIORITY_CFG[asgn.priority?.toLowerCase()] ??
                    PRIORITY_CFG.medium;

                  return (
                    <TableRow
                      key={asgn._id}
                      hover
                      selected={selected.includes(asgn._id)}
                      sx={{
                        "&.Mui-selected": { bgcolor: alpha("#d35400", 0.03) },
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        <Checkbox
                          size="small"
                          checked={selected.includes(asgn._id)}
                          onChange={() => toggle(asgn._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          fontSize={13}
                          fontWeight={600}
                          noWrap
                          sx={{ maxWidth: 180 }}
                        >
                          {getChecklistName(asgn)}
                        </Typography>
                        <Typography fontSize={11} color="text.disabled">
                          #{asgn._id?.slice(-8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          fontSize={12}
                          fontWeight={500}
                          noWrap
                          sx={{ maxWidth: 160 }}
                        >
                          {getAssignedTo(asgn)}
                        </Typography>
                        {asgn.assignedByRole && (
                          <Typography
                            fontSize={11}
                            color="text.disabled"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {asgn.assignedByRole}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={asgn.priority || "—"}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            bgcolor: pCfg.bg,
                            color: pCfg.color,
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            bgcolor: statusCfg.bg,
                            color: statusCfg.color,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <PersonOutlineOutlinedIcon
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          />
                          <Typography
                            fontSize={12}
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 150 }}
                          >
                            {asgn.deletedBy?.email ||
                              asgn.assignedBy?.email ||
                              "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={formatDate(asgn.deletedAt)}
                          placement="top"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                              cursor: "default",
                            }}
                          >
                            <CalendarTodayOutlinedIcon
                              sx={{ fontSize: 12, color: "text.disabled" }}
                            />
                            <Typography fontSize={12} color="text.secondary">
                              {timeAgo(asgn.deletedAt || asgn.updatedAt)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.25}>
                          <Tooltip title="Restore">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                openConfirm("restore-single", asgn._id)
                              }
                              disabled={actionLoading}
                              sx={{ borderRadius: 1.5 }}
                            >
                              <RestoreOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Permanently">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                openConfirm("delete-single", asgn._id)
                              }
                              disabled={actionLoading}
                              sx={{ borderRadius: 1.5 }}
                            >
                              <DeleteForeverOutlinedIcon
                                sx={{ fontSize: 17 }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
          <Pagination
            count={totalPages}
            page={assignmentPagination.page}
            onChange={handlePage}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Box>
      )}

      <ConfirmDialog
        open={confirm.open}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={isDanger ? "Permanently Delete?" : "Restore Assignment?"}
        description={
          isDanger
            ? "This action cannot be undone. The assignment will be permanently removed from the system."
            : "The assignment will be restored and will appear in the active assignments list."
        }
        confirmLabel={isDanger ? "Delete Permanently" : "Restore"}
        danger={isDanger}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function RecycleBin() {
  const { user } = useAuth();
  const { deletedChecklists, deletedRequests, deletedAssignments, canAccess } =
    useRecycleBin();
  const [tab, setTab] = useState(0);

  if (!canAccess) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            You don't have permission to access the Recycle Bin.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>
        <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1400, mx: "auto" }}>
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <Box sx={{ mb: 3.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2.5,
                    background:
                      "linear-gradient(135deg, #fef5ec 0%, #fde8d0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 0 1px ${alpha("#d35400", 0.18)}`,
                  }}
                >
                  <RestoreFromTrashOutlinedIcon
                    sx={{ color: "#d35400", fontSize: 20 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color="text.primary"
                    sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}
                  >
                    Recycle Bin
                  </Typography>
                  <Typography
                    color="text.secondary"
                    fontSize={13}
                    sx={{ mt: 0.25 }}
                  >
                    Restore or permanently delete archived items
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: alpha("#d35400", 0.07),
                  border: `1px solid ${alpha("#d35400", 0.2)}`,
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 15, color: "#d35400" }} />
                <Typography fontSize={12} color="#7c2d12" fontWeight={500}>
                  Permanently deleted items cannot be recovered
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Tabs ────────────────────────────────────────────────────────── */}
          <Box
            sx={{ borderBottom: "1px solid", borderColor: "divider", mb: 3 }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ "& .MuiTabs-indicator": { height: 2.5, borderRadius: 2 } }}
            >
              <StyledTab
                icon={
                  <Badge
                    badgeContent={deletedChecklists.length}
                    color="error"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 10,
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    <ChecklistOutlinedIcon sx={{ fontSize: 18 }} />
                  </Badge>
                }
                iconPosition="start"
                label="Checklists"
              />
              <StyledTab
                icon={
                  <Badge
                    badgeContent={deletedRequests.length}
                    color="error"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 10,
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
                  </Badge>
                }
                iconPosition="start"
                label="Checklist Requests"
              />
              <StyledTab
                icon={
                  <Badge
                    badgeContent={deletedAssignments.length}
                    color="error"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 10,
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    {/* BUG FIX: AssignmentLateOutlinedIcon doesn't exist — use AssignmentTurnedInOutlinedIcon */}
                    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />
                  </Badge>
                }
                iconPosition="start"
                label="Assignments"
              />
            </Tabs>
          </Box>

          {/* ── Tab Panels ──────────────────────────────────────────────────── */}
          {tab === 0 && <ChecklistsTab />}
          {tab === 1 && <RequestsTab />}
          {tab === 2 && <AssignmentsTab />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

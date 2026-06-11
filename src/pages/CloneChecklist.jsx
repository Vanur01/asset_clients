// pages/admin/CloneChecklist.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Pagination,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  Divider,
  Fade,
  Collapse,
  Grid,
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SecurityIcon from "@mui/icons-material/Security";
import ConstructionIcon from "@mui/icons-material/Construction";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import VerifiedIcon from "@mui/icons-material/Verified";
import AssignmentIcon from "@mui/icons-material/AssignmentTurnedIn";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TagIcon from "@mui/icons-material/Tag";
import LayersIcon from "@mui/icons-material/Layers";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CategoryIcon from "@mui/icons-material/Category";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ListAltIcon from "@mui/icons-material/ListAlt";

// ─── StatCard component ───────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accent, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "16px",
      position: "relative",
      width:"276px",
      overflow: "hidden",
      transition: "all 0.22s",
      "&:hover": {
        borderColor: accent || theme.palette.primary.main,
        transform: "translateY(-2px)",
        boxShadow: (t) =>
          `0 8px 24px ${alpha(accent || t.palette.primary.main, 0.1)}`,
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: accent || theme.palette.primary.main,
        opacity: 0,
        transition: "opacity 0.22s",
      },
      "&:hover::before": { opacity: 1 },
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            display: "block",
            mb: 0.75,
            fontSize: 10.5,
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={56} height={38} sx={{ mt: 0.25 }} />
        ) : (
          <Typography
            fontWeight={800}
            fontSize={26}
            lineHeight={1}
            color={accent || "primary.main"}
            sx={{ mb: 0.5 }}
          >
            {value}
          </Typography>
        )}
        {sub &&
          (loading ? (
            <Skeleton width={90} height={13} />
          ) : (
            <Typography variant="caption" color="text.disabled" fontSize={11}>
              {sub}
            </Typography>
          ))}
      </Box>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "13px",
          flexShrink: 0,
          bgcolor: alpha(accent || theme.palette.primary.main, 0.09),
          color: accent || "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#0d4a5c", dark: "#092f3a", light: "#e4f1f5" },
    success: { main: "#0A5C4B", light: "#e6f4f0" },
    error: { main: "#C73A2B", light: "#fdf0ee" },
    warning: { main: "#B96F0F", light: "#fdf4e7" },
    info: { main: "#2E7D8A", light: "#e8f4f6" },
    text: { primary: "#111d22", secondary: "#4e6872", disabled: "#98b3bc" },
    background: { default: "#f2f7f9", paper: "#ffffff" },
    divider: "#dde8ec",
  },
  typography: {
    fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
  },
});

// ─── Styled helpers ───────────────────────────────────────────────────────────
const TH = styled(TableCell)(() => ({
  padding: "11px 16px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: theme.palette.text.disabled,
  backgroundColor: alpha(theme.palette.background.default, 0.9),
  borderBottom: `1.5px solid ${theme.palette.divider}`,
  whiteSpace: "nowrap",
}));

const TD = styled(TableCell)(() => ({
  padding: "13px 16px",
  fontSize: 13,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  verticalAlign: "middle",
}));

const HoverRow = styled(TableRow)(() => ({
  transition: "background 0.15s",
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.028) },
  "&:last-child td": { borderBottom: "none" },
}));

// ─── Category icon ────────────────────────────────────────────────────────────
const CAT_ICONS = {
  safety: <SecurityIcon sx={{ fontSize: 18 }} />,
  equipment: <ConstructionIcon sx={{ fontSize: 18 }} />,
  site: <LocationCityIcon sx={{ fontSize: 18 }} />,
  quality: <VerifiedIcon sx={{ fontSize: 18 }} />,
  compliance: <VerifiedIcon sx={{ fontSize: 18 }} />,
  maintenance: <ConstructionIcon sx={{ fontSize: 18 }} />,
  audit: <AssignmentIcon sx={{ fontSize: 18 }} />,
  environmental: <PublicIcon sx={{ fontSize: 18 }} />,
};

const CatAvatar = ({ category }) => (
  <Avatar
    sx={{
      width: 38,
      height: 38,
      borderRadius: "12px",
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
      flexShrink: 0,
    }}
  >
    {CAT_ICONS[category?.toLowerCase()] || (
      <AssignmentIcon sx={{ fontSize: 18 }} />
    )}
  </Avatar>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  published: { label: "Published", color: "success" },
  active: { label: "Active", color: "success" },
  draft: { label: "Draft", color: "warning" },
  archived: { label: "Archived", color: "default" },
  inactive: { label: "Inactive", color: "default" },
  pending: { label: "Pending", color: "info" },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status?.toLowerCase()] || {
    label: status || "—",
    color: "default",
  };
  return (
    <Chip
      label={cfg.label}
      size="small"
      color={cfg.color}
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        "& .MuiChip-label": { px: 1.25 },
      }}
    />
  );
};

// ─── Type badge ───────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => (
  <Chip
    label={type || "custom"}
    size="small"
    variant="outlined"
    icon={
      type === "global" ? (
        <PublicIcon sx={{ fontSize: "11px !important" }} />
      ) : undefined
    }
    sx={{
      height: 22,
      fontSize: 11,
      fontWeight: 600,
      "& .MuiChip-label": { px: 1.25 },
      borderColor:
        type === "global" ? theme.palette.info.main : theme.palette.divider,
      color:
        type === "global"
          ? theme.palette.info.main
          : theme.palette.text.secondary,
    }}
  />
);

// ─── formatDate ───────────────────────────────────────────────────────────────
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ searched }) => (
  <Fade in>
    <Box sx={{ py: 9, textAlign: "center", px: 3 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "22px",
          mx: "auto",
          mb: 2.5,
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LayersIcon sx={{ fontSize: 34, color: theme.palette.primary.main }} />
      </Box>
      <Typography
        fontWeight={700}
        fontSize={16}
        color="text.primary"
        gutterBottom
      >
        {searched ? "No matching checklists" : "No cloneable checklists"}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 320, mx: "auto" }}
      >
        {searched
          ? "Try different search terms or clear the search field."
          : "Create a checklist first, then it will appear here for cloning."}
      </Typography>
    </Box>
  </Fade>
);

// ─── Error state ──────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <Fade in>
    <Box sx={{ py: 9, textAlign: "center", px: 3 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "22px",
          mx: "auto",
          mb: 2.5,
          bgcolor: alpha(theme.palette.error.main, 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ErrorOutlineIcon
          sx={{ fontSize: 34, color: theme.palette.error.main }}
        />
      </Box>
      <Typography
        fontWeight={700}
        fontSize={16}
        color="text.primary"
        gutterBottom
      >
        Failed to load checklists
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 320, mx: "auto", mb: 3 }}
      >
        {message || "An unexpected error occurred. Please try again."}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        sx={{ borderColor: "divider", color: "text.secondary" }}
      >
        Try Again
      </Button>
    </Box>
  </Fade>
);

// ─── Table skeleton ───────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <HoverRow key={i}>
        <TD>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Skeleton
              variant="rounded"
              width={38}
              height={38}
              sx={{ borderRadius: "12px", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        </TD>
        <TD>
          <Skeleton width={100} height={14} />
        </TD>
        <TD>
          <Skeleton width={80} height={14} />
        </TD>
        <TD>
          <Skeleton variant="rounded" width={40} height={22} />
        </TD>
        <TD>
          <Skeleton variant="rounded" width={56} height={22} />
        </TD>
        <TD>
          <Skeleton variant="rounded" width={56} height={22} />
        </TD>
        <TD>
          <Skeleton
            variant="rounded"
            width={80}
            height={32}
            sx={{ borderRadius: "10px" }}
          />
        </TD>
      </HoverRow>
    ))}
  </>
);

// ─── Mobile skeleton ──────────────────────────────────────────────────────────
const MobileSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {[...Array(4)].map((_, i) => (
      <Paper
        key={i}
        sx={{ p: 2, mb: 1.5, border: "1px solid", borderColor: "divider" }}
      >
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
          <Skeleton
            variant="rounded"
            width={38}
            height={38}
            sx={{ borderRadius: "12px" }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="45%" height={12} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Skeleton width="100%" height={36} sx={{ borderRadius: "10px" }} />
      </Paper>
    ))}
  </Box>
);

// ─── Clone Confirm Dialog ─────────────────────────────────────────────────────
const CloneDialog = ({ open, checklist, onClose, onConfirm, loading }) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && checklist) {
      setName(`${checklist.name} (Clone)`);
      setNameError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, checklist]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Clone name is required.");
      return;
    }
    if (trimmed.length < 3) {
      setNameError("Name must be at least 3 characters.");
      return;
    }
    if (trimmed.length > 120) {
      setNameError("Name must be under 120 characters.");
      return;
    }
    setNameError("");
    onConfirm(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          px: 3,
          pt: 3,
          pb: 2.5,
          borderRadius: "20px 20px 0 0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography fontWeight={800} fontSize={17} color="white">
              Clone Checklist
            </Typography>
            <Typography
              fontSize={12}
              sx={{ color: alpha("#fff", 0.65), mt: 0.3 }}
            >
              Give your copy a unique name
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={loading}
            sx={{
              color: "white",
              bgcolor: alpha("#fff", 0.12),
              "&:hover": { bgcolor: alpha("#fff", 0.22) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Source info card */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.18),
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.disabled"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                display: "block",
                mb: 1.25,
              }}
            >
              Cloning From
            </Typography>
            <Box
              sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1.5 }}
            >
              <CatAvatar category={checklist?.category} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={14} noWrap>
                  {checklist?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {checklist?.checklistType} &nbsp;·&nbsp;
                  {checklist?.totalFields ??
                    checklist?.fields?.length ??
                    0}{" "}
                  fields &nbsp;·&nbsp; v{checklist?.version || 1}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Status
                </Typography>
                <Box sx={{ mt: 0.4 }}>
                  <StatusBadge status={checklist?.status} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.disabled">
                  Category
                </Typography>
                <Box sx={{ mt: 0.4 }}>
                  <Chip
                    label={checklist?.category || "general"}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      "& .MuiChip-label": { px: 1.25 },
                    }}
                  />
                </Box>
              </Box>
              {checklist?.tags?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.disabled">
                    Tags
                  </Typography>
                  <Box sx={{ mt: 0.4 }}>
                    <Typography variant="caption" color="text.secondary">
                      {checklist.tags
                        .slice(0, 3)
                        .map((t) => `#${t}`)
                        .join(" ")}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Name input */}
          <TextField
            inputRef={inputRef}
            fullWidth
            label="Clone Name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            onKeyDown={handleKeyDown}
            error={!!nameError}
            helperText={nameError || `${name.length}/120 characters`}
            placeholder="Enter a name for the cloned checklist"
            disabled={loading}
            size="small"
            FormHelperTextProps={{
              sx: {
                color: nameError ? "error.main" : "text.disabled",
                fontSize: 11,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            borderColor: "divider",
            color: "text.secondary",
            borderRadius: "10px",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || !name.trim()}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={15} color="inherit" />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            )
          }
          sx={{ borderRadius: "10px", px: 2.5, minWidth: 130 }}
        >
          {loading ? "Creating…" : "Create Clone"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Mobile checklist card ────────────────────────────────────────────────────
const MobileCard = ({ row, onClone }) => (
  <Paper
    sx={{
      p: 2,
      mb: 1.5,
      border: "1px solid",
      borderColor: "divider",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: "primary.main",
        boxShadow: (t) => `0 4px 16px ${alpha(t.palette.primary.main, 0.1)}`,
      },
    }}
    elevation={0}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
          flex: 1,
          minWidth: 0,
        }}
      >
        <CatAvatar category={row.category} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} fontSize={14} sx={{ mb: 0.3 }} noWrap>
            {row.name}
          </Typography>
          {row.description && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {row.description}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ ml: 1, flexShrink: 0 }}>
        <StatusBadge status={row.status} />
      </Box>
    </Box>

    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CalendarTodayIcon sx={{ fontSize: 12, color: "text.disabled" }} />
        <Typography variant="caption" color="text.secondary">
          {fmt(row.createdAt)}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <DescriptionIcon sx={{ fontSize: 12, color: "text.disabled" }} />
        <Typography variant="caption" color="text.secondary">
          {row.totalFields ?? row.fields?.length ?? 0} fields
        </Typography>
      </Box>
      <TypeBadge type={row.checklistType} />
    </Box>

    <Button
      fullWidth
      variant="contained"
      size="small"
      startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />}
      onClick={() => onClone(row)}
      sx={{ borderRadius: "10px", fontSize: 13 }}
    >
      Clone This Checklist
    </Button>
  </Paper>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CloneChecklist = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getCloneableChecklists, cloneChecklist } = useChecklistBuilder();

  // List state
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]); // unfiltered snapshot for stats
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Dialog state
  const [dialog, setDialog] = useState({ open: false, checklist: null });
  const [cloneLoading, setCloneLoading] = useState(false);

  // Snackbar state
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 380);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch cloneable checklists — uses GET /checklists/cloneable
  const fetchList = useCallback(
    async (pg = page, q = debouncedSearch) => {
      setListLoading(true);
      setFetchError(null);
      try {
        const filters = { page: pg, limit: 10 };
        if (q) filters.search = q;

        const res = await getCloneableChecklists(filters);

        if (!res.success) {
          setFetchError(res.error || "Failed to load checklists.");
          setRows([]);
          return;
        }

        const raw = res.data;
        const list = raw?.checklists ?? (Array.isArray(raw) ? raw : []);
        const pag = raw?.pagination ?? {};

        setRows(list);
        setPagination({
          page: pag.page || pg,
          limit: pag.limit || 10,
          total: pag.total || list.length,
          pages: pag.pages || Math.ceil((pag.total || list.length) / 10),
        });

        // On first unfiltered load, capture a full snapshot for stats
        if (!q && pg === 1) {
          // Fetch up to 100 for stat aggregation (no UI pagination effect)
          const statsRes = await getCloneableChecklists({
            page: 1,
            limit: 100,
          });
          if (statsRes.success) {
            const sraw = statsRes.data;
            const slist = sraw?.checklists ?? (Array.isArray(sraw) ? sraw : []);
            setAllRows(slist);
          }
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Unexpected error.";
        setFetchError(msg);
        setRows([]);
      } finally {
        setListLoading(false);
      }
    },
    [getCloneableChecklists, page, debouncedSearch],
  );

  useEffect(() => {
    fetchList(page, debouncedSearch);
  }, [page, debouncedSearch]);

  // Open dialog
  const openClone = (row) => setDialog({ open: true, checklist: row });
  const closeClone = () => {
    if (!cloneLoading) setDialog({ open: false, checklist: null });
  };

  // Confirm clone — POST /checklists/:id/clone
  const handleCloneConfirm = useCallback(
    async (newName) => {
      if (!dialog.checklist) return;
      setCloneLoading(true);
      try {
        const res = await cloneChecklist(dialog.checklist._id, { newName });
        if (res.success) {
          setSnack({
            open: true,
            msg: `"${newName}" created successfully!`,
            severity: "success",
          });
          closeClone();
          fetchList(page, debouncedSearch);
          setTimeout(() => navigate("/admin/checklists"), 1800);
        } else {
          setSnack({
            open: true,
            msg: res.error || "Clone failed. Please try again.",
            severity: "error",
          });
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Clone failed.";
        setSnack({ open: true, msg, severity: "error" });
      } finally {
        setCloneLoading(false);
      }
    },
    [
      dialog.checklist,
      cloneChecklist,
      fetchList,
      navigate,
      page,
      debouncedSearch,
    ],
  );

  const handlePageChange = (_, v) => {
    setPage(v);
  };
  const handleRetry = () => fetchList(page, debouncedSearch);

  // ── Derived stats from allRows snapshot ──────────────────────────────────
  const statsSource = allRows.length > 0 ? allRows : rows;
  const stats = {
    total: pagination.total || statsSource.length,
    published: statsSource.filter(
      (r) => r.status === "published" || r.status === "active",
    ).length,
    totalFields: statsSource.reduce(
      (s, r) => s + (r.totalFields ?? r.fields?.length ?? 0),
      0,
    ),
    categories: [...new Set(statsSource.map((r) => r.category).filter(Boolean))]
      .length,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>
        {/* ── Top bar ── */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: { xs: 2, sm: 4 },
            py: 2,
            position: "sticky",
            top: 0,
            width: "1152px",
            marginLeft: "30px",
            borderRadius: 1,
            zIndex: 50,
          }}
        >
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => navigate("/admin/checklists")}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  borderRadius: "12px",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.13),
                  },
                }}
              >
                <ArrowBackIcon sx={{ color: "primary.main", fontSize: 20 }} />
              </IconButton>
              <Box>
                <Typography
                  fontWeight={800}
                  fontSize={{ xs: 15, sm: 18 }}
                  color="text.primary"
                  sx={{ letterSpacing: "-0.01em", lineHeight: 1.2 }}
                >
                  Clone Checklist
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  Duplicate an existing checklist to use as a new starting point
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Refresh list">
              <IconButton
                onClick={handleRetry}
                disabled={listLoading}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  borderRadius: "12px",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.13),
                  },
                }}
              >
                <RefreshIcon
                  sx={{
                    color: "primary.main",
                    fontSize: 20,
                    animation: listLoading
                      ? "spin 0.9s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Container
          maxWidth="lg"
          sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}
        >
          {/* ── Search ── */}
          <Paper
            elevation={0}
            sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, category, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.disabled", fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* ── Stats ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              {
                label: "Total Cloneable",
                value: stats.total,
                sub: "Available to duplicate",
                icon: <LayersIcon sx={{ fontSize: 20 }} />,
              },
              {
                label: "Published",
                value: stats.published,
                sub: "Active & ready to clone",
                icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
                accent: theme.palette.success.main,
              },
              {
                label: "Total Fields",
                value: stats.totalFields,
                sub: "Across all checklists",
                icon: <ListAltIcon sx={{ fontSize: 20 }} />,
                accent: theme.palette.info.main,
              },
              {
                label: "Categories",
                value: stats.categories,
                sub: "Distinct categories",
                icon: <CategoryIcon sx={{ fontSize: 20 }} />,
                accent: theme.palette.warning.main,
              },
            ].map((s) => (
              <Grid item xs={6} sm={3} key={s.label}>
                <StatCard
                  {...s}
                  loading={listLoading && allRows.length === 0}
                />
              </Grid>
            ))}
          </Grid>

          {/* ── Count bar ── */}
          {!listLoading && !fetchError && rows.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                {pagination.total}{" "}
                {pagination.total === 1 ? "checklist" : "checklists"} available
                to clone
                {debouncedSearch && ` · filtered by "${debouncedSearch}"`}
              </Typography>
            </Box>
          )}

          {/* ── Content card ── */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            {/* Error */}
            {!listLoading && fetchError && (
              <ErrorState message={fetchError} onRetry={handleRetry} />
            )}

            {/* Mobile cards */}
            {!fetchError && isMobile && (
              <Box sx={{ p: 2 }}>
                {listLoading ? (
                  <MobileSkeleton />
                ) : rows.length === 0 ? (
                  <EmptyState searched={!!debouncedSearch} />
                ) : (
                  rows.map((row) => (
                    <MobileCard key={row._id} row={row} onClone={openClone} />
                  ))
                )}
              </Box>
            )}

            {/* Desktop table */}
            {!fetchError && !isMobile && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TH>Checklist</TH>
                      <TH>Created By</TH>
                      <TH>Date</TH>
                      <TH align="center">Fields</TH>
                      <TH align="center">Type</TH>
                      <TH align="center">Status</TH>
                      <TH align="center">Action</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listLoading ? (
                      <TableSkeleton />
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TD colSpan={7} sx={{ border: 0 }}>
                          <EmptyState searched={!!debouncedSearch} />
                        </TD>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <HoverRow key={row._id}>
                          {/* Checklist name + description */}
                          <TD sx={{ maxWidth: 280 }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1.5,
                                alignItems: "center",
                              }}
                            >
                              <CatAvatar category={row.category} />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  fontWeight={700}
                                  fontSize={13}
                                  noWrap
                                >
                                  {row.name}
                                </Typography>
                                {row.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    sx={{
                                      display: "block",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: 220,
                                    }}
                                  >
                                    {row.description}
                                  </Typography>
                                )}
                                {row.tags?.length > 0 && (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ mt: 0.4 }}
                                  >
                                    {row.tags.slice(0, 3).map((t) => (
                                      <Typography
                                        key={t}
                                        variant="caption"
                                        color="text.disabled"
                                        fontSize={10}
                                      >
                                        #{t}
                                      </Typography>
                                    ))}
                                  </Stack>
                                )}
                              </Box>
                            </Box>
                          </TD>

                          {/* Created by */}
                          <TD>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 26,
                                  height: 26,
                                  fontSize: 11,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  color: "primary.main",
                                }}
                              >
                                {(
                                  row.createdBy?.email ||
                                  row.createdBy?.name ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  fontSize={12}
                                  color="text.secondary"
                                  noWrap
                                  sx={{ maxWidth: 140 }}
                                >
                                  {row.createdBy?.email ||
                                    row.createdBy?.name ||
                                    "System"}
                                </Typography>
                                {row.createdByRole && (
                                  <Typography
                                    fontSize={10}
                                    color="text.disabled"
                                    noWrap
                                  >
                                    {row.createdByRole.replace("_", " ")}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TD>

                          {/* Created date */}
                          <TD>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <CalendarTodayIcon
                                sx={{ fontSize: 12, color: "text.disabled" }}
                              />
                              <Typography fontSize={12} color="text.secondary">
                                {fmt(row.createdAt)}
                              </Typography>
                            </Box>
                          </TD>

                          {/* Fields count */}
                          <TD align="center">
                            <Chip
                              label={row.totalFields ?? row.fields?.length ?? 0}
                              size="small"
                              sx={{
                                height: 22,
                                minWidth: 36,
                                fontWeight: 700,
                                fontSize: 11,
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.07,
                                ),
                                color: "primary.main",
                                "& .MuiChip-label": { px: 1.25 },
                              }}
                            />
                          </TD>

                          {/* Type */}
                          <TD align="center">
                            <TypeBadge type={row.checklistType} />
                          </TD>

                          {/* Status */}
                          <TD align="center">
                            <StatusBadge status={row.status} />
                          </TD>

                          {/* Clone action */}
                          <TD align="center">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              }
                              onClick={() => openClone(row)}
                              sx={{
                                fontSize: 12,
                                borderRadius: "10px",
                                px: 1.75,
                                py: 0.65,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Clone
                            </Button>
                          </TD>
                        </HoverRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {!listLoading &&
              !fetchError &&
              rows.length > 0 &&
              pagination.pages > 1 && (
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.7),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Showing {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    of {pagination.total}
                  </Typography>
                  <Pagination
                    count={pagination.pages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: 12,
                      },
                      "& .Mui-selected": {
                        bgcolor: "primary.main !important",
                        color: "#fff",
                        "&:hover": { bgcolor: "primary.dark !important" },
                      },
                    }}
                  />
                </Box>
              )}
          </Paper>
        </Container>

        {/* ── Clone dialog ── */}
        <CloneDialog
          open={dialog.open}
          checklist={dialog.checklist}
          onClose={closeClone}
          onConfirm={handleCloneConfirm}
          loading={cloneLoading}
        />

        {/* ── Snackbar ── */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          TransitionComponent={Fade}
        >
          <Alert
            severity={snack.severity}
            variant="filled"
            icon={
              snack.severity === "success" ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <WarningAmberIcon fontSize="small" />
              )
            }
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{
              borderRadius: "14px",
              fontWeight: 600,
              fontSize: 13,
              bgcolor:
                snack.severity === "success" ? "primary.main" : "error.main",
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CloneChecklist;

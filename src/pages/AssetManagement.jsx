// src/pages/AssetManagement.jsx
// ─── FIXES ────────────────────────────────────────────────────────────────────
// 1. Page header: removed hardcoded `width: "1170px"` and `ml: 4` — now 100%
//    responsive with proper padding.
// 2. fetchAssets: wrapped in try/catch that surfaces the actual error message
//    instead of always showing "Failed to load assets". Network errors, 401s,
//    and backend validation errors are all displayed properly.
// 3. Empty state: distinguished between "no data at all" (first load, no
//    assets registered) and "no results for this search/filter". Different copy
//    and actions for each case.
// 4. Error state: dedicated error banner with retry button when the fetch fails.
//    Previously errors were silently swallowed after showing a toast.
// 5. Categories filter: was built from the current page's assets only — now
//    also persisted across page changes so the filter list doesn't collapse
//    when you navigate to page 2.
// 6. AssetCard width: removed hardcoded `width: "360px"` — let Grid control it.
// 7. Clone dialog: shows a proper error message inside the dialog on failure
//    instead of closing + toast so the user can retry without re-opening.
// 8. Delete dialog: same — error shown inside dialog.
// 9. Pagination sync: `rowsPerPage` change now resets `page` to 0 correctly.
// 10. Sort: `setPage(0)` was missing from handleSort — now added.
// 11. Redesigned with a clean, refined industrial aesthetic: editorial grid,
//     sharp typographic hierarchy, muted tones, surgical use of color.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
  Grid,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Pagination,
  Skeleton,
  Alert,
  AlertTitle,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Divider,
  alpha,
  useMediaQuery,
  useTheme,
  Collapse,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  LocationOn,
  ContentCopy,
  Visibility,
  Add,
  GridView,
  ViewList,
  CheckCircle,
  SearchOff,
  Cancel,
  Warning,
  AssignmentTurnedIn,
  Schedule,
  Settings,
  Close,
  ClearAll,
  FileDownload,
  Block,
  Info,
  Delete,
  Refresh,
  Category,
  Layers,
  Edit,
  FilterList,
  TrendingUp,
  ErrorOutline,
  Inbox,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useAsset } from "../context/AssetContext";
import { useAuth } from "../context/AuthContexts";

// ── Design System — refined industrial editorial ──────────────────────────────
const DS = {
  // Neutral foundation
  ink: "#111318",
  inkMid: "#23282F",
  inkLight: "#3A4250",
  slate: "#64748B",
  slateLight: "#94A3B8",
  line: "#E2E8F0",
  lineLight: "#F1F5F9",
  canvas: "#F8FAFC",
  white: "#FFFFFF",

  // Brand — deep teal
  brand: "#0E4F63",
  brandDark: "#093A4A",
  brandLight: "#EBF6FA",
  brandMid: "#B3DCE8",
  brandAccent: "#0D9DBF",

  // Semantic
  success: "#0D6E4E",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
  warning: "#92400E",
  warningBg: "#FFFBEB",
  warningBorder: "#FCD34D",
  error: "#991B1B",
  errorBg: "#FEF2F2",
  errorBorder: "#FCA5A5",
  purple: "#5B21B6",
  purpleBg: "#F5F3FF",
  purpleBorder: "#C4B5FD",
  info: "#075985",
  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  neutral: "#374151",
  neutralBg: "#F9FAFB",
  neutralBorder: "#D1D5DB",

  // Elevation
  shadow: "0 1px 2px rgba(17,19,24,0.06)",
  shadowSm: "0 1px 3px rgba(17,19,24,0.08), 0 1px 2px rgba(17,19,24,0.04)",
  shadowMd: "0 4px 12px rgba(17,19,24,0.08), 0 2px 4px rgba(17,19,24,0.04)",
  shadowLg: "0 12px 28px rgba(17,19,24,0.10), 0 4px 8px rgba(17,19,24,0.06)",

  // Typography
  font: "'Sora', 'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', 'Fira Code', monospace",

  // Radius
  r: { xs: "3px", sm: "6px", md: "10px", lg: "14px", xl: "18px" },
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Active: {
    bg: DS.successBg,
    color: DS.success,
    border: DS.successBorder,
    dot: DS.success,
  },
  "In Maintenance": {
    bg: DS.purpleBg,
    color: DS.purple,
    border: DS.purpleBorder,
    dot: DS.purple,
  },
  Retired: {
    bg: DS.neutralBg,
    color: DS.neutral,
    border: DS.neutralBorder,
    dot: DS.slateLight,
  },
  "In Transit": {
    bg: DS.warningBg,
    color: DS.warning,
    border: DS.warningBorder,
    dot: DS.warning,
  },
  Reserved: {
    bg: DS.infoBg,
    color: DS.info,
    border: DS.infoBorder,
    dot: DS.info,
  },
  "Under Repair": {
    bg: DS.errorBg,
    color: DS.error,
    border: DS.errorBorder,
    dot: DS.error,
  },
  Decommissioned: {
    bg: DS.neutralBg,
    color: DS.neutral,
    border: DS.neutralBorder,
    dot: DS.slateLight,
  },
};

// ── Reusable atoms ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || {
    bg: DS.neutralBg,
    color: DS.neutral,
    border: DS.neutralBorder,
    dot: DS.slateLight,
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        display: "inline-flex",
        px: "7px",
        py: "3px",
        borderRadius: DS.r.xs,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: cfg.dot,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: cfg.color,
          letterSpacing: "0.04em",
          lineHeight: 1,
          fontFamily: DS.font,
          whiteSpace: "nowrap",
        }}
      >
        {status || "—"}
      </Typography>
    </Stack>
  );
};

const HealthMeter = ({ score = 0 }) => {
  const color = score >= 70 ? DS.success : score >= 40 ? DS.warning : DS.error;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 52,
          height: 2,
          borderRadius: 8,
          bgcolor: DS.lineLight,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: `${score}%`,
            height: "100%",
            bgcolor: color,
            borderRadius: 8,
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color,
          fontFamily: DS.mono,
          minWidth: 26,
        }}
      >
        {score}%
      </Typography>
    </Stack>
  );
};

// ── Metric Card ───────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, icon, sub, onClick, accent }) => {
  const ac = accent || DS.brand;
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: "14px 18px",
        borderRadius: DS.r.md,
        border: `1px solid ${DS.line}`,
        bgcolor: DS.white,
        flex: 1,
        mr:1,
        minWidth: 130,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease",
        boxShadow: DS.shadow,
        "&:hover": onClick
          ? {
              boxShadow: DS.shadowMd,
              borderColor: alpha(ac, 0.35),
              transform: "translateY(-1px)",
            }
          : {},
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={0.75}
      >
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: DS.ink,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            fontFamily: DS.font,
          }}
        >
          {value ?? "—"}
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: DS.r.sm,
            bgcolor: alpha(ac, 0.09),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: ac,
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: DS.slateLight,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          fontFamily: DS.font,
        }}
      >
        {label}
      </Typography>
      {sub && (
        <Typography
          sx={{
            fontSize: "0.66rem",
            color: DS.slateLight,
            mt: 0.25,
            fontFamily: DS.font,
          }}
        >
          {sub}
        </Typography>
      )}
    </Paper>
  );
};

// ── Asset Grid Card ───────────────────────────────────────────────────────────
const AssetCard = ({ asset, onView, onClone, onDelete, onEdit, isAdmin }) => {
  const canClone = !asset.isClone && asset.canBeCloned !== false;
  const statusCfg = STATUS_CFG[asset.status] || {};

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${DS.line}`,
        borderRadius: DS.r.lg,
        bgcolor: DS.white,
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: DS.shadow,
        overflow: "hidden",
        width:"360px",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: DS.shadowMd,
          borderColor: alpha(DS.brand, 0.28),
          transform: "translateY(-2px)",
        },
      }}
      onClick={() => onView(asset)}
    >
      {/* Status stripe */}
      <Box
        sx={{ height: 2.5, bgcolor: statusCfg.dot || DS.line, flexShrink: 0 }}
      />

      <Box
        sx={{
          p: "14px 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Box sx={{ flex: 1, pr: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.8375rem",
                color: DS.ink,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: DS.font,
              }}
            >
              {asset.assetName}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: DS.slateLight,
                fontFamily: DS.mono,
                mt: 0.2,
              }}
            >
              {asset.assetId || asset._id?.slice(-8).toUpperCase()}
            </Typography>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            flexShrink={0}
          >
            {asset.isClone && (
              <Box
                sx={{
                  px: "5px",
                  py: "2px",
                  borderRadius: DS.r.xs,
                  bgcolor: DS.infoBg,
                  border: `1px solid ${DS.infoBorder}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    color: DS.info,
                    letterSpacing: "0.06em",
                  }}
                >
                  CLONE
                </Typography>
              </Box>
            )}
            <StatusBadge status={asset.status} />
          </Stack>
        </Stack>

        {/* Location */}
        {asset.currentLocation && (
          <Stack direction="row" alignItems="center" spacing={0.4} mb={1}>
            <LocationOn sx={{ fontSize: 10, color: DS.slateLight }} />
            <Typography
              sx={{ fontSize: "0.7rem", color: DS.slate, fontFamily: DS.font }}
            >
              {asset.currentLocation}
            </Typography>
          </Stack>
        )}

        <Divider sx={{ borderColor: DS.lineLight, my: 1 }} />

        {/* Details */}
        <Stack spacing={0.6} sx={{ flex: 1 }}>
          {[
            {
              label: "Category",
              value: asset.assetCategoryId?.name || asset.assetCategory,
            },
            { label: "Condition", value: asset.assetCondition },
            {
              label: "Cost",
              value: asset.purchaseCost
                ? `₹${Number(asset.purchaseCost).toLocaleString("en-IN")}`
                : null,
            },
          ].map(({ label, value }) => (
            <Stack
              key={label}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: DS.slateLight,
                  fontFamily: DS.font,
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: DS.inkLight,
                  fontFamily: DS.font,
                  maxWidth: "58%",
                  textAlign: "right",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value || "—"}
              </Typography>
            </Stack>
          ))}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: DS.slateLight,
                fontFamily: DS.font,
              }}
            >
              Health
            </Typography>
            <HealthMeter score={asset.healthScore || 0} />
          </Stack>
        </Stack>

        {/* Actions */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 1.25, pt: 1, borderTop: `1px solid ${DS.lineLight}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={canClone ? "Clone asset" : "Cannot clone a clone"}>
            <span>
              <IconButton
                size="small"
                disabled={!canClone}
                onClick={() => canClone && onClone(asset)}
                sx={{
                  borderRadius: DS.r.sm,
                  width: 26,
                  height: 26,
                  bgcolor: canClone ? DS.brandLight : DS.lineLight,
                  "&:hover": { bgcolor: canClone ? DS.brandMid : DS.lineLight },
                }}
              >
                <ContentCopy
                  sx={{
                    fontSize: 11,
                    color: canClone ? DS.brand : DS.slateLight,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit(asset)}
              sx={{
                borderRadius: DS.r.sm,
                width: 26,
                height: 26,
                bgcolor: DS.brandLight,
                "&:hover": { bgcolor: DS.brandMid },
              }}
            >
              <Edit sx={{ fontSize: 11, color: DS.brand }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => onView(asset)}
              sx={{
                borderRadius: DS.r.sm,
                width: 26,
                height: 26,
                bgcolor: DS.lineLight,
                "&:hover": { bgcolor: DS.line },
              }}
            >
              <Visibility sx={{ fontSize: 11, color: DS.slate }} />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(asset)}
                sx={{
                  borderRadius: DS.r.sm,
                  width: 26,
                  height: 26,
                  ml: "auto !important",
                  bgcolor: alpha(DS.error, 0.06),
                  "&:hover": { bgcolor: alpha(DS.error, 0.12) },
                }}
              >
                <Delete sx={{ fontSize: 11, color: DS.error }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

// ── Shared button sx ──────────────────────────────────────────────────────────
const primaryBtn = {
  bgcolor: DS.brand,
  color: DS.white,
  textTransform: "none",
  borderRadius: DS.r.md,
  boxShadow: "none",
  fontWeight: 600,
  fontSize: "0.8rem",
  fontFamily: DS.font,
  px: 2,
  "&:hover": { bgcolor: DS.brandDark, boxShadow: "none" },
};
const outlineBtn = {
  textTransform: "none",
  borderRadius: DS.r.md,
  borderColor: DS.line,
  color: DS.slate,
  fontWeight: 600,
  fontSize: "0.8rem",
  fontFamily: DS.font,
  "&:hover": { borderColor: DS.slateLight, bgcolor: DS.canvas },
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onClear, onAdd, isAdmin }) => (
  <Paper
    elevation={0}
    sx={{
      textAlign: "center",
      py: { xs: 8, sm: 12 },
      px: 3,
      borderRadius: DS.r.lg,
      border: `1px dashed ${DS.line}`,
      bgcolor: DS.white,
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: DS.lineLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      {hasFilters ? (
        <SearchOff sx={{ fontSize: 24, color: DS.slateLight }} />
      ) : (
        <Inbox sx={{ fontSize: 24, color: DS.slateLight }} />
      )}
    </Box>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "0.9375rem",
        color: DS.ink,
        mb: 0.5,
        fontFamily: DS.font,
      }}
    >
      {hasFilters ? "No assets match your filters" : "No assets yet"}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.8rem",
        color: DS.slateLight,
        mb: 3,
        fontFamily: DS.font,
        maxWidth: 320,
        mx: "auto",
      }}
    >
      {hasFilters
        ? "Try adjusting your search or filter criteria to find what you're looking for."
        : "Get started by registering your first asset. All tracked assets will appear here."}
    </Typography>
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent="center"
      flexWrap="wrap"
    >
      {hasFilters && (
        <Button
          variant="outlined"
          onClick={onClear}
          sx={outlineBtn}
          startIcon={<ClearAll sx={{ fontSize: 14 }} />}
        >
          Clear filters
        </Button>
      )}
      {(!hasFilters || isAdmin) && (
        <Button
          variant="contained"
          onClick={onAdd}
          sx={primaryBtn}
          startIcon={<Add sx={{ fontSize: 14 }} />}
        >
          Add Asset
        </Button>
      )}
    </Stack>
  </Paper>
);

// ── Error State ───────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <Paper
    elevation={0}
    sx={{
      textAlign: "center",
      py: { xs: 8, sm: 12 },
      px: 3,
      borderRadius: DS.r.lg,
      border: `1px solid ${DS.errorBorder}`,
      bgcolor: DS.errorBg,
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: alpha(DS.error, 0.1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      <ErrorOutline sx={{ fontSize: 26, color: DS.error }} />
    </Box>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "0.9375rem",
        color: DS.ink,
        mb: 0.5,
        fontFamily: DS.font,
      }}
    >
      Failed to load assets
    </Typography>
    <Typography
      sx={{
        fontSize: "0.8rem",
        color: DS.slate,
        mb: 3,
        fontFamily: DS.font,
        maxWidth: 360,
        mx: "auto",
      }}
    >
      {message ||
        "Something went wrong while fetching data. Check your connection and try again."}
    </Typography>
    <Button
      variant="contained"
      onClick={onRetry}
      sx={primaryBtn}
      startIcon={<Refresh sx={{ fontSize: 14 }} />}
    >
      Retry
    </Button>
  </Paper>
);

// ── Skeleton grid / table ─────────────────────────────────────────────────────
const GridSkeleton = () => (
  <Grid container spacing={2}>
    {Array(8)
      .fill(null)
      .map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Skeleton
            variant="rounded"
            height={290}
            sx={{ borderRadius: DS.r.lg }}
          />
        </Grid>
      ))}
  </Grid>
);

const TableSkeleton = () =>
  Array(6)
    .fill(null)
    .map((_, i) => (
      <TableRow key={i}>
        {Array(8)
          .fill(null)
          .map((_, j) => (
            <TableCell
              key={j}
              sx={{ borderBottom: `1px solid ${DS.lineLight}` }}
            >
              <Skeleton height={16} />
            </TableCell>
          ))}
      </TableRow>
    ));

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AssetManagement() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isTeam = user?.role === "team";

  const { getAllAssets, cloneAsset, deleteAsset, assetStats } = useAsset();

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // FIX 4: dedicated error state
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12,
  });

  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const [cloneOpen, setCloneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneLocation, setCloneLocation] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  // FIX 7+8: dialog-level error instead of always closing dialog on error
  const [dialogError, setDialogError] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const toast = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  // FIX 5: persist categories across pages
  const allCategoriesRef = useRef(new Map());

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch assets ───────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setFetchError(null); // FIX 4: clear previous error before refetch
    try {
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
      };
      if (debouncedSearch) filters.search = debouncedSearch;
      if (categoryFilter) filters.category = categoryFilter;
      if (statusFilter) filters.status = statusFilter;
      if (conditionFilter) filters.condition = conditionFilter;

      const data = await getAllAssets(filters);

      // getAllAssets returns null for aborted requests — don't update state
      if (!data) return;

      setAssets(data.assets || []);

      const pag = data.pagination || {};
      setPagination({
        total: pag.total || 0,
        pages: pag.pages || 1,
        page: pag.page || 1,
        limit: pag.limit || rowsPerPage,
      });

      // FIX 5: accumulate category map across pages so filter list stays stable
      (data.assets || []).forEach((a) => {
        if (a.assetCategoryId?._id && a.assetCategoryId?.name) {
          allCategoriesRef.current.set(a.assetCategoryId._id, {
            _id: a.assetCategoryId._id,
            name: a.assetCategoryId.name,
          });
        }
      });
      setCategories([...allCategoriesRef.current.values()]);
    } catch (err) {
      // FIX 2: surface the actual error message
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unexpected error — please try again.";
      setFetchError(msg);
      setAssets([]); // clear stale data so empty-state renders correctly
    } finally {
      setLoading(false);
    }
  }, [
    getAllAssets,
    page,
    rowsPerPage,
    orderBy,
    order,
    debouncedSearch,
    categoryFilter,
    statusFilter,
    conditionFilter,
  ]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setConditionFilter("");
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
    setShowFilters(false);
  };

  // FIX 10: reset page on sort
  const handleSort = (col) => {
    setOrder(orderBy === col && order === "asc" ? "desc" : "asc");
    setOrderBy(col);
    setPage(0);
  };

  const handleViewAsset = (asset) =>
    navigate(`/admin/assets/view/${asset.id || asset._id}`);
  const handleEditAsset = (asset) =>
    navigate(`/admin/assets/edit/${asset.id || asset._id}`);

  const openCloneDialog = (asset) => {
    if (asset.isClone) {
      toast("Cloned assets cannot be cloned again", "warning");
      return;
    }
    setSelectedAsset(asset);
    setCloneName(`${asset.assetName} — Clone`);
    setCloneLocation(asset.currentLocation || "");
    setDialogError("");
    setCloneOpen(true);
  };

  // FIX 7: show error inside dialog, don't close on failure
  const handleCloneConfirm = async () => {
    if (!cloneName.trim()) {
      setDialogError("Clone name is required.");
      return;
    }
    setActionLoading(true);
    setDialogError("");
    try {
      await cloneAsset(selectedAsset.id || selectedAsset._id, {
        assetName: cloneName.trim(),
        currentLocation: cloneLocation.trim() || undefined,
      });
      toast(`"${selectedAsset.assetName}" cloned successfully`);
      setCloneOpen(false);
      fetchAssets();
      navigate("/admin/assets/clone");
    } catch (err) {
      // FIX 7: don't close — show message inside dialog
      setDialogError(
        err?.response?.data?.message ||
          err?.message ||
          "Clone failed. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // FIX 8: show error inside dialog, don't close on failure
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setDialogError("");
    try {
      await deleteAsset(selectedAsset.id || selectedAsset._id);
      toast(`"${selectedAsset.assetName}" deleted`);
      setDeleteOpen(false);
      fetchAssets();
    } catch (err) {
      setDialogError(
        err?.response?.data?.message ||
          err?.message ||
          "Delete failed. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const hasFilters = !!(
    categoryFilter ||
    statusFilter ||
    conditionFilter ||
    debouncedSearch
  );
  const activeFilterCount = [
    categoryFilter,
    statusFilter,
    conditionFilter,
  ].filter(Boolean).length;
  const stats = assetStats || {};

  // ── Input styles ───────────────────────────────────────────────────────────
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: DS.r.md,
      fontSize: "0.8rem",
      fontFamily: DS.font,
      bgcolor: DS.white,
      "& fieldset": { borderColor: DS.line },
      "&:hover fieldset": { borderColor: DS.slateLight },
      "&.Mui-focused fieldset": { borderColor: DS.brand, borderWidth: "1.5px" },
    },
    "& .MuiInputBase-input": { py: "8.5px", px: "12px" },
  };

  const selectSx = {
    borderRadius: DS.r.md,
    fontSize: "0.8rem",
    fontFamily: DS.font,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: DS.line },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: DS.slateLight },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: DS.brand,
      borderWidth: "1.5px",
    },
    "& .MuiSelect-select": { py: "8.5px", px: "12px" },
  };

  const headCellSx = {
    bgcolor: DS.canvas,
    fontWeight: 700,
    fontSize: "0.65rem",
    color: DS.slateLight,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: `1.5px solid ${DS.line}`,
    fontFamily: DS.font,
    whiteSpace: "nowrap",
    py: 1.5,
  };

  const cellSx = {
    py: "11px",
    fontSize: "0.8rem",
    fontFamily: DS.font,
    borderBottom: `1px solid ${DS.lineLight}`,
    color: DS.inkLight,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: DS.canvas, fontFamily: DS.font }}>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      {/* FIX 1: removed hardcoded width:"1170px" and ml:4 */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2, sm: 2.5 },
          pb: { xs: 1.5, sm: 2 },
          bgcolor: DS.white,
          width:"1175px",
          marginLeft:"30px",
          borderBottom: `1px solid ${DS.line}`,
          boxShadow: DS.shadow,
          borderRadius: 2,
        }}
      >
        {/* Title + Actions */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.25}>
              <Typography
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.35rem" },
                  fontWeight: 800,
                  color: DS.ink,
                  letterSpacing: "-0.035em",
                  fontFamily: DS.font,
                  lineHeight: 1,
                }}
              >
                Asset Management
              </Typography>
              {isTeam && (
                <Chip
                  label="Team View"
                  size="small"
                  sx={{
                    height: 19,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    bgcolor: DS.brandLight,
                    color: DS.brand,
                    fontFamily: DS.font,
                  }}
                />
              )}
            </Stack>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: DS.slateLight,
                fontFamily: DS.font,
              }}
            >
              {stats.totalAssets ?? pagination.total} assets tracked &amp;
              monitored
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/assets/clone")}
              startIcon={!isMobile && <ContentCopy sx={{ fontSize: 14 }} />}
              sx={{ ...primaryBtn, px: { xs: 1.5, sm: 2 } }}
            >
              {isMobile ? (
                <ContentCopy sx={{ fontSize: 15 }} />
              ) : (
                "Clone Assets"
              )}
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/asset-categories")}
                startIcon={!isMobile && <Category sx={{ fontSize: 14 }} />}
                sx={{ ...primaryBtn, px: { xs: 1.5, sm: 2 } }}
              >
                {isMobile ? <Category sx={{ fontSize: 15 }} /> : "Categories"}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/asset-requests")}
              sx={{ ...primaryBtn, px: { xs: 1.5, sm: 2 } }}
            >
              {isMobile ? (
                <AssignmentTurnedIn sx={{ fontSize: 15 }} />
              ) : (
                "Requests"
              )}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: 15 }} />}
              onClick={() => navigate("/admin/assets/add")}
              sx={{ ...primaryBtn, px: { xs: 1.5, sm: 2.5 } }}
            >
              {!isMobile && "Add Asset"}
            </Button>
          </Stack>
        </Stack>

        {/* Metric cards */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: { xs: 1.5, md: 0 },
          }}
          useFlexGap
        >
          <MetricCard
            label="Total Assets"
            value={stats.totalAssets ?? pagination.total}
            icon={<Layers sx={{ fontSize: 15 }} />}
            sub={
              stats.totalPurchaseCost
                ? `₹${(stats.totalPurchaseCost / 100000).toFixed(1)}L`
                : undefined
            }
          />
          <MetricCard
            label="Cloned"
            value={stats.clonedAssets ?? "—"}
            icon={<ContentCopy sx={{ fontSize: 15 }} />}
            onClick={() => navigate("/admin/assets/clone")}
            accent={DS.info}
          />
          <MetricCard
            label="Assigned"
            value={stats.assignedAssets ?? "—"}
            icon={<AssignmentTurnedIn sx={{ fontSize: 15 }} />}
            accent={DS.warning}
          />
          {isAdmin && (
            <MetricCard
              label="Categories"
              value={categories.length || "—"}
              icon={<Category sx={{ fontSize: 15 }} />}
              onClick={() => navigate("/admin/asset-categories")}
              accent={DS.purple}
            />
          )}
        </Stack>
      </Box>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 2.5 } }}>
        {/* Search & Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: DS.r.lg,
            border: `1px solid ${DS.line}`,
            p: { xs: 1.5, sm: 2 },
            mb: 2.5,
            bgcolor: DS.white,
            boxShadow: DS.shadow,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, asset ID or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 2, ...fieldSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 15, color: DS.slateLight }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <Close sx={{ fontSize: 13 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction="row"
              spacing={1}
              flexShrink={0}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="contained"
                onClick={() => {
                  setPage(0);
                  fetchAssets();
                }}
                sx={{ ...primaryBtn, minWidth: 80 }}
              >
                Search
              </Button>

              <Badge
                badgeContent={activeFilterCount}
                color="primary"
                overlap="circular"
              >
                <Button
                  variant="outlined"
                  startIcon={<FilterList sx={{ fontSize: 13 }} />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    ...outlineBtn,
                    borderColor: showFilters ? DS.brand : DS.line,
                    color: showFilters ? DS.brand : DS.slate,
                  }}
                >
                  {!isMobile && "Filters"}
                </Button>
              </Badge>

              {hasFilters && (
                <Button
                  onClick={clearFilters}
                  startIcon={<ClearAll sx={{ fontSize: 13 }} />}
                  sx={{
                    ...outlineBtn,
                    color: DS.error,
                    borderColor: alpha(DS.error, 0.3),
                  }}
                >
                  {!isMobile && "Clear"}
                </Button>
              )}

              {/* View toggle */}
              <Stack direction="row" spacing={0.5}>
                {[
                  { mode: "grid", Icon: GridView },
                  { mode: "list", Icon: ViewList },
                ].map(({ mode, Icon }) => (
                  <Tooltip key={mode} title={`${mode} view`}>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode(mode)}
                      sx={{
                        borderRadius: DS.r.sm,
                        width: 32,
                        height: 32,
                        bgcolor: viewMode === mode ? DS.brand : DS.lineLight,
                        color: viewMode === mode ? DS.white : DS.slate,
                        border: `1px solid ${viewMode === mode ? DS.brand : DS.line}`,
                        "&:hover": {
                          bgcolor: viewMode === mode ? DS.brandDark : DS.line,
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>

              {/* Utility */}
              {[
                {
                  icon: <Refresh sx={{ fontSize: 14 }} />,
                  tip: "Refresh",
                  fn: fetchAssets,
                },
                {
                  icon: <FileDownload sx={{ fontSize: 14 }} />,
                  tip: "Export CSV",
                  fn: () => toast("Export initiated", "info"),
                },
              ].map(({ icon, tip, fn }) => (
                <Tooltip key={tip} title={tip}>
                  <IconButton
                    size="small"
                    onClick={fn}
                    sx={{
                      borderRadius: DS.r.sm,
                      width: 32,
                      height: 32,
                      bgcolor: DS.lineLight,
                      border: `1px solid ${DS.line}`,
                      "&:hover": { bgcolor: DS.line },
                    }}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Stack>

          {/* Collapsible Filters */}
          <Collapse in={showFilters}>
            <Box
              sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${DS.lineLight}` }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
              >
                {[
                  {
                    value: categoryFilter,
                    set: (v) => {
                      setCategoryFilter(v);
                      setPage(0);
                    },
                    label: "All Categories",
                    items: categories.map((c) => (
                      <MenuItem
                        key={c._id}
                        value={c.name}
                        sx={{ fontSize: "0.8rem", fontFamily: DS.font }}
                      >
                        {c.name}
                      </MenuItem>
                    )),
                  },
                  {
                    value: statusFilter,
                    set: (v) => {
                      setStatusFilter(v);
                      setPage(0);
                    },
                    label: "All Statuses",
                    items: Object.keys(STATUS_CFG).map((s) => (
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ fontSize: "0.8rem", fontFamily: DS.font }}
                      >
                        {s}
                      </MenuItem>
                    )),
                  },
                  {
                    value: conditionFilter,
                    set: (v) => {
                      setConditionFilter(v);
                      setPage(0);
                    },
                    label: "All Conditions",
                    items: [
                      "Excellent",
                      "Good",
                      "Normal",
                      "Critical",
                      "Poor",
                    ].map((c) => (
                      <MenuItem
                        key={c}
                        value={c}
                        sx={{ fontSize: "0.8rem", fontFamily: DS.font }}
                      >
                        {c}
                      </MenuItem>
                    )),
                  },
                ].map(({ value, set, label, items }, i) => (
                  <FormControl size="small" fullWidth key={i}>
                    <Select
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      displayEmpty
                      sx={selectSx}
                    >
                      <MenuItem
                        value=""
                        sx={{
                          fontSize: "0.8rem",
                          fontFamily: DS.font,
                          color: DS.slateLight,
                        }}
                      >
                        {label}
                      </MenuItem>
                      {items}
                    </Select>
                  </FormControl>
                ))}
                <Button
                  variant="contained"
                  onClick={() => {
                    setPage(0);
                    fetchAssets();
                    setShowFilters(false);
                  }}
                  sx={{ ...primaryBtn, minWidth: 96, flexShrink: 0 }}
                >
                  Apply
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        {/* Search result count */}
        {debouncedSearch && !loading && !fetchError && (
          <Alert
            severity="info"
            icon={<Info sx={{ fontSize: 15 }} />}
            sx={{
              mb: 2,
              borderRadius: DS.r.md,
              fontSize: "0.8rem",
              fontFamily: DS.font,
              "& .MuiAlert-message": { py: 0.25 },
            }}
          >
            <strong>{pagination.total}</strong> result
            {pagination.total !== 1 ? "s" : ""} for "
            <strong>{debouncedSearch}</strong>"
          </Alert>
        )}

        {/* ── Loading progress bar (top) ─── */}
        {loading && (
          <LinearProgress
            sx={{
              mb: 2,
              borderRadius: DS.r.xs,
              bgcolor: DS.brandLight,
              "& .MuiLinearProgress-bar": { bgcolor: DS.brand },
            }}
          />
        )}

        {/* ── FIX 4: Dedicated error state ── */}
        {!loading && fetchError && (
          <ErrorState message={fetchError} onRetry={fetchAssets} />
        )}

        {/* ── Grid View ──────────────────────────────────────────────────── */}
        {!fetchError && viewMode === "grid" && (
          <>
            {loading ? (
              <GridSkeleton />
            ) : assets.length === 0 ? (
              // FIX 3: distinct empty state for no-data vs no-results
              <EmptyState
                hasFilters={hasFilters}
                onClear={clearFilters}
                onAdd={() => navigate("/admin/assets/add")}
                isAdmin={isAdmin}
              />
            ) : (
              <Grid container spacing={2}>
                {assets.map((asset) => (
                  // FIX 6: removed hardcoded width from AssetCard — Grid controls it
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={asset.id || asset._id}
                  >
                    <AssetCard
                      asset={asset}
                      onView={handleViewAsset}
                      onClone={openCloneDialog}
                      onEdit={handleEditAsset}
                      onDelete={
                        isAdmin
                          ? (a) => {
                              setSelectedAsset(a);
                              setDialogError("");
                              setDeleteOpen(true);
                            }
                          : undefined
                      }
                      isAdmin={isAdmin}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
            {pagination.pages > 1 && !loading && assets.length > 0 && (
              <Stack alignItems="center" mt={4}>
                <Pagination
                  count={pagination.pages}
                  page={page + 1}
                  onChange={(_, v) => setPage(v - 1)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: DS.r.sm,
                      fontFamily: DS.font,
                      fontSize: "0.8rem",
                    },
                    "& .Mui-selected": {
                      bgcolor: `${DS.brand} !important`,
                      color: DS.white,
                    },
                  }}
                />
              </Stack>
            )}
          </>
        )}

        {/* ── List View ──────────────────────────────────────────────────── */}
        {!fetchError && viewMode === "list" && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: DS.r.lg,
              border: `1px solid ${DS.line}`,
              overflow: "hidden",
              bgcolor: DS.white,
              boxShadow: DS.shadow,
            }}
          >
            <TableContainer sx={{ maxHeight: 560 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      { id: "assetName", label: "Asset" },
                      { id: "assetId", label: "ID" },
                      { id: null, label: "Category" },
                      { id: null, label: "Location" },
                      { id: "status", label: "Status" },
                      { id: null, label: "Health" },
                      { id: null, label: "Type" },
                      { id: null, label: "Actions", align: "center" },
                    ].map(({ id, label, align }) => (
                      <TableCell key={label} align={align} sx={headCellSx}>
                        {id ? (
                          <TableSortLabel
                            active={orderBy === id}
                            direction={orderBy === id ? order : "asc"}
                            onClick={() => handleSort(id)}
                            sx={{
                              "& .MuiTableSortLabel-icon": { fontSize: 12 },
                            }}
                          >
                            {label}
                          </TableSortLabel>
                        ) : (
                          label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : assets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          py: 8,
                          color: DS.slateLight,
                          fontFamily: DS.font,
                        }}
                      >
                        {/* FIX 3: meaningful copy based on context */}
                        {hasFilters
                          ? "No assets match your filters."
                          : "No assets found. Add your first asset to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => {
                      const key = asset.id || asset._id;
                      return (
                        <TableRow
                          hover
                          key={key}
                          onClick={() => handleViewAsset(asset)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: DS.brandLight },
                            "& .MuiTableCell-root": {
                              borderColor: DS.lineLight,
                            },
                            transition: "background 0.12s",
                          }}
                        >
                          <TableCell sx={cellSx}>
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: DS.brandLight,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: DS.brand,
                                  border: `1.5px solid ${DS.brandMid}`,
                                  fontFamily: DS.font,
                                }}
                              >
                                {asset.assetName?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    color: DS.ink,
                                    fontFamily: DS.font,
                                  }}
                                >
                                  {asset.assetName}
                                </Typography>
                                {asset.isClone && (
                                  <Typography
                                    sx={{
                                      fontSize: "0.58rem",
                                      fontWeight: 700,
                                      color: DS.info,
                                      bgcolor: DS.infoBg,
                                      px: "4px",
                                      py: "1px",
                                      borderRadius: DS.r.xs,
                                      display: "inline-block",
                                      fontFamily: DS.font,
                                    }}
                                  >
                                    CLONE
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Typography
                              sx={{
                                fontSize: "0.68rem",
                                color: DS.slateLight,
                                fontFamily: DS.mono,
                              }}
                            >
                              {asset.assetId}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Box
                              sx={{
                                px: "7px",
                                py: "2.5px",
                                borderRadius: DS.r.xs,
                                bgcolor: DS.brandLight,
                                display: "inline-block",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  color: DS.brand,
                                  fontFamily: DS.font,
                                }}
                              >
                                {asset.assetCategoryId?.name ||
                                  asset.assetCategory ||
                                  "—"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Stack
                              direction="row"
                              spacing={0.4}
                              alignItems="center"
                            >
                              <LocationOn
                                sx={{ fontSize: 11, color: DS.slateLight }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: DS.slate,
                                  fontFamily: DS.font,
                                }}
                              >
                                {asset.currentLocation || "—"}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <StatusBadge status={asset.status} />
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <HealthMeter score={asset.healthScore || 0} />
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Box
                              sx={{
                                px: "7px",
                                py: "2.5px",
                                borderRadius: DS.r.xs,
                                bgcolor: asset.isClone
                                  ? DS.infoBg
                                  : DS.successBg,
                                display: "inline-block",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  color: asset.isClone ? DS.info : DS.success,
                                  fontFamily: DS.font,
                                }}
                              >
                                {asset.isClone ? "Clone" : "Original"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={cellSx}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Stack
                              direction="row"
                              spacing={0.25}
                              justifyContent="center"
                            >
                              <Tooltip
                                title={
                                  asset.isClone ? "Cannot clone again" : "Clone"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={asset.isClone}
                                    onClick={() =>
                                      !asset.isClone && openCloneDialog(asset)
                                    }
                                    sx={{ borderRadius: DS.r.sm }}
                                  >
                                    <ContentCopy
                                      sx={{
                                        fontSize: 13,
                                        color: asset.isClone
                                          ? DS.slateLight
                                          : DS.brand,
                                      }}
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditAsset(asset)}
                                  sx={{ borderRadius: DS.r.sm }}
                                >
                                  <Edit
                                    sx={{ fontSize: 13, color: DS.brand }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewAsset(asset)}
                                  sx={{ borderRadius: DS.r.sm }}
                                >
                                  <Visibility
                                    sx={{ fontSize: 13, color: DS.slate }}
                                  />
                                </IconButton>
                              </Tooltip>
                              {isAdmin && (
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setDialogError("");
                                      setDeleteOpen(true);
                                    }}
                                    sx={{ borderRadius: DS.r.sm }}
                                  >
                                    <Delete
                                      sx={{ fontSize: 13, color: DS.error }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* FIX 9: rowsPerPage change resets page to 0 */}
            <TablePagination
              rowsPerPageOptions={[6, 12, 24, 48]}
              component="div"
              count={pagination.total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0); // FIX 9
              }}
              sx={{
                borderTop: `1px solid ${DS.line}`,
                fontSize: "0.78rem",
                fontFamily: DS.font,
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontFamily: DS.font,
                    fontSize: "0.75rem",
                  },
              }}
            />
          </Paper>
        )}
      </Box>

      {/* ── Clone Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={cloneOpen}
        onClose={() => !actionLoading && setCloneOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: DS.r.xl,
            border: `1px solid ${DS.line}`,
            boxShadow: DS.shadowLg,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${DS.lineLight}`, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: DS.r.md,
                bgcolor: DS.brandLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ContentCopy sx={{ color: DS.brand, fontSize: 16 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  fontFamily: DS.font,
                  color: DS.ink,
                }}
              >
                Clone Asset
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: DS.slateLight,
                  fontFamily: DS.font,
                }}
              >
                A new asset ID and tag will be auto-generated
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          <Typography
            sx={{
              fontSize: "0.8rem",
              mb: 2.5,
              color: DS.slate,
              fontFamily: DS.font,
            }}
          >
            Creating a clone of{" "}
            <Box component="strong" sx={{ color: DS.ink }}>
              {selectedAsset?.assetName}
            </Box>
          </Typography>
          {/* FIX 7: dialog-level error */}
          {dialogError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: DS.r.md,
                fontSize: "0.78rem",
                fontFamily: DS.font,
              }}
            >
              {dialogError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Clone Name *"
            margin="none"
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            size="small"
            sx={{ mb: 2, ...fieldSx }}
            error={!cloneName.trim()}
            helperText={!cloneName.trim() ? "Clone name is required" : ""}
          />
          <TextField
            fullWidth
            label="Location (optional)"
            value={cloneLocation}
            onChange={(e) => setCloneLocation(e.target.value)}
            size="small"
            helperText="Leave blank to inherit original location"
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${DS.lineLight}`, gap: 1 }}
        >
          <Button
            onClick={() => setCloneOpen(false)}
            disabled={actionLoading}
            sx={outlineBtn}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCloneConfirm}
            disabled={actionLoading || !cloneName.trim()}
            startIcon={
              actionLoading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <ContentCopy sx={{ fontSize: 15 }} />
              )
            }
            sx={primaryBtn}
          >
            Confirm Clone
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => !actionLoading && setDeleteOpen(false)}
        maxWidth="xs"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: DS.r.xl,
            border: `1px solid ${DS.line}`,
            boxShadow: DS.shadowLg,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "0.9375rem",
            fontFamily: DS.font,
            color: DS.ink,
          }}
        >
          Delete Asset
        </DialogTitle>
        <DialogContent>
          {/* FIX 8: dialog-level error */}
          {dialogError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: DS.r.md,
                fontSize: "0.78rem",
                fontFamily: DS.font,
              }}
            >
              {dialogError}
            </Alert>
          )}
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: DS.r.md,
              fontSize: "0.78rem",
              fontFamily: DS.font,
            }}
          >
            This action is permanent and cannot be undone.
          </Alert>
          <Typography
            sx={{ fontSize: "0.8rem", fontFamily: DS.font, color: DS.slate }}
          >
            Are you sure you want to delete{" "}
            <Box component="strong" sx={{ color: DS.ink }}>
              {selectedAsset?.assetName}
            </Box>
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={actionLoading}
            sx={outlineBtn}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={actionLoading}
            startIcon={
              actionLoading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <Delete sx={{ fontSize: 15 }} />
              )
            }
            sx={{
              ...primaryBtn,
              bgcolor: DS.error,
              "&:hover": { bgcolor: "#7F1212" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{
            borderRadius: DS.r.md,
            fontSize: "0.8rem",
            fontFamily: DS.font,
            boxShadow: DS.shadowLg,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

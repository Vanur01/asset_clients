// src/pages/CloneAssets.jsx
// ── Card-Based Design · Clean UI · Clone Functionality ──────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Stack,
  Tooltip,
  Avatar,
  LinearProgress,
  Paper,
  Grid,
  Fade,
  Card,
  CardContent,
  CardActions,
  alpha,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAsset } from "../context/AssetContext";
import { useAuth } from "../context/AuthContexts";
import {
  ArrowBack,
  Search,
  LocationOn,
  ContentCopy,
  Visibility,
  Inventory2Outlined,
  CheckCircle,
  Cancel,
  CategoryOutlined,
  DirectionsCar,
  Computer,
  Weekend,
  ElectricalServices,
  Refresh,
  ClearAll,
  Person,
  ErrorOutline,
  Close,
  FilterList,
  Star,
  InfoOutlined,
  AutoAwesome,
  Build,
} from "@mui/icons-material";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#f0f4f8",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  border: "#e2e8f0",
  text: {
    primary: "#1e293b",
    secondary: "#64748b",
    muted: "#94a3b8",
  },
  primary: "#145a66",
  primaryDark: "#0b4049",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#6366f1",
  radius: { sm: "8px", md: "12px", lg: "16px" },
  shadow: "0 1px 3px rgba(0,0,0,0.1)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease",
};

// ── Helper Functions ─────────────────────────────────────────────────────────
const getCategoryIcon = (category = "") => {
  const c = category.toLowerCase();
  if (c.includes("vehicle") || c.includes("car"))
    return <DirectionsCar sx={{ fontSize: 20 }} />;
  if (c.includes("computer") || c.includes("it") || c.includes("laptop"))
    return <Computer sx={{ fontSize: 20 }} />;
  if (c.includes("furniture")) return <Weekend sx={{ fontSize: 20 }} />;
  if (c.includes("electrical"))
    return <ElectricalServices sx={{ fontSize: 20 }} />;
  if (c.includes("machinery") || c.includes("equipment"))
    return <Build sx={{ fontSize: 20 }} />;
  return <Inventory2Outlined sx={{ fontSize: 20 }} />;
};

const getCategoryColor = (category = "") => {
  const c = category.toLowerCase();
  if (c.includes("vehicle") || c.includes("car")) return "#10b981";
  if (c.includes("computer") || c.includes("it")) return "#3b82f6";
  if (c.includes("furniture")) return "#f59e0b";
  if (c.includes("electrical")) return "#ef4444";
  if (c.includes("machinery")) return "#8b5cf6";
  return "#6366f1";
};

const getStatusConfig = (status = "") => {
  const key = status.toLowerCase().replace(/\s+/g, "");
  const configs = {
    active: {
      bg: "#dcfce7",
      color: "#15803d",
      icon: CheckCircle,
      label: "Active",
    },
    operational: {
      bg: "#dcfce7",
      color: "#15803d",
      icon: CheckCircle,
      label: "Operational",
    },
    retired: {
      bg: "#fee2e2",
      color: "#b91c1c",
      icon: Cancel,
      label: "Retired",
    },
    maintenance: {
      bg: "#fce7f3",
      color: "#be185d",
      icon: Build,
      label: "Maintenance",
    },
    inmaintenance: {
      bg: "#fce7f3",
      color: "#be185d",
      icon: Build,
      label: "In Maintenance",
    },
    intransit: {
      bg: "#e0f2fe",
      color: "#0369a1",
      icon: LocationOn,
      label: "In Transit",
    },
    reserved: {
      bg: "#f3e8ff",
      color: "#7e22ce",
      icon: Person,
      label: "Reserved",
    },
  };
  return (
    configs[key] || {
      bg: "#f1f5f9",
      color: "#64748b",
      icon: InfoOutlined,
      label: status || "Unknown",
    }
  );
};

const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <Chip
      icon={<Icon sx={{ fontSize: 12 }} />}
      label={config.label}
      size="small"
      sx={{
        height: 24,
        borderRadius: T.radius.sm,
        fontWeight: 600,
        fontSize: "0.7rem",
        bgcolor: config.bg,
        color: config.color,
      }}
    />
  );
};

const HealthScore = ({ score }) => {
  const color = score >= 70 ? T.success : score >= 40 ? T.warning : T.error;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(color, 0.15),
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 2 },
        }}
      />
      <Typography fontSize="0.7rem" fontWeight={700} color={color}>
        {score}%
      </Typography>
    </Stack>
  );
};

// ── Asset Card Component ─────────────────────────────────────────────────────
const AssetCard = ({ asset, onClone, isAdmin, getCreatorName }) => {
  const categoryColor = getCategoryColor(asset.assetCategory);
  const canClone = !asset.isClone && asset.status?.toLowerCase() !== "retired";
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: T.radius.lg,
        border: `1px solid ${T.border}`,
        transition: T.transition,
        height: "100%",
        width: "365px",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: T.shadowMd,
          borderColor: alpha(T.primary, 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1 }}>
        {/* Header with Icon and Type */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              borderRadius: T.radius.md,
              bgcolor: alpha(categoryColor, 0.1),
              color: categoryColor,
            }}
          >
            {getCategoryIcon(asset.assetCategory)}
          </Avatar>
          <Chip
            icon={
              asset.isClone ? (
                <ContentCopy sx={{ fontSize: 10 }} />
              ) : (
                <Star sx={{ fontSize: 10 }} />
              )
            }
            label={asset.isClone ? "Clone" : "Original"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.65rem",
              fontWeight: 600,
              bgcolor: asset.isClone
                ? alpha(T.info, 0.1)
                : alpha(T.success, 0.1),
              color: asset.isClone ? T.info : T.success,
            }}
          />
        </Stack>

        {/* Asset Name and ID */}
        <Typography
          variant="h6"
          fontWeight={700}
          fontSize="1rem"
          color={T.text.primary}
          mb={0.5}
        >
          {asset.assetName}
        </Typography>
        <Typography
          fontSize="0.7rem"
          color={T.text.muted}
          fontFamily="monospace"
          mb={1.5}
        >
          ID: {asset.assetId}
        </Typography>

        {/* Category and Location */}
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1.5}>
          <Chip
            label={asset.assetCategory || "Uncategorized"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 500,
              bgcolor: alpha(categoryColor, 0.1),
              color: categoryColor,
            }}
          />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LocationOn sx={{ fontSize: 12, color: T.text.muted }} />
            <Typography fontSize="0.7rem" color={T.text.secondary}>
              {asset.currentLocation || "—"}
            </Typography>
          </Stack>
        </Stack>

        {/* Status and Health */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <StatusBadge status={asset.status} />
          <HealthScore score={asset.healthScore || 0} />
        </Stack>

        {/* Created By (Admin only) */}
        {isAdmin && asset.createdBy && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mt={1}
            pt={1}
            borderTop={`1px solid ${T.border}`}
          >
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.65rem",
                bgcolor: alpha(T.primary, 0.1),
                color: T.primary,
              }}
            >
              {getCreatorName(asset).charAt(0).toUpperCase()}
            </Avatar>
            <Typography fontSize="0.7rem" color={T.text.secondary}>
              Created by: {getCreatorName(asset)}
            </Typography>
          </Stack>
        )}
      </CardContent>

      {/* <CardActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={() => navigate(`/admin/assets/view/${asset._id}`)}
          sx={{
            textTransform: "none",
            borderRadius: T.radius.sm,
            borderColor: T.border,
            color: T.text.secondary,
            "&:hover": { borderColor: T.primary, color: T.primary },
          }}
        >
          View
        </Button>
        {canClone && (
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<ContentCopy />}
            onClick={() => onClone(asset)}
            sx={{
              textTransform: "none",
              borderRadius: T.radius.sm,
              bgcolor: T.primary,
              "&:hover": { bgcolor: T.primaryDark },
            }}
          >
            Clone
          </Button>
        )}
      </CardActions> */}
    </Card>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function CloneAssets() {
  const navigate = useNavigate();
  const {
    assets,
    getAllAssets,
    cloneAsset,
    loading: assetLoading,
  } = useAsset();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isTeam = user?.role === "team";

  // State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cloning, setCloning] = useState(false);
  const [cloneNote, setCloneNote] = useState("");
  const [cloneSuffix, setCloneSuffix] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats, setStats] = useState({
    total: 0,
    cloneable: 0,
    clones: 0,
    categories: 0,
  });

  const toast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    try {
      await getAllAssets({ limit: 1000, isClone: true });
    } catch (err) {
      toast(err.message || "Failed to fetch assets", "error");
    }
  }, [getAllAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Calculate stats
  useEffect(() => {
    if (assets?.length) {
      const cloneableAssets = assets.filter(
        (a) => !a.isClone && a.status?.toLowerCase() !== "retired",
      );
      setStats({
        total: assets.length,
        cloneable: cloneableAssets.length,
        clones: assets.filter((a) => a.isClone).length,
        categories: new Set(assets.map((a) => a.assetCategory).filter(Boolean))
          .size,
      });
    }
  }, [assets]);

  // Check if asset can be cloned
  const canCloneAsset = (asset) => {
    if (!asset) return false;
    const retiredStatuses = ["retired", "inactive", "decommissioned"];
    return (
      !asset.isClone && !retiredStatuses.includes(asset.status?.toLowerCase())
    );
  };

  // Handle clone click
  const handleCloneClick = (asset) => {
    if (!canCloneAsset(asset)) {
      toast(
        asset.isClone
          ? "Clone assets cannot be cloned again"
          : "This asset cannot be cloned",
        "warning",
      );
      return;
    }
    setSelectedAsset(asset);
    setCloneSuffix(`_copy`);
    setCloneNote(
      `Cloned from "${asset.assetName}" on ${new Date().toLocaleString()}`,
    );
    setCloneDialogOpen(true);
  };

  // Confirm clone
  const confirmClone = async () => {
    if (!selectedAsset) return;
    setCloning(true);
    try {
      const newName = cloneSuffix
        ? `${selectedAsset.assetName}${cloneSuffix}`
        : `${selectedAsset.assetName}_copy`;
      const res = await cloneAsset(selectedAsset._id, {
        cloneNote: cloneNote.trim(),
        assetName: newName,
      });
      if (res?.success !== false) {
        toast(`"${selectedAsset.assetName}" cloned successfully!`, "success");
        setCloneDialogOpen(false);
        setSelectedAsset(null);
        await fetchAssets();
      } else {
        throw new Error(res?.message || "Failed to clone");
      }
    } catch (err) {
      toast(err.message || "Failed to clone asset", "error");
    } finally {
      setCloning(false);
    }
  };

  // Get creator name
  const getCreatorName = (asset) => {
    if (asset.createdBy?.firstName)
      return `${asset.createdBy.firstName} ${asset.createdBy.lastName || ""}`.trim();
    return asset.createdBy?.email?.split("@")[0] || "System";
  };

  // Get unique filters
  const allCategories = [
    "All",
    ...new Set((assets || []).map((a) => a.assetCategory).filter(Boolean)),
  ];
  const allStatuses = [
    "All",
    "Active",
    "In Maintenance",
    "Operational",
    "Reserved",
    "In Transit",
  ];

  // Filter assets
  const filteredAssets = (assets || []).filter((asset) => {
    const matchesSearch =
      asset.assetName?.toLowerCase().includes(search.toLowerCase()) ||
      asset.assetId?.toLowerCase().includes(search.toLowerCase()) ||
      asset.currentLocation?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || asset.assetCategory === category;
    const matchesStatus = status === "All" || asset.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: T.primary,
          color: "white",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 2, sm: 3 },
          position: "sticky",
          top: 0,
          zIndex: 100,
          marginLeft: "42px",
          borderRadius: 2,
          width: "1140px",
          boxShadow: T.shadow,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate("/admin/assets")}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                borderRadius: T.radius.md,
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Clone Assets
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {isTeam
                  ? "View and clone available assets"
                  : "Create copies of existing assets"}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={fetchAssets}
            disabled={assetLoading}
            sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }}
          >
            {assetLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3} sx={{ width: "270px" }}>
            <Paper sx={{ p: 2, borderRadius: T.radius.lg, bgcolor: T.surface }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    fontSize="0.7rem"
                    fontWeight={600}
                    color={T.text.muted}
                  >
                    Total Assets
                  </Typography>
                  <Typography fontSize="1.5rem" fontWeight={800}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar
                  sx={{ bgcolor: alpha(T.primary, 0.1), color: T.primary }}
                >
                  <Inventory2Outlined />
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ width: "270px" }}>
            <Paper sx={{ p: 2, borderRadius: T.radius.lg, bgcolor: T.surface }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    fontSize="0.7rem"
                    fontWeight={600}
                    color={T.text.muted}
                  >
                    Cloneable
                  </Typography>
                  <Typography fontSize="1.5rem" fontWeight={800}>
                    {stats.cloneable}
                  </Typography>
                </Box>
                <Avatar
                  sx={{ bgcolor: alpha(T.success, 0.1), color: T.success }}
                >
                  <ContentCopy />
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ width: "270px" }}>
            <Paper sx={{ p: 2, borderRadius: T.radius.lg, bgcolor: T.surface }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    fontSize="0.7rem"
                    fontWeight={600}
                    color={T.text.muted}
                  >
                    Clones Created
                  </Typography>
                  <Typography fontSize="1.5rem" fontWeight={800}>
                    {stats.clones}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(T.info, 0.1), color: T.info }}>
                  <AutoAwesome />
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ width: "270px" }}>
            <Paper sx={{ p: 2, borderRadius: T.radius.lg, bgcolor: T.surface }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    fontSize="0.7rem"
                    fontWeight={600}
                    color={T.text.muted}
                  >
                    Categories
                  </Typography>
                  <Typography fontSize="1.5rem" fontWeight={800}>
                    {stats.categories}
                  </Typography>
                </Box>
                <Avatar
                  sx={{ bgcolor: alpha(T.warning, 0.1), color: T.warning }}
                >
                  <CategoryOutlined />
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: T.radius.lg,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, ID, or location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: T.text.muted }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <Close fontSize="small" />
                  </IconButton>
                ),
                sx: { borderRadius: T.radius.md },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                displayEmpty
              >
                {allCategories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                displayEmpty
              >
                {allStatuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(search || category !== "All" || status !== "All") && (
              <Button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setStatus("All");
                  setPage(1);
                }}
                startIcon={<ClearAll />}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Assets Grid */}
        {assetLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton
                  variant="rounded"
                  height={280}
                  sx={{ borderRadius: T.radius.lg }}
                />
              </Grid>
            ))}
          </Grid>
        ) : paginatedAssets.length === 0 ? (
          <Paper sx={{ textAlign: "center", py: 8, borderRadius: T.radius.lg }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                bgcolor: alpha(T.primary, 0.1),
                color: T.primary,
              }}
            >
              <ErrorOutline sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography fontWeight={600} gutterBottom>
              No assets found
            </Typography>
            <Typography fontSize="0.8rem" color={T.text.muted}>
              {search || category !== "All" || status !== "All"
                ? "Try adjusting your filters"
                : "Create assets first to start cloning"}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2.5}>
              {paginatedAssets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset._id}>
                  <AssetCard
                    asset={asset}
                    onClone={handleCloneClick}
                    isAdmin={isAdmin}
                    getCreatorName={getCreatorName}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": { borderRadius: T.radius.sm },
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Clone Dialog */}
      <Dialog
        open={cloneDialogOpen}
        onClose={() => !cloning && setCloneDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: alpha(T.primary, 0.1), color: T.primary }}>
              <ContentCopy />
            </Avatar>
            <Box>
              <Typography fontWeight={700}>Clone Asset</Typography>
              <Typography fontSize="0.75rem" color={T.text.muted}>
                Create a new independent copy
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                bgcolor: T.surfaceAlt,
                borderRadius: T.radius.md,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: alpha(
                      getCategoryColor(selectedAsset.assetCategory),
                      0.1,
                    ),
                    color: getCategoryColor(selectedAsset.assetCategory),
                  }}
                >
                  {getCategoryIcon(selectedAsset.assetCategory)}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {selectedAsset.assetName}
                  </Typography>
                  <Typography fontSize="0.7rem" color={T.text.muted}>
                    ID: {selectedAsset.assetId}
                  </Typography>
                </Box>
                <StatusBadge status={selectedAsset.status} />
              </Stack>
            </Paper>
          )}

          <TextField
            fullWidth
            size="small"
            label="Clone Name Suffix (optional)"
            value={cloneSuffix}
            onChange={(e) => setCloneSuffix(e.target.value)}
            sx={{ mb: 2 }}
            helperText={`Preview: ${selectedAsset?.assetName || "Asset"}${cloneSuffix}`}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Clone Note (optional)"
            value={cloneNote}
            onChange={(e) => setCloneNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCloneDialogOpen(false)} disabled={cloning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmClone}
            disabled={cloning}
            startIcon={
              cloning ? <CircularProgress size={16} /> : <ContentCopy />
            }
            sx={{ bgcolor: T.primary, "&:hover": { bgcolor: T.primaryDark } }}
          >
            {cloning ? "Cloning..." : "Confirm Clone"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: T.radius.md }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

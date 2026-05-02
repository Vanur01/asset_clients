// AssetManagement.jsx - Fully Responsive with consistent design
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Pagination,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  LinearProgress,
  useMediaQuery,
  useTheme,
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
  Cancel,
  Warning,
  AssignmentTurnedIn,
  Schedule,
  Settings,
  Close,
  ClearAll,
  FileDownload,
  RateReview,
  ArrowBack,
} from "@mui/icons-material";
import { useAsset } from "../context/AssetContext";
import { useAuth } from "../context/AuthContexts";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// ─── Consistent Palette ───────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e8f2f5",
  success: "#16a34a",
  successBg: "#dcfce7",
  surface: "#f1f4f8",
  card: "#ffffff",
  border: "#e2e8f0",
  error: "#d32f2f",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  text: { primary: "#1e293b", secondary: "#64748b", disabled: "#94a3b8" },
};

// ─── Status Configuration ─────────────────────────────────────────────────
const statusConfig = {
  Active: {
    bg: C.successBg,
    color: C.success,
    icon: <CheckCircle sx={{ fontSize: 12 }} />,
  },
  "In Maintenance": {
    bg: "#dbeafe",
    color: "#1d4ed8",
    icon: <Settings sx={{ fontSize: 12 }} />,
  },
  Retired: {
    bg: "#f1f5f9",
    color: C.text.disabled,
    icon: <Cancel sx={{ fontSize: 12 }} />,
  },
  "In Transit": {
    bg: "#fef3c7",
    color: "#d97706",
    icon: <Schedule sx={{ fontSize: 12 }} />,
  },
  Reserved: {
    bg: "#e0f2fe",
    color: "#0891b2",
    icon: <AssignmentTurnedIn sx={{ fontSize: 12 }} />,
  },
  "Under Repair": {
    bg: "#ffebea",
    color: C.error,
    icon: <Warning sx={{ fontSize: 12 }} />,
  },
};

const StatusChip = ({ status }) => {
  const cfg = statusConfig[status] || {
    bg: "#f1f5f9",
    color: C.text.secondary,
    icon: null,
  };
  return (
    <Chip
      label={status}
      size="small"
      icon={cfg.icon}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: "0.72rem",
        height: 24,
        borderRadius: "20px",
        "& .MuiChip-icon": { fontSize: 14, color: cfg.color },
      }}
    />
  );
};

// ─── Asset Card Component ─────────────────────────────────────────────────
const AssetCard = ({ asset, onView, onClone }) => (
  <Paper
    elevation={0}
    sx={{
      border: `1px solid ${C.border}`,
      borderRadius: 3,
      p: 2.5,
      height: "100%",
      bgcolor: C.card,
      width:"365px",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
      "&:hover": {
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        transform: "translateY(-2px)",
      },
    }}
    onClick={() => onView(asset)}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={1}
    >
      <Typography
        fontWeight={700}
        fontSize="0.95rem"
        color={C.text.primary}
        sx={{ flex: 1, mr: 1 }}
      >
        {asset.assetName}
      </Typography>
      <StatusChip status={asset.status} />
    </Stack>

    <Typography fontSize="0.7rem" color={C.text.disabled} mb={1.5}>
      ID: {asset.assetId}
    </Typography>

    <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
      <LocationOn sx={{ fontSize: 14, color: C.text.disabled }} />
      <Typography fontSize="0.75rem" color={C.text.secondary} noWrap>
        {asset.currentLocation || "No location specified"}
      </Typography>
    </Stack>

    <Divider sx={{ mb: 2, borderColor: C.border }} />

    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between">
        <Typography fontSize="0.7rem" color={C.text.disabled}>
          Category:
        </Typography>
        <Typography fontSize="0.75rem" fontWeight={600} color={C.text.primary}>
          {asset.assetCategory}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography fontSize="0.7rem" color={C.text.disabled}>
          Condition:
        </Typography>
        <Typography fontSize="0.75rem" fontWeight={600} color={C.text.primary}>
          {asset.assetCondition || "N/A"}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography fontSize="0.7rem" color={C.text.disabled}>
          Purchase Cost:
        </Typography>
        <Typography fontSize="0.75rem" fontWeight={600} color={C.primary}>
          {asset.purchaseCost
            ? `$${asset.purchaseCost.toLocaleString()}`
            : "N/A"}
        </Typography>
      </Stack>
      {asset.healthScore && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontSize="0.7rem" color={C.text.disabled}>
            Health Score:
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={asset.healthScore}
              sx={{ width: 60, height: 4, borderRadius: 2 }}
              color={
                asset.healthScore > 70
                  ? "success"
                  : asset.healthScore > 40
                    ? "warning"
                    : "error"
              }
            />
            <Typography fontSize="0.75rem" fontWeight={600}>
              {asset.healthScore}%
            </Typography>
          </Box>
        </Stack>
      )}
    </Stack>

    <Stack
      direction="row"
      spacing={1}
      sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${C.border}` }}
    >
      <Tooltip title="Clone Asset">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClone(asset);
          }}
          sx={{ bgcolor: C.surface, "&:hover": { bgcolor: C.border } }}
        >
          <ContentCopy sx={{ fontSize: "0.9rem", color: C.text.secondary }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onView(asset);
          }}
          sx={{ bgcolor: C.surface, "&:hover": { bgcolor: C.border } }}
        >
          <Visibility sx={{ fontSize: "0.9rem", color: C.text.secondary }} />
        </IconButton>
      </Tooltip>
    </Stack>
  </Paper>
);

export default function AssetManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const { assets, pagination, getAllAssets, cloneAsset } = useAsset();

  const handleAssetRequests = () => {
    const userRole = user?.role;
    if (userRole === "admin") {
      navigate("/admin/asset-requests");
    } else if (userRole === "team") {
      navigate("/admin/my-requests");
    } else {
      navigate("/admin/asset-requests");
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, rowsPerPage, orderBy, order, category, status, condition]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        assetCategory: category || undefined,
        status: status || undefined,
        assetCondition: condition || undefined,
        search: search || undefined,
      };
      await getAllAssets(filters);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch assets",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchAssets();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCloneAsset = async () => {
    if (!selectedAsset) return;
    setLoading(true);
    try {
      const cloneData = {
        assetName: `${selectedAsset.assetName} (Clone)`,
        description: selectedAsset.description,
        currentLocation: selectedAsset.currentLocation,
        status: "Active",
      };
      const result = await cloneAsset(selectedAsset._id, cloneData);
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: "Asset cloned successfully",
          severity: "success",
        });
        await fetchAssets();
        setCloneDialogOpen(false);
        setSelectedAsset(null);
      } else {
        throw new Error(result?.message || "Failed to clone asset");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to clone asset",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCloneDialog = (asset) => {
    setSelectedAsset(asset);
    setCloneDialogOpen(true);
  };

  const handleViewAsset = (asset) => {
    const userRole = user?.role;
    if (userRole === "team") {
      navigate(`/team/assets/view/${asset._id}`);
    } else {
      navigate(`/admin/assets/view/${asset._id}`);
    }
  };

  const handleAddAsset = () => {
    const userRole = user?.role;
    if (userRole === "team") {
      navigate("/team/assets/add");
    } else {
      navigate("/admin/assets/add");
    }
  };

  const handleExportToExcel = () => {
    const exportData = assets.map((asset) => ({
      "Asset ID": asset.assetId,
      "Asset Name": asset.assetName,
      Category: asset.assetCategory,
      Status: asset.status,
      Condition: asset.assetCondition,
      Location: asset.currentLocation,
      "Serial Number": asset.serialNumber,
      "Purchase Cost": asset.purchaseCost,
      "Health Score": asset.healthScore,
      "Created At": new Date(asset.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");
    XLSX.writeFile(
      wb,
      `assets_export_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    setSnackbar({
      open: true,
      message: "Export completed successfully",
      severity: "success",
    });
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const clearFilters = () => {
    setCategory("");
    setStatus("");
    setCondition("");
    setSearch("");
    setPage(0);
    setTimeout(() => fetchAssets(), 100);
  };

  const userRole = user?.role;
  const isTeamUser = userRole === "team";
  const isAdminUser = userRole === "admin" || userRole === "super_admin";

  // Responsive grid sizing
  const getGridSize = () => {
    if (isMobile) return 12;
    if (isTablet) return 6;
    return 3;
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography
            fontWeight={700}
            fontSize={{ xs: "1.25rem", sm: "1.35rem" }}
            color={C.text.primary}
          >
            Asset Management
          </Typography>
          <Typography fontSize="0.75rem" color={C.text.secondary} mt={0.5}>
            Track and manage your assets and equipment • {pagination.total || 0}{" "}
            total assets
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<ContentCopy sx={{ fontSize: "1rem" }} />}
            onClick={() =>
              navigate(
                isAdminUser ? "/admin/assets/clone" : "/team/assets/clone",
              )
            }
            sx={{
              bgcolor: C.primary,
              fontSize: "0.75rem",
              textTransform: "none",
              borderRadius: 2,
              py: 0.8,
            }}
          >
            {!isMobile && "Clone Asset"}
          </Button>
          {(isAdminUser || isTeamUser) && (
            <Button
              variant="outlined"
              startIcon={<RateReview sx={{ fontSize: "1rem" }} />}
              onClick={handleAssetRequests}
              sx={{
                borderColor: C.primary,
                color: C.primary,
                fontSize: "0.75rem",
                textTransform: "none",
                borderRadius: 2,
                py: 0.8,
              }}
            >
              {!isMobile && "Requests"}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: "1rem" }} />}
            onClick={handleAddAsset}
            sx={{
              bgcolor: C.primary,
              fontSize: "0.75rem",
              textTransform: "none",
              borderRadius: 2,
              py: 0.8,
            }}
          >
            {!isMobile && "Add Asset"}
          </Button>
        </Stack>
      </Stack>

      {/* Search & Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${C.border}`,
          borderRadius: 3,
          p: 2,
          mb: 3,
          bgcolor: C.card,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search by asset name, ID, or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ flex: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: "1rem", color: C.text.disabled }} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <Close sx={{ fontSize: "0.9rem" }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { fontSize: "0.75rem" },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            size="small"
            sx={{ bgcolor: C.primary, minWidth: 80, fontSize: "0.75rem" }}
          >
            Search
          </Button>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 130 } }}>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              {[
                "Equipment",
                "IT",
                "Vehicle",
                "Machinery",
                "Tool",
                "Furniture",
                "Electrical",
              ].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 120 } }}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.keys(statusConfig).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 120 } }}>
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Conditions</MenuItem>
              {["Excellent", "Normal", "Critical", "Poor"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(category || status || condition || search) && (
            <Button
              size="small"
              onClick={clearFilters}
              startIcon={<ClearAll />}
              sx={{ fontSize: "0.7rem" }}
            >
              Clear
            </Button>
          )}

          <Tooltip title="Export to Excel">
            <IconButton
              onClick={handleExportToExcel}
              size="small"
              sx={{ bgcolor: C.surface, borderRadius: 2 }}
            >
              <FileDownload
                sx={{ fontSize: "1rem", color: C.text.secondary }}
              />
            </IconButton>
          </Tooltip>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Grid View">
              <IconButton
                size="small"
                onClick={() => setViewMode("grid")}
                sx={{
                  bgcolor: viewMode === "grid" ? C.primary : "transparent",
                  color: viewMode === "grid" ? "#fff" : C.text.secondary,
                  borderRadius: 2,
                }}
              >
                <GridView sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton
                size="small"
                onClick={() => setViewMode("list")}
                sx={{
                  bgcolor: viewMode === "list" ? C.primary : "transparent",
                  color: viewMode === "list" ? "#fff" : C.text.secondary,
                  borderRadius: 2,
                }}
              >
                <ViewList sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton
                variant="rounded"
                height={320}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && (
        <>
          <Grid container spacing={2.5}>
            {assets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset._id}>
                <AssetCard
                  asset={asset}
                  onView={handleViewAsset}
                  onClone={openCloneDialog}
                />
              </Grid>
            ))}
          </Grid>
          {assets.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography color={C.text.disabled} fontSize="0.85rem">
                No assets found matching your filters.
              </Typography>
              <Button onClick={clearFilters} sx={{ mt: 2, color: C.primary }}>
                Clear Filters
              </Button>
            </Box>
          )}
        </>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && (
        <Paper
          sx={{
            width: "100%",
            overflow: "auto",
            borderRadius: 3,
            border: `1px solid ${C.border}`,
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: C.surface,
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "assetName"}
                      direction={orderBy === "assetName" ? order : "asc"}
                      onClick={() => handleSort("assetName")}
                    >
                      Asset Name
                    </TableSortLabel>
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: C.surface,
                      }}
                    >
                      Asset ID
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: C.surface,
                    }}
                  >
                    Category
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: C.surface,
                      }}
                    >
                      Location
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: C.surface,
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: C.surface,
                    }}
                  >
                    Health
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: C.surface,
                    }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow
                    hover
                    key={asset._id}
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleViewAsset(asset)}
                  >
                    <TableCell>
                      <Typography
                        fontWeight={600}
                        fontSize="0.8rem"
                        color={C.text.primary}
                      >
                        {asset.assetName}
                      </Typography>
                      {isMobile && (
                        <Typography fontSize="0.65rem" color={C.text.disabled}>
                          {asset.assetId}
                        </Typography>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ fontSize: "0.75rem" }}>
                        {asset.assetId}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={asset.assetCategory}
                        size="small"
                        sx={{ fontSize: "0.65rem", height: 22 }}
                      />
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <LocationOn
                            sx={{ fontSize: 12, color: C.text.disabled }}
                          />
                          <Typography
                            fontSize="0.7rem"
                            noWrap
                            sx={{ maxWidth: 120 }}
                          >
                            {asset.currentLocation || "N/A"}
                          </Typography>
                        </Stack>
                      </TableCell>
                    )}
                    <TableCell>
                      <StatusChip status={asset.status} />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={asset.healthScore || 0}
                          sx={{ width: 40, height: 3, borderRadius: 2 }}
                        />
                        <Typography fontSize="0.7rem">
                          {asset.healthScore || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Clone">
                        <IconButton
                          size="small"
                          onClick={() => openCloneDialog(asset)}
                        >
                          <ContentCopy sx={{ fontSize: "0.9rem" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination.total || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* Pagination for Grid View */}
      {!loading && viewMode === "grid" && pagination.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={page + 1}
            onChange={(e, value) => setPage(value - 1)}
            color="primary"
          />
        </Box>
      )}

      {/* Clone Dialog */}
      <Dialog
        open={cloneDialogOpen}
        onClose={() => setCloneDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ fontSize: "1rem", fontWeight: 700, color: C.text.primary }}
        >
          Confirm Clone
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ fontSize: "0.8rem", color: C.text.secondary }}
          >
            Are you sure you want to clone "{selectedAsset?.assetName}"? A new
            asset will be created with similar properties.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCloneDialogOpen(false)}
            sx={{ fontSize: "0.75rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCloneAsset}
            variant="contained"
            sx={{ bgcolor: C.primary, fontSize: "0.75rem" }}
          >
            Clone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ fontSize: "0.75rem", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

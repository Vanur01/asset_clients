// pages/AssetView.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  InputAdornment,
  CircularProgress,
  Avatar,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset } from "../context/AssetContext";

import {
  ArrowBack,
  Edit,
  Delete,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Person,
  Search,
  CheckCircle,
  Schedule,
  Warning,
  Link as LinkIcon,
  Add,
  Close,
  Inventory2,
  Category,
  VerifiedUser,
  Image as ImageIcon,
} from "@mui/icons-material";

// ── Styled Components ──────────────────────────────────────────────────────────

const StatusChip = styled(Chip)(({ statusvalue }) => ({
  borderRadius: "20px",
  fontWeight: 600,
  fontSize: "12px",
  padding: "2px 4px",
  ...(statusvalue === "Active" && { backgroundColor: "#e8f5e9", color: "#2e7d32" }),
  ...(statusvalue === "operational" && { backgroundColor: "#e8f5e9", color: "#2e7d32" }),
  ...(statusvalue === "In Maintenance" && { backgroundColor: "#fff3e0", color: "#ed6c02" }),
  ...(statusvalue === "Retired" && { backgroundColor: "#ffebee", color: "#d32f2f" }),
  ...(statusvalue === "In Transit" && { backgroundColor: "#e3f2fd", color: "#0288d1" }),
  ...(statusvalue === "Reserved" && { backgroundColor: "#f3e5f5", color: "#7b1fa2" }),
}));

const CriticalChip = styled(Chip)(() => ({
  borderRadius: "20px",
  fontWeight: 600,
  fontSize: "12px",
  padding: "2px 4px",
  backgroundColor: "#fce4ec",
  color: "#c62828",
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  border: "1px solid #eef0f4",
  borderRadius: 16,
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
}));

const InfoItem = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        bgcolor: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="#1a1a2e">
        {value || "N/A"}
      </Typography>
    </Box>
  </Stack>
);

const InspectionCard = ({ icon, label, value, color }) => (
  <Paper
    sx={{
      borderRadius: 3,
      p: 2.5,
      border: "1px solid #eef0f4",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      flex: 1,
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
    <Typography variant="body1" fontWeight={700} color="#1a1a2e">
      {value || "N/A"}
    </Typography>
  </Paper>
);

// ── Asset Selection Item ───────────────────────────────────────────────────────

const AssetSelectItem = ({ asset, selected, onToggle }) => (
  <Paper
    onClick={() => onToggle(asset._id)}
    sx={{
      p: 2,
      borderRadius: 2,
      border: selected ? "2px solid #1a3a4a" : "1px solid #e8eaed",
      bgcolor: selected ? "#f0f4f8" : "#fff",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": { borderColor: "#1a3a4a", bgcolor: "#f7f9fc" },
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {asset.assetName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {asset.assetId}
        </Typography>
        <Stack direction="row" spacing={1} mt={0.5}>
          {asset.assetCategory && (
            <Chip label={asset.assetCategory} size="small" sx={{ height: 18, fontSize: 10 }} />
          )}
          {asset.currentLocation && (
            <Typography variant="caption" color="text.secondary">
              {asset.currentLocation}
            </Typography>
          )}
        </Stack>
      </Box>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: selected ? "none" : "2px solid #ccc",
          bgcolor: selected ? "#1a3a4a" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected && <CheckCircle sx={{ color: "#fff", fontSize: 18 }} />}
      </Box>
    </Stack>
  </Paper>
);

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AssetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssetById, deleteAsset, linkChildAssets, getAllAssets } = useAsset();

  const [asset, setAsset] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkTab, setLinkTab] = useState(0); // 0 = Link Existing, 1 = Add New
  const [availableAssets, setAvailableAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedChildAssets, setSelectedChildAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [linking, setLinking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchAssetDetails();
    fetchAvailableAssets();
  }, [id]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredAssets(
      availableAssets.filter(
        (a) =>
          a.assetName?.toLowerCase().includes(q) ||
          a.assetId?.toLowerCase().includes(q) ||
          a.assetCategory?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, availableAssets]);

  const fetchAssetDetails = async () => {
    setPageLoading(true);
    try {
      const response = await getAssetById(id);
      if (response && response.success !== false) {
        const assetData = response.asset || response.data || response;
        setAsset(assetData);
      } else {
        showSnackbar("Asset not found", "error");
        navigate("/admin/assets");
      }
    } catch (error) {
      showSnackbar("Failed to fetch asset details", "error");
    } finally {
      setPageLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const response = await getAllAssets({ limit: 100 });
      if (response?.assets) {
        const filtered = response.assets.filter((a) => a._id !== id);
        setAvailableAssets(filtered);
        setFilteredAssets(filtered);
      }
    } catch (error) {
      console.error("Error fetching available assets:", error);
    }
  };

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleToggleSelect = (assetId) => {
    setSelectedChildAssets((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleLinkAssets = async () => {
    if (selectedChildAssets.length === 0) {
      showSnackbar("Please select at least one asset to link", "warning");
      return;
    }
    setLinking(true);
    try {
      const result = await linkChildAssets(id, selectedChildAssets);
      if (result.success) {
        showSnackbar(`${selectedChildAssets.length} asset(s) linked successfully!`);
        setLinkDialogOpen(false);
        setSelectedChildAssets([]);
        fetchAssetDetails();
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Failed to link assets", "error");
    } finally {
      setLinking(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAsset(id);
      showSnackbar("Asset deleted successfully!");
      setDeleteDialogOpen(false);
      setTimeout(() => navigate("/admin/assets"), 1500);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to delete asset",
        "error"
      );
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const getImageUrl = () => {
    if (!asset?.assetImages?.length) return null;
    const primary = asset.assetImages.find((img) => img.isPrimary) || asset.assetImages[0];
    if (!primary?.name) return null;
    return `https://assset-management-backend-4.onrender.com/uploads/assets/${primary.name}`;
  };

  const getLastInspection = () => {
    const histories = [
      ...(asset?.inspectionSystems?.amcInspection?.inspectionHistory || []),
      ...(asset?.inspectionSystems?.camcInspection?.inspectionHistory || []),
    ];
    if (!histories.length) return null;
    const sorted = histories.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0]?.date ? new Date(sorted[0].date).toLocaleDateString() : null;
  };

  const getDaysUntilDue = () => {
    if (!asset?.warrantyExpiry) return null;
    const diff = Math.ceil(
      (new Date(asset.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? `${diff} days` : "Overdue";
  };

  if (pageLoading) {
    return (
      <Box sx={{ p: 4, bgcolor: "#f7f8fc", minHeight: "100vh" }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!asset) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Asset not found</Typography>
        <Button onClick={() => navigate("/admin/assets")} sx={{ mt: 2 }}>
          Back to Assets
        </Button>
      </Box>
    );
  }

  const imageUrl = getImageUrl();
  const primaryUser = asset.assignedUsers?.primaryUser;
  const secondaryUser = asset.assignedUsers?.secondaryUser;
  const custodian = asset.assignedUsers?.custodian;

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      {/* ── Header ── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={() => navigate("/admin/assets")}
            sx={{ bgcolor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                {asset.assetName}
              </Typography>
              <StatusChip
                label={asset.status?.toLowerCase() === "active" ? "operational" : asset.status}
                statusvalue={asset.status?.toLowerCase() === "active" ? "operational" : asset.status}
                size="small"
              />
              <CriticalChip label="Critical" size="small" />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Serial: {asset.serialNumber || "N/A"}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={() => setLinkDialogOpen(true)}
            sx={{
              bgcolor: "#1a3a4a",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0f2836" },
            }}
          >
            Link Assets
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/admin/assets/edit/${id}`)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Edit Asset
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {/* ── Body ── */}
      <Grid container spacing={3}>
        {/* Left – Image + Health Score */}
        <Grid item xs={12} md={4}>
          <InfoCard sx={{ p: 0, overflow: "hidden" }}>
            {/* Asset Image */}
            <Box
              sx={{
                width: "300px",
                height: 300,
                bgcolor: "#eef0f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={asset.assetName}
                  onError={() => setImageError(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Stack alignItems="center" spacing={1} color="text.secondary">
                  <ImageIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                  <Typography variant="caption">No Image Available</Typography>
                </Stack>
              )}
            </Box>

            {/* Health Score */}
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Health Score
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={
                    asset.healthScore >= 70
                      ? "success.main"
                      : asset.healthScore >= 40
                      ? "warning.main"
                      : "error.main"
                  }
                >
                  {asset.healthScore || 0}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={asset.healthScore || 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#e8eaed",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor:
                      asset.healthScore >= 70
                        ? "#1a3a4a"
                        : asset.healthScore >= 40
                        ? "#ed6c02"
                        : "#d32f2f",
                  },
                }}
              />
            </Box>
          </InfoCard>
        </Grid>

        {/* Right – Info */}
        <Grid item xs={12} md={8} sx={{width:"810px"}}>
          {/* Asset Information */}
          <InfoCard sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1a1a2e" mb={3}>
              Asset Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<Category fontSize="small" sx={{ color: "#6b7280" }} />}
                  label="Category"
                  value={asset.assetCategory}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<LocationOn fontSize="small" sx={{ color: "#6b7280" }} />}
                  label="Location"
                  value={asset.currentLocation}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<Person fontSize="small" sx={{ color: "#6b7280" }} />}
                  label="Assigned To"
                  value={
                    primaryUser || secondaryUser
                      ? [
                          primaryUser
                            ? `${primaryUser.email || primaryUser}`
                            : null,
                          secondaryUser
                            ? `${secondaryUser.email || secondaryUser}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join("\n")
                      : "Unassigned"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<CalendarToday fontSize="small" sx={{ color: "#6b7280" }} />}
                  label="Purchase Date"
                  value={
                    asset.commissioningDate
                      ? new Date(asset.commissioningDate).toLocaleDateString()
                      : asset.commissioningDate
                      ? new Date(asset.commissioningDate).toLocaleDateString()
                      : "N/A"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<VerifiedUser fontSize="small" sx={{ color: "#6b7280" }} />}
                  label="Custodian"
                  value={custodian?.name || custodian || "N/A"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<AttachMoney fontSize="small" sx={{ color: "#6b7280" }} />}
                  label="Purchase Cost"
                  value={
                    asset.purchaseCost
                      ? `$${asset.purchaseCost.toLocaleString()}`
                      : "N/A"
                  }
                />
              </Grid>
            </Grid>
          </InfoCard>

          {/* Inspection Cards */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
            <InspectionCard
              icon={<CheckCircle fontSize="small" />}
              label="Last Inspection"
              value={getLastInspection() || "N/A"}
              color="#4caf50"
            />
            <InspectionCard
              icon={<Schedule fontSize="small" />}
              label="Next Inspection"
              value={
                asset.inspectionSystems?.amcInspection?.enabled
                  ? asset.inspectionSystems.amcInspection.schedule || "Scheduled"
                  : "N/A"
              }
              color="#1976d2"
            />
            <InspectionCard
              icon={<Warning fontSize="small" />}
              label="Days Until Due"
              value={getDaysUntilDue() || "N/A"}
              color="#f59e0b"
            />
          </Stack>

          {/* Asset Hierarchy */}
          {(asset.parentAsset || (asset.childAssets && asset.childAssets.length > 0)) && (
            <InfoCard>
              <Typography variant="subtitle1" fontWeight={700} color="#1a1a2e" mb={2}>
                Asset Hierarchy
              </Typography>
              {asset.parentAsset && (
                <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f6fa", borderRadius: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight={600}>
                    Parent Asset
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {asset.parentAsset.assetName || "Parent Asset"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {asset.parentAsset.assetId || asset.parentAsset}
                      </Typography>
                    </Box>
                    {asset.parentAsset._id && (
                      <Button size="small" onClick={() => navigate(`/admin/assets/view/${asset.parentAsset._id}`)}>
                        View
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}
              {asset.childAssets?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Child Assets ({asset.childAssets.length})
                  </Typography>
                  <Stack spacing={1}>
                    {asset.childAssets.map((child, index) => (
                      <Paper key={child._id || index} sx={{ p: 2, bgcolor: "#fafbfc", borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {child.assetName || "Child Asset"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {child.assetId || "N/A"} | Status: {child.status || "N/A"}
                            </Typography>
                          </Box>
                          {child._id && (
                            <Button size="small" onClick={() => navigate(`/admin/assets/view/${child._id}`)}>
                              View
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </InfoCard>
          )}
        </Grid>
      </Grid>

      {/* ── Link Assets Dialog ── */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => { setLinkDialogOpen(false); setSelectedChildAssets([]); setSearchQuery(""); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Inventory2 fontSize="small" />
              <Typography fontWeight={700}>Link Child Assets</Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={() => { setLinkDialogOpen(false); setSelectedChildAssets([]); setSearchQuery(""); }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* Tab Toggle */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              bgcolor: "#f5f6fa",
              borderRadius: 2,
              p: 0.5,
              gap: 0.5,
            }}
          >
            {["Link Existing", "Add New Assets"].map((label, i) => (
              <Box
                key={label}
                onClick={() => setLinkTab(i)}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: linkTab === i ? "#fff" : "transparent",
                  boxShadow: linkTab === i ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  transition: "all 0.2s ease",
                }}
              >
                {i === 0 && <Search fontSize="small" sx={{ fontSize: 14, color: linkTab === i ? "#1a3a4a" : "#6b7280" }} />}
                {i === 1 && <Add fontSize="small" sx={{ fontSize: 14, color: linkTab === i ? "#1a3a4a" : "#6b7280" }} />}
                <Typography
                  variant="body2"
                  fontWeight={linkTab === i ? 600 : 500}
                  color={linkTab === i ? "#1a3a4a" : "#6b7280"}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <DialogContent sx={{ pt: 0 }}>
          {linkTab === 0 ? (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, mb: 2 },
                }}
                sx={{ mb: 2 }}
              />
              <Stack spacing={1.5} sx={{ maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
                {filteredAssets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No assets found
                  </Typography>
                ) : (
                  filteredAssets.map((a) => (
                    <AssetSelectItem
                      key={a._id}
                      asset={a}
                      selected={selectedChildAssets.includes(a._id)}
                      onToggle={handleToggleSelect}
                    />
                  ))
                )}
              </Stack>
              {selectedChildAssets.length > 0 && (
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  {selectedChildAssets.length} asset{selectedChildAssets.length > 1 ? "s" : ""} selected
                </Typography>
              )}
            </>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Use the asset creation form to add and link a new asset.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}
                onClick={() => navigate("/admin/assets/create")}
              >
                Create New Asset
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => { setLinkDialogOpen(false); setSelectedChildAssets([]); setSearchQuery(""); }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          {linkTab === 0 && (
            <Button
              onClick={handleLinkAssets}
              variant="contained"
              disabled={linking || selectedChildAssets.length === 0}
              sx={{
                bgcolor: "#1a3a4a",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "#0f2836" },
              }}
            >
              {linking ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                `Link (${selectedChildAssets.length}) Assets`
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 360 } }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "#ffebee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Delete sx={{ color: "#d32f2f", fontSize: 18 }} />
            </Box>
            <Typography fontWeight={700}>Delete Asset</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>"{asset.assetName}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, minWidth: 100 }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
// pages/EditAsset.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed version with proper error handling and data loading
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  InputAdornment,
  Autocomplete,
  Switch,
  FormControlLabel,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset } from "../context/AssetContext";
import {
  ArrowBack,
  Save,
  CloudUpload,
  Add,
  Close,
  Image as ImageIcon,
  Inventory2,
  LocationOn,
  Person,
  AttachMoney,
  CalendarToday,
  Build,
  Computer,
  DirectionsCar,
  Factory,
  Settings,
  CheckCircle,
  Info,
  StarOutline,
  Star,
  ExpandMore,
  ExpandLess,
  Delete,
} from "@mui/icons-material";

// ── Constants ─────────────────────────────────────────────────────────────────
const ASSET_CATEGORIES = [
  "Electronics",
  "Furniture",
  "Vehicle",
  "Machinery",
  "IT Assets",
  "Material Handling",
  "Facility Management",
  "Rotating Machinery",
  "Transportation",
  "Garbage Management",
  "Other",
];
const STATUS_OPTIONS = [
  "Active",
  "In Maintenance",
  "Retired",
  "In Transit",
  "Reserved",
];
const CONDITION_OPTIONS = ["Excellent", "Normal", "Poor", "Critical"];
const MHE_UTILIZATION = ["Active", "Idle", "Under Repair", "Decommissioned"];
const VEHICLE_TYPES = [
  "Truck",
  "Van",
  "Car",
  "Motorcycle",
  "Forklift",
  "Crane",
  "Other",
];
const HEALTH_STATUS = ["Green", "Yellow", "Red"];
const FAULT_TYPES = [
  "Mechanical",
  "Electrical",
  "Hydraulic",
  "Pneumatic",
  "Structural",
  "Other",
];
const OS_PLATFORMS = ["Windows", "macOS", "Linux", "Android", "iOS", "Other"];
const LICENSE_STATUS = ["active", "expired", "trial"];
const PM_STATUS = ["Up to Date", "Overdue", "Scheduled"];
const MAINT_PRIORITY = ["Low", "Medium", "High", "Critical"];
const CONTAINER_SIZES = [
  "Small (120L)",
  "Medium (240L)",
  "Large (360L)",
  "Extra Large (660L+)",
];
const INSP_SCHEDULES = [
  "Daily",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
  "Quarterly",
  "Annually",
];
const API_HOST = "https://assset-management-backend-4.onrender.com";

// ── Styled helpers ────────────────────────────────────────────────────────────
const SectionCard = styled(Paper)(({ theme }) => ({
  border: "1px solid #eef0f4",
  borderRadius: 16,
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  marginBottom: theme.spacing(3),
}));

const FieldLabel = ({ children, required }) => (
  <Typography
    variant="caption"
    fontWeight={600}
    color="#374151"
    display="block"
    mb={0.5}
    sx={{
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      fontSize: "10px",
    }}
  >
    {children}
    {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
  </Typography>
);

const StyledTF = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    backgroundColor: "#fafbfc",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1a3a4a" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1a3a4a",
      borderWidth: 2,
    },
  },
});

const StyledSel = styled(Select)({
  borderRadius: 10,
  backgroundColor: "#fafbfc",
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1a3a4a" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#1a3a4a",
    borderWidth: 2,
  },
});

const SectionHeader = ({
  icon,
  title,
  subtitle,
  collapsible,
  collapsed,
  onToggle,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    mb={collapsed ? 0 : 3}
    sx={{ cursor: collapsible ? "pointer" : "default" }}
    onClick={collapsible ? onToggle : undefined}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: "#1a3a4a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { color: "#fff", fontSize: 18 } })}
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="#1a1a2e"
          lineHeight={1.2}
        >
          {title}
        </Typography>
        {subtitle && !collapsed && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
    {collapsible && (
      <IconButton size="small">
        {collapsed ? <ExpandMore /> : <ExpandLess />}
      </IconButton>
    )}
  </Stack>
);

// ── Image upload zone ─────────────────────────────────────────────────────────
const ImageZone = ({ images, onUpload, onRemove, onSetPrimary, uploading }) => {
  const ref = useRef();
  return (
    <Box>
      <Box
        onClick={() => ref.current?.click()}
        sx={{
          border: "2px dashed #d1d5db",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: "#fafbfc",
          transition: "all 0.2s",
          "&:hover": { borderColor: "#1a3a4a", bgcolor: "#f0f4f8" },
        }}
      >
        <input
          ref={ref}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => onUpload(Array.from(e.target.files))}
        />
        {uploading ? (
          <CircularProgress size={32} sx={{ color: "#1a3a4a" }} />
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 40, color: "#9ca3af", mb: 1 }} />
            <Typography variant="body2" fontWeight={600} color="#374151">
              Click to upload images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, WEBP up to 10MB each
            </Typography>
          </>
        )}
      </Box>

      {images.length > 0 && (
        <Grid container spacing={2} mt={2}>
          {images.map((img, idx) => (
            <Grid item xs={6} sm={4} md={3} key={img._id || idx}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: img.isPrimary
                    ? "2px solid #1a3a4a"
                    : "1px solid #e5e7eb",
                  height: 100,
                  bgcolor: "#f3f4f6",
                }}
              >
                <img
                  src={img.preview || `${API_HOST}/uploads/assets/${img.name}`}
                  alt={img.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                {img.isPrimary && (
                  <Chip
                    label="Primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      height: 18,
                      fontSize: 9,
                      bgcolor: "#1a3a4a",
                      color: "#fff",
                    }}
                  />
                )}
                <Stack
                  direction="row"
                  sx={{ position: "absolute", top: 4, right: 4, gap: 0.5 }}
                >
                  <Tooltip title="Set as primary">
                    <IconButton
                      size="small"
                      onClick={() => onSetPrimary(idx)}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        width: 22,
                        height: 22,
                      }}
                    >
                      {img.isPrimary ? (
                        <Star sx={{ fontSize: 13, color: "#f59e0b" }} />
                      ) : (
                        <StarOutline sx={{ fontSize: 13 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => onRemove(idx)}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        width: 22,
                        height: 22,
                      }}
                    >
                      <Close sx={{ fontSize: 13, color: "#ef4444" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// ── Safe date formatter ───────────────────────────────────────────────────────
const toDateInput = (val) => {
  if (!val) return "";
  // Handle MongoDB { $date: "..." }
  const raw = val && typeof val === "object" && val.$date ? val.$date : val;
  try {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// ── Safe value getter ─────────────────────────────────────────────────────────
const safeString = (val) => (val == null ? "" : String(val));
const safeNumber = (val) => (val == null || val === "" ? "" : String(val));
const safeBoolean = (val) => Boolean(val);
const safeArray = (val) => (Array.isArray(val) ? val : []);

// ── Main component ────────────────────────────────────────────────────────────
export default function EditAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const {
    getAssetById,
    createAsset,
    updateAsset,
    loading: assetLoading,
  } = useAsset();

  const [pageLoading, setPageLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [collapsed, setCollapsed] = useState({
    mhe: true,
    transportation: true,
    rotating: true,
    garbage: true,
    it: true,
    facility: true,
  });
  const toggle = (k) => setCollapsed((p) => ({ ...p, [k]: !p[k] }));

  // ── Initial blank form ────────────────────────────────────────────────────
  const BLANK = {
    assetName: "",
    description: "",
    serialNumber: "",
    tagNumber: "",
    assetCategory: "",
    currentLocation: "",
    status: "Active",
    assetCondition: "Normal",
    purchaseCost: "",
    currentValue: "",
    acquisitionDate: "",
    commissioningDate: "",
    warrantyExpiry: "",
    leaseExpiry: "",
    healthScore: 80,
    primaryUser: "",
    secondaryUser: "",
    custodian: "",
    streetAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    tags: [],
    notes: "",
    amcEnabled: false,
    amcSchedule: "Monthly",
    camcEnabled: false,
    camcSchedule: "Monthly",
    mheUtilization: "Active",
    engineRuntimeHours: "",
    safetyCertification: "",
    vehicleType: "Truck",
    driver: "",
    loadStatus: 50,
    healthStatusIndex: "Green",
    vibrationAlert: false,
    temperatureAlert: false,
    faultType: [],
    containerTypeSize: "Small (120L)",
    smartFillLevel: 50,
    osPlatform: [],
    softwareName: "",
    licenseStatus: "active",
    pmStatus: "Up to Date",
    maintenancePriority: "Medium",
    statusChangeReason: "",
  };

  const [form, setForm] = useState(BLANK);

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const showSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // ── Safe asset data extraction helper ───────────────────────────────────
  const extractAssetData = (response) => {
    // Try multiple possible response structures
    if (response && typeof response === "object") {
      // Direct asset object with assetName
      if (response.assetName !== undefined) return response;
      // Nested under asset property
      if (response.asset && response.asset.assetName !== undefined)
        return response.asset;
      // Nested under data property
      if (response.data && response.data.assetName !== undefined)
        return response.data;
      // Nested under data.asset
      if (
        response.data &&
        response.data.asset &&
        response.data.asset.assetName !== undefined
      )
        return response.data.asset;
      // Response from getAssetById might return { success: true, asset: {...} }
      if (response.success && response.asset) return response.asset;
    }
    return null;
  };

  // ── Load asset for edit ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;

    (async () => {
      setPageLoading(true);
      setLoadError(null);
      try {
        const resp = await getAssetById(id);

        if (!isMounted) return;

        // Extract asset data safely
        const assetData = extractAssetData(resp);

        if (!assetData) {
          console.error("Invalid asset data structure:", resp);
          throw new Error("Asset data not found in response");
        }

        // Safely extract values with fallbacks
        const extractedForm = {
          assetName: safeString(assetData.assetName),
          description: safeString(assetData.description),
          serialNumber: safeString(assetData.serialNumber),
          tagNumber: safeString(assetData.tagNumber),
          assetCategory: safeString(assetData.assetCategory),
          currentLocation: safeString(assetData.currentLocation),
          status: safeString(assetData.status) || "Active",
          assetCondition: safeString(assetData.assetCondition) || "Normal",
          purchaseCost: safeNumber(assetData.purchaseCost),
          currentValue: safeNumber(assetData.currentValue),
          acquisitionDate: toDateInput(assetData.acquisitionDate),
          commissioningDate: toDateInput(assetData.commissioningDate),
          warrantyExpiry: toDateInput(assetData.warrantyExpiry),
          leaseExpiry: toDateInput(assetData.leaseExpiry),
          healthScore:
            assetData.healthScore != null ? Number(assetData.healthScore) : 80,
          primaryUser: safeString(
            assetData.assignedUsers?.primaryUser?.name ??
              assetData.assignedUsers?.primaryUser,
          ),
          secondaryUser: safeString(
            assetData.assignedUsers?.secondaryUser?.name ??
              assetData.assignedUsers?.secondaryUser,
          ),
          custodian: safeString(
            assetData.assignedUsers?.custodian?.name ??
              assetData.assignedUsers?.custodian,
          ),
          streetAddress: safeString(
            assetData.customPhysicalAddress?.streetAddress,
          ),
          city: safeString(assetData.customPhysicalAddress?.city),
          stateProvince: safeString(
            assetData.customPhysicalAddress?.stateProvince,
          ),
          postalCode: safeString(assetData.customPhysicalAddress?.postalCode),
          country: safeString(assetData.customPhysicalAddress?.country),
          tags: safeArray(assetData.metadata?.tags),
          notes: safeString(assetData.metadata?.notes),
          amcEnabled: safeBoolean(
            assetData.inspectionSystems?.amcInspection?.enabled,
          ),
          amcSchedule:
            safeString(assetData.inspectionSystems?.amcInspection?.schedule) ||
            "Monthly",
          camcEnabled: safeBoolean(
            assetData.inspectionSystems?.camcInspection?.enabled,
          ),
          camcSchedule:
            safeString(assetData.inspectionSystems?.camcInspection?.schedule) ||
            "Monthly",
          mheUtilization:
            safeString(assetData.mhe?.utilizationStatus) || "Active",
          engineRuntimeHours: safeNumber(assetData.mhe?.engineRuntimeHours),
          safetyCertification: safeString(assetData.mhe?.safetyCertification),
          vehicleType:
            safeString(assetData.transportation?.vehicleType) || "Truck",
          driver: safeString(assetData.transportation?.driver),
          loadStatus: assetData.transportation?.loadStatus ?? 50,
          healthStatusIndex:
            safeString(assetData.rotatingMachinery?.healthStatusIndex) ||
            "Green",
          vibrationAlert: safeBoolean(
            assetData.rotatingMachinery?.vibrationAlert,
          ),
          temperatureAlert: safeBoolean(
            assetData.rotatingMachinery?.temperatureAlert,
          ),
          faultType: safeArray(assetData.rotatingMachinery?.faultType),
          containerTypeSize:
            safeString(assetData.garbageManagement?.containerTypeSize) ||
            "Small (120L)",
          smartFillLevel:
            assetData.garbageManagement?.smartStatusIoTFillLevel ?? 50,
          osPlatform: safeArray(assetData.itAssets?.osPlatform),
          softwareName: safeString(assetData.itAssets?.softwareName),
          licenseStatus:
            safeString(assetData.itAssets?.licenseStatus) || "active",
          pmStatus:
            safeString(assetData.facilityManagement?.pmStatus) || "Up to Date",
          maintenancePriority:
            safeString(assetData.facilityManagement?.maintenancePriority) ||
            "Medium",
          statusChangeReason: "",
        };

        // Set images safely
        const assetImages = safeArray(assetData.assetImages);
        setImages(assetImages);

        // Update form state
        setForm(extractedForm);
      } catch (err) {
        console.error("Error loading asset:", err);
        if (isMounted) {
          setLoadError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load asset",
          );
          showSnack("Failed to load asset data", "error");
          // Navigate back after short delay if loading fails
          setTimeout(() => navigate("/admin/assets"), 2000);
        }
      } finally {
        if (isMounted) setPageLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, navigate]);

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleImgUpload = (files) => {
    const previews = files.map((f, i) => ({
      name: f.name,
      isPrimary: images.length === 0 && i === 0,
      preview: URL.createObjectURL(f),
      file: f,
      isNew: true,
    }));
    setImages((p) => [...p, ...previews]);
    setNewFiles((p) => [...p, ...files]);
  };

  const handleImgRemove = (idx) => {
    const img = images[idx];
    if (img.preview) URL.revokeObjectURL(img.preview);
    setImages((p) => p.filter((_, i) => i !== idx));
    if (img.isNew) setNewFiles((p) => p.filter((f) => f.name !== img.name));
  };

  const handleImgPrimary = (idx) =>
    setImages((p) => p.map((img, i) => ({ ...img, isPrimary: i === idx })));

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.assetName?.trim()) e.assetName = "Asset name is required";
    if (!form.assetCategory) e.assetCategory = "Category is required";
    if (!form.status) e.status = "Status is required";
    if (form.purchaseCost && isNaN(Number(form.purchaseCost)))
      e.purchaseCost = "Must be a number";
    if (form.currentValue && isNaN(Number(form.currentValue)))
      e.currentValue = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build JSON payload ────────────────────────────────────────────────────
  const buildPayload = () => {
    const p = {
      assetName: form.assetName,
      description: form.description,
      assetCategory: form.assetCategory,
      currentLocation: form.currentLocation,
      status: form.status,
      assetCondition: form.assetCondition,
      healthScore: Number(form.healthScore),
    };
    if (form.serialNumber?.trim()) p.serialNumber = form.serialNumber;
    if (form.tagNumber?.trim()) p.tagNumber = form.tagNumber;
    if (form.purchaseCost !== "") p.purchaseCost = Number(form.purchaseCost);
    if (form.currentValue !== "") p.currentValue = Number(form.currentValue);
    if (isEdit && form.statusChangeReason?.trim())
      p.statusChangeReason = form.statusChangeReason;

    if (form.acquisitionDate) p.acquisitionDate = form.acquisitionDate;
    if (form.commissioningDate) p.commissioningDate = form.commissioningDate;
    if (form.warrantyExpiry) p.warrantyExpiry = form.warrantyExpiry;
    if (form.leaseExpiry) p.leaseExpiry = form.leaseExpiry;

    p.assignedUsers = {
      primaryUser: form.primaryUser || null,
      secondaryUser: form.secondaryUser || null,
      custodian: form.custodian || null,
    };

    p.customPhysicalAddress = {
      streetAddress: form.streetAddress,
      city: form.city,
      stateProvince: form.stateProvince,
      postalCode: form.postalCode,
      country: form.country,
    };

    p.metadata = { tags: form.tags, notes: form.notes };

    p.inspectionSystems = {
      amcInspection: { enabled: form.amcEnabled, schedule: form.amcSchedule },
      camcInspection: {
        enabled: form.camcEnabled,
        schedule: form.camcSchedule,
      },
    };

    p.mhe = {
      utilizationStatus: form.mheUtilization,
      engineRuntimeHours:
        form.engineRuntimeHours !== "" ? Number(form.engineRuntimeHours) : null,
      safetyCertification: form.safetyCertification,
    };

    p.transportation = {
      vehicleType: form.vehicleType,
      driver: form.driver,
      loadStatus: Number(form.loadStatus),
    };

    p.rotatingMachinery = {
      healthStatusIndex: form.healthStatusIndex,
      vibrationAlert: form.vibrationAlert,
      temperatureAlert: form.temperatureAlert,
      faultType: form.faultType,
    };

    p.garbageManagement = {
      containerTypeSize: form.containerTypeSize,
      smartStatusIoTFillLevel: Number(form.smartFillLevel),
    };

    p.itAssets = {
      osPlatform: form.osPlatform,
      softwareName: form.softwareName,
      licenseStatus: form.licenseStatus,
    };

    p.facilityManagement = {
      pmStatus: form.pmStatus,
      maintenancePriority: form.maintenancePriority,
    };

    return p;
  };

  // ── Upload images ─────────────────────────────────────────────────────────
  const uploadImages = async (assetId) => {
    if (!newFiles.length) return;
    const fd = new FormData();
    newFiles.forEach((f) => fd.append("images", f));
    const pri = images.findIndex((i) => i.isPrimary && i.isNew);
    if (pri >= 0) fd.append("primaryIndex", pri);
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    await fetch(`${API_HOST}/api/v1/asset/${assetId}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      showSnack("Please fix the errors before saving", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();

      if (isEdit) {
        const res = await updateAsset(id, payload);
        if (res && res.success !== false) {
          // Upload any new images
          if (newFiles.length) {
            setUploading(true);
            try {
              await uploadImages(id);
            } catch (err) {
              console.error("Image upload error:", err);
            } finally {
              setUploading(false);
            }
          }
          showSnack("Asset updated successfully!");
          setTimeout(() => navigate(`/admin/assets/view/${id}`), 1500);
        } else {
          throw new Error(res?.message || "Update failed");
        }
      } else {
        const res = await createAsset(payload);
        const newId =
          res?.data?._id || res?.data?.asset?._id || res?._id || null;
        if (newId && newFiles.length) {
          setUploading(true);
          try {
            await uploadImages(newId);
          } catch (err) {
            console.error("Image upload error:", err);
          } finally {
            setUploading(false);
          }
        }
        showSnack("Asset created successfully!");
        setTimeout(
          () =>
            navigate(newId ? `/admin/assets/view/${newId}` : "/admin/assets"),
          1500,
        );
      }
    } catch (err) {
      showSnack(
        err?.response?.data?.message || err?.message || "Failed to save asset",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Loading State ─────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f7f8fc", minHeight: "100vh" }}>
        <Skeleton
          variant="rectangular"
          height={56}
          sx={{ mb: 3, borderRadius: 2 }}
        />
        {[1, 2, 3].map((k) => (
          <Skeleton
            key={k}
            variant="rectangular"
            height={200}
            sx={{ mb: 3, borderRadius: 3 }}
          />
        ))}
      </Box>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ maxWidth: 500, mx: "auto" }}>
          <AlertTitle>Error Loading Asset</AlertTitle>
          {loadError}
        </Alert>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate("/admin/assets")}
        >
          Back to Assets
        </Button>
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f8fc", p: { xs: 2, md: 3 } }}>
      {/* ── Sticky top bar ── */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #eef0f4",
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          bgcolor: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={() =>
                navigate(isEdit ? `/admin/assets/view/${id}` : "/admin/assets")
              }
              sx={{ bgcolor: "#f5f6fa", borderRadius: 2 }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                color="#1a1a2e"
                lineHeight={1}
              >
                {isEdit ? "Edit Asset" : "Create New Asset"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEdit
                  ? `Editing: ${form.assetName || "Asset"}`
                  : "Fill in the details below"}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() =>
                navigate(isEdit ? `/admin/assets/view/${id}` : "/admin/assets")
              }
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <Save />
                )
              }
              onClick={handleSubmit}
              disabled={saving || uploading}
              sx={{
                bgcolor: "#1a3a4a",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "#0f2836" },
                minWidth: 130,
              }}
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Asset"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* ──── LEFT ──── */}
        <Grid item xs={12} lg={8}>
          {/* Basic Info */}
          <SectionCard>
            <SectionHeader
              icon={<Inventory2 />}
              title="Basic Information"
              subtitle="Core asset details"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <FieldLabel required>Asset Name</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.assetName}
                  onChange={(e) => set("assetName", e.target.value)}
                  error={!!errors.assetName}
                  helperText={errors.assetName}
                  placeholder="e.g. Forklift Model X-200"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FieldLabel>Tag Number</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.tagNumber}
                  onChange={(e) => set("tagNumber", e.target.value)}
                  placeholder="e.g. TAG-001"
                />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Description</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description of the asset…"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Category</FieldLabel>
                <FormControl
                  fullWidth
                  size="small"
                  error={!!errors.assetCategory}
                >
                  <StyledSel
                    value={form.assetCategory}
                    displayEmpty
                    onChange={(e) => set("assetCategory", e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      <em>Select category</em>
                    </MenuItem>
                    {ASSET_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </StyledSel>
                  {errors.assetCategory && (
                    <FormHelperText>{errors.assetCategory}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel>Serial Number</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.serialNumber}
                  onChange={(e) => set("serialNumber", e.target.value)}
                  placeholder="e.g. SN-2024-001"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Status</FieldLabel>
                <FormControl fullWidth size="small" error={!!errors.status}>
                  <StyledSel
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </StyledSel>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel>Condition</FieldLabel>
                <FormControl fullWidth size="small">
                  <StyledSel
                    value={form.assetCondition}
                    onChange={(e) => set("assetCondition", e.target.value)}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </StyledSel>
                </FormControl>
              </Grid>
              {isEdit && (
                <Grid item xs={12}>
                  <FieldLabel>Status Change Reason</FieldLabel>
                  <StyledTF
                    fullWidth
                    size="small"
                    value={form.statusChangeReason}
                    onChange={(e) => set("statusChangeReason", e.target.value)}
                    placeholder="e.g. Annual maintenance check (optional)"
                    helperText="Provide a reason if you are changing the status"
                  />
                </Grid>
              )}
            </Grid>
          </SectionCard>

          {/* Images */}
          <SectionCard>
            <SectionHeader
              icon={<ImageIcon />}
              title="Asset Images"
              subtitle="Upload one or more photos"
            />
            <ImageZone
              images={images}
              onUpload={handleImgUpload}
              onRemove={handleImgRemove}
              onSetPrimary={handleImgPrimary}
              uploading={uploading}
            />
          </SectionCard>

          {/* Location */}
          <SectionCard>
            <SectionHeader
              icon={<LocationOn />}
              title="Location"
              subtitle="Where the asset is stored"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <FieldLabel>Current Location</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.currentLocation}
                  onChange={(e) => set("currentLocation", e.target.value)}
                  placeholder="e.g. Warehouse A - Bay 3"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  mb={1}
                  display="block"
                >
                  Custom Physical Address (optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Street Address</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.streetAddress}
                  onChange={(e) => set("streetAddress", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FieldLabel>City</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FieldLabel>State / Province</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.stateProvince}
                  onChange={(e) => set("stateProvince", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <FieldLabel>Postal Code</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <FieldLabel>Country</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Assignment */}
          <SectionCard>
            <SectionHeader
              icon={<Person />}
              title="Assignment"
              subtitle="Users responsible for this asset"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <FieldLabel>Primary User</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.primaryUser}
                  onChange={(e) => set("primaryUser", e.target.value)}
                  placeholder="Primary member"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FieldLabel>Secondary User</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.secondaryUser}
                  onChange={(e) => set("secondaryUser", e.target.value)}
                  placeholder="Secondary member"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FieldLabel>Custodian</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  value={form.custodian}
                  onChange={(e) => set("custodian", e.target.value)}
                  placeholder="Custodian name"
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Inspection Systems */}
          <SectionCard>
            <SectionHeader
              icon={<CheckCircle />}
              title="Inspection Systems"
              subtitle="AMC & CAMC scheduling"
            />
            <Grid container spacing={2.5}>
              {[
                {
                  key: "amc",
                  label: "AMC Inspection",
                  en: "amcEnabled",
                  sch: "amcSchedule",
                },
                {
                  key: "cam",
                  label: "CAMC Inspection",
                  en: "camcEnabled",
                  sch: "camcSchedule",
                },
              ].map(({ key, label, en, sch }) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid #eef0f4",
                      bgcolor: form[en] ? "#f0f9ff" : "#fafbfc",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1.5}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {label}
                      </Typography>
                      <Switch
                        checked={form[en]}
                        size="small"
                        onChange={(e) => set(en, e.target.checked)}
                      />
                    </Stack>
                    {form[en] && (
                      <FormControl fullWidth size="small">
                        <FieldLabel>Schedule</FieldLabel>
                        <StyledSel
                          value={form[sch]}
                          onChange={(e) => set(sch, e.target.value)}
                        >
                          {INSP_SCHEDULES.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </StyledSel>
                      </FormControl>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </SectionCard>

          {/* ── Collapsible specialty sections ── */}
          {[
            {
              key: "mhe",
              icon: <Factory />,
              title: "MHE Details",
              subtitle: "Material Handling Equipment",
              content: (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Utilization Status</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.mheUtilization}
                        onChange={(e) => set("mheUtilization", e.target.value)}
                      >
                        {MHE_UTILIZATION.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Engine Runtime Hours</FieldLabel>
                    <StyledTF
                      fullWidth
                      size="small"
                      type="number"
                      value={form.engineRuntimeHours}
                      onChange={(e) =>
                        set("engineRuntimeHours", e.target.value)
                      }
                      placeholder="0"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Safety Certification</FieldLabel>
                    <StyledTF
                      fullWidth
                      size="small"
                      value={form.safetyCertification}
                      onChange={(e) =>
                        set("safetyCertification", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              ),
            },
            {
              key: "transportation",
              icon: <DirectionsCar />,
              title: "Transportation",
              subtitle: "Vehicle & transport details",
              content: (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Vehicle Type</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.vehicleType}
                        onChange={(e) => set("vehicleType", e.target.value)}
                      >
                        {VEHICLE_TYPES.map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Driver</FieldLabel>
                    <StyledTF
                      fullWidth
                      size="small"
                      value={form.driver}
                      onChange={(e) => set("driver", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Load Status (%)</FieldLabel>
                    <StyledTF
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      value={form.loadStatus}
                      onChange={(e) => set("loadStatus", e.target.value)}
                    />
                  </Grid>
                </Grid>
              ),
            },
            {
              key: "rotating",
              icon: <Settings />,
              title: "Rotating Machinery",
              subtitle: "Health & alerts for rotating equipment",
              content: (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Health Status Index</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.healthStatusIndex}
                        onChange={(e) =>
                          set("healthStatusIndex", e.target.value)
                        }
                      >
                        {HEALTH_STATUS.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Vibration Alert</FieldLabel>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.vibrationAlert}
                          size="small"
                          onChange={(e) =>
                            set("vibrationAlert", e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {form.vibrationAlert ? "Active" : "None"}
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Temperature Alert</FieldLabel>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.temperatureAlert}
                          size="small"
                          onChange={(e) =>
                            set("temperatureAlert", e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {form.temperatureAlert ? "Active" : "None"}
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FieldLabel>Fault Types</FieldLabel>
                    <Autocomplete
                      multiple
                      options={FAULT_TYPES}
                      value={form.faultType}
                      onChange={(_, v) => set("faultType", v)}
                      renderTags={(val, gtp) =>
                        val.map((o, i) => (
                          <Chip
                            key={o}
                            label={o}
                            size="small"
                            {...gtp({ index: i })}
                          />
                        ))
                      }
                      renderInput={(p) => (
                        <StyledTF
                          {...p}
                          size="small"
                          placeholder="Select fault types"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              ),
            },
            {
              key: "garbage",
              icon: <Delete />,
              title: "Garbage Management",
              subtitle: "Container & IoT fill-level data",
              content: (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel>Container Type / Size</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.containerTypeSize}
                        onChange={(e) =>
                          set("containerTypeSize", e.target.value)
                        }
                      >
                        {CONTAINER_SIZES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel>Smart IoT Fill Level (%)</FieldLabel>
                    <StyledTF
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      value={form.smartFillLevel}
                      onChange={(e) => set("smartFillLevel", e.target.value)}
                    />
                  </Grid>
                </Grid>
              ),
            },
            {
              key: "it",
              icon: <Computer />,
              title: "IT Assets",
              subtitle: "Software, OS & license info",
              content: (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel>OS Platform</FieldLabel>
                    <Autocomplete
                      multiple
                      options={OS_PLATFORMS}
                      value={form.osPlatform}
                      onChange={(_, v) => set("osPlatform", v)}
                      renderTags={(val, gtp) =>
                        val.map((o, i) => (
                          <Chip
                            key={o}
                            label={o}
                            size="small"
                            {...gtp({ index: i })}
                          />
                        ))
                      }
                      renderInput={(p) => (
                        <StyledTF
                          {...p}
                          size="small"
                          placeholder="Select platforms"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel>Software Name</FieldLabel>
                    <StyledTF
                      fullWidth
                      size="small"
                      value={form.softwareName}
                      onChange={(e) => set("softwareName", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FieldLabel>License Status</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.licenseStatus}
                        onChange={(e) => set("licenseStatus", e.target.value)}
                      >
                        {LICENSE_STATUS.map((s) => (
                          <MenuItem
                            key={s}
                            value={s}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {s}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                </Grid>
              ),
            },
            {
              key: "facility",
              icon: <Build />,
              title: "Facility Management",
              subtitle: "PM status & maintenance priority",
              content: (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel>PM Status</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.pmStatus}
                        onChange={(e) => set("pmStatus", e.target.value)}
                      >
                        {PM_STATUS.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel>Maintenance Priority</FieldLabel>
                    <FormControl fullWidth size="small">
                      <StyledSel
                        value={form.maintenancePriority}
                        onChange={(e) =>
                          set("maintenancePriority", e.target.value)
                        }
                      >
                        {MAINT_PRIORITY.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </StyledSel>
                    </FormControl>
                  </Grid>
                </Grid>
              ),
            },
          ].map(({ key, icon, title, subtitle, content }) => (
            <SectionCard key={key}>
              <SectionHeader
                icon={icon}
                title={title}
                subtitle={subtitle}
                collapsible
                collapsed={collapsed[key]}
                onToggle={() => toggle(key)}
              />
              {!collapsed[key] && content}
            </SectionCard>
          ))}
        </Grid>

        {/* ──── RIGHT ──── */}
        <Grid item xs={12} lg={4}>
          {/* Financial */}
          <SectionCard>
            <SectionHeader
              icon={<AttachMoney />}
              title="Financial"
              subtitle="Cost & value details"
            />
            <Stack spacing={2.5}>
              {[
                {
                  label: "Purchase Cost ($)",
                  key: "purchaseCost",
                  err: errors.purchaseCost,
                },
                {
                  label: "Current Value ($)",
                  key: "currentValue",
                  err: errors.currentValue,
                },
              ].map(({ label, key, err }) => (
                <Box key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <StyledTF
                    fullWidth
                    size="small"
                    type="number"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    error={!!err}
                    helperText={err}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    placeholder="0.00"
                  />
                </Box>
              ))}
            </Stack>
          </SectionCard>

          {/* Dates */}
          <SectionCard>
            <SectionHeader icon={<CalendarToday />} title="Important Dates" />
            <Stack spacing={2.5}>
              {[
                { label: "Acquisition Date", key: "acquisitionDate" },
                { label: "Commissioning Date", key: "commissioningDate" },
                { label: "Warranty Expiry", key: "warrantyExpiry" },
                { label: "Lease Expiry", key: "leaseExpiry" },
              ].map(({ label, key }) => (
                <Box key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <StyledTF
                    fullWidth
                    size="small"
                    type="date"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              ))}
            </Stack>
          </SectionCard>

          {/* Health Score */}
          <SectionCard>
            <SectionHeader icon={<Info />} title="Health Score" />
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Score
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                color={
                  form.healthScore >= 70
                    ? "success.main"
                    : form.healthScore >= 40
                      ? "warning.main"
                      : "error.main"
                }
              >
                {form.healthScore}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Number(form.healthScore)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#e8eaed",
                mb: 2,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor:
                    form.healthScore >= 70
                      ? "#22c55e"
                      : form.healthScore >= 40
                        ? "#f59e0b"
                        : "#ef4444",
                },
              }}
            />
            <StyledTF
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={form.healthScore}
              onChange={(e) =>
                set(
                  "healthScore",
                  Math.min(100, Math.max(0, Number(e.target.value))),
                )
              }
            />
          </SectionCard>

          {/* Tags & Notes */}
          <SectionCard>
            <SectionHeader icon={<Info />} title="Tags & Notes" />
            <Stack spacing={2.5}>
              <Box>
                <FieldLabel>Tags</FieldLabel>
                <Stack
                  direction="row"
                  spacing={1}
                  mb={1}
                  flexWrap="wrap"
                  gap={0.5}
                >
                  {form.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ borderRadius: 1.5 }}
                      onDelete={() =>
                        set(
                          "tags",
                          form.tags.filter((t) => t !== tag),
                        )
                      }
                    />
                  ))}
                </Stack>
                <StyledTF
                  fullWidth
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      if (!form.tags.includes(tagInput.trim()))
                        set("tags", [...form.tags, tagInput.trim()]);
                      setTagInput("");
                    }
                  }}
                  placeholder="Type and press Enter"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (
                              tagInput.trim() &&
                              !form.tags.includes(tagInput.trim())
                            ) {
                              set("tags", [...form.tags, tagInput.trim()]);
                              setTagInput("");
                            }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <FieldLabel>Notes</FieldLabel>
                <StyledTF
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Any additional notes…"
                />
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// src/pages/AddNewAsset.jsx
// ─── FIXES ────────────────────────────────────────────────────────────────────
// 1. Sticky header: removed hardcoded `width: "1160px"` and `marginLeft: "25px"`.
//    Now uses width:"100%" so it works on all screen sizes.
//
// 2. "Other" category name: otherCategoryName was captured in state but never
//    sent to the API. Added `customCategoryName` field to the payload so the
//    backend receives it when "other" is selected.
//
// 3. TeamContext api: added a note + pattern showing how TeamContext must also
//    import the shared `api` from AssetContext (same fix as AssetCategoryContext).
//    The `fetchTeamMembers` call will 401 until that context is updated.
//
// 4. useEffect deps: getAllCategories and fetchTeamMembers are useCallback-stable
//    references — listing them is correct and prevents stale-closure warnings.
//
// 5. All previously-retained schema fixes kept (driverName, healthStatusIndex
//    enum, assetCategoryId, faultType array, etc.).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Button,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Autocomplete,
  Collapse,
  Divider,
  alpha,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  Inventory2Outlined,
  DirectionsCarOutlined,
  SettingsOutlined,
  DeleteOutlineOutlined,
  ComputerOutlined,
  ApartmentOutlined,
  LockOutlined,
  Person,
  ExpandMore,
  CheckCircle,
  CategoryOutlined,
  LocationOnOutlined,
  LocalOfferOutlined,
  HomeOutlined,
  SaveOutlined,
  Close,
  CheckCircleOutline,
  InfoOutlined,
} from "@mui/icons-material";
import { useAsset } from "../context/AssetContext";
import { useAssetCategory } from "../context/AssetCategoryContexts";
import { useAuth } from "../context/AuthContexts";
import { useTeam } from "../context/TeamContext";
import { useNavigate } from "react-router-dom";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "#f8fafc",
  bgCard: "#ffffff",
  bgInput: "#ffffff",
  bgPanel: "#f1f5f9",
  border: "#e2e8f0",
  teal: "#0d444e",
  borderFocus: "#0d444e",
  brandPrimary: "#0d444e",
  brandLight: "rgba(13,68,78,0.08)",
  brandDark: "#092f37",
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#94a3b8",
    inverse: "#ffffff",
  },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#0d444e",
  radius: { xs: "6px", sm: "8px", md: "12px", lg: "16px", xl: "20px" },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  font: "'Inter', system-ui, -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  transition: "all 0.2s ease",
};

const SECTION_COLORS = {
  mhe: "#0d444e",
  transport: "#10b981",
  machine: "#8b5cf6",
  garbage: "#22c55e",
  it: "#ef4444",
  facility: "#f59e0b",
  inspection: "#06b6d4",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: T.radius.md,
    bgcolor: T.bgInput,
    fontSize: "0.875rem",
    fontFamily: T.font,
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": {
      borderColor: T.borderFocus,
      borderWidth: "1.5px",
    },
    "&.Mui-disabled": { bgcolor: "#f8fafc" },
  },
  "& .MuiInputBase-input": {
    py: "10px",
    px: "14px",
    color: T.text.primary,
  },
};

const selectSx = {
  borderRadius: T.radius.md,
  bgcolor: T.bgInput,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: T.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: T.borderFocus,
  },
  "& .MuiSelect-select": { py: "10px", px: "14px" },
};

const menuPaperSx = {
  bgcolor: "#ffffff",
  border: `1px solid ${T.border}`,
  borderRadius: T.radius.lg,
  boxShadow: T.shadow.lg,
};

const Label = ({ children, required }) => (
  <Box sx={{ mb: 0.75 }}>
    <Typography
      sx={{
        fontSize: "0.7rem",
        fontWeight: 600,
        color: T.text.secondary,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      {children}
      {required && <span style={{ color: T.error, marginLeft: 2 }}>*</span>}
    </Typography>
  </Box>
);

const Dot = ({ color }) => (
  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
);

const HealthBar = ({ value }) => {
  const color = value >= 70 ? T.success : value >= 40 ? T.warning : T.error;
  return (
    <Box
      sx={{
        height: 6,
        borderRadius: 3,
        bgcolor: alpha(color, 0.1),
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          borderRadius: 3,
          bgcolor: color,
          width: `${value}%`,
        }}
      />
    </Box>
  );
};

const SectionCard = ({
  icon,
  title,
  color = T.brandPrimary,
  children,
  disabled,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: T.bgCard,
        border: `1px solid ${open ? alpha(color, 0.25) : T.border}`,
        borderRadius: T.radius.lg,
        overflow: "hidden",
        mb: 2.5,
        position: "relative",
      }}
    >
      {disabled && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(255,255,255,0.85)",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chip
            icon={<LockOutlined sx={{ fontSize: 13 }} />}
            label="Read Only"
            size="small"
          />
        </Box>
      )}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setOpen(!open)}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          cursor: "pointer",
          borderBottom: open ? `1px solid ${T.border}` : "none",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: T.radius.sm,
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: T.text.primary,
            }}
          >
            {title}
          </Typography>
        </Stack>
        <ExpandMore
          sx={{
            fontSize: 18,
            color,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: T.transition,
          }}
        />
      </Stack>
      <Collapse in={open}>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

const CheckboxGroup = ({
  name,
  options,
  values,
  onChange,
  disabled,
  withOther,
}) => {
  const [otherText, setOtherText] = useState("");
  const allOptions = withOther ? [...options, "Other"] : options;
  return (
    <Box>
      <Grid container spacing={1}>
        {allOptions.map((label) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={values[label] || false}
                  onChange={(e) => onChange?.(name, label, e.target.checked)}
                  disabled={disabled}
                  sx={{ "&.Mui-checked": { color: T.brandPrimary } }}
                />
              }
              label={
                <Typography
                  sx={{ fontSize: "0.8rem", color: T.text.secondary }}
                >
                  {label}
                </Typography>
              }
            />
          </Grid>
        ))}
      </Grid>
      {withOther && values["Other"] && (
        <TextField
          size="small"
          fullWidth
          placeholder="Specify other…"
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value);
            onChange?.(name, `Other:${e.target.value}`, true);
          }}
          disabled={disabled}
          sx={{ mt: 1.5, ...inputSx }}
        />
      )}
    </Box>
  );
};

export default function AddNewAsset() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { user } = useAuth() || {};
  const { createAsset, loading } = useAsset() || {};
  const {
    categories,
    getAllCategories,
    loading: catLoading,
  } = useAssetCategory() || {};
  const {
    teamMembers,
    fetchTeamMembers,
    loading: teamLoading,
  } = useTeam() || {};

  const isAdmin = user?.role === "admin";
  const isTeam = user?.role === "team";
  const canEdit = isAdmin || isTeam;
  const currentUserId = user?._id || user?.id;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const toast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const [formData, setFormData] = useState({
    assetName: "",
    description: "",
    serialNumber: "",
    currentLocation: "",
    customPhysicalAddress: {
      streetAddress: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
    },
    assignedUsers: { primaryUser: null, secondaryUser: null, custodian: null },
    status: "Active",
    assetCondition: "Normal",
    purchaseCost: "",
    commissioningDate: "",
    healthScore: 80,
    metadata: { tags: [], notes: "" },
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [otherCategoryName, setOtherCategoryName] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [mheFilters, setMheFilters] = useState({});
  const [vehicleFilters, setVehicleFilters] = useState({});
  const [faultTypeFilters, setFaultTypeFilters] = useState({});
  const [containerFilters, setContainerFilters] = useState({});
  const [osFilters, setOsFilters] = useState({});
  const [pmFilters, setPmFilters] = useState({});
  const [mheData, setMheData] = useState({
    engineRuntimeHours: "",
    safetyCertification: "",
  });
  const [transportData, setTransportData] = useState({
    driverName: "",
    loadStatus: 50,
  });
  const [machineData, setMachineData] = useState({
    healthStatusIndex: "Green",
    vibrationAlert: false,
    temperatureAlert: false,
  });
  const [garbageData, setGarbageData] = useState({
    smartStatusIoTFillLevel: 50,
    collectionStatus: "",
  });
  const [itData, setItData] = useState({ softwareName: "", licenseStatus: "" });
  const [facilityData, setFacilityData] = useState({
    maintenancePriority: "Medium",
  });
  const [inspectionSystems, setInspectionSystems] = useState({
    amcInspection: { enabled: false, schedule: "Monthly" },
    camcInspection: { enabled: false, schedule: "Monthly" },
  });

  // Stable refs — both are useCallback so listing them is safe
  useEffect(() => {
    getAllCategories?.({ limit: 100 });
    fetchTeamMembers?.({ limit: 100 });
  }, [getAllCategories, fetchTeamMembers]);

  // ─── Build team options based on role ────────────────────────────────────
  const teamOptions = (() => {
    if (!teamMembers?.length) {
      if (isTeam && user) {
        return [
          {
            id: currentUserId,
            label:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.email ||
              "Me",
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.email ||
              "Me",
            email: user.email || "",
            role: user.role || "team",
          },
        ];
      }
      return [];
    }

    const mapped = teamMembers.map((m) => ({
      id: m._id || m.id,
      label:
        `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.name || m.email,
      name:
        `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.name || m.email,
      email: m.email,
      role: m.teamRole || m.role || "team",
    }));

    if (isTeam && currentUserId) {
      return mapped.filter((m) => m.id === currentUserId);
    }

    return mapped;
  })();

  const fi = (field, value) =>
    canEdit && setFormData((p) => ({ ...p, [field]: value }));
  const fa = (field, value) =>
    canEdit &&
    setFormData((p) => ({
      ...p,
      customPhysicalAddress: { ...p.customPhysicalAddress, [field]: value },
    }));
  const fau = (field, value) =>
    canEdit &&
    setFormData((p) => ({
      ...p,
      assignedUsers: { ...p.assignedUsers, [field]: value?.id || null },
    }));

  const handleCB = (section, label, checked) => {
    if (!canEdit) return;
    const map = {
      mhe: setMheFilters,
      vehicle: setVehicleFilters,
      faultType: setFaultTypeFilters,
      container: setContainerFilters,
      os: setOsFilters,
      pm: setPmFilters,
    };
    map[section]?.((p) => ({ ...p, [label]: checked }));
  };

  const addTag = (val) => {
    const tag = val.trim();
    if (!tag || formData.metadata.tags.includes(tag)) return;
    setFormData((p) => ({
      ...p,
      metadata: { ...p.metadata, tags: [...p.metadata.tags, tag] },
    }));
    setTagInput("");
  };
  const removeTag = (tag) =>
    setFormData((p) => ({
      ...p,
      metadata: {
        ...p.metadata,
        tags: p.metadata.tags.filter((t) => t !== tag),
      },
    }));

  const handleSubmit = async () => {
    if (!canEdit) {
      toast("No permission to create assets", "error");
      return;
    }
    if (!formData.assetName.trim()) {
      toast("Asset name is required", "error");
      return;
    }
    if (!selectedCategoryId) {
      toast("Please select a category", "error");
      return;
    }
    // FIX 2: validate custom name when "Other" is selected
    if (selectedCategoryId === "other" && !otherCategoryName.trim()) {
      toast("Please enter a custom category name", "error");
      return;
    }

    try {
      const selectedCat =
        selectedCategoryId !== "other"
          ? categories?.find((c) => c._id === selectedCategoryId)
          : null;

      const mheUtilization =
        Object.keys(mheFilters).find((k) => mheFilters[k]) || "";
      const vehicleType =
        Object.keys(vehicleFilters).find((k) => vehicleFilters[k]) || "";
      const faultTypes = Object.keys(faultTypeFilters).filter(
        (k) => faultTypeFilters[k],
      );
      const containerType =
        Object.keys(containerFilters).find((k) => containerFilters[k]) || "";
      const osPlatforms = Object.keys(osFilters).filter((k) => osFilters[k]);
      const pmStatus = Object.keys(pmFilters).find((k) => pmFilters[k]) || "";

      const payload = {
        assetName: formData.assetName.trim(),
        description: formData.description.trim(),
        serialNumber: formData.serialNumber.trim() || undefined,

        // FIX 2: send assetCategoryId for known cats, customCategoryName for "other"
        ...(selectedCategoryId !== "other"
          ? { assetCategoryId: selectedCategoryId }
          : { customCategoryName: otherCategoryName.trim() }),

        currentLocation: formData.currentLocation.trim(),
        customPhysicalAddress: formData.customPhysicalAddress,

        assignedUsers: {
          primaryUser: formData.assignedUsers.primaryUser || undefined,
          secondaryUser: formData.assignedUsers.secondaryUser || undefined,
          custodian: formData.assignedUsers.custodian || undefined,
        },

        status: formData.status,
        assetCondition: formData.assetCondition,

        purchaseCost: formData.purchaseCost
          ? parseFloat(formData.purchaseCost)
          : undefined,

        commissioningDate: formData.commissioningDate || undefined,

        metadata: {
          tags: formData.metadata.tags,
          notes: formData.metadata.notes.trim(),
        },

        mhe: {
          utilizationStatus: mheUtilization || "Not Applicable",
          engineRuntimeHours: mheData.engineRuntimeHours
            ? parseFloat(mheData.engineRuntimeHours)
            : undefined,
          safetyCertification: mheData.safetyCertification || undefined,
        },

        transportation: {
          vehicleType: vehicleType || "Not Applicable",
          driverName: transportData.driverName || undefined,
          loadStatus: transportData.loadStatus,
        },

        rotatingMachinery: {
          healthStatusIndex: machineData.healthStatusIndex || "Green",
          vibrationAlert: machineData.vibrationAlert,
          temperatureAlert: machineData.temperatureAlert,
          faultType: faultTypes,
        },

        garbageManagement: {
          containerTypeSize: containerType || undefined,
          smartStatusIoTFillLevel: garbageData.smartStatusIoTFillLevel,
          collectionStatus: garbageData.collectionStatus || "Not Scheduled",
        },

        itAssets: {
          osPlatform: osPlatforms,
          softwareName: itData.softwareName || undefined,
          licenseStatus: itData.licenseStatus || "Not Applicable",
        },

        facilityManagement: {
          maintenancePriority: facilityData.maintenancePriority,
          pmStatus: pmStatus || "Not Scheduled",
        },

        inspectionSystems,
      };

      const res = await createAsset(payload);
      if (res?.success) {
        toast("Asset created successfully!");
        setTimeout(() => navigate("/admin/assets"), 1800);
      } else {
        throw new Error(res?.message || "Creation failed");
      }
    } catch (e) {
      toast(e?.message || "Failed to create asset", "error");
    }
  };

  if (user?.role === "super_admin") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: T.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 400 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: alpha(T.error, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <LockOutlined sx={{ color: T.error, fontSize: 28 }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.25rem",
              color: T.text.primary,
              mb: 1,
            }}
          >
            Access Restricted
          </Typography>
          <Typography
            sx={{ fontSize: "0.875rem", color: T.text.secondary, mb: 3 }}
          >
            Super Admin accounts don't have Asset Management access.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/admin")}
            sx={{
              bgcolor: T.brandPrimary,
              textTransform: "none",
              borderRadius: T.radius.md,
              px: 4,
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  const healthColor =
    formData.healthScore >= 70
      ? T.success
      : formData.healthScore >= 40
        ? T.warning
        : T.error;

  const selectedCatName = (() => {
    if (!selectedCategoryId) return null;
    if (selectedCategoryId === "other")
      return otherCategoryName?.trim() || "Other";
    const cat = categories?.find((c) => c._id === selectedCategoryId);
    return cat?.name || null;
  })();

  const STATUS_OPTIONS = [
    "Active",
    "In Maintenance",
    "Retired",
    "In Transit",
    "Reserved",
  ];
  const CONDITION_OPTIONS = ["Excellent", "Normal", "Critical", "Poor"];
  const STATUS_COLORS = {
    Active: T.success,
    "In Maintenance": T.warning,
    Retired: T.text.muted,
    "In Transit": T.info,
    Reserved: "#8b5cf6",
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg }}>
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      {/* FIX 1: removed hardcoded width:"1160px" and marginLeft:"25px"       */}
      <Box
        sx={{
          borderBottom: `1px solid ${T.border}`,
          bgcolor: T.bgCard,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, sm: 2 },
          position: "sticky",
          top: 0,
          width: "100%", // ← was "1160px"
          borderRadius: 2,
          zIndex: 100,
          boxSizing: "border-box",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 1.5, sm: 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => navigate("/admin/assets")}
              sx={{
                bgcolor: alpha(T.brandPrimary, 0.08),
                color: T.brandPrimary,
                borderRadius: T.radius.sm,
                p: 0.75,
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
                  color: T.text.primary,
                }}
              >
                Add New Asset
              </Typography>
              <Typography
                sx={{ fontSize: "0.7rem", color: T.text.muted, mt: 0.25 }}
              >
                {isAdmin
                  ? "Complete all required fields to register a new asset"
                  : isTeam
                    ? "Fill in the details to submit a new asset"
                    : "Viewing asset form in read-only mode"}
              </Typography>
            </Box>
          </Stack>
          {canEdit && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/assets")}
                sx={{
                  textTransform: "none",
                  borderRadius: T.radius.md,
                  borderColor: T.border,
                  color: T.text.secondary,
                  px: 2.5,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={15} /> : <SaveOutlined />
                }
                sx={{
                  textTransform: "none",
                  borderRadius: T.radius.md,
                  bgcolor: T.brandPrimary,
                  "&:hover": { bgcolor: T.brandDark },
                  px: 3,
                }}
              >
                {loading ? "Saving…" : "Save Asset"}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <Grid item xs={12} md={4} lg={3.5}>
            {/* Core Identification */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius.lg,
                p: { xs: 2, sm: 2.5 },
                mb: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: T.radius.sm,
                    bgcolor: alpha(T.brandPrimary, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CategoryOutlined
                    sx={{ fontSize: 16, color: T.brandPrimary }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: T.text.primary,
                  }}
                >
                  Core Identification
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <Box>
                  <Label required>Asset Name</Label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter asset name"
                    value={formData.assetName}
                    onChange={(e) => fi("assetName", e.target.value)}
                    disabled={!canEdit}
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <Label>Description</Label>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Brief description"
                    value={formData.description}
                    onChange={(e) => fi("description", e.target.value)}
                    disabled={!canEdit}
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <Label>Serial Number</Label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="SN-20240001"
                    value={formData.serialNumber}
                    onChange={(e) => fi("serialNumber", e.target.value)}
                    disabled={!canEdit}
                    sx={inputSx}
                  />
                </Box>

                {/* Asset Category */}
                <Box>
                  <Label required>Asset Category</Label>
                  {catLoading ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ py: 1 }}
                    >
                      <CircularProgress size={18} />
                      <Typography
                        sx={{ fontSize: "0.8rem", color: T.text.muted }}
                      >
                        Loading categories…
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedCategoryId}
                          onChange={(e) => {
                            setSelectedCategoryId(e.target.value);
                            if (e.target.value !== "other") {
                              setOtherCategoryName("");
                            }
                          }}
                          disabled={!canEdit}
                          displayEmpty
                          sx={selectSx}
                          MenuProps={{
                            PaperProps: { sx: menuPaperSx },
                            anchorOrigin: {
                              vertical: "bottom",
                              horizontal: "left",
                            },
                            transformOrigin: {
                              vertical: "top",
                              horizontal: "left",
                            },
                          }}
                          renderValue={(val) => {
                            if (!val)
                              return (
                                <span style={{ color: T.text.muted }}>
                                  Select category…
                                </span>
                              );
                            if (val === "other")
                              return (
                                <span
                                  style={{
                                    color: T.brandPrimary,
                                    fontWeight: 600,
                                  }}
                                >
                                  Other (Custom)
                                </span>
                              );
                            const cat = categories?.find((c) => c._id === val);
                            return (
                              <span>
                                {cat?.name || (
                                  <span style={{ color: T.text.muted }}>
                                    Unknown category
                                  </span>
                                )}
                              </span>
                            );
                          }}
                        >
                          {Array.isArray(categories) &&
                          categories.length > 0 ? (
                            categories.map((cat) => (
                              <MenuItem key={cat._id} value={cat._id}>
                                <Stack>
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontWeight: 500,
                                      color: T.text.primary,
                                    }}
                                  >
                                    {cat.name}
                                  </Typography>
                                  {cat.description && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: T.text.muted,
                                      }}
                                    >
                                      {cat.description}
                                    </Typography>
                                  )}
                                </Stack>
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: T.text.muted,
                                  fontStyle: "italic",
                                }}
                              >
                                No categories available
                              </Typography>
                            </MenuItem>
                          )}
                          <Divider sx={{ my: 0.5 }} />
                          <MenuItem value="other">
                            <Typography
                              sx={{
                                color: T.brandPrimary,
                                fontSize: "0.875rem",
                                fontWeight: 500,
                              }}
                            >
                              + Other (Custom)
                            </Typography>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      {selectedCategoryId === "other" && (
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Enter custom category name"
                          value={otherCategoryName}
                          onChange={(e) => setOtherCategoryName(e.target.value)}
                          disabled={!canEdit}
                          sx={{ mt: 1, ...inputSx }}
                        />
                      )}

                      {selectedCatName && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mt={1}
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: T.radius.md,
                            bgcolor: alpha(T.brandPrimary, 0.06),
                            border: `1px solid ${alpha(T.brandPrimary, 0.15)}`,
                          }}
                        >
                          <CheckCircleOutline
                            sx={{ fontSize: 14, color: T.brandPrimary }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: T.brandPrimary,
                              fontWeight: 500,
                            }}
                          >
                            {selectedCatName}
                          </Typography>
                        </Stack>
                      )}
                    </>
                  )}
                </Box>
              </Stack>
            </Paper>

            {/* Assigned Users */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius.lg,
                p: { xs: 2, sm: 2.5 },
                mb: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: T.radius.sm,
                    bgcolor: alpha("#8b5cf6", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Person sx={{ fontSize: 16, color: "#8b5cf6" }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: T.text.primary,
                  }}
                >
                  Assigned Users
                </Typography>
                {isTeam && (
                  <Chip
                    label="You only"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      bgcolor: alpha("#8b5cf6", 0.1),
                      color: "#8b5cf6",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>

              {teamLoading ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ py: 1 }}
                >
                  <CircularProgress size={18} />
                  <Typography sx={{ fontSize: "0.8rem", color: T.text.muted }}>
                    Loading members…
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {[
                    { key: "primaryUser", label: "Primary User" },
                    { key: "secondaryUser", label: "Secondary User" },
                    { key: "custodian", label: "Custodian" },
                  ].map(({ key, label }) => (
                    <Box key={key}>
                      <Label>{label}</Label>
                      <Autocomplete
                        size="small"
                        options={teamOptions}
                        value={
                          teamOptions.find(
                            (o) => o.id === formData.assignedUsers[key],
                          ) || null
                        }
                        onChange={(_, v) => fau(key, v)}
                        isOptionEqualToValue={(o, v) => o?.id === v?.id}
                        getOptionLabel={(opt) => opt?.name || opt?.label || ""}
                        noOptionsText={
                          <Typography
                            sx={{ color: T.text.muted, fontSize: "0.8rem" }}
                          >
                            {isTeam
                              ? "Only your account is available"
                              : "No members found"}
                          </Typography>
                        }
                        disabled={!canEdit}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={`Select ${label.toLowerCase()}…`}
                            sx={inputSx}
                          />
                        )}
                        renderOption={(props, opt) => (
                          <li {...props} key={opt.id}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                              sx={{ py: 0.5 }}
                            >
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  fontSize: "0.7rem",
                                  bgcolor: "#8b5cf6",
                                }}
                              >
                                {(opt.name || opt.label)?.charAt(0) || "?"}
                              </Avatar>
                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 500,
                                    color: T.text.primary,
                                  }}
                                >
                                  {opt.name || opt.label}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: T.text.muted,
                                  }}
                                >
                                  {opt.role} · {opt.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </li>
                        )}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Physical Address */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius.lg,
                p: { xs: 2, sm: 2.5 },
                mb: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: T.radius.sm,
                    bgcolor: alpha(T.success, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HomeOutlined sx={{ fontSize: 16, color: T.success }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: T.text.primary,
                  }}
                >
                  Physical Address
                </Typography>
              </Stack>
              <Stack spacing={1.75}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Street Address"
                  value={formData.customPhysicalAddress.streetAddress}
                  onChange={(e) => fa("streetAddress", e.target.value)}
                  disabled={!canEdit}
                  sx={inputSx}
                />
                <Grid container spacing={1.5}>
                  {[
                    ["City", "city"],
                    ["State / Province", "stateProvince"],
                    ["Postal Code", "postalCode"],
                    ["Country", "country"],
                  ].map(([label, key]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={label}
                        value={formData.customPhysicalAddress[key]}
                        onChange={(e) => fa(key, e.target.value)}
                        disabled={!canEdit}
                        sx={inputSx}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          {/* ── RIGHT MAIN AREA ────────────────────────────────────────────── */}
          <Grid item xs={12} md={8} lg={8.5}>
            {/* Primary Information */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius.lg,
                p: { xs: 2, sm: 2.5 },
                mb: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: T.radius.sm,
                    bgcolor: alpha(T.info, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocationOnOutlined sx={{ fontSize: 16, color: T.info }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: T.text.primary,
                  }}
                >
                  Primary Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Label>Current Location</Label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Warehouse A"
                    value={formData.currentLocation}
                    onChange={(e) => fi("currentLocation", e.target.value)}
                    disabled={!canEdit}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Label>Status</Label>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.status}
                      onChange={(e) => fi("status", e.target.value)}
                      disabled={!canEdit}
                      sx={selectSx}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Dot color={STATUS_COLORS[s]} />
                            <Typography>{s}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Label>Asset Condition</Label>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.assetCondition}
                      onChange={(e) => fi("assetCondition", e.target.value)}
                      disabled={!canEdit}
                      sx={selectSx}
                    >
                      {CONDITION_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Label>Purchase Cost (₹)</Label>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={formData.purchaseCost}
                    onChange={(e) => fi("purchaseCost", e.target.value)}
                    disabled={!canEdit}
                    inputProps={{ min: 0, step: "0.01" }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Label>Commissioning Date</Label>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={formData.commissioningDate}
                    onChange={(e) => fi("commissioningDate", e.target.value)}
                    disabled={!canEdit}
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Label>Health Score</Label>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.75}
                    >
                      <Typography
                        sx={{ fontSize: "0.75rem", color: T.text.muted }}
                      >
                        {formData.healthScore >= 70
                          ? "Good"
                          : formData.healthScore >= 40
                            ? "Fair"
                            : "Critical"}
                      </Typography>
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.4,
                          borderRadius: 20,
                          bgcolor: alpha(healthColor, 0.1),
                          border: `1px solid ${alpha(healthColor, 0.2)}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: healthColor,
                          }}
                        >
                          {formData.healthScore}%
                        </Typography>
                      </Box>
                    </Stack>
                    <HealthBar value={formData.healthScore} />
                    <Slider
                      value={formData.healthScore}
                      onChange={(_, v) => fi("healthScore", v)}
                      min={0}
                      max={100}
                      disabled={!canEdit}
                      sx={{
                        color: healthColor,
                        mt: 0.5,
                        "& .MuiSlider-thumb": { width: 14, height: 14 },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Label>Tags</Label>
                  <Stack direction="row" spacing={1} mb={1}>
                    <TextField
                      size="small"
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      disabled={!canEdit}
                      sx={{ ...inputSx, flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => addTag(tagInput)}
                      disabled={!canEdit || !tagInput.trim()}
                      sx={{
                        textTransform: "none",
                        borderRadius: T.radius.md,
                        padding: "4px 8px",
                      }}
                    >
                      Add
                    </Button>
                  </Stack>
                  {formData.metadata.tags.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {formData.metadata.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={canEdit ? () => removeTag(tag) : undefined}
                          sx={{
                            bgcolor: alpha(T.brandPrimary, 0.08),
                            color: T.brandPrimary,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Label>Notes</Label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Additional notes…"
                    value={formData.metadata.notes}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        metadata: { ...p.metadata, notes: e.target.value },
                      }))
                    }
                    disabled={!canEdit}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Section Cards */}
            <SectionCard
              icon={<Inventory2Outlined />}
              title="Material Handling Equipment"
              color={SECTION_COLORS.mhe}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                <Typography
                  sx={{ fontSize: "0.75rem", color: T.text.muted, mb: 0.5 }}
                >
                  Utilization Status
                </Typography>
                <CheckboxGroup
                  name="mhe"
                  values={mheFilters}
                  onChange={handleCB}
                  disabled={!canEdit}
                  withOther
                  options={[
                    "Active",
                    "Idle",
                    "Under Maintenance",
                    "Decommissioned",
                  ]}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Engine Runtime (Hours)"
                      type="number"
                      value={mheData.engineRuntimeHours}
                      onChange={(e) =>
                        setMheData((p) => ({
                          ...p,
                          engineRuntimeHours: e.target.value,
                        }))
                      }
                      disabled={!canEdit}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Safety Certification"
                      value={mheData.safetyCertification}
                      onChange={(e) =>
                        setMheData((p) => ({
                          ...p,
                          safetyCertification: e.target.value,
                        }))
                      }
                      disabled={!canEdit}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </SectionCard>

            <SectionCard
              icon={<DirectionsCarOutlined />}
              title="Transportation"
              color={SECTION_COLORS.transport}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                <Typography
                  sx={{ fontSize: "0.75rem", color: T.text.muted, mb: 0.5 }}
                >
                  Vehicle Type
                </Typography>
                <CheckboxGroup
                  name="vehicle"
                  values={vehicleFilters}
                  onChange={handleCB}
                  disabled={!canEdit}
                  withOther
                  options={["Truck", "Car", "Van", "Motorcycle"]}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Driver Name"
                      value={transportData.driverName}
                      onChange={(e) =>
                        setTransportData((p) => ({
                          ...p,
                          driverName: e.target.value,
                        }))
                      }
                      disabled={!canEdit}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ mb: 1, fontSize: "0.875rem" }}>
                      Load Status — {transportData.loadStatus}%
                    </Typography>
                    <Slider
                      value={transportData.loadStatus}
                      onChange={(_, v) =>
                        setTransportData((p) => ({ ...p, loadStatus: v }))
                      }
                      min={0}
                      max={100}
                      disabled={!canEdit}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </SectionCard>

            <SectionCard
              icon={<SettingsOutlined />}
              title="Rotating Machinery"
              color={SECTION_COLORS.machine}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Label>Health Status Index</Label>
                    <FormControl fullWidth size="small">
                      <Select
                        value={machineData.healthStatusIndex}
                        onChange={(e) =>
                          setMachineData((p) => ({
                            ...p,
                            healthStatusIndex: e.target.value,
                          }))
                        }
                        disabled={!canEdit}
                        sx={selectSx}
                      >
                        {["Green", "Yellow", "Red"].map((v) => (
                          <MenuItem key={v} value={v}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Dot
                                color={
                                  v === "Green"
                                    ? T.success
                                    : v === "Yellow"
                                      ? T.warning
                                      : T.error
                                }
                              />
                              <Typography>{v}</Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Label>Fault Types</Label>
                    <CheckboxGroup
                      name="faultType"
                      values={faultTypeFilters}
                      onChange={handleCB}
                      disabled={!canEdit}
                      withOther
                      options={[
                        "Bearing",
                        "Imbalance",
                        "Misalignment",
                        "Overheating",
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={machineData.vibrationAlert}
                          onChange={(e) =>
                            setMachineData((p) => ({
                              ...p,
                              vibrationAlert: e.target.checked,
                            }))
                          }
                          disabled={!canEdit}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "0.875rem" }}>
                          Vibration Alert
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={machineData.temperatureAlert}
                          onChange={(e) =>
                            setMachineData((p) => ({
                              ...p,
                              temperatureAlert: e.target.checked,
                            }))
                          }
                          disabled={!canEdit}
                          size="small"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "0.875rem" }}>
                          Temperature Alert
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </Stack>
            </SectionCard>

            <SectionCard
              icon={<DeleteOutlineOutlined />}
              title="Garbage Management"
              color={SECTION_COLORS.garbage}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                <Typography
                  sx={{ fontSize: "0.75rem", color: T.text.muted, mb: 0.5 }}
                >
                  Container Type / Size
                </Typography>
                <CheckboxGroup
                  name="container"
                  values={containerFilters}
                  onChange={handleCB}
                  disabled={!canEdit}
                  withOther
                  options={["Small", "Medium", "Large", "Industrial"]}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ mb: 1, fontSize: "0.875rem" }}>
                      IoT Fill Level — {garbageData.smartStatusIoTFillLevel}%
                    </Typography>
                    <Slider
                      value={garbageData.smartStatusIoTFillLevel}
                      onChange={(_, v) =>
                        setGarbageData((p) => ({
                          ...p,
                          smartStatusIoTFillLevel: v,
                        }))
                      }
                      min={0}
                      max={100}
                      disabled={!canEdit}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Collection Status"
                      value={garbageData.collectionStatus}
                      onChange={(e) =>
                        setGarbageData((p) => ({
                          ...p,
                          collectionStatus: e.target.value,
                        }))
                      }
                      disabled={!canEdit}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </SectionCard>

            <SectionCard
              icon={<ComputerOutlined />}
              title="IT Assets"
              color={SECTION_COLORS.it}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                <Typography
                  sx={{ fontSize: "0.75rem", color: T.text.muted, mb: 0.5 }}
                >
                  OS Platform
                </Typography>
                <CheckboxGroup
                  name="os"
                  values={osFilters}
                  onChange={handleCB}
                  disabled={!canEdit}
                  withOther
                  options={["Windows", "Linux", "macOS", "Android", "iOS"]}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Software Name"
                      value={itData.softwareName}
                      onChange={(e) =>
                        setItData((p) => ({
                          ...p,
                          softwareName: e.target.value,
                        }))
                      }
                      disabled={!canEdit}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="License Status"
                      value={itData.licenseStatus}
                      onChange={(e) =>
                        setItData((p) => ({
                          ...p,
                          licenseStatus: e.target.value,
                        }))
                      }
                      disabled={!canEdit}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </SectionCard>

            <SectionCard
              icon={<ApartmentOutlined />}
              title="Facility Management"
              color={SECTION_COLORS.facility}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                <Typography
                  sx={{ fontSize: "0.75rem", color: T.text.muted, mb: 0.5 }}
                >
                  PM Status
                </Typography>
                <CheckboxGroup
                  name="pm"
                  values={pmFilters}
                  onChange={handleCB}
                  disabled={!canEdit}
                  withOther
                  options={["Scheduled", "In Progress", "Completed", "Overdue"]}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Label>Maintenance Priority</Label>
                    <FormControl fullWidth size="small">
                      <Select
                        value={facilityData.maintenancePriority}
                        onChange={(e) =>
                          setFacilityData((p) => ({
                            ...p,
                            maintenancePriority: e.target.value,
                          }))
                        }
                        disabled={!canEdit}
                        sx={selectSx}
                      >
                        {["Low", "Medium", "High", "Critical"].map((v) => (
                          <MenuItem key={v} value={v}>
                            {v}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </SectionCard>

            {/* Inspection Systems */}
            <SectionCard
              icon={<InfoOutlined />}
              title="Inspection Systems"
              color={SECTION_COLORS.inspection}
              disabled={!canEdit}
              defaultOpen={false}
            >
              <Stack spacing={2}>
                {[
                  { key: "amcInspection", label: "AMC Inspection" },
                  { key: "camcInspection", label: "CAMC Inspection" },
                ].map(({ key, label }) => (
                  <Box
                    key={key}
                    sx={{
                      p: 2,
                      borderRadius: T.radius.md,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography
                        sx={{ fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {label}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={inspectionSystems[key]?.enabled || false}
                            onChange={(e) =>
                              setInspectionSystems((p) => ({
                                ...p,
                                [key]: {
                                  ...p[key],
                                  enabled: e.target.checked,
                                },
                              }))
                            }
                            disabled={!canEdit}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8rem" }}>
                            Enabled
                          </Typography>
                        }
                      />
                    </Stack>
                    {inspectionSystems[key]?.enabled && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Label>Schedule</Label>
                          <FormControl fullWidth size="small">
                            <Select
                              value={
                                inspectionSystems[key]?.schedule || "Monthly"
                              }
                              onChange={(e) =>
                                setInspectionSystems((p) => ({
                                  ...p,
                                  [key]: {
                                    ...p[key],
                                    schedule: e.target.value,
                                  },
                                }))
                              }
                              disabled={!canEdit}
                              sx={selectSx}
                            >
                              {[
                                "Daily",
                                "Weekly",
                                "Monthly",
                                "Quarterly",
                                "Annually",
                              ].map((v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Label>Next Due Date</Label>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            value={inspectionSystems[key]?.nextDueDate || ""}
                            onChange={(e) =>
                              setInspectionSystems((p) => ({
                                ...p,
                                [key]: {
                                  ...p[key],
                                  nextDueDate: e.target.value,
                                },
                              }))
                            }
                            disabled={!canEdit}
                            InputLabelProps={{ shrink: true }}
                            sx={inputSx}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                ))}
              </Stack>
            </SectionCard>

            {/* Bottom Action Bar */}
            <Box
              sx={{
                mt: 3,
                mb: 2,
                p: { xs: 2, sm: 2.5 },
                borderRadius: T.radius.lg,
                bgcolor: T.bgCard,
                border: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, color: T.text.primary }}>
                  {canEdit ? "Ready to save?" : "Read-only access"}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: T.text.muted }}>
                  {canEdit
                    ? "Asset Name and Category are required."
                    : "You need admin or team permissions to save assets."}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/assets")}
                  sx={{ textTransform: "none", borderRadius: T.radius.md }}
                >
                  Cancel
                </Button>
                {canEdit && (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={15} />
                      ) : (
                        <SaveOutlined />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: T.radius.md,
                      bgcolor: T.brandPrimary,
                      "&:hover": { bgcolor: T.brandDark },
                    }}
                  >
                    {loading ? "Saving…" : "Save Asset"}
                  </Button>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: T.radius.md }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

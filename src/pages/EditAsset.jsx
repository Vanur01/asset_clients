// src/pages/EditAsset.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  LinearProgress,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset } from "../context/AssetContext";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import {
  ArrowBack,
  Save,
  Category,
  LocationOn,
  CalendarToday,
  Person,
  VerifiedUser,
  Description,
  Home,
  PinDrop,
  FmdGood,
  AccountTree,
  Inventory2,
  HealthAndSafety,
  CloudUpload,
  DeleteOutline,
  Star,
  StarBorder,
  PhotoCamera,
  Close,
  CheckCircle,
} from "@mui/icons-material";

// ─── Animations ───────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Design tokens ────────────────────────────────────────────
const C = {
  bg: "#f4f3ef",
  white: "#ffffff",
  dark: "#1a1a18",
  teal: "#174f60",
  tealDark: "#062c38",
  gold: "#c9b77a",
  border: "#e8e6e0",
  muted: "#aaa89e",
  mutedDark: "#888880",
  danger: "#b84040",
  success: "#3d8a5e",
  warn: "#c07c28",
};

// ─── Styled Components ────────────────────────────────────────
const PageRoot = styled(Box)({
  minHeight: "100vh",
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
});

const TopBar = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 36px",
  borderBottom: `1px solid ${C.border}`,
  background: C.white,
  width:"1160px",
  marginLeft:"32px",
  flexWrap: "wrap",
  gap: 14,
  animation: `${fadeUp} 0.35s ease both`,
  "@media (max-width: 600px)": { padding: "16px 20px" },
});

const BackBtn = styled(IconButton)({
  width: 36,
  height: 36,
  border: `1.5px solid ${C.border}`,
  borderRadius: 8,
  background: C.white,
  color: C.dark,
  flexShrink: 0,
  "&:hover": { background: C.dark, color: C.white, borderColor: C.dark },
  transition: "all 0.16s ease",
});

const SaveBtn = styled(Button)({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.01em",
  padding: "8px 22px",
  background: C.teal,
  color: "#fff",
  border: `1.5px solid ${C.teal}`,
  "&:hover": { background: C.tealDark, borderColor: C.tealDark },
  "&:disabled": {
    background: "#b0b0a8",
    borderColor: "#b0b0a8",
    color: "#fff",
  },
  transition: "all 0.16s ease",
});

const CancelBtn = styled(Button)({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  padding: "8px 20px",
  background: "transparent",
  color: C.dark,
  border: `1.5px solid ${C.border}`,
  "&:hover": { background: "#f0ede6", borderColor: "#ccc9c0" },
  transition: "all 0.16s ease",
});

const BodyLayout = styled(Box)({
  display: "grid",
  gridTemplateColumns: "290px 1fr",
  gap: 24,
  padding: "28px 36px",
  "@media (max-width: 960px)": { gridTemplateColumns: "1fr" },
  "@media (max-width: 600px)": { padding: "18px 16px", gap: 16 },
});

// ─── Sidebar ──────────────────────────────────────────────────
const Sidebar = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  animation: `${fadeUp} 0.4s 0.04s ease both`,
  "@media (max-width: 960px)": { flexDirection: "row", flexWrap: "wrap" },
});

const ImagePanel = styled(Box)({
  borderRadius: 16,
  overflow: "hidden",
  background: C.teal,
  border: "1px solid #2a3a40",
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  "@media (max-width: 960px)": { flex: "1 1 280px" },
});

const MainImageArea = styled(Box)({
  height: 230,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: C.tealDark,
  position: "relative",
  overflow: "hidden",
  "& img": { width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 },
});

const ThumbnailRail = styled(Box)({
  display: "flex",
  gap: 8,
  padding: "10px 12px",
  overflowX: "auto",
  "&::-webkit-scrollbar": { height: 3 },
  "&::-webkit-scrollbar-thumb": { background: "#3a5a65" },
});

const Thumb = styled(Box)(({ isprimary }) => ({
  width: 54,
  height: 50,
  flexShrink: 0,
  borderRadius: 7,
  overflow: "hidden",
  border:
    isprimary === "true" ? `2px solid ${C.gold}` : "2px solid transparent",
  cursor: "pointer",
  position: "relative",
  transition: "border-color 0.14s",
  "& img": { width: "100%", height: "100%", objectFit: "cover" },
  "&:hover": { borderColor: `${C.gold}88` },
}));

const UploadZone = styled(Box)({
  margin: "0 12px 12px",
  borderRadius: 10,
  border: `1.5px dashed #3a5a65`,
  padding: "10px 12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#b0d0d8",
  fontSize: 12,
  fontWeight: 600,
  transition: "all 0.16s",
  "&:hover": {
    background: "rgba(255,255,255,0.06)",
    borderColor: C.gold,
    color: C.gold,
  },
});

const StatusCard = styled(Box)({
  background: C.white,
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  padding: "18px 20px",
  "@media (max-width: 960px)": { flex: "1 1 220px" },
});

// ─── Main form area ───────────────────────────────────────────
const MainContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 20,
  animation: `${fadeUp} 0.4s 0.08s ease both`,
});

const FormCard = styled(Box)({
  background: C.white,
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  padding: "26px 28px",
  "@media (max-width: 600px)": { padding: "18px 16px" },
});

const SectionLabel = styled(Typography)({
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.mutedDark,
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 8,
  "& svg": { fontSize: 14, opacity: 0.7 },
});

const FieldGrid = styled(Box)(({ cols = 2 }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  gap: "16px 24px",
  "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
}));

// ─── Custom Field Components ──────────────────────────────────
const FieldLabel = styled(Typography)({
  fontSize: 11,
  fontWeight: 700,
  color: C.muted,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& svg": { fontSize: 13, opacity: 0.65 },
});

const FieldRequired = styled("span")({
  color: C.danger,
  marginLeft: 2,
});

const StyledInput = styled("input")({
  width: "100%",
  padding: "9px 13px",
  fontSize: 13,
  fontWeight: 500,
  color: C.dark,
  background: "#fafaf8",
  border: `1.5px solid ${C.border}`,
  borderRadius: 9,
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
  transition: "border-color 0.14s, background 0.14s",
  "&:focus": { borderColor: C.teal, background: C.white },
  "&::placeholder": { color: "#c8c5bc" },
  "&:disabled": { background: "#f3f2ee", color: "#aaa", cursor: "not-allowed" },
});

const StyledSelect = styled("select")({
  width: "100%",
  padding: "9px 13px",
  fontSize: 13,
  fontWeight: 500,
  color: C.dark,
  background: "#fafaf8",
  border: `1.5px solid ${C.border}`,
  borderRadius: 9,
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
  transition: "border-color 0.14s, background 0.14s",
  "&:focus": { borderColor: C.teal, background: C.white },
  "&:disabled": { background: "#f3f2ee", color: "#aaa", cursor: "not-allowed" },
});

const StyledTextarea = styled("textarea")({
  width: "100%",
  padding: "9px 13px",
  fontSize: 13,
  fontWeight: 500,
  color: C.dark,
  background: "#fafaf8",
  border: `1.5px solid ${C.border}`,
  borderRadius: 9,
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
  resize: "vertical",
  minHeight: 80,
  lineHeight: 1.55,
  transition: "border-color 0.14s, background 0.14s",
  "&:focus": { borderColor: C.teal, background: C.white },
  "&::placeholder": { color: "#c8c5bc" },
});

const VisuallyHidden = styled("input")({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  border: 0,
});

// ─── Field Components ─────────────────────────────────────────
const Field = ({ label, icon, required, children }) => (
  <Box>
    <FieldLabel>
      {icon}
      {label}
      {required && <FieldRequired>*</FieldRequired>}
    </FieldLabel>
    {children}
  </Box>
);

// ─── Static Options ───────────────────────────────────────────
const STATUS_OPTIONS = [
  "Active",
  "In Maintenance",
  "Retired",
  "In Transit",
  "Reserved",
];
const CONDITION_OPTIONS = ["Good", "Fair", "Poor", "Critical"];
const INSPECTION_SCHEDULES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"];

// ─── Helpers ──────────────────────────────────────────────────
const getUserDisplayName = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  if (user.firstName || user.lastName)
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "";
};

const toDateInput = (val) => {
  if (!val) return "";
  try {
    return new Date(val).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// ─── Main Component ───────────────────────────────────────────
export default function EditAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getAssetById,
    updateAsset,
    deleteAssetImage,
    setPrimaryImage,
    uploadAssetImages,
    loading: ctxLoading,
  } = useAsset();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // ─── Form State ───────────────────────────────────────────
  const [form, setForm] = useState({
    // Core
    assetName: "",
    assetId: "",
    tagNumber: "",
    serialNumber: "",
    modelNumber: "",
    status: "Active",
    assetCondition: "Good",
    description: "",
    // Category & Location
    assetCategoryId: "",
    currentLocation: "",
    department: "",
    // Financial
    purchaseCost: "",
    commissioningDate: "",
    warrantyExpiryDate: "",
    // Users
    primaryUser: "",
    secondaryUser: "",
    custodian: "",
    // Physical Address
    streetAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    // Inspection
    amcEnabled: false,
    amcSchedule: "Annual",
    camcEnabled: false,
    camcSchedule: "Annual",
    // Images (existing from API)
    assetImages: [],
  });

  // ─── Load Asset ───────────────────────────────────────────
  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    setPageLoading(true);
    try {
      const res = await getAssetById(id);
      if (res && res.success !== false) {
        const a = res.asset || res.data || res;
        const addr = a.customPhysicalAddress || {};
        setForm({
          assetName: a.assetName || "",
          assetId: a.assetId || "",
          tagNumber: a.tagNumber || "",
          serialNumber: a.serialNumber || "",
          modelNumber: a.modelNumber || "",
          status: a.status || "Active",
          assetCondition: a.assetCondition || "Good",
          description: a.description || "",
          assetCategoryId: a.assetCategoryId?._id || a.assetCategoryId || "",
          currentLocation: a.currentLocation || "",
          department: a.department || "",
          purchaseCost: a.purchaseCost || "",
          commissioningDate: toDateInput(a.commissioningDate),
          warrantyExpiryDate: toDateInput(a.warrantyExpiryDate),
          primaryUser: getUserDisplayName(a.assignedUsers?.primaryUser),
          secondaryUser: getUserDisplayName(a.assignedUsers?.secondaryUser),
          custodian: getUserDisplayName(a.assignedUsers?.custodian),
          streetAddress: addr.streetAddress || "",
          city: addr.city || "",
          stateProvince: addr.stateProvince || "",
          postalCode: addr.postalCode || "",
          country: addr.country || "",
          amcEnabled: a.inspectionSystems?.amcInspection?.enabled || false,
          amcSchedule: a.inspectionSystems?.amcInspection?.schedule || "Annual",
          camcEnabled: a.inspectionSystems?.camcInspection?.enabled || false,
          camcSchedule:
            a.inspectionSystems?.camcInspection?.schedule || "Annual",
          assetImages: a.assetImages || [],
        });
        const primary =
          (a.assetImages || []).find((i) => i.isPrimary) ||
          (a.assetImages || [])[0];
        setActiveImage(primary?.name || null);
      } else {
        showSnackbar("Asset not found", "error");
        navigate("/admin/assets");
      }
    } catch (err) {
      showSnackbar("Failed to load asset", "error");
      navigate("/admin/assets");
    } finally {
      setPageLoading(false);
    }
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const setCheck = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.checked }));

  // ─── Image Handlers ───────────────────────────────────────
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("image", f));
      await uploadAssetImages(id, fd);
      showSnackbar(`${files.length} image(s) uploaded`);
      await fetchAsset();
    } catch {
      showSnackbar("Image upload failed", "error");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageName, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteAssetImage(id, imageName);
      showSnackbar("Image deleted");
      await fetchAsset();
    } catch {
      showSnackbar("Failed to delete image", "error");
    }
  };

  const handleSetPrimary = async (imageName, e) => {
    e.stopPropagation();
    try {
      await setPrimaryImage(id, imageName);
      showSnackbar("Primary image updated");
      await fetchAsset();
    } catch {
      showSnackbar("Failed to set primary", "error");
    }
  };

  const getImageUrl = (name) =>
    name ? `http://localhost:9001/uploads/assets/${name}` : null;

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.assetName.trim()) {
      showSnackbar("Asset name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        assetName: form.assetName,
        tagNumber: form.tagNumber,
        serialNumber: form.serialNumber,
        modelNumber: form.modelNumber,
        status: form.status,
        assetCondition: form.assetCondition,
        description: form.description,
        assetCategoryId: form.assetCategoryId || undefined,
        currentLocation: form.currentLocation,
        department: form.department,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : undefined,
        commissioningDate: form.commissioningDate || undefined,
        warrantyExpiryDate: form.warrantyExpiryDate || undefined,
        customPhysicalAddress: {
          streetAddress: form.streetAddress,
          city: form.city,
          stateProvince: form.stateProvince,
          postalCode: form.postalCode,
          country: form.country,
        },
        inspectionSystems: {
          amcInspection: {
            enabled: form.amcEnabled,
            schedule: form.amcSchedule,
          },
          camcInspection: {
            enabled: form.camcEnabled,
            schedule: form.camcSchedule,
          },
        },
      };
      await updateAsset(id, payload);
      showSnackbar("Asset updated successfully!");
      setTimeout(() => navigate(`/admin/assets/view/${id}`), 1200);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to update asset",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── Health score display ─────────────────────────────────
  const healthScore = 0; // Managed server-side
  const healthColor = C.success;

  // ─── Loading skeleton ─────────────────────────────────────
  if (pageLoading || ctxLoading) {
    return (
      <PageRoot>
        <TopBar>
          <Skeleton variant="rounded" width={160} height={36} />
          <Skeleton variant="rounded" width={180} height={36} />
        </TopBar>
        <BodyLayout>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
          </Box>
        </BodyLayout>
      </PageRoot>
    );
  }

  const imageUrl = getImageUrl(activeImage);

  return (
    <PageRoot>
      {/* ─── Top Bar ─── */}
      <TopBar>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flexWrap="wrap"
        >
          <BackBtn onClick={() => navigate(`/admin/assets/view/${id}`)}>
            <ArrowBack sx={{ fontSize: 17 }} />
          </BackBtn>
          <Box>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                color: C.dark,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Edit Asset
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: C.muted,
                fontFamily: "'DM Mono', monospace",
                mt: 0.2,
              }}
            >
              {form.assetId || id}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.2}>
          <CancelBtn onClick={() => navigate(`/admin/assets/view/${id}`)}>
            Cancel
          </CancelBtn>
          <SaveBtn
            startIcon={
              saving ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <Save sx={{ fontSize: 15 }} />
              )
            }
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </SaveBtn>
        </Stack>
      </TopBar>

      {/* ─── Body ─── */}
      <BodyLayout>
        {/* ── Sidebar ── */}
        <Sidebar>
          {/* Image Panel */}
          <ImagePanel>
            <MainImageArea>
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={form.assetName}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    background: "#082c4a",
                    fontSize: 28,
                    color: C.gold,
                  }}
                >
                  {form.assetName?.charAt(0).toUpperCase() || "A"}
                </Avatar>
              )}
              {uploadingImages && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(6,44,56,0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={32} sx={{ color: C.gold }} />
                </Box>
              )}
            </MainImageArea>

            {form.assetImages.length > 0 && (
              <ThumbnailRail>
                {form.assetImages.map((img, i) => (
                  <Thumb
                    key={img.name || i}
                    isprimary={String(img.isPrimary)}
                    onClick={() => {
                      setActiveImage(img.name);
                      setImageError(false);
                    }}
                  >
                    <img src={getImageUrl(img.name)} alt="" />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        display: "flex",
                        gap: 0.3,
                        background: "rgba(0,0,0,0.65)",
                        borderRadius: 4,
                        p: "2px",
                      }}
                    >
                      {img.isPrimary ? (
                        <Star sx={{ fontSize: 10, color: C.gold }} />
                      ) : (
                        <IconButton
                          size="small"
                          sx={{ color: "#ddd", p: "1px" }}
                          onClick={(e) => handleSetPrimary(img.name, e)}
                        >
                          <StarBorder sx={{ fontSize: 10 }} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        sx={{ color: "#ff8a8a", p: "1px" }}
                        onClick={(e) => handleDeleteImage(img.name, e)}
                      >
                        <DeleteOutline sx={{ fontSize: 10 }} />
                      </IconButton>
                    </Box>
                  </Thumb>
                ))}
              </ThumbnailRail>
            )}
          </ImagePanel>

          {/* Status quick-edit */}
          <StatusCard>
            <SectionLabel sx={{ mb: 14 }}>
              <HealthAndSafety /> Quick Status
            </SectionLabel>
            <Stack spacing={2}>
              <Field
                label="Status"
                icon={<CheckCircle sx={{ fontSize: 13 }} />}
              >
                <StyledSelect value={form.status} onChange={set("status")}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </StyledSelect>
              </Field>
              <Field
                label="Condition"
                icon={<HealthAndSafety sx={{ fontSize: 13 }} />}
              >
                <StyledSelect
                  value={form.assetCondition}
                  onChange={set("assetCondition")}
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </StyledSelect>
              </Field>
            </Stack>
          </StatusCard>
        </Sidebar>

        {/* ── Main Form ── */}
        <MainContent>
          {/* ─ Core Info ─ */}
          <FormCard>
            <SectionLabel>
              <Inventory2 /> Core Information
            </SectionLabel>
            <FieldGrid cols={2}>
              <Field
                label="Asset Name"
                icon={<Inventory2 sx={{ fontSize: 13 }} />}
                required
              >
                <StyledInput
                  value={form.assetName}
                  onChange={set("assetName")}
                  placeholder="e.g. Dell Latitude 5520"
                />
              </Field>
              <Field
                label="Asset ID"
                icon={<Inventory2 sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.assetId}
                  disabled
                  placeholder="Auto-generated"
                />
              </Field>
              <Field
                label="Tag Number"
                icon={<Inventory2 sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.tagNumber}
                  onChange={set("tagNumber")}
                  placeholder="e.g. TAG-00123"
                />
              </Field>
              <Field
                label="Serial Number"
                icon={<Inventory2 sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.serialNumber}
                  onChange={set("serialNumber")}
                  placeholder="e.g. SN-XXXXXXXX"
                />
              </Field>
              <Field
                label="Model Number"
                icon={<Inventory2 sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.modelNumber}
                  onChange={set("modelNumber")}
                  placeholder="e.g. LAT5520"
                />
              </Field>
              <Field
                label="Department"
                icon={<Category sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.department}
                  onChange={set("department")}
                  placeholder="e.g. IT Department"
                />
              </Field>
            </FieldGrid>
            <Box sx={{ mt: 2 }}>
              <Field
                label="Description"
                icon={<Description sx={{ fontSize: 13 }} />}
              >
                <StyledTextarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Brief description of the asset…"
                  rows={3}
                />
              </Field>
            </Box>
          </FormCard>

          {/* ─ Location & Category ─ */}
          <FormCard>
            <SectionLabel>
              <LocationOn /> Location & Category
            </SectionLabel>
            <FieldGrid cols={2}>
              <Field
                label="Current Location"
                icon={<LocationOn sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.currentLocation}
                  onChange={set("currentLocation")}
                  placeholder="e.g. Server Room B2"
                />
              </Field>
              <Field
                label="Category ID"
                icon={<Category sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.assetCategoryId}
                  onChange={set("assetCategoryId")}
                  placeholder="Category ID or name"
                />
              </Field>
            </FieldGrid>
          </FormCard>

          {/* ─ Financial ─ */}
          <FormCard>
            <SectionLabel>
              <CurrencyRupeeIcon sx={{ fontSize: 14 }} /> Financial Details
            </SectionLabel>
            <FieldGrid cols={3}>
              <Field
                label="Purchase Cost (₹)"
                icon={<CurrencyRupeeIcon sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  type="number"
                  min="0"
                  value={form.purchaseCost}
                  onChange={set("purchaseCost")}
                  placeholder="0.00"
                />
              </Field>
              <Field
                label="Commissioning Date"
                icon={<CalendarToday sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  type="date"
                  value={form.commissioningDate}
                  onChange={set("commissioningDate")}
                />
              </Field>
              <Field
                label="Warranty Expiry"
                icon={<CalendarToday sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  type="date"
                  value={form.warrantyExpiryDate}
                  onChange={set("warrantyExpiryDate")}
                />
              </Field>
            </FieldGrid>
          </FormCard>

          {/* ─ Assigned Users ─ */}
          <FormCard>
            <SectionLabel>
              <Person /> Assigned Users
            </SectionLabel>
            <FieldGrid cols={3}>
              <Field
                label="Primary User"
                icon={<Person sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.primaryUser}
                  onChange={set("primaryUser")}
                  placeholder="Full name or user ID"
                />
              </Field>
              <Field
                label="Secondary User"
                icon={<Person sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.secondaryUser}
                  onChange={set("secondaryUser")}
                  placeholder="Full name or user ID"
                />
              </Field>
              <Field
                label="Custodian"
                icon={<VerifiedUser sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.custodian}
                  onChange={set("custodian")}
                  placeholder="Full name or user ID"
                />
              </Field>
            </FieldGrid>
          </FormCard>

          {/* ─ Physical Address ─ */}
          <FormCard>
            <SectionLabel>
              <Home /> Physical Address
            </SectionLabel>
            <Box sx={{ mb: 2 }}>
              <Field
                label="Street Address"
                icon={<Home sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.streetAddress}
                  onChange={set("streetAddress")}
                  placeholder="e.g. 42 Industrial Estate Rd"
                />
              </Field>
            </Box>
            <FieldGrid cols={2}>
              <Field label="City" icon={<PinDrop sx={{ fontSize: 13 }} />}>
                <StyledInput
                  value={form.city}
                  onChange={set("city")}
                  placeholder="e.g. Mumbai"
                />
              </Field>
              <Field
                label="State / Province"
                icon={<FmdGood sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.stateProvince}
                  onChange={set("stateProvince")}
                  placeholder="e.g. Maharashtra"
                />
              </Field>
              <Field
                label="Postal Code"
                icon={<PinDrop sx={{ fontSize: 13 }} />}
              >
                <StyledInput
                  value={form.postalCode}
                  onChange={set("postalCode")}
                  placeholder="e.g. 400001"
                />
              </Field>
              <Field label="Country" icon={<FmdGood sx={{ fontSize: 13 }} />}>
                <StyledInput
                  value={form.country}
                  onChange={set("country")}
                  placeholder="e.g. India"
                />
              </Field>
            </FieldGrid>
          </FormCard>

          {/* ─ Inspection Systems ─ */}
          <FormCard>
            <SectionLabel>
              <HealthAndSafety /> Inspection Systems
            </SectionLabel>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 24px",
                "@media (max-width:600px)": { gridTemplateColumns: "1fr" },
              }}
            >
              {/* AMC */}
              <Box
                sx={{
                  p: "16px 18px",
                  borderRadius: 12,
                  transition: "all 0.16s",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.dark,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    AMC Inspection
                  </Typography>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: 6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.amcEnabled}
                      onChange={setCheck("amcEnabled")}
                      style={{ accentColor: C.teal, width: 15, height: 15 }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: form.amcEnabled ? C.teal : C.muted,
                      }}
                    >
                      {form.amcEnabled ? "Enabled" : "Disabled"}
                    </Typography>
                  </label>
                </Stack>
                <Field label="Schedule">
                  <StyledSelect
                    value={form.amcSchedule}
                    onChange={set("amcSchedule")}
                    disabled={!form.amcEnabled}
                  >
                    {INSPECTION_SCHEDULES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </StyledSelect>
                </Field>
              </Box>

              {/* CAMC */}
              <Box
                sx={{
                  p: "16px 18px",
                  borderRadius: 12,
                  transition: "all 0.16s",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.dark,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    CAMC Inspection
                  </Typography>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: 6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.camcEnabled}
                      onChange={setCheck("camcEnabled")}
                      style={{ accentColor: C.teal, width: 15, height: 15 }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: form.camcEnabled ? C.teal : C.muted,
                      }}
                    >
                      {form.camcEnabled ? "Enabled" : "Disabled"}
                    </Typography>
                  </label>
                </Stack>
                <Field label="Schedule">
                  <StyledSelect
                    value={form.camcSchedule}
                    onChange={set("camcSchedule")}
                    disabled={!form.camcEnabled}
                  >
                    {INSPECTION_SCHEDULES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </StyledSelect>
                </Field>
              </Box>
            </Box>
          </FormCard>

          {/* ─ Bottom Action Bar ─ */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.2,
              pb: 2,
              flexWrap: "wrap",
            }}
          >
            <CancelBtn onClick={() => navigate(`/admin/assets/view/${id}`)}>
              Cancel
            </CancelBtn>
            <SaveBtn
              startIcon={
                saving ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  <Save sx={{ fontSize: 15 }} />
                )
              }
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </SaveBtn>
          </Box>
        </MainContent>
      </BodyLayout>

      {/* ─── Snackbar ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 10, fontFamily: "'DM Sans', sans-serif" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageRoot>
  );
}

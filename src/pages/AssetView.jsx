// src/pages/AssetView.jsx
// ─── FIXES ────────────────────────────────────────────────────────────────────
// 1. LinkAssetDialog: uses fetchRequests (not getRequests) matching the context API
// 2. Parent list: correct param name `type=parent` (not `type=all` / `status=approved`)
// 3. Auth: all fetch calls now pull token from localStorage/sessionStorage correctly
// 4. 401 handling: errors shown inline with retry capability
// 5. Responsive layout: removed hardcoded px widths, full CSS grid/flex responsiveness
// 6. Enhanced design: improved spacing, micro-interactions, loading states, empty states
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Grid,
  Stack,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  CircularProgress,
  Avatar,
  LinearProgress,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Collapse,
  Tab,
  Tabs,
  alpha,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset } from "../context/AssetContext";
import { useAssetRequest } from "../context/AssetRequestContext";

import {
  ArrowBack,
  Edit,
  Delete,
  LocationOn,
  CalendarToday,
  Person,
  CheckCircle,
  Category,
  VerifiedUser,
  Description,
  Home,
  PinDrop,
  Link as LinkIcon,
  AddLink,
  Search,
  Close,
  Check,
  ErrorOutline,
  Inventory2,
  DirectionsCar,
  Settings,
  DeleteOutline,
  Computer,
  Apartment,
  ContentCopy,
  History,
  Warning,
  Shield,
  Memory,
  LocalOffer,
  Build,
  Sensors,
  AccountTree,
  FiberManualRecord,
  SwapHoriz,
  ArrowForwardIos,
  AttachMoney,
  Numbers,
  CheckCircleOutline,
  CancelOutlined,
  HourglassEmpty,
  Refresh,
  LinkOff,
} from "@mui/icons-material";

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;
const popIn = keyframes`0%{opacity:0;transform:scale(0.92)}100%{opacity:1;transform:scale(1)}`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  surfaceAlt: "#F9F8F5",
  surfaceHover: "#F2F1ED",
  border: "#E8E4DC",
  borderStrong: "#D4CFC4",
  ink: "#1A1A18",
  inkSecondary: "#5C5B56",
  inkMuted: "#9E9B93",
  brand: "#2D4A3E",
  brandLight: "#E8F0EC",
  brandAccent: "#5C8A72",
  brandGlow: "rgba(45,74,62,0.15)",
  amber: "#C8873A",
  amberLight: "#FBF0E4",
  red: "#C0392B",
  redLight: "#FBE8E6",
  teal: "#1A7A8A",
  tealLight: "#E3F3F6",
  gold: "#B8953A",
  goldLight: "#FBF4E3",
  violet: "#6B4E9E",
  violetLight: "#F0EBF8",
  font: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
  r: { xs: "6px", sm: "10px", md: "14px", lg: "20px", xl: "28px" },
  sh: {
    sm: "0 1px 3px rgba(26,26,24,0.07), 0 1px 2px rgba(26,26,24,0.04)",
    md: "0 4px 16px rgba(26,26,24,0.09), 0 2px 6px rgba(26,26,24,0.05)",
    lg: "0 12px 40px rgba(26,26,24,0.13), 0 4px 12px rgba(26,26,24,0.06)",
    xl: "0 24px 64px rgba(26,26,24,0.17), 0 8px 24px rgba(26,26,24,0.08)",
  },
};

// ─── Status / Condition configs ───────────────────────────────────────────────
const STATUS_CFG = {
  Active: { bg: "#E8F5EE", color: "#1A6B3C", dot: "#2ECC71" },
  "In Maintenance": { bg: "#FEF3E2", color: "#A0560A", dot: "#F39C12" },
  Retired: { bg: "#FCE8E6", color: "#A93226", dot: "#E74C3C" },
  "In Transit": { bg: "#E3F2FD", color: "#1565C0", dot: "#2196F3" },
  Reserved: { bg: "#F3E8FD", color: "#6A1B9A", dot: "#9C27B0" },
};
const CONDITION_CFG = {
  Excellent: { color: "#1A6B3C", bg: "#E8F5EE" },
  Good: { color: "#1565C0", bg: "#E3F2FD" },
  Normal: { color: "#5C5B56", bg: "#F0EFEA" },
  Critical: { color: "#A93226", bg: "#FCE8E6" },
  Poor: { color: "#A0560A", bg: "#FEF3E2" },
};
const REQ_STATUS_CFG = {
  pending: {
    bg: "#FEF3E2",
    color: "#A0560A",
    icon: <HourglassEmpty sx={{ fontSize: 12 }} />,
  },
  approved: {
    bg: "#E8F5EE",
    color: "#1A6B3C",
    icon: <CheckCircleOutline sx={{ fontSize: 12 }} />,
  },
  rejected: {
    bg: "#FCE8E6",
    color: "#A93226",
    icon: <CancelOutlined sx={{ fontSize: 12 }} />,
  },
  completed: {
    bg: "#E3F2FD",
    color: "#1565C0",
    icon: <CheckCircle sx={{ fontSize: 12 }} />,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUserName = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;
  if (user.firstName || user.lastName)
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return user.name || user.email || "Unknown";
};

const getToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("accessToken") ||
  "";

// ─── Styled atoms ─────────────────────────────────────────────────────────────
const Card = styled(Paper)({
  background: T.surface,
  borderRadius: 20,
  border: `1px solid ${T.border}`,
  boxShadow: T.sh.sm,
  overflow: "hidden",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": { boxShadow: T.sh.md },
});

const SectionTitle = ({ children, icon, action }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    mb={2.5}
  >
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box sx={{ color: T.brand, display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: T.inkMuted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: T.font,
        }}
      >
        {children}
      </Typography>
    </Stack>
    {action}
  </Stack>
);

const Field = ({ label, value, mono, icon, fullWidth, color, badge }) => (
  <Box sx={{ gridColumn: fullWidth ? "span 2" : undefined }}>
    <Typography
      sx={{
        fontSize: "0.67rem",
        fontWeight: 700,
        color: T.inkMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        mb: 0.5,
        fontFamily: T.font,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {icon && React.cloneElement(icon, { sx: { fontSize: 11 } })}
      {label}
    </Typography>
    {badge ? (
      <Chip
        label={value || "—"}
        size="small"
        sx={{
          height: 22,
          fontSize: "0.73rem",
          fontWeight: 600,
          bgcolor: badge.bg,
          color: badge.color,
          fontFamily: T.font,
          borderRadius: T.r.xs,
        }}
      />
    ) : (
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: color || T.ink,
          fontFamily: mono ? T.fontMono : T.font,
          wordBreak: "break-all",
        }}
      >
        {value || <span style={{ color: T.inkMuted, fontWeight: 400 }}>—</span>}
      </Typography>
    )}
  </Box>
);

const SpecialistRow = ({ icon, label, value, color }) => {
  if (
    !value ||
    value === "Not Applicable" ||
    value === "Not Scheduled" ||
    value === 0
  )
    return null;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        py: 1,
        borderBottom: `1px solid ${T.border}`,
        "&:last-child": { borderBottom: "none", pb: 0 },
      }}
    >
      <Box sx={{ color: color || T.inkMuted, display: "flex" }}>
        {React.cloneElement(icon, { sx: { fontSize: 14 } })}
      </Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: T.inkMuted,
          fontFamily: T.font,
          flex: 1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: T.ink,
          fontFamily: T.font,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: T.r.md,
      bgcolor: T.redLight,
      border: `1px solid ${alpha(T.red, 0.2)}`,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <ErrorOutline sx={{ color: T.red, fontSize: 22, flexShrink: 0 }} />
    <Typography
      sx={{
        flex: 1,
        fontSize: "0.875rem",
        color: T.red,
        fontFamily: T.font,
        fontWeight: 500,
      }}
    >
      {message}
    </Typography>
    {onRetry && (
      <Button
        size="small"
        onClick={onRetry}
        startIcon={<Refresh sx={{ fontSize: 15 }} />}
        sx={{
          textTransform: "none",
          color: T.red,
          borderRadius: T.r.xs,
          border: `1px solid ${alpha(T.red, 0.35)}`,
          fontFamily: T.font,
          fontWeight: 600,
          fontSize: "0.78rem",
          "&:hover": { bgcolor: alpha(T.red, 0.08) },
        }}
      >
        Retry
      </Button>
    )}
  </Box>
);

// ─── Link Asset Dialog ────────────────────────────────────────────────────────
const LinkAssetDialog = ({ open, onClose, assetId, onSuccess }) => {
  const { fetchRequests, createChildRequest } = useAssetRequest();

  const [step, setStep] = useState(1);
  const [parentRequests, setParentRequests] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [parentError, setParentError] = useState("");
  const [assetError, setAssetError] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChildAsset, setSelectedChildAsset] = useState(null);
  const [relationshipType, setRelationshipType] = useState("accessory");
  const [searchParent, setSearchParent] = useState("");
  const [searchChild, setSearchChild] = useState("");
  const [linking, setLinking] = useState(false);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [snackMsg, setSnackMsg] = useState("");

  // FIX 1: Use fetchRequests (the correct context method) with type=parent
  const loadParentRequests = useCallback(async () => {
    setLoadingParents(true);
    setParentError("");
    try {
      // type=parent fetches only parent requests (not child requests)
      const res = await fetchRequests({ type: "parent", limit: 100 });
      if (res?.success) {
        setParentRequests(res.requests || []);
      } else {
        setParentError(res?.message || "Failed to load parent requests");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setParentError(
          "Authentication failed. Please refresh the page and log in again.",
        );
      } else {
        setParentError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load parent requests",
        );
      }
    } finally {
      setLoadingParents(false);
    }
  }, [fetchRequests]);

  // FIX 2: Proper token retrieval and error handling for assets fetch
  const loadAllAssets = useCallback(async () => {
    setLoadingAssets(true);
    setAssetError("");
    try {
      const token = getToken();
      if (!token) {
        setAssetError("No auth token found. Please log in again.");
        return;
      }
      const API =
        import.meta.env?.VITE_API_URL || "https://assset-management-backend-4.onrender.com/api/v1";
      const res = await fetch(`${API}/assets?limit=200`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.status === 401 || res.status === 403) {
        setAssetError(
          "Authentication failed. Please refresh the page and log in again.",
        );
        return;
      }
      if (!res.ok) {
        setAssetError(`Failed to load assets (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAllAssets(
          (data.assets || []).filter((a) => (a._id || a.id) !== assetId),
        );
      } else {
        setAssetError(data.message || "Failed to load assets");
      }
    } catch (err) {
      setAssetError(err?.message || "Failed to load assets");
    } finally {
      setLoadingAssets(false);
    }
  }, [assetId]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedParent(null);
      setSelectedChildAsset(null);
      setSearchParent("");
      setSearchChild("");
      setDescription("");
      setParentError("");
      setAssetError("");
      loadParentRequests();
      loadAllAssets();
    }
  }, [open]);

  const filteredParents = parentRequests.filter(
    (r) =>
      (r.assetId?.assetName || "")
        .toLowerCase()
        .includes(searchParent.toLowerCase()) ||
      (r.requestType || "")
        .toLowerCase()
        .includes(searchParent.toLowerCase()) ||
      (r.assetId?.assetId || "")
        .toLowerCase()
        .includes(searchParent.toLowerCase()),
  );

  const filteredAssets = allAssets.filter(
    (a) =>
      (a.assetName || "").toLowerCase().includes(searchChild.toLowerCase()) ||
      (a.assetId || "").toLowerCase().includes(searchChild.toLowerCase()),
  );

  const handleLink = async () => {
    if (!selectedParent || !selectedChildAsset) {
      setSnackMsg("Please complete both selections");
      return;
    }
    setLinking(true);
    try {
      const res = await createChildRequest(selectedParent._id, {
        assetId: selectedChildAsset._id || selectedChildAsset.id,
        relationshipType,
        description: description || `Linked as ${relationshipType}`,
        urgency,
        requestType: "maintenance",
      });
      if (res?.success !== false) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(res?.message || "Link failed");
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setSnackMsg("Authentication failed. Please refresh the page.");
      } else {
        setSnackMsg(
          e?.response?.data?.message || e?.message || "Failed to link asset",
        );
      }
    } finally {
      setLinking(false);
    }
  };

  const selectedParentAsset = selectedParent?.assetId;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: T.r.lg,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
            boxShadow: T.sh.xl,
            overflow: "hidden",
            animation: `${popIn} 0.25s ease both`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 0,
            background: `linear-gradient(135deg, ${T.brandLight} 0%, ${T.surface} 70%)`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: T.r.sm,
                  bgcolor: T.brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${T.brandGlow}`,
                }}
              >
                <AddLink sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: T.ink,
                    fontFamily: T.font,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Link Asset
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: T.inkMuted,
                    fontFamily: T.font,
                  }}
                >
                  {step === 1
                    ? "Step 1 of 2 — Select parent request"
                    : "Step 2 of 2 — Configure child link"}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                bgcolor: T.surfaceAlt,
                borderRadius: T.r.xs,
                border: `1px solid ${T.border}`,
                "&:hover": { bgcolor: T.border },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>

          {/* Step progress */}
          <Stack direction="row" spacing={0.75} sx={{ pb: 2 }}>
            {[1, 2].map((s) => (
              <Box
                key={s}
                sx={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  bgcolor: s <= step ? T.brand : T.border,
                  transition: "background 0.35s ease",
                  position: "relative",
                  overflow: "hidden",
                  ...(s === step
                    ? {
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(90deg, transparent 0%, ${alpha("#fff", 0.4)} 50%, transparent 100%)`,
                          animation: `${shimmer} 1.5s infinite`,
                          backgroundSize: "200% 100%",
                        },
                      }
                    : {}),
                }}
              />
            ))}
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0, maxHeight: "72vh", overflowY: "auto" }}>
          {/* ── STEP 1: Parent request ── */}
          <Collapse in={step === 1} unmountOnExit>
            <Box sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: T.inkSecondary,
                  fontFamily: T.font,
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                Choose an existing parent request to link the current asset
                under.
              </Typography>

              {parentError ? (
                <ErrorBanner
                  message={parentError}
                  onRetry={loadParentRequests}
                />
              ) : (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by asset name, ID, or request type…"
                    value={searchParent}
                    onChange={(e) => setSearchParent(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: 15, color: T.inkMuted }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: T.r.sm,
                        fontSize: "0.875rem",
                        fontFamily: T.font,
                        "& fieldset": { borderColor: T.border },
                        "&:hover fieldset": { borderColor: T.brand },
                        "&.Mui-focused fieldset": {
                          borderColor: T.brand,
                          borderWidth: 1.5,
                        },
                      },
                    }}
                  />

                  {loadingParents ? (
                    <Stack spacing={1.5}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          height={88}
                          sx={{ borderRadius: T.r.md }}
                        />
                      ))}
                    </Stack>
                  ) : filteredParents.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          bgcolor: T.surfaceAlt,
                          border: `1px solid ${T.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <LinkOff sx={{ fontSize: 26, color: T.inkMuted }} />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: T.ink,
                          fontFamily: T.font,
                          mb: 0.5,
                        }}
                      >
                        {searchParent
                          ? "No matching requests"
                          : "No parent requests found"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: T.inkMuted,
                          fontFamily: T.font,
                        }}
                      >
                        {searchParent
                          ? "Try a different search term"
                          : "Create a request first before linking"}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack
                      spacing={1.25}
                      sx={{ maxHeight: 360, overflowY: "auto", pr: 0.5 }}
                    >
                      {filteredParents.map((req) => {
                        const isSelected = selectedParent?._id === req._id;
                        const sCfg = REQ_STATUS_CFG[req.status] || {};
                        return (
                          <Box
                            key={req._id}
                            onClick={() => setSelectedParent(req)}
                            sx={{
                              p: 2,
                              borderRadius: T.r.md,
                              cursor: "pointer",
                              border: `1.5px solid ${isSelected ? T.brand : T.border}`,
                              bgcolor: isSelected ? T.brandLight : T.surface,
                              transition: "all 0.15s ease",
                              boxShadow: isSelected
                                ? `0 0 0 3px ${T.brandGlow}`
                                : "none",
                              "&:hover": {
                                borderColor: T.brand,
                                bgcolor: T.brandLight,
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="flex-start"
                              justifyContent="space-between"
                            >
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="flex-start"
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: T.r.xs,
                                    bgcolor: isSelected
                                      ? T.brand
                                      : T.surfaceAlt,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.15s",
                                    flexShrink: 0,
                                    mt: 0.25,
                                  }}
                                >
                                  <AccountTree
                                    sx={{
                                      fontSize: 16,
                                      color: isSelected ? "#fff" : T.inkMuted,
                                    }}
                                  />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: T.ink,
                                      fontFamily: T.font,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {req.assetId?.assetName || "Unnamed Asset"}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: T.inkMuted,
                                      fontFamily: T.fontMono,
                                      mt: 0.2,
                                    }}
                                  >
                                    {req.assetId?.assetId ||
                                      req._id?.slice(-8) ||
                                      "—"}{" "}
                                    · {req.requestType}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={0.75}
                                    mt={0.75}
                                    flexWrap="wrap"
                                  >
                                    <Chip
                                      label={req.urgency || "—"}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.62rem",
                                        fontWeight: 600,
                                        bgcolor:
                                          req.urgency === "high"
                                            ? T.redLight
                                            : req.urgency === "critical"
                                              ? "#FCE8E6"
                                              : T.amberLight,
                                        color:
                                          req.urgency === "high" ||
                                          req.urgency === "critical"
                                            ? T.red
                                            : T.amber,
                                        fontFamily: T.font,
                                      }}
                                    />
                                    {(req.childRequests?.length ||
                                      req.childCount ||
                                      0) > 0 && (
                                      <Chip
                                        label={`${req.childRequests?.length || req.childCount} linked`}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: "0.62rem",
                                          fontWeight: 500,
                                          bgcolor: T.violetLight,
                                          color: T.violet,
                                          fontFamily: T.font,
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>
                              <Stack
                                alignItems="flex-end"
                                spacing={0.5}
                                sx={{ ml: 1, flexShrink: 0 }}
                              >
                                <Chip
                                  label={req.status}
                                  size="small"
                                  icon={sCfg.icon}
                                  sx={{
                                    height: 22,
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    bgcolor: sCfg.bg,
                                    color: sCfg.color,
                                    fontFamily: T.font,
                                    "& .MuiChip-icon": { color: sCfg.color },
                                  }}
                                />
                                {isSelected && (
                                  <Check
                                    sx={{ fontSize: 16, color: T.brand }}
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </>
              )}
            </Box>
          </Collapse>

          {/* ── STEP 2: Child asset + config ── */}
          <Collapse in={step === 2} unmountOnExit>
            <Box sx={{ p: 3 }}>
              {/* Parent summary */}
              {selectedParent && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: T.r.md,
                    bgcolor: T.brandLight,
                    border: `1px solid ${alpha(T.brand, 0.2)}`,
                    mb: 2.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      color: T.brand,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      mb: 0.75,
                      fontFamily: T.font,
                    }}
                  >
                    Parent Request
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <AccountTree
                      sx={{ fontSize: 18, color: T.brand, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: T.ink,
                          fontFamily: T.font,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedParentAsset?.assetName || "Unnamed"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          color: T.inkMuted,
                          fontFamily: T.fontMono,
                        }}
                      >
                        {selectedParentAsset?.assetId || "—"} ·{" "}
                        {selectedParent.requestType}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => setStep(1)}
                      sx={{
                        textTransform: "none",
                        color: T.brand,
                        fontFamily: T.font,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        p: 0,
                        minWidth: 0,
                        "&:hover": {
                          bgcolor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Change
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Relationship */}
              <Box mb={2.5}>
                <Typography
                  sx={{
                    fontSize: "0.67rem",
                    fontWeight: 700,
                    color: T.inkMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1,
                    fontFamily: T.font,
                  }}
                >
                  Relationship Type
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {["accessory", "component", "attachment", "spare"].map(
                    (t) => (
                      <Chip
                        key={t}
                        label={t}
                        clickable
                        onClick={() => setRelationshipType(t)}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          fontFamily: T.font,
                          textTransform: "capitalize",
                          bgcolor:
                            relationshipType === t ? T.brand : T.surfaceAlt,
                          color:
                            relationshipType === t ? "#fff" : T.inkSecondary,
                          border: `1px solid ${relationshipType === t ? T.brand : T.border}`,
                          transition: "all 0.15s",
                          boxShadow:
                            relationshipType === t
                              ? `0 2px 8px ${T.brandGlow}`
                              : "none",
                        }}
                      />
                    ),
                  )}
                </Stack>
              </Box>

              {/* Urgency */}
              <Box mb={2.5}>
                <Typography
                  sx={{
                    fontSize: "0.67rem",
                    fontWeight: 700,
                    color: T.inkMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1,
                    fontFamily: T.font,
                  }}
                >
                  Urgency
                </Typography>
                <Stack direction="row" spacing={0.75}>
                  {[
                    ["low", T.teal, T.tealLight],
                    ["medium", T.amber, T.amberLight],
                    ["high", T.red, T.redLight],
                  ].map(([u, activeColor, activeBg]) => (
                    <Chip
                      key={u}
                      label={u}
                      clickable
                      onClick={() => setUrgency(u)}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        fontFamily: T.font,
                        textTransform: "capitalize",
                        flex: 1,
                        justifyContent: "center",
                        bgcolor: urgency === u ? activeColor : T.surfaceAlt,
                        color: urgency === u ? "#fff" : T.inkSecondary,
                        border: `1px solid ${urgency === u ? activeColor : T.border}`,
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Description */}
              <Box mb={2.5}>
                <Typography
                  sx={{
                    fontSize: "0.67rem",
                    fontWeight: 700,
                    color: T.inkMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1,
                    fontFamily: T.font,
                  }}
                >
                  Description{" "}
                  <span style={{ textTransform: "none", fontWeight: 400 }}>
                    (optional)
                  </span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder={`Linked as ${relationshipType}…`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: T.r.sm,
                      fontSize: "0.875rem",
                      fontFamily: T.font,
                      "& fieldset": { borderColor: T.border },
                      "&.Mui-focused fieldset": {
                        borderColor: T.brand,
                        borderWidth: 1.5,
                      },
                    },
                  }}
                />
              </Box>

              {/* Child asset selection */}
              <Typography
                sx={{
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  color: T.inkMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 1,
                  fontFamily: T.font,
                }}
              >
                Select Child Asset
              </Typography>

              {assetError ? (
                <ErrorBanner message={assetError} onRetry={loadAllAssets} />
              ) : (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name or asset ID…"
                    value={searchChild}
                    onChange={(e) => setSearchChild(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: 15, color: T.inkMuted }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 1.5,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: T.r.sm,
                        fontSize: "0.875rem",
                        fontFamily: T.font,
                        "& fieldset": { borderColor: T.border },
                        "&:hover fieldset": { borderColor: T.brand },
                        "&.Mui-focused fieldset": {
                          borderColor: T.brand,
                          borderWidth: 1.5,
                        },
                      },
                    }}
                  />

                  {loadingAssets ? (
                    <Stack spacing={1.25}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          height={62}
                          sx={{ borderRadius: T.r.sm }}
                        />
                      ))}
                    </Stack>
                  ) : filteredAssets.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: T.inkMuted,
                          fontFamily: T.font,
                        }}
                      >
                        {searchChild
                          ? "No assets match your search"
                          : "No available assets"}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack
                      spacing={1}
                      sx={{ maxHeight: 280, overflowY: "auto", pr: 0.5 }}
                    >
                      {filteredAssets.map((asset) => {
                        const isSelected =
                          selectedChildAsset?._id === asset._id ||
                          selectedChildAsset?.id === asset.id;
                        const sCfg = STATUS_CFG[asset.status] || {};
                        return (
                          <Box
                            key={asset._id || asset.id}
                            onClick={() => setSelectedChildAsset(asset)}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: T.r.sm,
                              cursor: "pointer",
                              border: `1.5px solid ${isSelected ? T.brand : T.border}`,
                              bgcolor: isSelected ? T.brandLight : T.surface,
                              transition: "all 0.15s ease",
                              boxShadow: isSelected
                                ? `0 0 0 3px ${T.brandGlow}`
                                : "none",
                              "&:hover": {
                                borderColor: T.brand,
                                bgcolor: T.brandLight,
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: T.r.xs,
                                    bgcolor: isSelected
                                      ? T.brand
                                      : T.surfaceAlt,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <Inventory2
                                    sx={{
                                      fontSize: 14,
                                      color: isSelected ? "#fff" : T.inkMuted,
                                    }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: T.ink,
                                      fontFamily: T.font,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {asset.assetName}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: T.inkMuted,
                                      fontFamily: T.fontMono,
                                    }}
                                  >
                                    {asset.assetId}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.75}
                                sx={{ ml: 1, flexShrink: 0 }}
                              >
                                {sCfg.dot && (
                                  <Box
                                    sx={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: "50%",
                                      bgcolor: sCfg.dot,
                                    }}
                                  />
                                )}
                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: sCfg.color || T.inkMuted,
                                    fontWeight: 500,
                                    fontFamily: T.font,
                                  }}
                                >
                                  {asset.status}
                                </Typography>
                                {isSelected && (
                                  <Check
                                    sx={{ fontSize: 15, color: T.brand }}
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </>
              )}
            </Box>
          </Collapse>
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: T.surfaceAlt,
          }}
        >
          <Button
            onClick={step === 1 ? onClose : () => setStep(1)}
            sx={{
              textTransform: "none",
              borderRadius: T.r.sm,
              color: T.inkSecondary,
              fontFamily: T.font,
              fontWeight: 600,
              px: 2.5,
              border: `1px solid ${T.border}`,
              bgcolor: T.surface,
              "&:hover": { bgcolor: T.surfaceHover },
            }}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </Button>
          {step === 1 ? (
            <Button
              variant="contained"
              onClick={() => setStep(2)}
              disabled={!selectedParent}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                bgcolor: T.brand,
                color: "#fff",
                fontFamily: T.font,
                fontWeight: 700,
                px: 3,
                boxShadow: `0 2px 8px ${T.brandGlow}`,
                "&:hover": { bgcolor: T.brandAccent },
                "&.Mui-disabled": { opacity: 0.45 },
              }}
            >
              Next: Select Asset →
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleLink}
              disabled={!selectedChildAsset || linking}
              startIcon={
                linking ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <LinkIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                bgcolor: T.brand,
                color: "#fff",
                fontFamily: T.font,
                fontWeight: 700,
                px: 3,
                boxShadow: `0 2px 8px ${T.brandGlow}`,
                "&:hover": { bgcolor: T.brandAccent },
                "&.Mui-disabled": { opacity: 0.45 },
              }}
            >
              {linking ? "Linking…" : "Confirm Link"}
            </Button>
          )}
        </Box>
      </Dialog>

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={5000}
        onClose={() => setSnackMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setSnackMsg("")}
          sx={{ borderRadius: T.r.sm, fontFamily: T.font, fontWeight: 500 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssetById, deleteAsset, loading: assetLoading } = useAsset();
  const { getRequestsByAsset } = useAssetRequest();

  const [asset, setAsset] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkedRequests, setLinkedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const loadAsset = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await getAssetById(id);
      if (res && res.success !== false) {
        const data = res.asset || res.data || res;
        setAsset(data);
        const primary =
          data?.assetImages?.find((i) => i.isPrimary) || data?.assetImages?.[0];
        setActiveImage(primary?.name || null);
      } else {
        toast("Asset not found", "error");
        navigate("/admin/assets");
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        toast("Session expired. Please log in again.", "error");
      } else {
        toast(e?.response?.data?.message || "Failed to fetch asset", "error");
      }
      navigate("/admin/assets");
    } finally {
      setPageLoading(false);
    }
  }, [id, getAssetById, navigate]);

  const loadLinkedRequests = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getRequestsByAsset(id);
      if (res && res.success !== false) setLinkedRequests(res.requests || []);
    } catch (e) {
      // Silently fail — not critical
      console.warn(
        "[AssetView] Failed to load linked requests:",
        e?.response?.status,
      );
    }
  }, [id, getRequestsByAsset]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);
  useEffect(() => {
    if (asset) loadLinkedRequests();
  }, [asset, loadLinkedRequests]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAsset(id);
      toast("Asset deleted successfully");
      setTimeout(() => navigate("/admin/assets"), 1500);
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const getImageUrl = (name) =>
    name
      ? `${import.meta.env?.VITE_API_URL?.replace("/api/v1", "") || "https://assset-management-backend-4.onrender.com"}/uploads/assets/${name}`
      : null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (pageLoading)
    return (
      <Box sx={{ minHeight: "100vh", fontFamily: T.font }}>
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: `1px solid ${T.border}`,
            bgcolor: T.surface,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton
              variant="rounded"
              width={38}
              height={38}
              sx={{ borderRadius: T.r.sm }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="text" width="25%" height={18} />
            </Box>
            <Stack direction="row" spacing={1}>
              {[80, 70, 70].map((w, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={w}
                  height={32}
                  sx={{ borderRadius: T.r.sm }}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3.5}>
              <Stack spacing={2.5}>
                {[360, 130, 200].map((h, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={h}
                    sx={{ borderRadius: T.r.lg }}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={8} lg={8.5}>
              <Skeleton
                variant="rounded"
                height={520}
                sx={{ borderRadius: T.r.lg }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    );

  if (!asset) return null;

  const statusCfg = STATUS_CFG[asset.status] || {
    bg: "#f1f5f9",
    color: "#475569",
    dot: "#94a3b8",
  };
  const conditionCfg =
    CONDITION_CFG[asset.assetCondition] || CONDITION_CFG.Normal;
  const healthColor =
    asset.healthScore >= 70
      ? "#1A6B3C"
      : asset.healthScore >= 40
        ? "#A0560A"
        : "#A93226";
  const healthBg =
    asset.healthScore >= 70
      ? "#E8F5EE"
      : asset.healthScore >= 40
        ? "#FEF3E2"
        : "#FCE8E6";
  const category =
    asset.assetCategoryId?.name || asset.assetCategory || "Uncategorized";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        fontFamily: T.font,
        animation: `${fadeUp} 0.4s ease both`,
      }}
    >
      {/* ── Top Bar ── */}
      <Box
        sx={{
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 2.5 },
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(8px)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 1.5, sm: 0 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <IconButton
              onClick={() => navigate("/admin/assets")}
              sx={{
                width: 38,
                height: 38,
                border: `1.5px solid ${T.border}`,
                borderRadius: T.r.sm,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: T.brand,
                  color: "#fff",
                  borderColor: T.brand,
                },
                transition: "all 0.2s",
              }}
            >
              <ArrowBack sx={{ fontSize: 17 }} />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                flexWrap="wrap"
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.05rem", sm: "1.2rem" },
                    fontWeight: 700,
                    color: T.ink,
                    fontFamily: T.font,
                    letterSpacing: "-0.02em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: { xs: "180px", sm: "320px", md: "auto" },
                  }}
                >
                  {asset.assetName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: T.r.xs,
                    bgcolor: statusCfg.bg,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: statusCfg.dot,
                      boxShadow: `0 0 6px ${statusCfg.dot}`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      color: statusCfg.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontFamily: T.font,
                    }}
                  >
                    {asset.status}
                  </Typography>
                </Box>
                {asset.isClone && (
                  <Chip
                    icon={<ContentCopy sx={{ fontSize: "11px !important" }} />}
                    label="Clone"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: T.violetLight,
                      color: T.violet,
                      fontFamily: T.font,
                    }}
                  />
                )}
                {asset.assetCondition === "Critical" && (
                  <Chip
                    icon={<Warning sx={{ fontSize: "11px !important" }} />}
                    label="Critical"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: T.redLight,
                      color: T.red,
                      fontFamily: T.font,
                      "& .MuiChip-icon": { color: T.red },
                    }}
                  />
                )}
              </Stack>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: T.inkMuted,
                  mt: 0.25,
                  fontFamily: T.fontMono,
                }}
              >
                {asset.assetId} · Tag: {asset.tagNumber || "—"}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ flexShrink: 0 }}
          >
            <Button
              onClick={() => setLinkOpen(true)}
              variant="outlined"
              size="small"
              startIcon={<AddLink sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1.5px solid ${T.brand}`,
                color: T.brand,
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: "0.78rem",
                px: 2,
                "&:hover": { bgcolor: T.brandLight },
              }}
            >
              Link Asset
            </Button>
            <Button
              onClick={() => navigate(`/admin/assets/edit/${id}`)}
              variant="outlined"
              size="small"
              startIcon={<Edit sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1.5px solid ${T.border}`,
                color: T.inkSecondary,
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: "0.78rem",
                px: 2,
                "&:hover": { bgcolor: T.surfaceAlt },
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => setDeleteOpen(true)}
              variant="outlined"
              size="small"
              startIcon={<Delete sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1.5px solid ${alpha(T.red, 0.4)}`,
                color: T.red,
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: "0.78rem",
                px: 2,
                "&:hover": { bgcolor: T.redLight, borderColor: T.red },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Body ── */}
      <Box
        sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1400, mx: "auto" }}
      >
        <Grid container spacing={3}>
          {/* LEFT SIDEBAR */}
          <Grid item xs={12} md={4} lg={3.5}>
            <Stack spacing={2.5}>
              {/* Image Panel */}
              <Card
                elevation={0}
                sx={{ animation: `${slideIn} 0.4s 0.05s ease both` }}
              >
                <Box
                  sx={{
                    height: 240,
                    bgcolor: T.surfaceAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {activeImage && !imgError ? (
                    <Box
                      component="img"
                      src={getImageUrl(activeImage)}
                      alt={asset.assetName}
                      onError={() => setImgError(true)}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <Avatar
                        sx={{
                          width: 76,
                          height: 76,
                          bgcolor: T.brand,
                          fontSize: "1.9rem",
                          mx: "auto",
                          mb: 1,
                          boxShadow: `0 4px 16px ${T.brandGlow}`,
                        }}
                      >
                        {asset.assetName?.charAt(0)?.toUpperCase() || "A"}
                      </Avatar>
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: T.inkMuted,
                          fontFamily: T.font,
                        }}
                      >
                        No image
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: T.r.xs,
                      bgcolor: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(4px)",
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: T.brand,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontFamily: T.font,
                      }}
                    >
                      {category}
                    </Typography>
                  </Box>
                </Box>
                {asset.assetImages?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      p: 1.5,
                      borderTop: `1px solid ${T.border}`,
                      overflowX: "auto",
                    }}
                  >
                    {asset.assetImages.map((img, i) => (
                      <Box
                        key={i}
                        onClick={() => {
                          setActiveImage(img.name);
                          setImgError(false);
                        }}
                        sx={{
                          width: 50,
                          height: 44,
                          flexShrink: 0,
                          borderRadius: T.r.xs,
                          overflow: "hidden",
                          border: `2px solid ${activeImage === img.name ? T.brand : "transparent"}`,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          "&:hover": { transform: "scale(1.06)" },
                        }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(img.name)}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>

              {/* Health Score */}
              <Card
                elevation={0}
                sx={{ p: 2.5, animation: `${slideIn} 0.4s 0.1s ease both` }}
              >
                <SectionTitle icon={<Sensors sx={{ fontSize: 15 }} />}>
                  Health Score
                </SectionTitle>
                <Stack
                  direction="row"
                  alignItems="flex-end"
                  spacing={1}
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontSize: "2.75rem",
                      fontWeight: 800,
                      color: healthColor,
                      fontFamily: T.font,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {asset.healthScore ?? 0}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: T.inkMuted,
                      fontFamily: T.font,
                      mb: 0.75,
                      fontWeight: 500,
                    }}
                  >
                    /100
                  </Typography>
                  <Box
                    sx={{
                      ml: "auto !important",
                      px: 1.25,
                      py: 0.35,
                      borderRadius: T.r.xs,
                      bgcolor: healthBg,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        color: healthColor,
                        fontFamily: T.font,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {asset.healthScore >= 70
                        ? "Good"
                        : asset.healthScore >= 40
                          ? "Fair"
                          : "Critical"}
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={asset.healthScore || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(healthColor, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: healthColor,
                      borderRadius: 4,
                      boxShadow: `0 0 10px ${alpha(healthColor, 0.45)}`,
                    },
                  }}
                />
                <Stack direction="row" justifyContent="space-between" mt={0.75}>
                  {["0", "25", "50", "75", "100"].map((v) => (
                    <Typography
                      key={v}
                      sx={{
                        fontSize: "0.6rem",
                        color: T.inkMuted,
                        fontFamily: T.font,
                      }}
                    >
                      {v}
                    </Typography>
                  ))}
                </Stack>
              </Card>

              {/* Quick Info */}
              <Card
                elevation={0}
                sx={{ p: 2.5, animation: `${slideIn} 0.4s 0.15s ease both` }}
              >
                <SectionTitle icon={<Numbers sx={{ fontSize: 15 }} />}>
                  Quick Info
                </SectionTitle>
                <Stack spacing={0}>
                  {[
                    {
                      label: "Condition",
                      value: asset.assetCondition,
                      badge: conditionCfg,
                    },
                    { label: "Type", value: asset.type || "Equipment" },
                    { label: "Manufacturer", value: asset.manufacturer },
                    { label: "Model", value: asset.model },
                    {
                      label: "Clone Version",
                      value: asset.isClone ? `v${asset.cloneVersion}` : null,
                    },
                    {
                      label: "Clone Allowed",
                      value:
                        asset.canBeCloned !== undefined
                          ? asset.canBeCloned
                            ? "Yes"
                            : "No"
                          : null,
                    },
                  ]
                    .filter((f) => f.value)
                    .map(({ label, value, badge }) => (
                      <Stack
                        key={label}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          py: 1,
                          borderBottom: `1px solid ${T.border}`,
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: T.inkMuted,
                            fontFamily: T.font,
                          }}
                        >
                          {label}
                        </Typography>
                        {badge ? (
                          <Chip
                            label={value}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              bgcolor: badge.bg,
                              color: badge.color,
                              fontFamily: T.font,
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: T.ink,
                              fontFamily: T.font,
                              textAlign: "right",
                              maxWidth: "55%",
                            }}
                          >
                            {value}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                </Stack>
              </Card>

              {/* Tags */}
              {asset.metadata?.tags?.length > 0 && (
                <Card
                  elevation={0}
                  sx={{ p: 2.5, animation: `${slideIn} 0.4s 0.2s ease both` }}
                >
                  <SectionTitle icon={<LocalOffer sx={{ fontSize: 15 }} />}>
                    Tags
                  </SectionTitle>
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {asset.metadata.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 500,
                          bgcolor: T.brandLight,
                          color: T.brand,
                          border: `1px solid ${alpha(T.brand, 0.2)}`,
                          fontFamily: T.font,
                        }}
                      />
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* MAIN CONTENT */}
          <Grid item xs={12} md={8} lg={8.5}>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  bgcolor: T.surface,
                  borderRadius: T.r.lg,
                  border: `1px solid ${T.border}`,
                  overflow: "hidden",
                  boxShadow: T.sh.sm,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  sx={{
                    px: 2,
                    borderBottom: `1px solid ${T.border}`,
                    minHeight: 50,
                    bgcolor: T.surfaceAlt,
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontFamily: T.font,
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      minHeight: 50,
                      color: T.inkMuted,
                      "&.Mui-selected": { color: T.brand },
                    },
                    "& .MuiTabs-indicator": {
                      bgcolor: T.brand,
                      height: 2.5,
                      borderRadius: "2px 2px 0 0",
                    },
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Specialist Data" />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <span>Requests</span>
                        <Chip
                          label={linkedRequests.length}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: linkedRequests.length ? T.brand : T.border,
                            color: linkedRequests.length ? "#fff" : T.inkMuted,
                            minWidth: 22,
                          }}
                        />
                      </Stack>
                    }
                  />
                  <Tab label="History" />
                </Tabs>

                {/* ── TAB 0: OVERVIEW ── */}
                {activeTab === 0 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2.5,
                      }}
                    >
                      <Field
                        icon={<Category />}
                        label="Category"
                        value={category}
                      />
                      <Field
                        icon={<LocationOn />}
                        label="Current Location"
                        value={asset.currentLocation}
                      />
                      <Field
                        icon={<Person />}
                        label="Primary User"
                        value={getUserName(asset.assignedUsers?.primaryUser)}
                      />
                      <Field
                        icon={<Person />}
                        label="Secondary User"
                        value={getUserName(asset.assignedUsers?.secondaryUser)}
                      />
                      <Field
                        icon={<VerifiedUser />}
                        label="Custodian"
                        value={getUserName(asset.assignedUsers?.custodian)}
                      />
                      <Field
                        icon={<CalendarToday />}
                        label="Commissioning Date"
                        value={
                          asset.commissioningDate
                            ? new Date(
                                asset.commissioningDate,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : null
                        }
                      />
                      <Field
                        icon={<AttachMoney />}
                        label="Purchase Cost"
                        value={
                          asset.purchaseCost
                            ? `₹${asset.purchaseCost.toLocaleString("en-IN")}`
                            : null
                        }
                        color={T.brand}
                      />
                      <Field
                        icon={<AttachMoney />}
                        label="Current Value"
                        value={
                          asset.currentValue
                            ? `₹${asset.currentValue.toLocaleString("en-IN")}`
                            : null
                        }
                      />
                      <Field
                        label="Depreciation Rate"
                        value={
                          asset.depreciationRate
                            ? `${asset.depreciationRate}%`
                            : null
                        }
                      />
                      <Field
                        icon={<Shield />}
                        label="Warranty Expiry"
                        value={
                          asset.warrantyExpiry
                            ? new Date(asset.warrantyExpiry).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : null
                        }
                        color={
                          asset.warrantyLeaseExpiryWarning?.expired
                            ? T.red
                            : T.ink
                        }
                        badge={
                          asset.warrantyLeaseExpiryWarning?.expired
                            ? { bg: T.redLight, color: T.red }
                            : asset.warrantyLeaseExpiryWarning?.lessThan90Days
                              ? { bg: T.amberLight, color: T.amber }
                              : null
                        }
                      />
                      <Field
                        icon={<Description />}
                        label="Description"
                        value={asset.description}
                        fullWidth
                      />
                      {asset.metadata?.notes && (
                        <Field
                          label="Notes"
                          value={asset.metadata.notes}
                          fullWidth
                        />
                      )}
                    </Box>

                    {/* Physical Address */}
                    {asset.customPhysicalAddress &&
                      Object.values(asset.customPhysicalAddress).some(
                        Boolean,
                      ) && (
                        <>
                          <Divider sx={{ my: 3, borderColor: T.border }} />
                          <SectionTitle icon={<Home sx={{ fontSize: 15 }} />}>
                            Physical Address
                          </SectionTitle>
                          <Stack spacing={1}>
                            {asset.customPhysicalAddress.streetAddress && (
                              <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="flex-start"
                              >
                                <Home
                                  sx={{
                                    fontSize: 14,
                                    color: T.inkMuted,
                                    mt: 0.25,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    color: T.ink,
                                    fontFamily: T.font,
                                    fontWeight: 500,
                                  }}
                                >
                                  {asset.customPhysicalAddress.streetAddress}
                                </Typography>
                              </Stack>
                            )}
                            {(asset.customPhysicalAddress.city ||
                              asset.customPhysicalAddress.stateProvince) && (
                              <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                              >
                                <PinDrop
                                  sx={{
                                    fontSize: 14,
                                    color: T.inkMuted,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    color: T.ink,
                                    fontFamily: T.font,
                                    fontWeight: 500,
                                  }}
                                >
                                  {[
                                    asset.customPhysicalAddress.city,
                                    asset.customPhysicalAddress.stateProvince,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </Typography>
                              </Stack>
                            )}
                            {(asset.customPhysicalAddress.postalCode ||
                              asset.customPhysicalAddress.country) && (
                              <Typography
                                sx={{
                                  fontSize: "0.875rem",
                                  color: T.inkSecondary,
                                  fontFamily: T.font,
                                  ml: "26px",
                                }}
                              >
                                {[
                                  asset.customPhysicalAddress.postalCode,
                                  asset.customPhysicalAddress.country,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </Typography>
                            )}
                          </Stack>
                        </>
                      )}

                    {/* User Assignment */}
                    <Divider sx={{ my: 3, borderColor: T.border }} />
                    <SectionTitle icon={<Person sx={{ fontSize: 15 }} />}>
                      User Assignment
                    </SectionTitle>
                    <Grid container spacing={2}>
                      {[
                        {
                          role: "Primary User",
                          user: asset.assignedUsers?.primaryUser,
                          color: T.brand,
                        },
                        {
                          role: "Secondary User",
                          user: asset.assignedUsers?.secondaryUser,
                          color: T.teal,
                        },
                        {
                          role: "Custodian",
                          user: asset.assignedUsers?.custodian,
                          color: T.amber,
                        },
                      ].map(({ role, user, color }) => (
                        <Grid item xs={12} sm={4} key={role}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: T.r.md,
                              border: `1px solid ${T.border}`,
                              bgcolor: T.surfaceAlt,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                color: T.inkMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                mb: 1.25,
                                fontFamily: T.font,
                              }}
                            >
                              {role}
                            </Typography>
                            {user ? (
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: alpha(color, 0.14),
                                    fontSize: "0.8rem",
                                    color,
                                    fontFamily: T.font,
                                    fontWeight: 700,
                                  }}
                                >
                                  {(getUserName(user) || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      color: T.ink,
                                      fontFamily: T.font,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {getUserName(user)}
                                  </Typography>
                                  {typeof user === "object" && user.email && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.68rem",
                                        color: T.inkMuted,
                                        fontFamily: T.font,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {user.email}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            ) : (
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: T.inkMuted,
                                  fontFamily: T.font,
                                }}
                              >
                                Unassigned
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* ── TAB 1: SPECIALIST DATA ── */}
                {activeTab === 1 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2.5}>
                      {[
                        {
                          title: "Material Handling Equipment",
                          icon: (
                            <Inventory2
                              sx={{ fontSize: 14, color: "#1565C0" }}
                            />
                          ),
                          iconBg: alpha("#2196F3", 0.12),
                          rows: [
                            {
                              icon: <Build />,
                              label: "Utilization",
                              value: asset.mhe?.utilizationStatus,
                              color: "#1565C0",
                            },
                            {
                              icon: <Sensors />,
                              label: "Engine Runtime",
                              value: asset.mhe?.engineRuntimeHours
                                ? `${asset.mhe.engineRuntimeHours} hrs`
                                : null,
                              color: "#1565C0",
                            },
                            {
                              icon: <Settings />,
                              label: "Engine Status",
                              value: asset.mhe?.engineStatus,
                              color: "#1565C0",
                            },
                            {
                              icon: <Shield />,
                              label: "Safety Cert.",
                              value: asset.mhe?.safetyCertification,
                              color: "#1565C0",
                            },
                          ],
                          empty: "No MHE data available",
                        },
                        {
                          title: "Transportation",
                          icon: (
                            <DirectionsCar
                              sx={{ fontSize: 14, color: "#00695C" }}
                            />
                          ),
                          iconBg: alpha("#009688", 0.12),
                          rows: [
                            {
                              icon: <DirectionsCar />,
                              label: "Vehicle Type",
                              value: asset.transportation?.vehicleType,
                              color: "#00695C",
                            },
                            {
                              icon: <Person />,
                              label: "Driver",
                              value:
                                asset.transportation?.driver ||
                                asset.transportation?.driverId,
                              color: "#00695C",
                            },
                            {
                              icon: <Sensors />,
                              label: "Load Status",
                              value:
                                asset.transportation?.loadStatus != null
                                  ? `${asset.transportation.loadStatus}%`
                                  : null,
                              color: "#00695C",
                            },
                            {
                              icon: <Sensors />,
                              label: "Fuel Level",
                              value:
                                asset.transportation?.fuelLevel != null
                                  ? `${asset.transportation.fuelLevel}%`
                                  : null,
                              color: "#00695C",
                            },
                            {
                              icon: <Numbers />,
                              label: "Odometer",
                              value: asset.transportation?.odometer
                                ? `${asset.transportation.odometer} km`
                                : null,
                              color: "#00695C",
                            },
                          ],
                          empty: "No transport data available",
                        },
                        {
                          title: "IT Assets",
                          icon: (
                            <Computer sx={{ fontSize: 14, color: "#C62828" }} />
                          ),
                          iconBg: alpha("#F44336", 0.1),
                          rows: [
                            {
                              icon: <Shield />,
                              label: "License Status",
                              value: asset.itAssets?.licenseStatus,
                              color: "#C62828",
                            },
                            {
                              icon: <Memory />,
                              label: "Software",
                              value: asset.itAssets?.softwareName,
                              color: "#C62828",
                            },
                            {
                              icon: <Sensors />,
                              label: "Usage Hours",
                              value: asset.itAssets?.usageHours
                                ? `${asset.itAssets.usageHours} hrs`
                                : null,
                              color: "#C62828",
                            },
                          ],
                          extra:
                            asset.itAssets?.osPlatform?.length > 0 ? (
                              <Box mt={1}>
                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: T.inkMuted,
                                    fontFamily: T.font,
                                    mb: 0.75,
                                  }}
                                >
                                  OS Platforms
                                </Typography>
                                <Stack
                                  direction="row"
                                  flexWrap="wrap"
                                  gap={0.5}
                                >
                                  {asset.itAssets.osPlatform.map((p) => (
                                    <Chip
                                      key={p}
                                      label={p}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.6rem",
                                        fontWeight: 500,
                                        bgcolor: T.tealLight,
                                        color: T.teal,
                                        fontFamily: T.font,
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            ) : null,
                          empty: "No IT asset data available",
                        },
                        {
                          title: "Facility Management",
                          icon: (
                            <Apartment
                              sx={{ fontSize: 14, color: "#E65100" }}
                            />
                          ),
                          iconBg: alpha("#FF9800", 0.12),
                          rows: [
                            {
                              icon: <Build />,
                              label: "PM Status",
                              value: asset.facilityManagement?.pmStatus,
                              color: "#E65100",
                            },
                            {
                              icon: <Warning />,
                              label: "Priority",
                              value:
                                asset.facilityManagement?.maintenancePriority,
                              color: "#E65100",
                            },
                            {
                              icon: <Shield />,
                              label: "Safety Compliance",
                              value: asset.facilityManagement?.safetyCompliance,
                              color: "#E65100",
                            },
                          ],
                          empty: "No facility data available",
                        },
                        {
                          title: "Garbage Management",
                          icon: (
                            <DeleteOutline
                              sx={{ fontSize: 14, color: "#2E7D32" }}
                            />
                          ),
                          iconBg: alpha("#4CAF50", 0.12),
                          rows: [
                            {
                              icon: <Sensors />,
                              label: "Fill Level",
                              value:
                                asset.garbageManagement
                                  ?.smartStatusIoTFillLevel != null
                                  ? `${asset.garbageManagement.smartStatusIoTFillLevel}%`
                                  : null,
                              color: "#2E7D32",
                            },
                            {
                              icon: <Build />,
                              label: "Collection Status",
                              value: asset.garbageManagement?.collectionStatus,
                              color: "#2E7D32",
                            },
                            {
                              icon: <Warning />,
                              label: "Fill Level Alert",
                              value: asset.garbageManagement?.fillLevelAlert
                                ? "Active"
                                : null,
                              color: "#A93226",
                            },
                          ],
                          extra:
                            asset.garbageManagement?.smartStatusIoTFillLevel !=
                            null ? (
                              <Box mt={1.5}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    asset.garbageManagement
                                      .smartStatusIoTFillLevel
                                  }
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: alpha("#2E7D32", 0.1),
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor:
                                        asset.garbageManagement
                                          .smartStatusIoTFillLevel > 80
                                          ? T.red
                                          : "#2E7D32",
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                            ) : null,
                          empty: "No garbage management data available",
                        },
                        {
                          title: "Rotating Machinery",
                          icon: (
                            <Settings sx={{ fontSize: 14, color: "#6A1B9A" }} />
                          ),
                          iconBg: alpha("#9C27B0", 0.12),
                          rows: [
                            {
                              icon: <Sensors />,
                              label: "Vibration Alert",
                              value: asset.rotatingMachinery?.vibrationAlert
                                ? "Active"
                                : null,
                              color: "#A93226",
                            },
                            {
                              icon: <Sensors />,
                              label: "Temp. Alert",
                              value: asset.rotatingMachinery?.temperatureAlert
                                ? "Active"
                                : null,
                              color: "#A0560A",
                            },
                            {
                              icon: <Numbers />,
                              label: "RPM",
                              value: asset.rotatingMachinery?.rpm
                                ? `${asset.rotatingMachinery.rpm} rpm`
                                : null,
                              color: "#6A1B9A",
                            },
                            {
                              icon: <Sensors />,
                              label: "Op. Hours",
                              value: asset.rotatingMachinery?.operatingHours
                                ? `${asset.rotatingMachinery.operatingHours} hrs`
                                : null,
                              color: "#6A1B9A",
                            },
                          ],
                          extra: (
                            <>
                              {asset.rotatingMachinery?.healthStatusIndex && (
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.25}
                                  sx={{
                                    py: 1,
                                    borderBottom: `1px solid ${T.border}`,
                                  }}
                                >
                                  <Box
                                    sx={{ color: "#6A1B9A", display: "flex" }}
                                  >
                                    <Sensors sx={{ fontSize: 14 }} />
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: T.inkMuted,
                                      fontFamily: T.font,
                                      flex: 1,
                                    }}
                                  >
                                    Health Index
                                  </Typography>
                                  <Chip
                                    label={
                                      asset.rotatingMachinery.healthStatusIndex
                                    }
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      fontFamily: T.font,
                                      bgcolor:
                                        asset.rotatingMachinery
                                          .healthStatusIndex === "Green"
                                          ? "#E8F5EE"
                                          : asset.rotatingMachinery
                                                .healthStatusIndex === "Yellow"
                                            ? "#FEF3E2"
                                            : "#FCE8E6",
                                      color:
                                        asset.rotatingMachinery
                                          .healthStatusIndex === "Green"
                                          ? "#1A6B3C"
                                          : asset.rotatingMachinery
                                                .healthStatusIndex === "Yellow"
                                            ? "#A0560A"
                                            : "#A93226",
                                    }}
                                  />
                                </Stack>
                              )}
                              {asset.rotatingMachinery?.faultType?.length >
                                0 && (
                                <Stack
                                  direction="row"
                                  flexWrap="wrap"
                                  gap={0.5}
                                  mt={1}
                                >
                                  {asset.rotatingMachinery.faultType.map(
                                    (f) => (
                                      <Chip
                                        key={f}
                                        label={f}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: "0.6rem",
                                          fontWeight: 500,
                                          bgcolor: T.redLight,
                                          color: T.red,
                                          fontFamily: T.font,
                                        }}
                                      />
                                    ),
                                  )}
                                </Stack>
                              )}
                            </>
                          ),
                          empty: "No rotating machinery data available",
                        },
                      ].map(({ title, icon, iconBg, rows, extra, empty }) => {
                        const hasData = rows.some(
                          (r) =>
                            r.value &&
                            r.value !== "Not Applicable" &&
                            r.value !== "Not Scheduled" &&
                            r.value !== 0,
                        );
                        return (
                          <Grid item xs={12} sm={6} key={title}>
                            <Box
                              sx={{
                                p: 2.5,
                                borderRadius: T.r.md,
                                border: `1px solid ${T.border}`,
                                bgcolor: T.surfaceAlt,
                                height: "100%",
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.25}
                                mb={2}
                              >
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: T.r.xs,
                                    bgcolor: iconBg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {icon}
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    color: T.ink,
                                    fontFamily: T.font,
                                  }}
                                >
                                  {title}
                                </Typography>
                              </Stack>
                              {rows.map((r) => (
                                <SpecialistRow key={r.label} {...r} />
                              ))}
                              {extra}
                              {!hasData && !extra && (
                                <Typography
                                  sx={{
                                    fontSize: "0.78rem",
                                    color: T.inkMuted,
                                    fontFamily: T.font,
                                  }}
                                >
                                  {empty}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {/* ── TAB 2: REQUESTS ── */}
                {activeTab === 2 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {linkedRequests.length === 0 ? (
                      <Box sx={{ py: 7, textAlign: "center" }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            bgcolor: T.surfaceAlt,
                            border: `1px solid ${T.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <AccountTree
                            sx={{ fontSize: 30, color: T.inkMuted }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: T.ink,
                            fontFamily: T.font,
                            mb: 0.75,
                          }}
                        >
                          No linked requests
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: T.inkMuted,
                            fontFamily: T.font,
                            mb: 2.5,
                          }}
                        >
                          Link this asset to a parent request to start tracking
                          relationships.
                        </Typography>
                        <Button
                          onClick={() => setLinkOpen(true)}
                          variant="contained"
                          startIcon={<AddLink />}
                          sx={{
                            textTransform: "none",
                            borderRadius: T.r.sm,
                            bgcolor: T.brand,
                            fontFamily: T.font,
                            fontWeight: 700,
                            px: 3,
                            boxShadow: `0 2px 8px ${T.brandGlow}`,
                            "&:hover": { bgcolor: T.brandAccent },
                          }}
                        >
                          Link Asset
                        </Button>
                      </Box>
                    ) : (
                      <Stack spacing={2}>
                        {linkedRequests.map((req) => {
                          const cfg = REQ_STATUS_CFG[req.status] || {};
                          return (
                            <Box
                              key={req._id}
                              sx={{
                                p: 2.5,
                                borderRadius: T.r.md,
                                border: `1px solid ${T.border}`,
                                bgcolor: T.surfaceAlt,
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="flex-start"
                                justifyContent="space-between"
                                mb={2}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.5}
                                >
                                  <Box
                                    sx={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: T.r.sm,
                                      bgcolor: T.brandLight,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <AccountTree
                                      sx={{ fontSize: 18, color: T.brand }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        color: T.ink,
                                        fontFamily: T.font,
                                      }}
                                    >
                                      {req.assetId?.assetName ||
                                        "Unnamed Asset"}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: T.inkMuted,
                                        fontFamily: T.fontMono,
                                      }}
                                    >
                                      {req.assetId?.assetId} · {req.requestType}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Chip
                                  label={req.status}
                                  size="small"
                                  icon={cfg.icon}
                                  sx={{
                                    height: 24,
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    bgcolor: cfg.bg,
                                    color: cfg.color,
                                    fontFamily: T.font,
                                    flexShrink: 0,
                                    "& .MuiChip-icon": { color: cfg.color },
                                  }}
                                />
                              </Stack>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: 1.5,
                                }}
                              >
                                {[
                                  {
                                    label: "Urgency",
                                    content: (
                                      <Chip
                                        label={req.urgency}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          fontWeight: 600,
                                          bgcolor:
                                            req.urgency === "high"
                                              ? T.redLight
                                              : T.amberLight,
                                          color:
                                            req.urgency === "high"
                                              ? T.red
                                              : T.amber,
                                          fontFamily: T.font,
                                        }}
                                      />
                                    ),
                                  },
                                  {
                                    label: "Children",
                                    content: (
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          fontWeight: 600,
                                          color: T.ink,
                                          fontFamily: T.font,
                                        }}
                                      >
                                        {req.childRequests?.length || 0}
                                      </Typography>
                                    ),
                                  },
                                  {
                                    label: "Created",
                                    content: (
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          fontWeight: 500,
                                          color: T.ink,
                                          fontFamily: T.font,
                                        }}
                                      >
                                        {req.createdAt
                                          ? new Date(
                                              req.createdAt,
                                            ).toLocaleDateString("en-IN", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })
                                          : "—"}
                                      </Typography>
                                    ),
                                  },
                                ].map(({ label, content }) => (
                                  <Box key={label}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.62rem",
                                        color: T.inkMuted,
                                        fontFamily: T.font,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        mb: 0.5,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {label}
                                    </Typography>
                                    {content}
                                  </Box>
                                ))}
                              </Box>
                              {req.description && (
                                <Box
                                  sx={{
                                    mt: 1.5,
                                    p: 1.25,
                                    borderRadius: T.r.xs,
                                    bgcolor: T.surface,
                                    border: `1px solid ${T.border}`,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.78rem",
                                      color: T.inkSecondary,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    {req.description}
                                  </Typography>
                                </Box>
                              )}
                              {req.metadata?.childAssets?.length > 0 && (
                                <Box mt={1.5}>
                                  <Typography
                                    sx={{
                                      fontSize: "0.62rem",
                                      fontWeight: 700,
                                      color: T.inkMuted,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                      mb: 1,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    Child Links
                                  </Typography>
                                  <Stack spacing={0.75}>
                                    {req.metadata.childAssets.map(
                                      (child, i) => (
                                        <Stack
                                          key={i}
                                          direction="row"
                                          alignItems="center"
                                          spacing={1.25}
                                          sx={{
                                            px: 1.25,
                                            py: 0.75,
                                            borderRadius: T.r.xs,
                                            bgcolor: T.surface,
                                            border: `1px solid ${T.border}`,
                                          }}
                                        >
                                          <SwapHoriz
                                            sx={{
                                              fontSize: 14,
                                              color: T.inkMuted,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              fontSize: "0.75rem",
                                              color: T.ink,
                                              fontFamily: T.font,
                                              flex: 1,
                                            }}
                                          >
                                            Asset: {child.assetId}
                                          </Typography>
                                          <Chip
                                            label={child.relationshipType}
                                            size="small"
                                            sx={{
                                              height: 18,
                                              fontSize: "0.6rem",
                                              fontWeight: 500,
                                              bgcolor: T.brandLight,
                                              color: T.brand,
                                              fontFamily: T.font,
                                            }}
                                          />
                                        </Stack>
                                      ),
                                    )}
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                )}

                {/* ── TAB 3: HISTORY ── */}
                {activeTab === 3 && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {!asset.statusHistory?.length ? (
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <History
                          sx={{ fontSize: 40, color: T.inkMuted, mb: 1 }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: T.inkMuted,
                            fontFamily: T.font,
                          }}
                        >
                          No status history available
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={0}>
                        {[...asset.statusHistory].reverse().map((entry, i) => {
                          const sCfg = STATUS_CFG[entry.status] || {};
                          return (
                            <Stack
                              key={i}
                              direction="row"
                              spacing={2}
                              sx={{ position: "relative" }}
                            >
                              {i < asset.statusHistory.length - 1 && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    left: 15,
                                    top: 32,
                                    bottom: 0,
                                    width: 1.5,
                                    bgcolor: T.border,
                                    zIndex: 0,
                                  }}
                                />
                              )}
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  bgcolor: sCfg.bg || T.surfaceAlt,
                                  border: `2px solid ${sCfg.dot || T.border}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  zIndex: 1,
                                  mt: 1.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: sCfg.dot || T.inkMuted,
                                  }}
                                />
                              </Box>
                              <Box sx={{ flex: 1, pb: 3 }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.25}
                                  mb={0.5}
                                >
                                  <Chip
                                    label={entry.status}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: "0.68rem",
                                      fontWeight: 600,
                                      bgcolor: sCfg.bg,
                                      color: sCfg.color,
                                      fontFamily: T.font,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.72rem",
                                      color: T.inkMuted,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    {entry.changedAt
                                      ? new Date(
                                          entry.changedAt,
                                        ).toLocaleString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "—"}
                                  </Typography>
                                </Stack>
                                {entry.reason && (
                                  <Typography
                                    sx={{
                                      fontSize: "0.8rem",
                                      color: T.inkSecondary,
                                      fontFamily: T.font,
                                    }}
                                  >
                                    {entry.reason}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Link Asset Dialog */}
      <LinkAssetDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        assetId={id}
        onSuccess={() => {
          loadLinkedRequests();
          toast("Asset linked successfully!");
        }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: T.r.lg,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
            maxWidth: 420,
            animation: `${popIn} 0.2s ease both`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: T.r.sm,
                bgcolor: T.redLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Delete sx={{ color: T.red, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: T.ink,
                  fontFamily: T.font,
                }}
              >
                Delete Asset
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: T.inkMuted,
                  fontFamily: T.font,
                }}
              >
                This action cannot be undone.
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              p: 2,
              borderRadius: T.r.sm,
              bgcolor: T.redLight,
              border: `1px solid ${alpha(T.red, 0.2)}`,
              mb: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: T.red,
                fontFamily: T.font,
                fontWeight: 500,
              }}
            >
              Are you sure you want to permanently delete{" "}
              <strong>"{asset.assetName}"</strong>? All linked data will be
              removed.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} justifyContent="flex-end">
            <Button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                border: `1px solid ${T.border}`,
                color: T.inkSecondary,
                fontFamily: T.font,
                fontWeight: 600,
                px: 2.5,
                "&:hover": { bgcolor: T.surfaceAlt },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={deleting}
              startIcon={
                deleting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Delete sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                textTransform: "none",
                borderRadius: T.r.sm,
                bgcolor: T.red,
                color: "#fff",
                fontFamily: T.font,
                fontWeight: 700,
                px: 3,
                "&:hover": { bgcolor: "#922B21" },
                "&.Mui-disabled": { opacity: 0.5 },
              }}
            >
              {deleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{
            borderRadius: T.r.sm,
            fontFamily: T.font,
            fontSize: "0.8125rem",
            boxShadow: T.sh.lg,
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

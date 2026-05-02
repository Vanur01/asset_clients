// pages/ClientDetails.jsx - Complete Working Version
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Grid,
  Divider,
  Stack,
  useMediaQuery,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  useTheme,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import SubscriptionIcon from "@mui/icons-material/Subscriptions";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useClient } from "../context/ClientContext";

// ─── Color palette ──────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryLight: "#e6f0f3",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: { primary: "#1e293b", secondary: "#475569", disabled: "#94a3b8" },
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const getInitials = (name = "") =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "—";

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const DetailSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        bgcolor: C.surface,
        minHeight: "100vh",
      }}
    >
      <Skeleton
        variant="rounded"
        height={isMobile ? 180 : 200}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <Skeleton
              variant="rounded"
              height={isMobile ? 90 : 100}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={50} sx={{ mb: 2 }} />
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={250} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={250} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry, onBack }) => (
  <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8, md: 10 }, px: 2 }}>
    <ErrorOutlineIcon
      sx={{ fontSize: { xs: 48, sm: 64 }, color: C.error, mb: 2 }}
    />
    <Typography
      variant="h6"
      sx={{
        fontWeight: 600,
        color: C.error,
        mb: 1,
        fontSize: { xs: "0.9rem", sm: "1rem" },
      }}
    >
      Failed to Load Client
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: C.text.secondary,
        mb: 3,
        fontSize: { xs: "0.7rem", sm: "0.75rem" },
        maxWidth: 400,
        mx: "auto",
      }}
    >
      {message || "An error occurred while loading client details."}
    </Typography>
    <Stack direction="row" spacing={2} justifyContent="center">
      <Button variant="outlined" onClick={onBack} startIcon={<ArrowBackIcon />}>
        Go Back
      </Button>
      <Button
        variant="contained"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        sx={{ bgcolor: C.primary }}
      >
        Retry
      </Button>
    </Stack>
  </Box>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, label, value, sub, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (loading) {
    return (
      <Card sx={{ borderRadius: { xs: 2, sm: 3 }, height: "100%" }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Skeleton
            variant="circular"
            width={isMobile ? 28 : 32}
            height={isMobile ? 28 : 32}
            sx={{ mb: 1 }}
          />
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: { xs: 0.5, sm: 0.75 },
          }}
        >
          <Box
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: iconBg,
            }}
          >
            {Icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: C.text.secondary,
              fontWeight: 500,
              fontSize: { xs: "0.6rem", sm: "0.65rem" },
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: C.text.primary,
            mb: 0.25,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
          }}
        >
          {value ?? "—"}
        </Typography>
        {sub && (
          <Typography
            variant="caption"
            sx={{
              color: C.text.disabled,
              fontSize: { xs: "0.55rem", sm: "0.6rem" },
            }}
          >
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Module Card ─────────────────────────────────────────────────────────────
const ModuleCard = ({
  icon,
  iconBg,
  title,
  description,
  countLabel,
  count,
  onClick,
}) => (
  <Card
    sx={{
      flex: 1,
      minWidth: { xs: "100%", sm: 180, md: 200 },
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconBg,
          }}
        >
          {icon}
        </Box>
        <IconButton size="small" sx={{ color: C.text.disabled, p: 0.5 }}>
          <ArrowBackIcon
            sx={{ transform: "rotate(180deg)", fontSize: "0.9rem" }}
          />
        </IconButton>
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          mb: 0.5,
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: C.text.secondary,
          mb: 1,
          display: "block",
          fontSize: { xs: "0.6rem", sm: "0.65rem" },
        }}
      >
        {description}
      </Typography>
      <Divider sx={{ my: 0.75 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: C.text.disabled,
            fontSize: { xs: "0.55rem", sm: "0.6rem" },
          }}
        >
          {countLabel}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ color: C.primary, fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
        >
          {count}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// ─── Upgrade Plan Modal ─────────────────────────────────────────────────────
const UpgradePlanModal = ({
  open,
  client,
  currentPlan,
  onClose,
  onUpgrade,
  loading,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [extendDays, setExtendDays] = useState(30);
  const [licenseLimit, setLicenseLimit] = useState(client?.licenseLimit || 10);

  const plans = [
    {
      value: "free",
      label: "Free",
      price: "$0",
      priceValue: 0,
      limits: { users: 5, storage: 500 },
    },
    {
      value: "standard",
      label: "Standard",
      price: "$49",
      priceValue: 49,
      limits: { users: 25, storage: 5000 },
    },
    {
      value: "premium",
      label: "Premium",
      price: "$99",
      priceValue: 99,
      limits: { users: 100, storage: 25000 },
    },
    {
      value: "enterprise",
      label: "Enterprise",
      price: "$299",
      priceValue: 299,
      limits: { users: 500, storage: 100000 },
    },
  ];

  useEffect(() => {
    if (open && client) {
      setSelectedPlan(currentPlan);
      setExtendDays(30);
      setLicenseLimit(client.licenseLimit || 10);
    }
  }, [open, client, currentPlan]);

  const handleUpgrade = () => {
    onUpgrade(selectedPlan, extendDays, licenseLimit);
  };

  const selectedPlanData = plans.find((p) => p.value === selectedPlan);
  const isUpgrade = selectedPlan !== currentPlan;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={useMediaQuery(useTheme().breakpoints.down("sm"))}
    >
      <DialogTitle
        sx={{
          p: { xs: 1.5, sm: 2 },
          pb: 0,
          bgcolor: C.primary,
          color: "white",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
        >
          Upgrade Plan
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, pt: { xs: 2, sm: 2.5 } }}>
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            color: C.text.secondary,
          }}
        >
          Current Plan:{" "}
          <strong>
            {currentPlan?.charAt(0).toUpperCase() + currentPlan?.slice(1)}
          </strong>
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Select New Plan</InputLabel>
          <Select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            label="Select New Plan"
          >
            {plans.map((plan) => (
              <MenuItem key={plan.value} value={plan.value}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>{plan.label}</span>
                  <span style={{ color: C.primary, fontWeight: 600 }}>
                    {plan.price}/mo
                  </span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedPlanData && (
          <Box
            sx={{
              bgcolor: alpha(C.primary, 0.05),
              borderRadius: 1.5,
              p: 1.5,
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                fontSize: { xs: "0.6rem", sm: "0.65rem" },
              }}
            >
              <strong>Plan Features:</strong>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontSize: { xs: "0.55rem", sm: "0.6rem" },
              }}
            >
              • Up to {selectedPlanData.limits.users} users
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontSize: { xs: "0.55rem", sm: "0.6rem" },
              }}
            >
              • {selectedPlanData.limits.storage}MB storage
            </Typography>
          </Box>
        )}

        <TextField
          label="License Limit"
          type="number"
          value={licenseLimit}
          onChange={(e) => setLicenseLimit(parseInt(e.target.value) || 1)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          InputProps={{ inputProps: { min: 1, max: 1000 } }}
          helperText="Number of user licenses"
        />

        <TextField
          label="Extend Days"
          type="number"
          value={extendDays}
          onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
          fullWidth
          size="small"
          InputProps={{ inputProps: { min: 0, max: 365 } }}
          helperText="Days to extend subscription (0 = no extension)"
        />

        {isUpgrade && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: alpha("#f97316", 0.1),
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: "0.6rem", sm: "0.65rem" },
                color: "#f97316",
              }}
            >
              ⚡ You will be upgraded from {currentPlan} to {selectedPlan}.
              Price difference will be applied.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpgrade}
          variant="contained"
          size="small"
          disabled={loading || !selectedPlan}
          sx={{
            bgcolor: "#f97316",
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : isUpgrade ? (
            "Confirm Upgrade"
          ) : (
            "Renew Only"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Edit Modal ─────────────────────────────────────────────────────────────
const EditModal = ({ open, client, onClose, onSave, loading }) => {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (client) {
      setForm({
        customerName: client.customerName ?? "",
        membershipPlan: client.membershipPlan ?? "standard",
        extendDays: 0,
        licenseLimit: String(client.licenseLimit ?? 10),
        phone: client.phone ?? "",
        website: client.website ?? "",
        notes: client.notes ?? "",
      });
    }
  }, [client]);
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 520 },
            maxWidth: "96vw",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 2.5, sm: 3.5 },
            maxHeight: "92vh",
            overflowY: "auto",
            outline: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.15rem" } }}
            >
              Edit Client
            </Typography>
            <IconButton onClick={onClose} size="small" disabled={loading}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Stack spacing={2.5}>
            <TextField
              label="Customer Name"
              name="customerName"
              value={form.customerName ?? ""}
              onChange={handleChange}
              size="small"
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Plan"
                  name="membershipPlan"
                  value={form.membershipPlan ?? "standard"}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  {["free", "standard", "premium", "enterprise"].map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Extend Days"
                  name="extendDays"
                  type="number"
                  value={form.extendDays ?? 0}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 365 } }}
                  helperText="0 = No extension"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="License Limit"
                  name="licenseLimit"
                  type="number"
                  value={form.licenseLimit ?? ""}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={form.phone ?? ""}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Website"
              name="website"
              value={form.website ?? ""}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="https://"
            />
            <TextField
              label="Notes"
              name="notes"
              value={form.notes ?? ""}
              onChange={handleChange}
              size="small"
              fullWidth
              multiline
              rows={3}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                mt: 2,
              }}
            >
              <Button
                variant="text"
                onClick={onClose}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => onSave(form)}
                disabled={loading}
                sx={{ textTransform: "none", bgcolor: C.primary, boxShadow: 2 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ClientDetails() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    selectedClient,
    loading,
    initialLoading,
    error,
    actionLoading,
    fetchClientById,
    editClient,
    changeClientStatus,
    removeClient,
    renewClientMembership,
  } = useClient();

  const clientId = id || location.state?.clientId;

  // ALL hooks must be called unconditionally before any early return
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [renewDays, setRenewDays] = useState(30);
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const showToast = useCallback((msg, sev = "success") => {
    setToast({ open: true, message: msg, severity: sev });
  }, []);

  const closeToast = useCallback(
    () => setToast((p) => ({ ...p, open: false })),
    [],
  );

  const loadClientData = useCallback(async () => {
    if (!clientId) {
      setFetchError("No client ID provided");
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    try {
      await fetchClientById(clientId);
      setFetchError(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load client details";
      setFetchError(msg);
      showToast(msg, "error");
    } finally {
      setIsFetching(false);
    }
  }, [clientId, fetchClientById, showToast]);

  useEffect(() => {
    if (clientId) {
      loadClientData();
    } else {
      setFetchError("Client ID is missing");
      setIsFetching(false);
    }
  }, [clientId, loadClientData]);

  // Derived values
  const client = selectedClient;
  const isActive = client?.status === "active";
  const daysLeft = client?.daysRemaining || 0;
  const usagePercentage = client?.usagePercentage || 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const usersUsed = client?.usersUsed || 0;
  const licenseLimit = client?.licenseLimit || 0;
  const activeChecklistCount = client?.activeChecklistCount || 0;
  const assetsCount = client?.stats?.assets || 0;
  const billingHistoryCount = client?.billingHistory?.length || 0;

  const statCards = useMemo(
    () => [
      {
        icon: (
          <PeopleIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: "#6366f1" }} />
        ),
        iconBg: alpha("#6366f1", 0.1),
        label: "Users",
        value: `${usersUsed}/${licenseLimit}`,
        sub: "license usage",
      },
      {
        icon: (
          <AssignmentIcon
            sx={{ fontSize: { xs: 14, sm: 16 }, color: "#a855f7" }}
          />
        ),
        iconBg: alpha("#a855f7", 0.1),
        label: "Checklists",
        value: activeChecklistCount,
        sub: "total forms",
      },
      {
        icon: (
          <InventoryIcon
            sx={{ fontSize: { xs: 14, sm: 16 }, color: "#f97316" }}
          />
        ),
        iconBg: alpha("#f97316", 0.1),
        label: "Assets",
        value: assetsCount,
        sub: "total managed",
      },
      {
        icon: (
          <ShowChartIcon
            sx={{ fontSize: { xs: 14, sm: 16 }, color: "#06b6d4" }}
          />
        ),
        iconBg: alpha("#06b6d4", 0.1),
        label: "Last Active",
        value: client?.lastActiveAt ? fmt(client.lastActiveAt) : "—",
        sub: "recent activity",
      },
    ],
    [
      usersUsed,
      licenseLimit,
      activeChecklistCount,
      assetsCount,
      client?.lastActiveAt,
    ],
  );

  const getPlanPrice = useCallback(() => {
    switch (client?.membershipPlan) {
      case "free":
        return "$0";
      case "standard":
        return "$49";
      case "premium":
        return "$99";
      case "enterprise":
        return "$299";
      default:
        return "$0";
    }
  }, [client?.membershipPlan]);

  const getPlanDescription = useCallback(() => {
    switch (client?.membershipPlan) {
      case "free":
        return "Basic features for small teams";
      case "standard":
        return "Advanced features for growing businesses";
      case "premium":
        return "Full features with priority support";
      case "enterprise":
        return "Custom solutions for large organizations";
      default:
        return "Premium business features";
    }
  }, [client?.membershipPlan]);

  // ─── Action Handlers ─────────────────────────────────────────────────────

  const handleEdit = async (formData) => {
    try {
      await editClient(clientId, {
        customerName: formData.customerName,
        membershipPlan: formData.membershipPlan,
        extendDays: parseInt(formData.extendDays) || 0,
        licenseLimit: parseInt(formData.licenseLimit),
        phone: formData.phone,
        website: formData.website,
        notes: formData.notes,
      });
      showToast("Client updated successfully");
      setEditOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to update client",
        "error",
      );
    }
  };

  const handleUpgradePlan = async (newPlan, extendDays, newLicenseLimit) => {
    try {
      const updateData = {
        membershipPlan: newPlan,
        licenseLimit: newLicenseLimit,
        extendDays: extendDays,
        notes: `Upgraded from ${client?.membershipPlan} to ${newPlan} on ${new Date().toLocaleDateString()}`,
      };

      await editClient(clientId, updateData);
      showToast(
        `Successfully upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan`,
        "success",
      );
      setUpgradeOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to upgrade plan",
        "error",
      );
    }
  };

  const handleToggleStatus = async () => {
    const newStatus =
      selectedClient?.status === "active" ? "inactive" : "active";
    try {
      await changeClientStatus(clientId, newStatus);
      showToast(
        `Client ${newStatus === "active" ? "activated" : "deactivated"}`,
      );
      await loadClientData();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to update status",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    try {
      await removeClient(clientId, true);
      showToast("Client permanently deleted");
      setDeleteConfirmOpen(false);
      navigate("/admin/clients");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to delete client",
        "error",
      );
    }
  };

  const handleRenew = async () => {
    try {
      await renewClientMembership(clientId, renewDays);
      showToast(`Membership renewed for ${renewDays} days`);
      setRenewOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to renew membership",
        "error",
      );
    }
  };

  // Early returns
  if ((initialLoading || loading || isFetching) && !selectedClient) {
    return <DetailSkeleton />;
  }

  if (fetchError || (error && !selectedClient)) {
    return (
      <ErrorState
        message={fetchError || error}
        onRetry={loadClientData}
        onBack={() => navigate("/admin/clients")}
      />
    );
  }

  if (!selectedClient && !loading && !initialLoading && !isFetching) {
    return (
      <Box sx={{ textAlign: "center", py: { xs: 8, sm: 10 }, px: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, mb: 2 }}
        >
          Client not found
        </Typography>
        <Typography variant="body2" sx={{ color: C.text.secondary, mb: 3 }}>
          Client ID: {clientId || "Not provided"}
        </Typography>
        <Button
          onClick={() => navigate("/admin/clients")}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Clients
        </Button>
      </Box>
    );
  }

  // Main render
  return (
    <Box
      sx={{
        bgcolor: C.surface,
        minHeight: "100vh",
        p: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
      }}
    >
      {(loading || actionLoading) && !initialLoading && !isFetching && (
        <Box sx={{ mb: 1 }}>
          <LinearProgress sx={{ borderRadius: 1, height: 3 }} />
        </Box>
      )}

      {/* Header Card */}
      <Card sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => navigate("/admin/clients")}
                size="small"
                sx={{ bgcolor: C.surface, p: 0.5 }}
              >
                <ArrowBackIcon
                  sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                />
              </IconButton>
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                <Button
                  variant="contained"
                  startIcon={
                    <EditIcon
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                    />
                  }
                  onClick={() => setEditOpen(true)}
                  disabled={actionLoading}
                  size="small"
                  sx={{
                    bgcolor: C.primary,
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    py: 0.5,
                    px: { xs: 1, sm: 1.5 },
                    "&:hover": { bgcolor: "#0b3f4f" },
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={
                    <PersonOffIcon
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                    />
                  }
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  size="small"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    py: 0.5,
                    px: { xs: 1, sm: 1.5 },
                    borderColor: isActive ? C.error : C.success,
                    color: isActive ? C.error : C.success,
                  }}
                >
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
                flexWrap: "wrap",
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 44, sm: 52, md: 56 },
                  height: { xs: 44, sm: 52, md: 56 },
                  bgcolor: C.primary,
                  borderRadius: 2,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  fontWeight: 700,
                }}
              >
                {getInitials(client?.customerName)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    flexWrap: "wrap",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
                    }}
                  >
                    {client?.customerName || "Unnamed Client"}
                  </Typography>
                  <Chip
                    label={isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: { xs: "0.55rem", sm: "0.6rem" },
                      bgcolor: isActive
                        ? alpha(C.success, 0.15)
                        : alpha(C.error, 0.15),
                      color: isActive ? C.success : C.error,
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    label={
                      client?.membershipPlan
                        ? client.membershipPlan.charAt(0).toUpperCase() +
                          client.membershipPlan.slice(1)
                        : "Free"
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: { xs: "0.55rem", sm: "0.6rem" },
                      borderColor: C.primary,
                      color: C.primary,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 1, sm: 1.5 },
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EmailIcon
                      sx={{
                        fontSize: { xs: 11, sm: 12 },
                        color: C.text.disabled,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.65rem" },
                        color: C.text.secondary,
                      }}
                    >
                      {client?.email || "No email"}
                    </Typography>
                  </Box>
                  {client?.phone && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <PhoneIcon
                        sx={{
                          fontSize: { xs: 11, sm: 12 },
                          color: C.text.disabled,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.6rem", sm: "0.65rem" },
                          color: C.text.secondary,
                        }}
                      >
                        {client.phone}
                      </Typography>
                    </Box>
                  )}
                  {client?.website && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LanguageIcon
                        sx={{
                          fontSize: { xs: 11, sm: 12 },
                          color: C.text.disabled,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.6rem", sm: "0.65rem" },
                          color: C.text.secondary,
                        }}
                      >
                        {client.website}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid
        container
        spacing={{ xs: 1, sm: 1.5 }}
        sx={{ mb: { xs: 1.5, sm: 2 } }}
      >
        {statCards.map((stat, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <StatCard {...stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper
        sx={{
          borderRadius: { xs: 1.5, sm: 2 },
          mb: { xs: 1.5, sm: 2 },
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            minHeight: { xs: 40, sm: 44, md: 48 },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
              minHeight: { xs: 40, sm: 44, md: 48 },
              py: { xs: 0.5, sm: 0.75, md: 1 },
            },
            "& .Mui-selected": { color: C.primary },
            "& .MuiTabs-indicator": { bgcolor: C.primary, height: 2 },
          }}
        >
          <Tab
            icon={<DashboardIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
            iconPosition="start"
            label="Overview"
          />
          <Tab
            icon={<SubscriptionIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
            iconPosition="start"
            label="Subscription"
          />
          <Tab
            icon={<SettingsIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
            iconPosition="start"
            label="Settings"
          />
        </Tabs>
      </Paper>

      {/* Tab 0: Overview */}
      {tab === 0 && (
        <Stack spacing={{ xs: 1, sm: 1.5 }}>
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ border: `1px solid ${C.border}`, height: "100%" }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 1.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Account Information
                  </Typography>
                  {[
                    { label: "Client ID", value: client?._id || "—" },
                    { label: "Email", value: client?.email || "—" },
                    { label: "Phone", value: client?.phone || "Not set" },
                    {
                      label: "Start Date",
                      value: fmt(client?.subscriptionStartDate),
                    },
                    {
                      label: "End Date",
                      value: fmt(client?.subscriptionEndDate),
                    },
                    {
                      label: "Days Remaining",
                      value: `${daysLeft} days`,
                      color: isExpiringSoon ? C.warning : C.text.primary,
                    },
                  ].map((row, i) => (
                    <Box key={i}>
                      {i > 0 && <Divider sx={{ my: 0.75 }} />}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: C.text.secondary,
                            fontSize: { xs: "0.6rem", sm: "0.65rem" },
                          }}
                        >
                          {row.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight:
                              row.label === "Days Remaining" ? 600 : 400,
                            color: row.color || C.text.primary,
                            fontSize: { xs: "0.6rem", sm: "0.65rem" },
                          }}
                        >
                          {row.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ border: `1px solid ${C.border}`, height: "100%" }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 1.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Usage Overview
                  </Typography>
                  <Box sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem" } }}
                      >
                        License Usage
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem" } }}
                      >
                        {usersUsed} / {licenseLimit} ({usagePercentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(usagePercentage, 100)}
                      sx={{
                        height: { xs: 4, sm: 6 },
                        borderRadius: 2,
                        bgcolor: C.border,
                        "& .MuiLinearProgress-bar": {
                          bgcolor: usagePercentage > 85 ? C.error : C.primary,
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(C.primary, 0.04),
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "0.55rem", sm: "0.6rem" },
                        color: C.text.secondary,
                      }}
                    >
                      ✓ Usage within limits • {daysLeft} days remaining
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <ModuleCard
              icon={<InventoryIcon sx={{ fontSize: 18, color: C.primary }} />}
              iconBg={alpha(C.primary, 0.1)}
              title="Assets"
              description="Manage assets"
              countLabel="Total Assets"
              count={assetsCount}
            />
            <ModuleCard
              icon={<ListAltIcon sx={{ fontSize: 18, color: C.primary }} />}
              iconBg={alpha(C.primary, 0.1)}
              title="Checklists"
              description="View forms"
              countLabel="Total Forms"
              count={activeChecklistCount}
            />
            <ModuleCard
              icon={<ReceiptIcon sx={{ fontSize: 18, color: C.primary }} />}
              iconBg={alpha(C.primary, 0.1)}
              title="Billing"
              description="View history"
              countLabel="Invoices"
              count={billingHistoryCount}
            />
          </Box>
        </Stack>
      )}

      {/* Tab 1: Subscription */}
      {tab === 1 && (
        <Card sx={{ border: `1px solid ${C.border}` }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              Current Plan
            </Typography>
            <Box
              sx={{
                bgcolor: alpha("#7e22ce", 0.04),
                borderRadius: 1.5,
                p: { xs: 1.5, sm: 2 },
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: "#7e22ce",
                      textTransform: "capitalize",
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                    }}
                  >
                    {client?.membershipPlan || "free"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#a855f7",
                      fontSize: { xs: "0.55rem", sm: "0.6rem" },
                    }}
                  >
                    {getPlanDescription()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      color: "#7e22ce",
                      fontSize: { xs: "1rem", sm: "1.2rem" },
                    }}
                  >
                    {getPlanPrice()}/mo
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  bgcolor: alpha(C.primary, 0.05),
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mb: 0.5,
                    fontSize: { xs: "0.6rem", sm: "0.65rem" },
                  }}
                >
                  <strong>Subscription Period:</strong>{" "}
                  {fmt(client?.subscriptionStartDate)} -{" "}
                  {fmt(client?.subscriptionEndDate)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontSize: { xs: "0.55rem", sm: "0.6rem" },
                    color: C.text.secondary,
                  }}
                >
                  <strong>License Limit:</strong> {licenseLimit} users |{" "}
                  <strong>Current Usage:</strong> {usersUsed} users
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<TrendingUpIcon sx={{ fontSize: "0.8rem" }} />}
                onClick={() => setUpgradeOpen(true)}
                disabled={actionLoading}
                size="small"
                sx={{
                  bgcolor: "#f97316",
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  py: 0.75,
                  "&:hover": { bgcolor: "#ea580c" },
                }}
              >
                Upgrade Plan
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setRenewOpen(true)}
                size="small"
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  py: 0.75,
                  borderColor: C.primary,
                  color: C.primary,
                }}
              >
                Renew Membership
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Settings */}
      {tab === 2 && (
        <Card sx={{ border: `1px solid ${C.border}` }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              Account Settings
            </Typography>
            {isExpiringSoon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: 1.5,
                  p: 1.5,
                  mb: 1.5,
                }}
              >
                <WarningAmberIcon
                  sx={{
                    color: C.warning,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem" } }}
                  >
                    License expiring in {daysLeft} days
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: C.warning,
                      fontSize: { xs: "0.55rem", sm: "0.6rem" },
                      display: "block",
                    }}
                  >
                    Renew now to avoid interruption
                  </Typography>
                </Box>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
                >
                  Account Status
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: "0.55rem", sm: "0.6rem" } }}
                >
                  Currently: <strong>{isActive ? "Active" : "Inactive"}</strong>
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleToggleStatus}
                disabled={actionLoading}
                size="small"
                sx={{
                  bgcolor: isActive ? C.error : C.success,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  py: 0.5,
                  px: 2,
                  "&:hover": { bgcolor: isActive ? "#b71c1c" : "#1b5e20" },
                }}
              >
                {isActive ? "Deactivate" : "Activate"}
              </Button>
            </Box>
            <Divider />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
                >
                  Delete Account
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: "0.55rem", sm: "0.6rem" } }}
                >
                  Permanently remove all data
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setDeleteConfirmOpen(true)}
                size="small"
                sx={{
                  borderColor: C.error,
                  color: C.error,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  py: 0.5,
                  px: 2,
                  "&:hover": {
                    borderColor: C.error,
                    bgcolor: alpha(C.error, 0.04),
                  },
                }}
              >
                Delete
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EditModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        loading={actionLoading}
      />

      <UpgradePlanModal
        open={upgradeOpen}
        client={client}
        currentPlan={client?.membershipPlan}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgradePlan}
        loading={actionLoading}
      />

      <Dialog
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ p: { xs: 1.5, sm: 2 }, pb: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
          >
            Renew Membership
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1.5,
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
              color: C.text.secondary,
            }}
          >
            Extend the membership duration for {client?.customerName}
          </Typography>
          <TextField
            label="Extension Days"
            type="number"
            value={renewDays}
            onChange={(e) => setRenewDays(parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
            InputProps={{ inputProps: { min: 1, max: 365 } }}
            helperText="Enter number of days to extend (1-365)"
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
          <Button
            onClick={() => setRenewOpen(false)}
            size="small"
            sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenew}
            variant="contained"
            size="small"
            disabled={renewDays < 1 || renewDays > 365}
            sx={{
              bgcolor: "#f97316",
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            Renew
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ p: { xs: 1.5, sm: 2 }, pb: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
          >
            Delete Client
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
              color: C.text.secondary,
            }}
          >
            Are you sure you want to permanently delete{" "}
            <strong>{client?.customerName}</strong>? This action cannot be
            undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            size="small"
            sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            size="small"
            sx={{
              bgcolor: C.error,
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
              "&:hover": { bgcolor: "#b71c1c" },
            }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ bottom: { xs: 72, sm: 80, md: 24 } }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            borderRadius: 1.5,
            width: "100%",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

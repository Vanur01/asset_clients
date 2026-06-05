// pages/ClientDetails.jsx - Complete with Role-Based Access Control

import React, { useState, useEffect, useCallback } from "react";
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
  Grid,
  Divider,
  Stack,
  useMediaQuery,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PersonOff as PersonOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
  Subscriptions as SubscriptionIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorOutlineIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useClient } from "../context/ClientContext";
import { useAuth } from "../context/AuthContexts";

// Color palette
const colors = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e6f0f3",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#94a3b8",
  },
};

// Plan configurations
const plans = {
  free: { label: "Free", color: "#94a3b8", bg: "#f1f5f9", price: "$0/mo" },
  standard: {
    label: "Standard",
    color: "#0d4a5c",
    bg: "#e6f0f3",
    price: "$49/mo",
  },
  premium: {
    label: "Premium",
    color: "#f59e0b",
    bg: "#fffbeb",
    price: "$99/mo",
  },
  enterprise: {
    label: "Enterprise",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    price: "$299/mo",
  },
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const formatError = (err) => {
  if (typeof err === "string") return err;
  return err.response?.data?.message || err.message || "Something went wrong";
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => {
  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, height: "100%" }}>
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="circular" width={32} height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: "100%",
        transition: "all 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 500,
            color: colors.text.muted,
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: colors.text.primary,
          }}
        >
          {value ?? "—"}
        </Typography>
        {sub && (
          <Typography
            sx={{ fontSize: "0.6rem", color: colors.text.muted, mt: 0.25 }}
          >
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Edit Client Modal
const EditClientModal = ({ open, client, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    website: "",
    membershipPlan: "standard",
    licenseLimit: 10,
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client && open) {
      setForm({
        customerName: client.customerName || "",
        phone: client.phone || "",
        website: client.website || "",
        membershipPlan: client.membershipPlan || "standard",
        licenseLimit: client.licenseLimit || 10,
        notes: client.notes || "",
      });
      setErrors({});
    }
  }, [client, open]);

  const validate = () => {
    const newErrors = {};
    if (!form.customerName?.trim())
      newErrors.customerName = "Customer name is required";
    if (!form.phone?.trim()) newErrors.phone = "Phone number is required";
    if (
      form.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(
        form.website,
      )
    ) {
      newErrors.website = "Invalid URL format";
    }
    if (form.licenseLimit < 1) newErrors.licenseLimit = "Minimum 1 user";
    if (form.licenseLimit > 10000)
      newErrors.licenseLimit = "Maximum 10000 users";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: colors.primary, color: "white", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
            Edit Customer
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <TextField
            name="customerName"
            label="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            fullWidth
            size="small"
            required
            error={!!errors.customerName}
            helperText={errors.customerName}
          />
          <TextField
            name="phone"
            label="Phone Number"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            size="small"
            required
            error={!!errors.phone}
            helperText={errors.phone}
          />
          <TextField
            name="website"
            label="Website"
            value={form.website}
            onChange={handleChange}
            fullWidth
            size="small"
            error={!!errors.website}
            helperText={errors.website}
            placeholder="https://example.com"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Membership Plan</InputLabel>
                <Select
                  name="membershipPlan"
                  value={form.membershipPlan}
                  onChange={handleChange}
                  label="Membership Plan"
                >
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="licenseLimit"
                label="License Limit"
                type="number"
                value={form.licenseLimit}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.licenseLimit}
                helperText={errors.licenseLimit}
                InputProps={{ inputProps: { min: 1, max: 10000 } }}
              />
            </Grid>
          </Grid>
          <TextField
            name="notes"
            label="Notes"
            multiline
            rows={3}
            value={form.notes}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: colors.primary,
            textTransform: "none",
            "&:hover": { bgcolor: colors.primaryDark },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Renew Membership Modal
const RenewModal = ({ open, client, onClose, onRenew, loading }) => {
  const [days, setDays] = useState(30);

  const handleSubmit = () => {
    if (days > 0 && days <= 365) {
      onRenew(days);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
          Renew Membership
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Typography
          sx={{ fontSize: "0.75rem", color: colors.text.secondary, mb: 2 }}
        >
          Extend membership for <strong>{client?.customerName}</strong>
        </Typography>
        <TextField
          label="Extension Days"
          type="number"
          value={days}
          onChange={(e) =>
            setDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 0)))
          }
          fullWidth
          size="small"
          InputProps={{ inputProps: { min: 1, max: 365 } }}
          helperText="Enter days to extend (1-365)"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || days < 1 || days > 365}
          sx={{
            bgcolor: colors.warning,
            textTransform: "none",
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Renew"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Upgrade Plan Modal
const UpgradeModal = ({
  open,
  client,
  currentPlan,
  onClose,
  onUpgrade,
  loading,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [extendDays, setExtendDays] = useState(30);

  useEffect(() => {
    if (open && client) {
      setSelectedPlan(currentPlan);
      setExtendDays(30);
    }
  }, [open, client, currentPlan]);

  const planOptions = [
    { value: "free", label: "Free", price: "0/mo" },
    { value: "standard", label: "Standard", price: "49/mo" },
    { value: "premium", label: "Premium", price: "99/mo" },
    { value: "enterprise", label: "Enterprise", price: "299/mo" },
  ];

  const handleSubmit = () => {
    onUpgrade(selectedPlan, extendDays);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: colors.primary, color: "white", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
            Upgrade Plan
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, bgcolor: colors.primaryLight, borderRadius: 2 }}>
            <Typography
              sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
            >
              Current Plan:{" "}
              <strong>
                {currentPlan?.charAt(0).toUpperCase() + currentPlan?.slice(1)}
              </strong>
            </Typography>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Select New Plan</InputLabel>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              label="Select New Plan"
            >
              {planOptions.map((plan) => (
                <MenuItem key={plan.value} value={plan.value}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{plan.label}</span>
                    <span style={{ color: colors.primary, fontWeight: 600 }}>
                      {plan.price}
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Extend Days"
            type="number"
            value={extendDays}
            onChange={(e) =>
              setExtendDays(
                Math.min(365, Math.max(0, parseInt(e.target.value) || 0)),
              )
            }
            fullWidth
            size="small"
            InputProps={{ inputProps: { min: 0, max: 365 } }}
            helperText="Days to extend subscription (0 = no extension)"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: colors.warning,
            textTransform: "none",
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Confirm Upgrade"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Deactivate Confirm Dialog
const DeactivateDialog = ({ open, client, onClose, onConfirm, loading }) => {
  const isActive = client?.status === "active";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ p: 2, pb: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
          {isActive ? "Deactivate Customer" : "Activate Customer"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
          Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
          <strong>{client?.customerName}</strong>?
          {isActive && " They will lose access until reactivated."}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: isActive ? colors.error : colors.success,
            textTransform: "none",
          }}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : isActive ? (
            "Deactivate"
          ) : (
            "Activate"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Loading Skeleton
const DetailSkeleton = () => (
  <Box
    sx={{ p: { xs: 2, sm: 3 }, bgcolor: colors.surface, minHeight: "100vh" }}
  >
    <Skeleton variant="rounded" height={200} sx={{ mb: 2, borderRadius: 2 }} />
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid key={i} size={{ xs: 6, sm: 3 }}>
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: 2 }} />
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
);

// Access Denied Component
const AccessDenied = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      p: 3,
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        bgcolor: `${colors.error}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2,
      }}
    >
      <LockIcon sx={{ fontSize: 40, color: colors.error }} />
    </Box>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "1.25rem",
        color: colors.text.primary,
        mb: 1,
      }}
    >
      Access Denied
    </Typography>
    <Typography
      sx={{
        fontSize: "0.875rem",
        color: colors.text.secondary,
        mb: 3,
        maxWidth: 400,
      }}
    >
      You don't have permission to access this page. This area is restricted to
      Super Administrators only.
    </Typography>
    <Button
      variant="contained"
      onClick={() => (window.location.href = "/admin/clients")}
      sx={{ bgcolor: colors.primary, textTransform: "none" }}
    >
      Back to Customers
    </Button>
  </Box>
);

// Main Component
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
    getClientById,
    editClient,
    changeClientStatus,
    renewClientMembership,
  } = useClient();

  const { user, isSuperAdmin } = useAuth();

  const clientId = id || location.state?.clientId;
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // Role-based access control - Check if user is Super Admin
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    // Check if user has super_admin role
    if (user && !isSuperAdmin()) {
      setHasAccess(false);
    } else {
      setHasAccess(true);
    }
  }, [user, isSuperAdmin]);

  const showToast = useCallback((message, severity = "success") => {
    setToast({ open: true, message, severity });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const loadClientData = useCallback(async () => {
    if (!clientId) {
      setFetchError("No client ID provided");
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    try {
      await getClientById(clientId);
      setFetchError(null);
    } catch (err) {
      const msg = formatError(err);
      setFetchError(msg);
      showToast(msg, "error");
    } finally {
      setIsFetching(false);
    }
  }, [clientId, getClientById, showToast]);

  useEffect(() => {
    if (clientId && hasAccess) {
      loadClientData();
    } else if (!clientId) {
      setFetchError("Client ID is missing");
      setIsFetching(false);
    }
  }, [clientId, loadClientData, hasAccess]);

  // Show access denied if not super admin
  if (!hasAccess) {
    return <AccessDenied />;
  }

  const client = selectedClient;
  const plan = plans[client?.membershipPlan] || plans.free;
  const isActive = client?.status === "active";
  const daysLeft = client?.daysRemaining || 0;
  const usersUsed = client?.usersUsed || 0;
  const licenseLimit = client?.licenseLimit || 0;
  const usagePercentage =
    licenseLimit > 0
      ? Math.min(100, Math.round((usersUsed / licenseLimit) * 100))
      : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const assetsCount = client?.stats?.assets || 0;
  const teamCount = client?.stats?.team?.total || 0;

  const statCards = [
    {
      icon: PeopleIcon,
      label: "Team Members",
      value: teamCount,
      sub: `${usersUsed}/${licenseLimit} licenses`,
      color: colors.primary,
    },
    {
      icon: AssignmentIcon,
      label: "Checklists",
      value: client?.activeChecklistCount || 0,
      sub: "active forms",
      color: "#8b5cf6",
    },
    {
      icon: InventoryIcon,
      label: "Assets",
      value: assetsCount,
      sub: "total managed",
      color: colors.warning,
    },
    {
      icon: CalendarIcon,
      label: "Days Left",
      value: daysLeft,
      sub: isExpiringSoon ? "Expiring soon" : "remaining",
      color: isExpiringSoon ? colors.error : colors.success,
    },
  ];

  const handleEdit = async (formData) => {
    try {
      await editClient(clientId, {
        customerName: formData.customerName,
        membershipPlan: formData.membershipPlan,
        licenseLimit: parseInt(formData.licenseLimit),
        phone: formData.phone,
        website: formData.website,
        notes: formData.notes,
      });
      showToast("Customer updated successfully");
      setEditOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(formatError(err), "error");
    }
  };

  const handleUpgrade = async (newPlan, extendDays) => {
    try {
      await editClient(clientId, {
        membershipPlan: newPlan,
        extendDays: extendDays,
        notes: client?.notes
          ? `${client.notes}\nUpgraded from ${client?.membershipPlan} to ${newPlan} on ${new Date().toLocaleDateString()}`
          : `Upgraded from ${client?.membershipPlan} to ${newPlan} on ${new Date().toLocaleDateString()}`,
      });
      showToast(
        `Successfully upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan`,
      );
      setUpgradeOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(formatError(err), "error");
    }
  };

  const handleRenew = async (days) => {
    try {
      await renewClientMembership(clientId, days);
      showToast(`Membership renewed for ${days} days`);
      setRenewOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(formatError(err), "error");
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = isActive ? "inactive" : "active";
    try {
      await changeClientStatus(clientId, newStatus);
      showToast(
        `Customer ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
      setDeactivateOpen(false);
      await loadClientData();
    } catch (err) {
      showToast(formatError(err), "error");
    }
  };

  if ((initialLoading || loading || isFetching) && !selectedClient) {
    return <DetailSkeleton />;
  }

  if (fetchError || (error && !selectedClient)) {
    return (
      <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: colors.error, mb: 2 }} />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: colors.text.primary,
            mb: 1,
          }}
        >
          Failed to Load Customer
        </Typography>
        <Typography
          sx={{ fontSize: "0.75rem", color: colors.text.secondary, mb: 3 }}
        >
          {fetchError || error}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/clients")}
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: "none" }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={loadClientData}
            startIcon={<RefreshIcon />}
            sx={{ bgcolor: colors.primary, textTransform: "none" }}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!selectedClient && !loading && !initialLoading && !isFetching) {
    return (
      <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>
          Customer Not Found
        </Typography>
        <Typography
          sx={{ fontSize: "0.75rem", color: colors.text.secondary, mb: 3 }}
        >
          Client ID: {clientId || "Not provided"}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/admin/clients")}
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: "none" }}
        >
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{ bgcolor: colors.surface, minHeight: "100vh", p: { xs: 2, sm: 3 } }}
    >
      {/* Loading indicator */}
      {(loading || actionLoading) && !initialLoading && !isFetching && (
        <LinearProgress sx={{ mb: 2, borderRadius: 2, height: 3 }} />
      )}

      {/* Header Card */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <IconButton
              onClick={() => navigate("/admin/clients")}
              size="small"
              sx={{ bgcolor: colors.surface }}
            >
              <ArrowBackIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Edit">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon sx={{ fontSize: "0.8rem" }} />}
                  onClick={() => setEditOpen(true)}
                  disabled={actionLoading}
                  sx={{ textTransform: "none", fontSize: "0.7rem" }}
                >
                  Edit
                </Button>
              </Tooltip>
              <Tooltip title={isActive ? "Deactivate" : "Activate"}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonOffIcon sx={{ fontSize: "0.8rem" }} />}
                  onClick={() => setDeactivateOpen(true)}
                  disabled={actionLoading}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.7rem",
                    borderColor: isActive ? colors.error : colors.success,
                    color: isActive ? colors.error : colors.success,
                  }}
                >
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: colors.primary,
                fontSize: "1.1rem",
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
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    color: colors.text.primary,
                  }}
                >
                  {client?.customerName}
                </Typography>
                <Chip
                  label={isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    bgcolor: isActive
                      ? `${colors.success}15`
                      : `${colors.error}15`,
                    color: isActive ? colors.success : colors.error,
                  }}
                />
                <Chip
                  label={plan.label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    bgcolor: plan.bg,
                    color: plan.color,
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 12, color: colors.text.muted }} />
                  <Typography
                    sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                  >
                    {client?.email}
                  </Typography>
                </Box>
                {client?.phone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneIcon
                      sx={{ fontSize: 12, color: colors.text.muted }}
                    />
                    <Typography
                      sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                    >
                      {client.phone}
                    </Typography>
                  </Box>
                )}
                {client?.website && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LanguageIcon
                      sx={{ fontSize: 12, color: colors.text.muted }}
                    />
                    <Typography
                      sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                    >
                      {client.website}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map((stat, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <StatCard {...stat} loading={loading || isFetching} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 2, overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.card,
          }}
        >
          {[
            { icon: DashboardIcon, label: "Overview", value: 0 },
            { icon: SubscriptionIcon, label: "Subscription", value: 1 },
            { icon: SettingsIcon, label: "Settings", value: 2 },
          ].map((item) => (
            <Button
              key={item.value}
              onClick={() => setTab(item.value)}
              sx={{
                flex: 1,
                borderRadius: 0,
                py: 1.5,
                textTransform: "none",
                fontWeight: tab === item.value ? 700 : 500,
                color:
                  tab === item.value ? colors.primary : colors.text.secondary,
                borderBottom:
                  tab === item.value ? `2px solid ${colors.primary}` : "none",
              }}
            >
              <item.icon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {item.label}
              </Typography>
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Tab Content - Overview */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: colors.text.primary,
                    mb: 1.5,
                  }}
                >
                  Account Information
                </Typography>
                <Stack divider={<Divider sx={{ my: 0.75 }} />}>
                  {[
                    {
                      label: "Customer ID",
                      value: client?._id?.slice(-8) || "—",
                    },
                    { label: "Email", value: client?.email || "—" },
                    { label: "Phone", value: client?.phone || "—" },
                    { label: "Website", value: client?.website || "—" },
                    { label: "Join Date", value: formatDate(client?.joinDate) },
                    {
                      label: "Last Active",
                      value: formatDate(client?.lastActiveAt),
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.65rem", color: colors.text.muted }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          color: colors.text.secondary,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: colors.text.primary,
                    mb: 1.5,
                  }}
                >
                  Usage Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "0.65rem", color: colors.text.muted }}
                    >
                      License Usage
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color:
                          usagePercentage > 85
                            ? colors.error
                            : colors.text.primary,
                      }}
                    >
                      {usersUsed}/{licenseLimit} ({usagePercentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={usagePercentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: colors.border,
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          usagePercentage > 85 ? colors.error : colors.primary,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
                {client?.notes && (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: colors.surface,
                      borderRadius: 2,
                      mt: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.6rem",
                        color: colors.text.muted,
                        mb: 0.5,
                      }}
                    >
                      Notes
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                    >
                      {client.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab Content - Subscription */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                color: colors.text.primary,
                mb: 1.5,
              }}
            >
              Current Plan
            </Typography>
            <Box sx={{ bgcolor: plan.bg, borderRadius: 2, p: 2, mb: 2 }}>
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
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: plan.color,
                    }}
                  >
                    {plan.label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                  >
                    {plan.price}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                  >
                    {formatDate(client?.subscriptionStartDate)} -{" "}
                    {formatDate(client?.subscriptionEndDate)}
                  </Typography>
                  {isExpiringSoon && (
                    <Chip
                      label={`${daysLeft} days remaining`}
                      size="small"
                      sx={{
                        mt: 0.5,
                        height: 20,
                        fontSize: "0.6rem",
                        bgcolor: `${colors.warning}15`,
                        color: colors.warning,
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ bgcolor: colors.card, borderRadius: 1.5, p: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: colors.text.secondary,
                    mb: 0.5,
                  }}
                >
                  <strong>License Limit:</strong> {licenseLimit} users
                </Typography>
                <Typography
                  sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                >
                  <strong>Current Usage:</strong> {usersUsed} users (
                  {usagePercentage}%)
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
                startIcon={<TrendingUpIcon />}
                onClick={() => setUpgradeOpen(true)}
                disabled={actionLoading}
                sx={{
                  bgcolor: colors.warning,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#ea580c" },
                }}
              >
                Upgrade Plan
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setRenewOpen(true)}
                disabled={actionLoading}
                sx={{
                  textTransform: "none",
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                Renew Membership
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Settings */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                color: colors.text.primary,
                mb: 1.5,
              }}
            >
              Account Settings
            </Typography>

            {isExpiringSoon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: `${colors.warning}10`,
                  border: `1px solid ${colors.warning}30`,
                  borderRadius: 2,
                  p: 1.5,
                  mb: 2,
                }}
              >
                <WarningAmberIcon
                  sx={{ fontSize: "1rem", color: colors.warning }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: colors.warning,
                    }}
                  >
                    License expiring in {daysLeft} days
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.65rem", color: colors.text.secondary }}
                  >
                    Renew now to avoid service interruption
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
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  Account Status
                </Typography>
                <Typography
                  sx={{ fontSize: "0.65rem", color: colors.text.secondary }}
                >
                  Currently: <strong>{isActive ? "Active" : "Inactive"}</strong>
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setDeactivateOpen(true)}
                disabled={actionLoading}
                sx={{
                  bgcolor: isActive ? colors.error : colors.success,
                  textTransform: "none",
                  fontSize: "0.7rem",
                }}
              >
                {isActive ? "Deactivate Account" : "Activate Account"}
              </Button>
            </Box>

            <Divider sx={{ my: 1.5 }} />

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
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  Auto-Renewal
                </Typography>
                <Typography
                  sx={{ fontSize: "0.65rem", color: colors.text.secondary }}
                >
                  Automatically renew subscription
                </Typography>
              </Box>
              <Chip
                label={client?.settings?.autoRenewal ? "Enabled" : "Disabled"}
                size="small"
                sx={{
                  bgcolor: client?.settings?.autoRenewal
                    ? `${colors.success}15`
                    : `${colors.error}15`,
                  color: client?.settings?.autoRenewal
                    ? colors.success
                    : colors.error,
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EditClientModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        loading={actionLoading}
      />
      <RenewModal
        open={renewOpen}
        client={client}
        onClose={() => setRenewOpen(false)}
        onRenew={handleRenew}
        loading={actionLoading}
      />
      <UpgradeModal
        open={upgradeOpen}
        client={client}
        currentPlan={client?.membershipPlan}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        loading={actionLoading}
      />
      <DeactivateDialog
        open={deactivateOpen}
        client={client}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleStatusToggle}
        loading={actionLoading}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

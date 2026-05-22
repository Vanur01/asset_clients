// pages/ClientManagement.tsx - Website and Notes Made Optional

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Modal,
  Fade,
  Backdrop,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
  useMediaQuery,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Zoom,
  TablePagination,
  alpha,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorOutlineIcon,
  Inbox as InboxIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  VpnKey as VpnKeyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Description as DescriptionIcon,
  BusinessCenter as BusinessCenterIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useClient } from "../context/ClientContext";

// ─── Color palette ──────────────────────────────────────────────────────────
const C = {
  primary: "#0d4a5c",
  primaryDark: "#0a3a49",
  primaryLight: "#e6f0f3",
  success: "#2e7d32",
  successLight: "#e8f5e9",
  warning: "#ed6c02",
  warningLight: "#fff4e5",
  error: "#d32f2f",
  errorLight: "#ffebea",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: { primary: "#1e293b", secondary: "#475569", disabled: "#94a3b8" },
};

// ─── Validation Functions ───────────────────────────────────────────
const validateCustomerName = (name) => {
  if (!name || !name.trim()) return "Customer name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > 100) return "Name must be less than 100 characters";
  if (!/^[a-zA-Z\s\-'.]+$/.test(name.trim()))
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return "";
};

const validateEmail = (email) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!emailRegex.test(email))
    return "Please enter a valid email address (e.g., name@company.com)";
  if (email.length > 255) return "Email must be less than 255 characters";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 50) return "Password must be less than 50 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Password must contain at least one special character";
  if (/\s/.test(password)) return "Password cannot contain spaces";
  return "";
};

const validateDuration = (duration) => {
  if (!duration && duration !== 0) return "Duration is required";
  const days = parseInt(duration);
  if (isNaN(days)) return "Duration must be a valid number";
  if (days < 1) return "Duration must be at least 1 day";
  if (days > 365) return "Duration cannot exceed 365 days";
  if (!Number.isInteger(days)) return "Duration must be a whole number";
  return "";
};

const validateExtendDays = (extendDays) => {
  if (!extendDays && extendDays !== 0) return "Extend days is required";
  const days = parseInt(extendDays);
  if (isNaN(days)) return "Extend days must be a valid number";
  if (days < 0) return "Extend days cannot be negative";
  if (days > 365) return "Cannot extend more than 365 days";
  if (!Number.isInteger(days)) return "Extend days must be a whole number";
  return "";
};

const validateLicenseLimit = (limit) => {
  if (!limit && limit !== 0) return "License limit is required";
  const numLimit = parseInt(limit);
  if (isNaN(numLimit)) return "License limit must be a valid number";
  if (numLimit < 1) return "License limit must be at least 1";
  if (numLimit > 10000) return "License limit cannot exceed 10,000";
  if (!Number.isInteger(numLimit))
    return "License limit must be a whole number";
  return "";
};

const validatePhoneNumber = (phone) => {
  if (!phone) return "Phone number is required";
  // International phone number format with better validation
  const phoneRegex =
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
  if (!phoneRegex.test(phone))
    return "Please enter a valid phone number (e.g., +1 555 123 4567)";
  if (phone.replace(/[\s\-\(\)\+]/g, "").length < 10)
    return "Phone number must have at least 10 digits";
  if (phone.replace(/[\s\-\(\)\+]/g, "").length > 15)
    return "Phone number is too long";
  return "";
};

// Updated: Website validation - made optional
const validateWebsite = (website) => {
  if (!website || !website.trim()) return ""; // Optional field
  const urlRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  if (!urlRegex.test(website))
    return "Please enter a valid URL (e.g., https://example.com)";
  if (website.length > 200)
    return "Website URL must be less than 200 characters";
  return "";
};

// Updated: Notes validation - made optional
const validateNotes = (notes) => {
  if (!notes || !notes.trim()) return ""; // Optional field
  if (notes.trim().length < 5) return "Notes must be at least 5 characters if provided";
  if (notes.trim().length > 1000)
    return "Notes must be less than 1000 characters";
  return "";
};

const validateMembershipPlan = (plan) => {
  if (!plan) return "Membership plan is required";
  const validPlans = ["free", "standard", "premium", "enterprise"];
  if (!validPlans.includes(plan.toLowerCase()))
    return "Please select a valid membership plan";
  return "";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const getMembershipStyle = (plan = "") => {
  const map = {
    premium: { bg: "#fff4e5", color: "#ed6c02", label: "Premium" },
    standard: { bg: "#e6f0f3", color: "#0d4a5c", label: "Standard" },
    free: { bg: "#f0f3f5", color: "#5f6b7a", label: "Free" },
    enterprise: { bg: "#ede7f6", color: "#5e35b1", label: "Enterprise" },
  };
  return (
    map[plan.toLowerCase()] || {
      bg: C.border,
      color: C.text.secondary,
      label: plan,
    }
  );
};

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const ClientCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 3,
      border: `1px solid ${C.border}`,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Skeleton
        variant="rounded"
        width={44}
        height={44}
        sx={{ borderRadius: 2 }}
      />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
      </Box>
      <Skeleton variant="circular" width={32} height={32} />
    </Box>
    <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
    <Skeleton variant="rounded" height={5} sx={{ borderRadius: 3, mb: 1.5 }} />
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Skeleton variant="rounded" width={70} height={32} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Box>
  </Paper>
);

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ title, description, action }) => (
  <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8, md: 10 }, px: 2 }}>
    <InboxIcon
      sx={{ fontSize: { xs: 48, sm: 64 }, color: C.text.disabled, mb: 2 }}
    />
    <Typography
      variant="h6"
      sx={{
        fontWeight: 600,
        color: C.text.primary,
        mb: 1,
        fontSize: { xs: "0.9rem", sm: "1rem" },
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: C.text.secondary,
        mb: 3,
        maxWidth: 400,
        mx: "auto",
        fontSize: { xs: "0.7rem", sm: "0.75rem" },
      }}
    >
      {description}
    </Typography>
    {action && action}
  </Box>
);

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8 }, px: 2 }}>
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
      Failed to Load Clients
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: C.text.secondary,
        mb: 3,
        fontSize: { xs: "0.7rem", sm: "0.75rem" },
      }}
    >
      {message || "An error occurred while fetching clients."}
    </Typography>
    <Button
      variant="contained"
      onClick={onRetry}
      startIcon={<RefreshIcon />}
      sx={{ bgcolor: C.primary }}
    >
      Retry
    </Button>
  </Box>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, subtitle, color, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          bgcolor: C.card,
          border: `1px solid ${C.border}`,
        }}
      >
        <Skeleton variant="circular" width={32} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={28} sx={{ mt: 1 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: { xs: 2, sm: 3 },
        bgcolor: C.card,
        border: "1px solid",
        borderColor: C.border,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 1,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(13,74,92,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: isMobile ? "100%" : "235px",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: C.text.secondary,
            fontWeight: 500,
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            p: { xs: 0.5, sm: 0.75 },
            borderRadius: 1.5,
            bgcolor: color ? `${color}18` : C.primaryLight,
          }}
        >
          <Icon
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem" },
              color: color || C.primary,
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: C.text.primary,
          fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
          lineHeight: 1,
        }}
      >
        {value ?? 0}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: C.text.disabled,
            fontSize: { xs: "0.6rem", sm: "0.65rem" },
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

// ─── Client Card ─────────────────────────────────────────────────────────────
const ClientCard = ({ client, onEdit, onDelete, onViewDetails }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const plan = client.membershipPlan || "free";
  const daysLeft = client.daysRemaining ?? 0;
  const isActive = client.status === "active";
  const mStyle = getMembershipStyle(plan);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const usersUsed = client.usersUsed || 0;
  const licenseLimit = client.licenseLimit || 0;
  const usagePercentage =
    licenseLimit > 0
      ? Math.min(100, Math.round((usersUsed / licenseLimit) * 100))
      : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  return (
    <Zoom in style={{ transitionDelay: "50ms" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: C.border,
          bgcolor: C.card,
          width: isMobile ? "260px" : "377px",
          position: "relative",
          opacity: isActive ? 1 : 0.75,
          transition: "all 0.2s",
          "&:hover": {
            borderColor: C.primary,
            boxShadow: "0 4px 20px rgba(13,74,92,0.1)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {!isActive && (
          <Chip
            label="Inactive"
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              height: 20,
              fontSize: { xs: "0.55rem", sm: "0.6rem" },
              fontWeight: 700,
              bgcolor: C.errorLight,
              color: C.error,
            }}
          />
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              bgcolor: isActive ? C.primary : C.text.disabled,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {getInitials(client.customerName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: C.text.primary,
                  fontSize: { xs: "0.8rem", sm: "0.88rem" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {client.customerName}
              </Typography>
              <CircleIcon
                sx={{
                  color: isActive ? C.success : C.text.disabled,
                  fontSize: "0.45rem",
                  flexShrink: 0,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: C.text.secondary,
                fontSize: { xs: "0.62rem", sm: "0.67rem" },
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {client.email}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{ color: C.text.disabled, p: 0.5 }}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVertIcon sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: C.text.disabled,
                fontSize: { xs: "0.55rem", sm: "0.6rem" },
                display: "block",
                mb: 0.5,
              }}
            >
              Membership
            </Typography>
            <Chip
              label={mStyle.label}
              size="small"
              sx={{
                bgcolor: mStyle.bg,
                color: mStyle.color,
                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                fontWeight: 700,
                height: { xs: 20, sm: 22 },
                borderRadius: 1,
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: C.text.disabled,
                fontSize: { xs: "0.55rem", sm: "0.6rem" },
                display: "block",
                mb: 0.5,
              }}
            >
              Duration
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                color: isExpiringSoon ? C.error : C.text.primary,
              }}
            >
              {daysLeft} days left {isExpiringSoon && "⚠"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: C.text.disabled,
                fontSize: { xs: "0.55rem", sm: "0.6rem" },
              }}
            >
              License Usage
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.62rem", sm: "0.67rem" },
                color: usagePercentage > 85 ? C.error : C.text.primary,
              }}
            >
              {usersUsed} / {licenseLimit} ({usagePercentage}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={usagePercentage}
            sx={{
              height: { xs: 4, sm: 5 },
              borderRadius: 3,
              bgcolor: C.border,
              "& .MuiLinearProgress-bar": {
                bgcolor: usagePercentage > 85 ? C.error : C.primary,
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: C.border, mb: { xs: 1, sm: 1.5 } }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={
              <VisibilityIcon
                sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" } }}
              />
            }
            onClick={() => onViewDetails(client._id)}
            sx={{
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
              fontWeight: 600,
              textTransform: "none",
              borderColor: C.border,
              color: C.text.secondary,
              py: 0.5,
              px: { xs: 1, sm: 1.5 },
              borderRadius: 1.5,
              "&:hover": {
                borderColor: C.primary,
                color: C.primary,
                bgcolor: C.primaryLight,
              },
            }}
          >
            View
          </Button>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => onEdit(client)}
              sx={{
                color: C.text.secondary,
                p: { xs: 0.5, sm: 0.75 },
                "&:hover": { color: C.primary, bgcolor: C.primaryLight },
              }}
            >
              <EditIcon sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(client)}
              sx={{
                color: C.text.secondary,
                p: { xs: 0.5, sm: 0.75 },
                "&:hover": { color: C.error, bgcolor: C.errorLight },
              }}
            >
              <DeleteIcon sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }} />
            </IconButton>
          </Box>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            sx: {
              mt: 0.5,
              borderRadius: 2,
              minWidth: 150,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              onEdit(client);
              setMenuAnchor(null);
            }}
            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, py: 0.75 }}
          >
            <ListItemIcon>
              <EditIcon sx={{ fontSize: "1rem", color: C.text.secondary }} />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDelete(client);
              setMenuAnchor(null);
            }}
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              py: 0.75,
              color: C.error,
            }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ fontSize: "1rem", color: C.error }} />
            </ListItemIcon>
            <ListItemText primary={isActive ? "Deactivate" : "Activate"} />
          </MenuItem>
        </Menu>
      </Paper>
    </Zoom>
  );
};

const EMPTY_FORM = {
  customerName: "",
  email: "",
  password: "",
  membershipPlan: "standard",
  duration: "30",
  licenseLimit: "10",
  phone: "",
  website: "",
  notes: "",
};

export default function ClientManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();

  const {
    clients,
    stats,
    pagination,
    filters,
    loading,
    initialLoading,
    error,
    actionLoading,
    fetchClients,
    addClient,
    editClient,
    changeClientStatus,
    updateFilters,
    changePage,
    resetFilters,
  } = useClient();

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [membershipAnchorEl, setMembershipAnchorEl] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [touchedFields, setTouchedFields] = useState({});

  const searchTimeoutRef = useRef(null);

  const showToast = useCallback(
    (msg, sev = "success") =>
      setToast({ open: true, message: msg, severity: sev }),
    [],
  );
  const closeToast = useCallback(
    () => setToast((p) => ({ ...p, open: false })),
    [],
  );

  useEffect(() => {
    fetchClients();
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: searchTerm });
      fetchClients({ search: searchTerm, page: 1 });
    }, 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  const handleStatusFilterChange = (status) => {
    updateFilters({ status });
    setFilterAnchorEl(null);
    fetchClients({ status, page: 1 });
  };

  const handleMembershipFilterChange = (membershipPlan) => {
    updateFilters({ membershipPlan });
    setMembershipAnchorEl(null);
    fetchClients({ membershipPlan, page: 1 });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchTerm("");
  };

  const handlePageChange = (newPage) => {
    changePage(newPage);
    fetchClients({ page: newPage });
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "customerName":
        error = validateCustomerName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        if (modalMode === "add") error = validatePassword(value);
        break;
      case "duration":
        if (modalMode === "add") error = validateDuration(value);
        break;
      case "extendDays":
        if (modalMode === "edit") error = validateExtendDays(value);
        break;
      case "licenseLimit":
        error = validateLicenseLimit(value);
        break;
      case "phone":
        error = validatePhoneNumber(value);
        break;
      case "website":
        error = validateWebsite(value);
        break;
      case "notes":
        error = validateNotes(value);
        break;
      case "membershipPlan":
        error = validateMembershipPlan(value);
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate ALL fields for Add Mode
    if (modalMode === "add") {
      const nameError = validateCustomerName(formData.customerName);
      if (nameError) {
        errors.customerName = nameError;
        isValid = false;
      }

      const emailError = validateEmail(formData.email);
      if (emailError) {
        errors.email = emailError;
        isValid = false;
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }

      const planError = validateMembershipPlan(formData.membershipPlan);
      if (planError) {
        errors.membershipPlan = planError;
        isValid = false;
      }

      const durationError = validateDuration(formData.duration);
      if (durationError) {
        errors.duration = durationError;
        isValid = false;
      }

      const licenseError = validateLicenseLimit(formData.licenseLimit);
      if (licenseError) {
        errors.licenseLimit = licenseError;
        isValid = false;
      }

      const phoneError = validatePhoneNumber(formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
        isValid = false;
      }

      // Website is optional - only validate if provided
      const websiteError = validateWebsite(formData.website);
      if (websiteError) {
        errors.website = websiteError;
        isValid = false;
      }

      // Notes is optional - only validate if provided
      const notesError = validateNotes(formData.notes);
      if (notesError) {
        errors.notes = notesError;
        isValid = false;
      }
    }

    // Validate ALL fields for Edit Mode
    if (modalMode === "edit") {
      const nameError = validateCustomerName(formData.customerName);
      if (nameError) {
        errors.customerName = nameError;
        isValid = false;
      }

      const planError = validateMembershipPlan(formData.membershipPlan);
      if (planError) {
        errors.membershipPlan = planError;
        isValid = false;
      }

      const extendDaysError = validateExtendDays(formData.extendDays);
      if (extendDaysError) {
        errors.extendDays = extendDaysError;
        isValid = false;
      }

      const licenseError = validateLicenseLimit(formData.licenseLimit);
      if (licenseError) {
        errors.licenseLimit = licenseError;
        isValid = false;
      }

      const phoneError = validatePhoneNumber(formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
        isValid = false;
      }

      // Website is optional - only validate if provided
      const websiteError = validateWebsite(formData.website);
      if (websiteError) {
        errors.website = websiteError;
        isValid = false;
      }

      // Notes is optional - only validate if provided
      const notesError = validateNotes(formData.notes);
      if (notesError) {
        errors.notes = notesError;
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Mark all required fields as touched to show errors
      const allFields = {};
      if (modalMode === "add") {
        allFields.customerName = true;
        allFields.email = true;
        allFields.password = true;
        allFields.membershipPlan = true;
        allFields.duration = true;
        allFields.licenseLimit = true;
        allFields.phone = true;
        // website and notes are optional - don't mark them as required
        // allFields.website = true;
        // allFields.notes = true;
      } else {
        allFields.customerName = true;
        allFields.membershipPlan = true;
        allFields.extendDays = true;
        allFields.licenseLimit = true;
        allFields.phone = true;
        // website and notes are optional - don't mark them as required
        // allFields.website = true;
        // allFields.notes = true;
      }
      setTouchedFields(allFields);
      showToast("Please fill in all required fields correctly", "error");
      return;
    }

    try {
      if (modalMode === "add") {
        await addClient({
          customerName: formData.customerName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          membershipPlan: formData.membershipPlan,
          duration: parseInt(formData.duration),
          licenseLimit: parseInt(formData.licenseLimit),
          phone: formData.phone.trim(),
          website: formData.website ? formData.website.trim() : "",
          notes: formData.notes ? formData.notes.trim() : "",
        });
        showToast("Client created successfully!");
      } else {
        await editClient(selectedClient._id, {
          customerName: formData.customerName.trim(),
          membershipPlan: formData.membershipPlan,
          extendDays: parseInt(formData.extendDays) || 0,
          licenseLimit: parseInt(formData.licenseLimit),
          phone: formData.phone.trim(),
          website: formData.website ? formData.website.trim() : "",
          notes: formData.notes ? formData.notes.trim() : "",
        });
        showToast("Client updated successfully");
      }
      setOpenModal(false);
      setFormData(EMPTY_FORM);
      setFormErrors({});
      setTouchedFields({});
    } catch (error) {
      showToast(error.message || "An error occurred", "error");
    }
  };

  const handleToggleStatus = async (client) => {
    const newStatus = client.status === "active" ? "inactive" : "active";
    try {
      await changeClientStatus(client._id, newStatus);
      showToast(
        `Client ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      showToast(error.message || "Failed to change status", "error");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setTouchedFields({});
    setOpenModal(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      customerName: client.customerName || "",
      email: client.email || "",
      password: "",
      membershipPlan: client.membershipPlan || "standard",
      extendDays: "0",
      licenseLimit: String(client.licenseLimit || 10),
      phone: client.phone || "",
      website: client.website || "",
      notes: client.notes || "",
    });
    setFormErrors({});
    setTouchedFields({});
    setModalMode("edit");
    setOpenModal(true);
  };

  const statCards = useMemo(
    () => [
      {
        icon: GroupIcon,
        title: "Total Clients",
        value: stats?.total || 0,
        subtitle: "All registered",
        color: C.primary,
      },
      {
        icon: PersonIcon,
        title: "Active",
        value: stats?.active || 0,
        subtitle: "Currently active",
        color: C.success,
      },
      {
        icon: BusinessIcon,
        title: "Enterprise",
        value: stats?.byPlan?.enterprise || 0,
        subtitle: "Business plans",
        color: "#5e35b1",
      },
      {
        icon: WarningIcon,
        title: "Expiring",
        value: stats?.expiringSoon || 0,
        subtitle: "Within 7 days",
        color: C.warning,
      },
    ],
    [stats],
  );

  const getStatusDisplayText = () =>
    filters.status === "all"
      ? "All Status"
      : filters.status === "active"
        ? "Active"
        : "Inactive";
  const getMembershipDisplayText = () =>
    filters.membershipPlan === "all"
      ? "All Plans"
      : filters.membershipPlan.charAt(0).toUpperCase() +
        filters.membershipPlan.slice(1);
  const hasActiveFilters =
    filters.status !== "all" || filters.membershipPlan !== "all" || searchTerm;

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: C.error };
    if (strength <= 4) return { strength, label: "Medium", color: C.warning };
    return { strength, label: "Strong", color: C.success };
  };

  // Show error state
  if (error && !initialLoading) {
    return <ErrorState message={error} onRetry={() => fetchClients()} />;
  }

  return (
    <Box
      sx={{
        bgcolor: C.surface,
        minHeight: "100%",
        p: { xs: 1.5, sm: 2, md: 3, lg: 3.5 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: C.text.primary,
              fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
              mb: 0.25,
            }}
          >
            Client Management
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: C.text.secondary,
              fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
            }}
          >
            Manage customer accounts and memberships
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={
            <AddIcon sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }} />
          }
          onClick={openAddModal}
          sx={{
            bgcolor: C.primary,
            fontSize: { xs: "0.7rem", sm: "0.78rem" },
            fontWeight: 600,
            textTransform: "none",
            py: { xs: 0.75, sm: 1 },
            px: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0b3f4f", boxShadow: "none" },
          }}
        >
          Add Client
        </Button>
      </Box>

      {/* Loading Indicator */}
      {loading && !initialLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 1, height: 3 }} />
        </Box>
      )}

      {/* Search and Filters */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
                borderRadius: 2,
                bgcolor: C.card,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon
                sx={{
                  color: C.text.disabled,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  flexShrink: 0,
                }}
              />
              <TextField
                placeholder="Search by name or email..."
                variant="standard"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: { xs: "0.75rem", sm: "0.82rem" },
                    py: { xs: 0.5, sm: 0.75 },
                    color: C.text.primary,
                  },
                }}
              />
              {searchTerm && (
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm("")}
                  sx={{ p: 0.25 }}
                >
                  <CloseIcon
                    sx={{ fontSize: "0.9rem", color: C.text.disabled }}
                  />
                </IconButton>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: { xs: "flex-start", md: "flex-end" },
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                endIcon={<FilterIcon sx={{ fontSize: "0.9rem" }} />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: C.border,
                  color:
                    filters.status !== "all" ? C.primary : C.text.secondary,
                  borderRadius: 1.5,
                  px: 1.5,
                  bgcolor: filters.status !== "all" ? C.primaryLight : C.card,
                }}
              >
                {getStatusDisplayText()}
              </Button>

              <Button
                variant="outlined"
                size="small"
                endIcon={<FilterIcon sx={{ fontSize: "0.9rem" }} />}
                onClick={(e) => setMembershipAnchorEl(e.currentTarget)}
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: C.border,
                  color:
                    filters.membershipPlan !== "all"
                      ? C.primary
                      : C.text.secondary,
                  borderRadius: 1.5,
                  px: 1.5,
                  bgcolor:
                    filters.membershipPlan !== "all" ? C.primaryLight : C.card,
                }}
              >
                {getMembershipDisplayText()}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{
                    fontSize: "0.7rem",
                    textTransform: "none",
                    color: C.error,
                    minWidth: "auto",
                  }}
                >
                  Clear
                </Button>
              )}

              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => fetchClients()}
                  sx={{
                    bgcolor: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 1.5,
                    p: 0.75,
                  }}
                >
                  <RefreshIcon
                    sx={{ color: C.text.secondary, fontSize: "1.05rem" }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Stat Cards */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        {statCards.map((s, i) => (
          <Grid item xs={6} sm={6} md={3} key={i}>
            <StatCard {...s} loading={initialLoading} />
          </Grid>
        ))}
      </Grid>

      {/* Results Count */}
      {!initialLoading && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: C.text.secondary,
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
            }}
          >
            Showing {clients.length} of {pagination.total || 0} clients
          </Typography>
        </Box>
      )}

      {/* Client Grid */}
      {initialLoading ? (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <ClientCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description={
            searchTerm
              ? `No results for "${searchTerm}". Try adjusting your search.`
              : "No clients have been added yet."
          }
          action={
            !searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddModal}
                sx={{ bgcolor: C.primary, textTransform: "none" }}
              >
                Add Your First Client
              </Button>
            )
          }
        />
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={client._id}>
              <ClientCard
                client={client}
                onEdit={openEditModal}
                onDelete={handleToggleStatus}
                onViewDetails={(id) =>
                  navigate(`/admin/clients-details/${id}`, {
                    state: { clientId: id },
                  })
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: { xs: 2, sm: 3 },
            flexWrap: "wrap",
          }}
        >
          <Button
            size="small"
            disabled={pagination.page <= 1 || loading}
            onClick={() => handlePageChange(pagination.page - 1)}
            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
          >
            Previous
          </Button>
          <Typography
            variant="caption"
            sx={{
              color: C.text.secondary,
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
            }}
          >
            Page {pagination.page} of {pagination.pages}
          </Typography>
          <Button
            size="small"
            disabled={pagination.page >= pagination.pages || loading}
            onClick={() => handlePageChange(pagination.page + 1)}
            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Filter Menus */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        {["all", "active", "inactive"].map((status) => (
          <MenuItem
            key={status}
            selected={filters.status === status}
            onClick={() => handleStatusFilterChange(status)}
            sx={{ fontSize: "0.75rem" }}
          >
            {status === "all"
              ? "All Status"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={membershipAnchorEl}
        open={Boolean(membershipAnchorEl)}
        onClose={() => setMembershipAnchorEl(null)}
      >
        {["all", "free", "standard", "premium", "enterprise"].map((plan) => (
          <MenuItem
            key={plan}
            selected={filters.membershipPlan === plan}
            onClick={() => handleMembershipFilterChange(plan)}
            sx={{ fontSize: "0.75rem" }}
          >
            {plan === "all"
              ? "All Plans"
              : plan.charAt(0).toUpperCase() + plan.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      {/* Add/Edit Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              width: { xs: "100%", sm: 650, md: 750, lg: 850 },
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "90vh",
              bgcolor: "background.paper",
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15)",
              position: "relative",
              outline: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Gradient Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
                borderRadius: {
                  xs: "8px 8px 0 0",
                  sm: "12px 12px 0 0",
                  md: "16px 16px 0 0",
                },
                p: { xs: 2, sm: 2.5, md: 3 },
                position: "relative",
                color: "white",
                flexShrink: 0,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.35rem" },
                  mb: 0.5,
                  pr: 5,
                }}
              >
                {modalMode === "add"
                  ? "✨ Create New Client"
                  : `✏️ Edit — ${selectedClient?.customerName}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                  opacity: 0.9,
                }}
              >
                {modalMode === "add"
                  ? "Please fill in all required fields below. Website and notes are optional."
                  : "Update customer information. Website and notes are optional."}
              </Typography>

              <IconButton
                onClick={() => setOpenModal(false)}
                size="small"
                sx={{
                  position: "absolute",
                  right: { xs: 12, sm: 16, md: 20 },
                  top: { xs: 12, sm: 16, md: 20 },
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <CloseIcon sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5, md: 3.5 },
                overflowY: "auto",
                flex: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#c1c1c1",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#a8a8a8" },
                },
              }}
            >
              <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Required Fields Indicator */}
                <Alert
                  severity="info"
                  icon={<CheckCircleIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="caption">
                    Fields marked with{" "}
                    <span style={{ color: C.error }}>*</span> are required. 
                    Website and Notes are optional.
                  </Typography>
                </Alert>

                {/* Customer Basic Information */}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: C.primary, mb: -1 }}
                >
                  Basic Information
                </Typography>

                <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Customer Name *"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInput}
                      onBlur={() => handleFieldBlur("customerName")}
                      size="small"
                      fullWidth
                      required
                      error={
                        !!formErrors.customerName && touchedFields.customerName
                      }
                      helperText={
                        touchedFields.customerName && formErrors.customerName
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon
                              sx={{ fontSize: "1rem", color: C.text.disabled }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInput}
                      onBlur={() => handleFieldBlur("email")}
                      size="small"
                      fullWidth
                      required
                      disabled={modalMode === "edit"}
                      error={!!formErrors.email && touchedFields.email}
                      helperText={touchedFields.email && formErrors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon
                              sx={{ fontSize: "1rem", color: C.text.disabled }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Password Field (Add Mode Only) */}
                {modalMode === "add" && (
                  <Box>
                    <TextField
                      label="Password *"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInput}
                      onBlur={() => handleFieldBlur("password")}
                      size="small"
                      fullWidth
                      required
                      error={!!formErrors.password && touchedFields.password}
                      helperText={touchedFields.password && formErrors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VpnKeyIcon
                              sx={{ fontSize: "1rem", color: C.text.disabled }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {formData.password && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (getPasswordStrength(formData.password)
                                  .strength /
                                  5) *
                                100
                              }
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: C.border,
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: getPasswordStrength(
                                    formData.password,
                                  ).color,
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: getPasswordStrength(formData.password)
                                .color,
                              fontWeight: 600,
                            }}
                          >
                            {getPasswordStrength(formData.password).label}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: C.text.disabled,
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          Password must contain: 8+ chars, uppercase, lowercase,
                          number, special character
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Subscription Details */}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: C.primary, mb: -1, mt: 1 }}
                >
                  Subscription Details
                </Typography>

                <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      required
                      error={
                        !!formErrors.membershipPlan &&
                        touchedFields.membershipPlan
                      }
                    >
                      <InputLabel>Subscription Plan *</InputLabel>
                      <Select
                        name="membershipPlan"
                        value={formData.membershipPlan}
                        onChange={handleInput}
                        onBlur={() => handleFieldBlur("membershipPlan")}
                        label="Subscription Plan *"
                        startAdornment={
                          <InputAdornment position="start">
                            <BusinessCenterIcon
                              sx={{
                                fontSize: "1rem",
                                color: C.text.disabled,
                                ml: 1,
                              }}
                            />
                          </InputAdornment>
                        }
                      >
                        {[
                          {
                            value: "free",
                            label: "Free",
                            color: "#10b981",
                            bg: "#d1fae5",
                          },
                          {
                            value: "standard",
                            label: "Standard",
                            color: "#3b82f6",
                            bg: "#dbeafe",
                          },
                          {
                            value: "premium",
                            label: "Premium",
                            color: "#8b5cf6",
                            bg: "#ede9fe",
                          },
                          {
                            value: "enterprise",
                            label: "Enterprise",
                            color: "#f59e0b",
                            bg: "#fed7aa",
                          },
                        ].map((plan) => (
                          <MenuItem key={plan.value} value={plan.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: plan.color,
                                  display: "inline-block",
                                }}
                              />
                              {plan.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {touchedFields.membershipPlan &&
                        formErrors.membershipPlan && (
                          <FormHelperText error>
                            {formErrors.membershipPlan}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={
                        modalMode === "add"
                          ? "Duration (Days) *"
                          : "Extend Days *"
                      }
                      name={modalMode === "add" ? "duration" : "extendDays"}
                      type="number"
                      value={
                        formData[
                          modalMode === "add" ? "duration" : "extendDays"
                        ]
                      }
                      onChange={handleInput}
                      onBlur={() =>
                        handleFieldBlur(
                          modalMode === "add" ? "duration" : "extendDays",
                        )
                      }
                      size="small"
                      fullWidth
                      required
                      error={
                        !!formErrors[
                          modalMode === "add" ? "duration" : "extendDays"
                        ] &&
                        touchedFields[
                          modalMode === "add" ? "duration" : "extendDays"
                        ]
                      }
                      helperText={
                        touchedFields[
                          modalMode === "add" ? "duration" : "extendDays"
                        ] &&
                        formErrors[
                          modalMode === "add" ? "duration" : "extendDays"
                        ]
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon
                              sx={{ fontSize: "1rem", color: C.text.disabled }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: modalMode === "add" && (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", mr: 1 }}
                          >
                            days
                          </Typography>
                        ),
                        inputProps: { min: 1, max: 365 },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* License Information */}
                <TextField
                  label="License Limit *"
                  name="licenseLimit"
                  type="number"
                  value={formData.licenseLimit}
                  onChange={handleInput}
                  onBlur={() => handleFieldBlur("licenseLimit")}
                  size="small"
                  fullWidth
                  required
                  error={
                    !!formErrors.licenseLimit && touchedFields.licenseLimit
                  }
                  helperText={
                    touchedFields.licenseLimit && formErrors.licenseLimit
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleIcon
                          sx={{ fontSize: "1rem", color: C.text.disabled }}
                        />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 10000 },
                  }}
                />

                {/* License Visual Meter */}
                {formData.licenseLimit &&
                  parseInt(formData.licenseLimit) <= 50 && (
                    <Box sx={{ mt: -1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          (parseInt(formData.licenseLimit) / 50) * 100,
                          100,
                        )}
                        sx={{ height: 4, borderRadius: 2, bgcolor: C.border }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: C.text.disabled,
                          mt: 0.5,
                          display: "block",
                        }}
                      >
                        {parseInt(formData.licenseLimit) <= 10
                          ? "Small Business Plan"
                          : "Growing Business Plan"}
                      </Typography>
                    </Box>
                  )}

                {/* Contact Information */}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: C.primary, mb: -1, mt: 1 }}
                >
                  Contact Information
                </Typography>

                <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number *"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInput}
                      onBlur={() => handleFieldBlur("phone")}
                      size="small"
                      fullWidth
                      required
                      placeholder="+1 (555) 000-0000"
                      error={!!formErrors.phone && touchedFields.phone}
                      helperText={touchedFields.phone && formErrors.phone}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon
                              sx={{ fontSize: "1rem", color: C.text.disabled }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Website (Optional)"
                      name="website"
                      value={formData.website}
                      onChange={handleInput}
                      onBlur={() => handleFieldBlur("website")}
                      size="small"
                      fullWidth
                      placeholder="https://example.com"
                      error={!!formErrors.website && touchedFields.website}
                      helperText={touchedFields.website && formErrors.website}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageIcon
                              sx={{ fontSize: "1rem", color: C.text.disabled }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Notes Section - Made Optional */}
                <TextField
                  label="Additional Notes (Optional)"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInput}
                  onBlur={() => handleFieldBlur("notes")}
                  size="small"
                  fullWidth
                  placeholder="Any additional information you'd like to add..."
                  error={!!formErrors.notes && touchedFields.notes}
                  helperText={touchedFields.notes && formErrors.notes}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon
                          sx={{ fontSize: "1rem", color: C.text.disabled }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Validation Summary */}
                {Object.keys(formErrors).length > 0 &&
                  Object.values(formErrors).some((err) => err) && (
                    <Alert
                      severity="error"
                      icon={<ErrorOutlineIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                      >
                        Please fix the following errors before submitting:
                      </Typography>
                      <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                        {Object.entries(formErrors).map(
                          ([key, error]) =>
                            error && (
                              <li key={key} style={{ fontSize: "0.75rem" }}>
                                {error}
                              </li>
                            ),
                        )}
                      </ul>
                    </Alert>
                  )}

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "flex-end",
                    gap: { xs: 1.5, sm: 2 },
                    pt: { xs: 2, sm: 2.5 },
                    mt: 1,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setOpenModal(false)}
                    disabled={actionLoading}
                    fullWidth={isMobile}
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      px: 3,
                      py: { xs: 0.75, sm: 1 },
                      order: { xs: 2, sm: 1 },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    disabled={actionLoading}
                    onClick={handleSubmit}
                    fullWidth={isMobile}
                    sx={{
                      bgcolor: C.primary,
                      "&:hover": { bgcolor: C.primaryDark },
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      py: { xs: 0.75, sm: 1 },
                      order: { xs: 1, sm: 2 },
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {actionLoading ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : modalMode === "add" ? (
                      <>
                        <CheckIcon sx={{ mr: 0.5 }} /> Create Client
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Modal>

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
          sx={{ fontSize: { xs: "0.7rem", sm: "0.78rem" }, borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
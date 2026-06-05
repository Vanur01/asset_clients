import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  alpha,
  Badge,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
  Divider,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useTeam } from "../context/TeamContext";
import { useAuth } from "../context/AuthContexts";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LockIcon from "@mui/icons-material/Lock";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShieldIcon from "@mui/icons-material/Shield";
import KeyIcon from "@mui/icons-material/Key";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

// ─── Animations ────────────────────────────────────────────────────────────────
const rise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const onlinePulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
  60%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
`;

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  // Brand
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  white: "#ffffff",
  // Accent — deep teal
  teal700: "#0f4c61",
  teal600: "#07465c",
  teal500: "#062935",
  teal100: "#ccfbf1",
  teal50: "#f0fdfa",
  // Status
  green500: "#22c55e",
  green100: "#dcfce7",
  red500: "#ef4444",
  red100: "#fee2e2",
  amber500: "#f59e0b",
  amber100: "#fef3c7",
  blue500: "#3b82f6",
  blue100: "#dbeafe",
  purple500: "#8b5cf6",
  purple100: "#ede9fe",
};

// ─── Styled primitives ────────────────────────────────────────────────────────
const Page = styled(Box)({
  minHeight: "100vh",
  background: P.slate50,
  paddingBottom: 64,
});

const TopBar = styled(Box)({
  background: P.white,
  borderBottom: `1px solid ${P.slate200}`,
  padding: "16px 24px",
  position: "sticky",
  top: 0,
  width:"1130px",
  marginLeft:"25px",
  zIndex: 10,
});

const Card = styled(Paper)({
  background: P.white,
  border: `1px solid ${P.slate200}`,
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  overflow: "hidden",
  animation: `${rise} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both`,
});

const CardHead = styled(Box)({
  padding: "14px 20px",
  borderBottom: `1px solid ${P.slate200}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const CardBody = styled(Box)({ padding: "20px" });

const Tag = styled(Box)(({ color = P.teal700, bg = P.teal50 }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 10px",
  borderRadius: 99,
  fontSize: "0.6875rem",
  fontWeight: 700,
  letterSpacing: "0.3px",
  color,
  background: bg,
  border: `1px solid ${alpha(color, 0.18)}`,
}));

const Field = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    fontSize: "0.8125rem",
    background: P.white,
    "& fieldset": { borderColor: P.slate200, borderWidth: 1 },
    "&:hover fieldset": { borderColor: P.slate400 },
    "&.Mui-focused fieldset": { borderColor: P.teal600, borderWidth: 1.5 },
    "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(P.teal600, 0.1)}` },
    "&.Mui-disabled": { background: P.slate50 },
    "&.Mui-disabled fieldset": { borderColor: P.slate200 },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.8125rem",
    padding: "10px 14px",
    color: P.slate900,
    "&::placeholder": { color: P.slate400, opacity: 1 },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: P.slate500,
    WebkitTextFillColor: P.slate500,
  },
  "& .MuiFormHelperText-root": { fontSize: "0.7rem" },
  "& .MuiInputLabel-root": { fontSize: "0.75rem" },
});

const Lbl = styled(Typography)({
  fontSize: "0.6875rem",
  fontWeight: 700,
  color: P.slate500,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom: 6,
  display: "block",
});

const TealBtn = styled(Button)({
  background: P.teal700,
  color: P.white,
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "8px 20px",
  borderRadius: 10,
  textTransform: "none",
  letterSpacing: "0.2px",
  boxShadow: `0 2px 8px ${alpha(P.teal700, 0.22)}`,
  transition: "all 0.2s",
  "&:hover": {
    background: P.teal600,
    transform: "translateY(-1px)",
    boxShadow: `0 4px 14px ${alpha(P.teal700, 0.3)}`,
  },
  "&:active": { transform: "translateY(0)" },
  "&.Mui-disabled": {
    background: P.slate200,
    color: P.slate400,
    boxShadow: "none",
  },
});

const GhostBtn = styled(Button)({
  color: P.slate500,
  fontWeight: 500,
  fontSize: "0.75rem",
  padding: "8px 20px",
  borderRadius: 10,
  textTransform: "none",
  border: `1px solid ${P.slate200}`,
  background: P.white,
  transition: "all 0.2s",
  "&:hover": {
    background: P.slate50,
    borderColor: P.slate400,
    color: P.slate700,
  },
});

const MetricTile = styled(Box)(({ accent = P.teal700 }) => ({
  padding: "14px 16px",
  borderRadius: 12,
  background: alpha(accent, 0.05),
  border: `1px solid ${alpha(accent, 0.12)}`,
  transition: "all 0.2s",
  "&:hover": { background: alpha(accent, 0.08), transform: "translateY(-1px)" },
}));

const InfoLine = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.75 }}>
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: P.slate100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: "0.85rem", color: P.slate500 }} />
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: "0.6rem",
          color: P.slate400,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          color: P.slate700,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const SectionIcon = ({ children }) => (
  <Box
    sx={{
      width: 30,
      height: 30,
      borderRadius: 8,
      background: P.teal50,
      border: `1px solid ${P.teal100}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& .MuiSvgIcon-root": { fontSize: "0.95rem", color: P.teal700 },
    }}
  >
    {children}
  </Box>
);

// ─── Profile Content ──────────────────────────────────────────────────────────
const ProfileContent = () => {
  const { user } = useAuth();
  const {
    profile,
    loading: teamLoading,
    updateTeamProfile,
    changePassword,
    formatDate,
    formatJoinDate,
    fetchTeamProfile,
  } = useTeam();

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    bio: "",
    department: "",
  });
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [passErrors, setPassErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    fetchTeamProfile();
  }, [fetchTeamProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        department: profile.department || "",
      });
    }
  }, [profile]);

  const toast = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const handleUpdateProfile = async () => {
    setSaving(true);
    const result = await updateTeamProfile(formData);
    setSaving(false);
    toast(
      result.success ? result.message : result.error,
      result.success ? "success" : "error",
    );
    if (result.success) setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passData.newPassword !== passData.confirmPassword)
      return toast("Passwords do not match", "error");
    if (passData.newPassword.length < 6)
      return toast("Password must be at least 6 characters", "error");
    setChangingPass(true);
    const result = await changePassword(
      passData.currentPassword,
      passData.newPassword,
      passData.confirmPassword,
    );
    setChangingPass(false);
    toast(result.message, result.success ? "success" : "error");
    if (result.success) {
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPassErrors({});
    }
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData({ ...passData, [name]: value });
    if (name === "newPassword") {
      const errs = {};
      if (value.length < 6) errs.newPassword = "At least 6 characters required";
      if (passData.confirmPassword && value !== passData.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
      setPassErrors(errs);
    }
    if (name === "confirmPassword") {
      setPassErrors(
        value !== passData.newPassword
          ? { confirmPassword: "Passwords do not match" }
          : {},
      );
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (profile)
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        department: profile.department || "",
      });
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    return profile?.email?.[0]?.toUpperCase() || "?";
  };
  const getFullName = () => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName} ${profile.lastName}`;
    return profile?.email?.split("@")[0] || "Team Member";
  };
  const getRoleDisplay = () => {
    if (profile?.roleDetails?.name) return profile.roleDetails.name;
    if (profile?.teamRole)
      return profile.teamRole.replace("_", " ").toUpperCase();
    return profile?.role || "Team Member";
  };
  const getDeptName = () =>
    profile?.departmentDetails?.name || profile?.department || "Not specified";
  const getLocName = () =>
    profile?.locationDetails?.name || profile?.location || "Not specified";

  const isActive = profile?.status === "active";
  const assigned = profile?.assignedCount || 0;
  const completed = profile?.completedCount || 0;
  const pending = assigned - completed;
  const rate =
    profile?.performanceScore ||
    (assigned > 0 ? Math.round((completed / assigned) * 100) : 0);

  if (teamLoading && !profile) {
    return (
      <Page>
        <TopBar>
          <Skeleton width={120} height={24} />
        </TopBar>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Skeleton
                  variant="circular"
                  width={88}
                  height={88}
                  sx={{ mx: "auto", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="70%"
                  sx={{ mx: "auto", mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  sx={{ mx: "auto", mb: 3 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 2 }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={32}
                  sx={{ mb: 3 }}
                />
                <Grid container spacing={2}>
                  {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Skeleton
                        variant="rectangular"
                        height={52}
                        sx={{ borderRadius: 2 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      {/* Top bar */}
      <TopBar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: 2,
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "1rem", color: P.slate900 }}
            >
              My Profile
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: P.slate400 }}>
              Manage your personal information and account settings
            </Typography>
          </Box>
        </Box>
      </TopBar>

      <Container maxWidth="xl" sx={{ pt: 4, px: { xs: 2, sm: 3 } }}>
        {/* Row 1: Profile Card and Stats Cards - Side by Side */}
        <Grid container spacing={3}>
          {/* Left side - Profile Card */}
          <Grid item xs={12} md={5} lg={4}>
            <Card
              sx={{ animationDelay: "0ms", height: "100%", width: "300px" }}
            >
              {/* Cover */}
              <Box
                sx={{
                  height: 80,
                  background: `linear-gradient(135deg, ${P.teal700} 0%, ${P.teal500} 100%)`,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)",
                  }}
                />
              </Box>

              <CardBody sx={{ pt: 0 }}>
                {/* Avatar */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    mt: "-36px",
                    mb: 2,
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 13,
                          height: 13,
                          bgcolor: isActive ? P.green500 : P.red500,
                          border: "2px solid #fff",
                          borderRadius: "50%",
                          animation: isActive
                            ? `${onlinePulse} 2.2s ease infinite`
                            : "none",
                        }}
                      />
                    }
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        background: `linear-gradient(135deg, ${P.teal700}, ${P.teal500})`,
                        border: "3px solid #fff",
                        boxShadow: "0 4px 14px rgba(13,125,125,0.25)",
                        fontSize: "1.4rem",
                        fontWeight: 800,
                      }}
                    >
                      {getInitials()}
                    </Avatar>
                  </Badge>
                  <Tag color={P.teal700} bg={P.teal50}>
                    {getRoleDisplay()}
                  </Tag>
                </Box>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: P.slate900,
                  }}
                >
                  {getFullName()}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.8rem", color: P.slate400, mb: 2.5 }}
                >
                  {profile?.email}
                </Typography>

                <Divider sx={{ borderColor: P.slate200, mb: 2 }} />

                <Stack spacing={0.5}>
                  <InfoLine
                    icon={MailOutlineIcon}
                    label="Email"
                    value={profile?.email}
                  />
                  <InfoLine
                    icon={PhoneIcon}
                    label="Phone"
                    value={profile?.phone || "Not provided"}
                  />
                  <InfoLine
                    icon={WorkIcon}
                    label="Department"
                    value={getDeptName()}
                  />
                  <InfoLine
                    icon={LocationOnIcon}
                    label="Location"
                    value={getLocName()}
                  />
                  <InfoLine
                    icon={CalendarTodayIcon}
                    label="Joined"
                    value={formatJoinDate(
                      profile?.joinDate || profile?.createdAt,
                    )}
                  />
                  {(profile?.lastActiveAt || profile?.lastLogin) && (
                    <InfoLine
                      icon={TrendingUpIcon}
                      label="Last active"
                      value={formatDate(
                        profile.lastActiveAt || profile.lastLogin,
                      )}
                    />
                  )}
                </Stack>

                {profile?.bio && (
                  <Box
                    sx={{
                      mt: 2.5,
                      pt: 2.5,
                      borderTop: `1px solid ${P.slate200}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: P.slate400,
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        mb: 1,
                      }}
                    >
                      About
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        color: P.slate600,
                        lineHeight: 1.65,
                      }}
                    >
                      {profile.bio}
                    </Typography>
                  </Box>
                )}
              </CardBody>
            </Card>
          </Grid>

          {/* Right side - Stats Row (Multiple Cards in a Row) */}
          <Grid item xs={12} md={7} lg={8}>
            <Card sx={{ animationDelay: "160ms" }}>
              <CardHead>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <SectionIcon>
                    <PersonOutlineIcon />
                  </SectionIcon>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8375rem",
                        color: P.slate900,
                      }}
                    >
                      Personal Information
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: P.slate400 }}>
                      {isEditing
                        ? "You're editing your profile"
                        : "View and update your details"}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip
                  title={isEditing ? "Discard changes" : "Edit profile"}
                  arrow
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      isEditing ? cancelEdit() : setIsEditing(true)
                    }
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      color: isEditing ? P.red500 : P.teal700,
                      bgcolor: isEditing ? P.red100 : P.teal50,
                      border: `1px solid ${isEditing ? alpha(P.red500, 0.2) : P.teal100}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: isEditing ? alpha(P.red500, 0.12) : P.teal100,
                      },
                    }}
                  >
                    {isEditing ? (
                      <CancelIcon sx={{ fontSize: "0.95rem" }} />
                    ) : (
                      <EditIcon sx={{ fontSize: "0.95rem" }} />
                    )}
                  </IconButton>
                </Tooltip>
              </CardHead>

              <CardBody sx={{ width: "800px" }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                    <Lbl>First Name</Lbl>
                    <Field
                      fullWidth
                      size="small"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                    <Lbl>Last Name</Lbl>
                    <Field
                      fullWidth
                      size="small"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ width: "300px" }}>
                    <Lbl>Email Address</Lbl>
                    <Field
                      fullWidth
                      size="small"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon
                              sx={{ fontSize: "0.85rem", color: P.slate400 }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tag color={P.slate500} bg={P.slate100}>
                              Verified
                            </Tag>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                    <Lbl>Phone Number</Lbl>
                    <Field
                      fullWidth
                      size="small"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneInTalkIcon
                              sx={{ fontSize: "0.85rem", color: P.slate400 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ width: "300px" }}>
                    <Lbl>Department</Lbl>
                    <Field
                      fullWidth
                      size="small"
                      name="department"
                      placeholder="Your department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkIcon
                              sx={{ fontSize: "0.85rem", color: P.slate400 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ width: "300px" }}>
                    <Lbl>Location</Lbl>
                    <Field
                      fullWidth
                      size="small"
                      name="location"
                      placeholder="City or region"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon
                              sx={{ fontSize: "0.85rem", color: P.slate400 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ width: "600px" }}>
                    <Lbl>About Me</Lbl>
                    {isEditing ? (
                      <Field
                        fullWidth
                        multiline
                        name="bio"
                        placeholder="A short description about yourself…"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                      />
                    ) : (
                      <Box
                        sx={{
                          minHeight: 60,
                          px: 1,
                          py: 1.25,
                          borderRadius: 2,
                          border: `1px solid ${P.slate200}`,
                          background: P.slate50,
                        }}
                      >
                        {formData.bio ? (
                          <Typography
                            sx={{
                              fontSize: "0.8125rem",
                              color: P.slate600,
                              lineHeight: 1.65,
                            }}
                          >
                            {formData.bio}
                          </Typography>
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.8125rem",
                              color: P.slate400,
                              fontStyle: "italic",
                            }}
                          >
                            No bio added yet. Click edit to add one.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>
                </Grid>

                {/* Save / cancel row */}
                <Fade in={isEditing} unmountOnExit>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 1.5,
                      mt: 3,
                      pt: 2.5,
                      borderTop: `1px solid ${P.slate200}`,
                    }}
                  >
                    <GhostBtn onClick={cancelEdit}>Discard</GhostBtn>
                    <TealBtn
                      startIcon={<SaveIcon sx={{ fontSize: "0.85rem" }} />}
                      onClick={handleUpdateProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </TealBtn>
                  </Box>
                </Fade>
              </CardBody>
            </Card>
          </Grid>
        </Grid>

        {/* Row 2: Personal Information and Security Cards - Side by Side */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Security / Change Password Card */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{ animationDelay: "200ms", height: "100%", width: "300px" }}
            >
              <CardHead>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <SectionIcon>
                    <KeyIcon />
                  </SectionIcon>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.8375rem",
                      color: P.slate900,
                    }}
                  >
                    Security
                  </Typography>
                </Box>
              </CardHead>
              <CardBody>
                <Typography
                  sx={{ fontSize: "0.75rem", color: P.slate400, mb: 2.5 }}
                >
                  Update your password to keep your account secure.
                </Typography>
                <Stack spacing={1.75}>
                  {[
                    {
                      name: "currentPassword",
                      label: "Current password",
                      key: "current",
                      placeholder: "Enter current password",
                    },
                    {
                      name: "newPassword",
                      label: "New password",
                      key: "new",
                      placeholder: "Min. 6 characters",
                    },
                    {
                      name: "confirmPassword",
                      label: "Confirm password",
                      key: "confirm",
                      placeholder: "Re-enter new password",
                    },
                  ].map((f) => (
                    <Box key={f.name}>
                      <Lbl>{f.label}</Lbl>
                      <Field
                        fullWidth
                        size="small"
                        name={f.name}
                        type={showPass[f.key] ? "text" : "password"}
                        placeholder={f.placeholder}
                        value={passData[f.name]}
                        onChange={handlePassChange}
                        error={!!passErrors[f.name]}
                        helperText={passErrors[f.name]}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowPass((p) => ({
                                    ...p,
                                    [f.key]: !p[f.key],
                                  }))
                                }
                                edge="end"
                                size="small"
                              >
                                {showPass[f.key] ? (
                                  <VisibilityOffIcon
                                    sx={{
                                      fontSize: "0.9rem",
                                      color: P.slate400,
                                    }}
                                  />
                                ) : (
                                  <VisibilityIcon
                                    sx={{
                                      fontSize: "0.9rem",
                                      color: P.slate400,
                                    }}
                                  />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  ))}
                  <TealBtn
                    fullWidth
                    startIcon={<LockIcon sx={{ fontSize: "0.9rem" }} />}
                    onClick={handleChangePassword}
                    disabled={
                      changingPass ||
                      !passData.currentPassword ||
                      !passData.newPassword ||
                      !passData.confirmPassword
                    }
                    sx={{ mt: 0.5 }}
                  >
                    {changingPass ? "Updating…" : "Update Password"}
                  </TealBtn>
                </Stack>
              </CardBody>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box
          sx={{
            textAlign: "center",
            mt: 6,
            pt: 3,
            borderTop: `1px solid ${P.slate200}`,
          }}
        >
          <Typography sx={{ fontSize: "0.65rem", color: P.slate400 }}>
            © 2026 Asset Management System · Profile v2.0{" "}
          </Typography>
        </Box>
      </Container>

      {/* Toast */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{
            borderRadius: 10,
            fontSize: "0.75rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Page>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────
const TeamProfile = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Please login to view profile</Typography>
      </Box>
    );
  if (user?.role !== "team")
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Access denied. Team members only.</Typography>
      </Box>
    );
  return <ProfileContent />;
};

export default TeamProfile;

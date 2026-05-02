// components/Sidebar.jsx - Fully Responsive with Role-Based Navigation & Modern Icons
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  CircularProgress,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// ─────────────────────────────────────────────
// MODERN ICONS (Material UI v6+ compatible)
// ─────────────────────────────────────────────
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import { useAuth } from "../context/AuthContexts";

// ─────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────

const MobileHeader = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: { xs: 56, sm: 64 },
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: { xs: "0 12px", sm: "0 20px" },
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
  zIndex: 1100,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backdropFilter: "blur(0px)",
}));

const MobileNavItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  borderRadius: 12,
  marginBottom: 6,
  padding: "10px 16px",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.08)
    : "transparent",
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  "&:active": {
    transform: "scale(0.98)",
  },
  "& .MuiListItemIcon-root": {
    color: "inherit",
    minWidth: 40,
  },
}));

const BottomNavBar = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: { xs: 60, sm: 68 },
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(10px)",
  boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  zIndex: 1100,
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// ─────────────────────────────────────────────
// Navigation Configuration with Modern Icons
// ─────────────────────────────────────────────

const navItemsConfig = {
  admin: [
    {
      id: "dashboard",
      icon: SpaceDashboardOutlinedIcon,
      label: "Dashboard",
      path: "/admin",
      roles: ["super_admin", "admin"],
    },
    {
      id: "clients",
      icon: GroupOutlinedIcon,
      label: "Clients Management",
      path: "/admin/clients",
      roles: ["super_admin"],
    },
        {
      id: "team",
      icon: PeopleAltOutlinedIcon,
      label: "Team Management",
      path: "/admin/team",
      roles: ["admin"],
    },
    {
      id: "checklists",
      icon: ChecklistOutlinedIcon,
      label: "Checklists Builder",
      path: "/admin/checklists",
      roles: ["super_admin", "admin"],
    },
    {
      id: "request-checklist",
      icon: RequestQuoteOutlinedIcon,
      label: "Request Checklist",
      path: "/admin/request-checklist",
      roles: ["super_admin", "admin"],
    },
    {
      id: "assigned",
      icon: AssignmentOutlinedIcon,
      label: "Assigned Checklist",
      path: "/admin/assigned-checklists",
      roles: ["super_admin", "admin"],
    },
    {
      id: "assets",
      icon: Inventory2OutlinedIcon,
      label: "Assets Management",
      path: "/admin/assets",
      roles: ["admin", "team"],
    },
    {
      id: "reports",
      icon: BarChartOutlinedIcon,
      label: "Reports and Analysis",
      path: "/admin/reports",
      roles: ["super_admin", "admin"],
    },
    {
      id: "settings",
      icon: SettingsOutlinedIcon,
      label: "Settings",
      path: "/admin/settings",
      roles: ["super_admin", "admin"],
    },
  ],
  team: [
    {
      id: "tasks",
      icon: TaskAltOutlinedIcon,
      label: "My Tasks",
      path: "/team",
      roles: ["team"],
    },
    {
      id: "assets",
      icon: Inventory2OutlinedIcon,
      label: "Assets Management",
      path: "/team/assets",
      roles: ["team"],
    },
    {
      id: "history",
      icon: HistoryOutlinedIcon,
      label: "History",
      path: "/team/history",
      roles: ["team"],
    },
    {
      id: "profile",
      icon: PersonOutlineOutlinedIcon,
      label: "Profile",
      path: "/team/profile",
      roles: ["team"],
    },
  ],
};

// Helper function to filter nav items based on user role
export const getNavItems = (userRole) => {
  if (userRole === "super_admin") {
    // UPDATED: super_admin gets only items with super_admin role
    // Assets Management is explicitly excluded because it only has ["admin", "team"]
    return navItemsConfig.admin.filter((item) =>
      item.roles.includes("super_admin"),
    );
  }
  if (userRole === "admin") {
    return navItemsConfig.admin.filter((item) => item.roles.includes("admin"));
  }
  if (userRole === "team") {
    return navItemsConfig.team;
  }
  return [];
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getUserDisplayName = (user) => {
  if (!user) return "User";
  return user.name || user.email?.split("@")[0] || "User";
};

const getUserInitials = (user) => {
  if (!user) return "U";
  const name = user.name || user.email || "User";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function Sidebar({ mobileOpen, onDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const navItems = getNavItems(user?.role);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (typeof mobileOpen === "boolean" && mobileOpen !== mobileMenuOpen) {
      setMobileMenuOpen(mobileOpen);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = navItems.findIndex((item) => currentPath === item.path);
    if (activeIndex !== -1) {
      setActiveItem(navItems[activeIndex].id);
      setBottomNavValue(activeIndex);
    } else {
      setActiveItem("");
    }
  }, [location.pathname, navItems]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = useCallback(
    (path, id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setActiveItem(id);
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (onDrawerToggle && mobileOpen) onDrawerToggle();
      navigate(path);
    },
    [navigate, onDrawerToggle, mobileOpen, mobileMenuOpen],
  );

  const handleBottomNavChange = (_event, newValue) => {
    const item = navItems[newValue];
    if (item) {
      setActiveItem(item.id);
      setBottomNavValue(newValue);
      navigate(item.path);
    }
  };

  const handleCollapseToggle = () => setIsCollapsed((prev) => !prev);
  const handleOpenMobileMenu = () => setMobileMenuOpen(true);
  const handleCloseMobileMenu = () => setMobileMenuOpen(false);

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!user || navItems.length === 0) return null;

  // ─────────────────────────────────────────────
  // Desktop Sidebar
  // ─────────────────────────────────────────────
  const desktopSidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        position: "relative",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: isCollapsed ? 2 : 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          justifyContent: isCollapsed ? "center" : "flex-start",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
        >
          <Inventory2OutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        {!isCollapsed && (
          <Box>
            <Typography fontWeight={700} fontSize={16}>
              AssetInspect
            </Typography>
            <Typography
              fontSize={11}
              color="text.secondary"
              textTransform="capitalize"
            >
              {user?.role === "super_admin" ? "Super Admin" : user?.role}
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleCollapseToggle}
            size="small"
            sx={{
              position: "absolute",
              right: -12,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "#fff",
              boxShadow: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              width: 24,
              height: 24,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            {isCollapsed ? (
              <ChevronRightOutlinedIcon fontSize="small" />
            ) : (
              <ChevronLeftOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {/* Nav Links */}
      <List sx={{ flex: 1, px: isCollapsed ? 1 : 2, py: 2, overflowY: "auto" }}>
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeItem === id || location.pathname === path;
          return (
            <Tooltip
              key={id}
              title={isCollapsed ? label : ""}
              placement="right"
              arrow
            >
              <ListItem
                onClick={(e) => handleNavigation(path, id, e)}
                sx={{
                  borderRadius: 2,
                  mb: 0.75,
                  py: 1.2,
                  px: 1.5,
                  cursor: "pointer",
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    minWidth: isCollapsed ? "auto" : 40,
                  },
                }}
              >
                <ListItemIcon>
                  <Icon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* User Profile (Desktop) */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
              fontSize: 14,
            }}
          >
            {getUserInitials(user)}
          </Avatar>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {getUserDisplayName(user)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Logout */}
      <Box
        sx={{
          p: isCollapsed ? 2 : 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Tooltip title={isCollapsed ? "Logout" : ""} placement="right" arrow>
          <Button
            onClick={handleLogout}
            startIcon={!isCollapsed ? <LogoutOutlinedIcon /> : null}
            fullWidth
            variant="text"
            sx={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              color: theme.palette.text.secondary,
              fontWeight: 500,
              textTransform: "none",
              py: 1,
              borderRadius: 2,
              "&:hover": {
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            {!isCollapsed ? "Logout" : <LogoutOutlinedIcon />}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  // ─────────────────────────────────────────────
  // Mobile Drawer
  // ─────────────────────────────────────────────
  const mobileMenuContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2OutlinedIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Typography fontWeight={600}>AssetInspect</Typography>
        </Box>
        <IconButton onClick={handleCloseMobileMenu}>
          <CloseOutlinedIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Avatar
            sx={{ width: 44, height: 44, bgcolor: theme.palette.primary.main }}
          >
            {getUserInitials(user)}
          </Avatar>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography fontWeight={600} noWrap>
              {getUserDisplayName(user)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 2, flex: 1, overflowY: "auto" }}>
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeItem === id || location.pathname === path;
          return (
            <MobileNavItem
              key={id}
              active={isActive}
              onClick={(e) => handleNavigation(path, id, e)}
            >
              <ListItemIcon>
                <Icon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </MobileNavItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: "auto" }}>
        <Button
          onClick={handleLogout}
          startIcon={<LogoutOutlinedIcon />}
          fullWidth
          variant="outlined"
          color="error"
          sx={{ py: 1.2, borderRadius: 2, textTransform: "none" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  // ─────────────────────────────────────────────
  // Mobile Layout
  // ─────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <MobileHeader>
          <IconButton onClick={handleOpenMobileMenu}>
            <MenuOutlinedIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Inventory2OutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography fontWeight={600} fontSize={14}>
              AssetInspect
            </Typography>
          </Box>
          <IconButton onClick={handleLogout} size="small">
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </MobileHeader>

        <Box sx={{ height: { xs: 56, sm: 64 } }} />

        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleCloseMobileMenu}
          keepMounted={false}
        >
          <Box sx={{ width: isSmallMobile ? "85vw" : 320 }}>
            {mobileMenuContent}
          </Box>
        </Drawer>

        {navItems.length > 0 && (
          <>
            <BottomNavBar elevation={0}>
              <BottomNavigation
                value={bottomNavValue}
                onChange={handleBottomNavChange}
                showLabels={!isSmallMobile}
                sx={{
                  height: { xs: 60, sm: 68 },
                  backgroundColor: "transparent",
                }}
              >
                {navItems.slice(0, 5).map((item, idx) => (
                  <BottomNavigationAction
                    key={item.id}
                    label={isSmallMobile ? "" : item.label}
                    icon={<item.icon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
                    sx={{
                      color:
                        bottomNavValue === idx
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                    }}
                  />
                ))}
              </BottomNavigation>
            </BottomNavBar>
            <Box sx={{ height: { xs: 60, sm: 68 } }} />
          </>
        )}
      </>
    );
  }

  // ─────────────────────────────────────────────
  // Desktop Return
  // ─────────────────────────────────────────────
  return (
    <Box
      component="aside"
      sx={{
        width: isCollapsed ? { md: 72, lg: 88 } : { md: 260, lg: 280 },
        backgroundColor: "#ffffff",
        display: { xs: "none", md: "block" },
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: "hidden",
        boxShadow: `2px 0 12px ${alpha(theme.palette.common.black, 0.02)}`,
      }}
    >
      {desktopSidebarContent}
    </Box>
  );
}
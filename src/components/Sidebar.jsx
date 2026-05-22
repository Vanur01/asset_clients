// components/Sidebar.jsx - Fully Responsive for All Devices (320px - 1200px+)
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
  Divider,
  SwipeableDrawer,
  Backdrop,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// MODERN ICONS (Material UI v6+ compatible)
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
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useAuth } from "../context/AuthContexts";

// Styled Components
const MobileHeader = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: { xs: 56, sm: 60, md: 64 },
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: { xs: "0 12px", sm: "0 16px", md: "0 20px" },
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
  padding: { xs: "10px 12px", sm: "10px 16px", md: "12px 16px" },
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
    minWidth: { xs: 36, sm: 40 },
  },
}));

const BottomNavBar = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: { xs: 56, sm: 60, md: 64 },
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  backdropFilter: "blur(10px)",
  boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  zIndex: 1100,
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const DesktopSidebar = styled(Box)(({ theme, iscollapsed }) => ({
  width:
    iscollapsed === "true"
      ? { md: 72, lg: 80, xl: 88 }
      : { md: 240, lg: 260, xl: 280 },
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
}));

// Navigation Configuration with Modern Icons
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
      roles: ["super_admin", "admin", "team"],
    },
    {
      id: "contact-inquiries",
      icon: EmailOutlinedIcon,
      label: "Contact Inquiries",
      path: "/admin/contact-inquiries",
      roles: ["super_admin"],
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
      path: "/admin/assets",
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

// Helpers
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

// Main Component
export default function Sidebar({ mobileOpen, onDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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

  // Desktop Sidebar
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
      {/* Logo Section */}
      <Box
        sx={{
          p: isCollapsed ? { md: 1.5, lg: 2 } : { md: 2, lg: 2.5 },
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
            width: { md: 36, lg: 40, xl: 44 },
            height: { md: 36, lg: 40, xl: 44 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: { md: "10px", lg: "12px", xl: "14px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            flexShrink: 0,
          }}
        >
          <Inventory2OutlinedIcon
            sx={{ color: "#fff", fontSize: { md: 18, lg: 20, xl: 22 } }}
          />
        </Box>
        {!isCollapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} fontSize={{ md: 14, lg: 16 }} noWrap>
              AssetInspect
            </Typography>
            <Typography
              fontSize={{ md: 10, lg: 11 }}
              color="text.secondary"
              textTransform="capitalize"
              noWrap
            >
              {user?.role === "super_admin" ? "Super Admin" : user?.role}
            </Typography>
          </Box>
        )}
        {isDesktop && (
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
              width: { md: 22, lg: 24 },
              height: { md: 22, lg: 24 },
              "&:hover": { bgcolor: "#f5f5f5" },
              display: { xs: "none", md: "flex" },
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

      {/* Navigation Links */}
      <List
        sx={{
          flex: 1,
          px: isCollapsed ? 1 : { md: 1.5, lg: 2 },
          py: 2,
          overflowY: "auto",
        }}
      >
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeItem === id || location.pathname === path;
          return (
            <Tooltip
              key={id}
              title={isCollapsed ? label : ""}
              placement="right"
              arrow
              enterDelay={500}
            >
              <ListItem
                onClick={(e) => handleNavigation(path, id, e)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: { md: 1, lg: 1.2 },
                  px: { md: 1.2, lg: 1.5 },
                  cursor: "pointer",
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    minWidth: isCollapsed ? "auto" : { md: 36, lg: 40 },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon sx={{ fontSize: { md: 20, lg: 22, xl: 24 } }} />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: { md: 13, lg: 14, xl: 15 },
                      fontWeight: isActive ? 600 : 500,
                      noWrap: true,
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* User Profile Section (Desktop Expanded) */}
      {!isCollapsed && (
        <Fade in={!isCollapsed}>
          <Box
            sx={{
              p: { md: 1.5, lg: 2 },
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: { md: 32, lg: 36, xl: 40 },
                height: { md: 32, lg: 36, xl: 40 },
                bgcolor: theme.palette.primary.main,
                fontSize: { md: 12, lg: 14 },
                flexShrink: 0,
              }}
            >
              {getUserInitials(user)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                fontSize={{ md: 12, lg: 13 }}
              >
                {getUserDisplayName(user)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                fontSize={{ md: 10, lg: 11 }}
              >
                {user?.email || ""}
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Logout Button */}
      <Box
        sx={{
          p: isCollapsed ? { md: 1.5, lg: 2 } : { md: 1.5, lg: 2 },
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
              py: { md: 0.75, lg: 1 },
              px: { md: 1, lg: 1.5 },
              borderRadius: 2,
              minWidth: 0,
              "&:hover": {
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            {!isCollapsed ? (
              "Logout"
            ) : (
              <LogoutOutlinedIcon sx={{ fontSize: { md: 18, lg: 20 } }} />
            )}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  // Mobile Drawer Content
  const mobileMenuContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        width: isMobile ? "85vw" : 320,
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2OutlinedIcon
              sx={{ color: "#fff", fontSize: { xs: 18, sm: 20 } }}
            />
          </Box>
          <Typography fontWeight={600} fontSize={{ xs: 14, sm: 16 }}>
            AssetInspect
          </Typography>
        </Box>
        <IconButton onClick={handleCloseMobileMenu} size="small">
          <CloseOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Avatar
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              bgcolor: theme.palette.primary.main,
              fontSize: { xs: 14, sm: 16 },
            }}
          >
            {getUserInitials(user)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <Typography fontWeight={600} noWrap fontSize={{ xs: 14, sm: 15 }}>
              {getUserDisplayName(user)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              fontSize={{ xs: 11, sm: 12 }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation Items */}
      <List sx={{ px: { xs: 1.5, sm: 2 }, flex: 1, overflowY: "auto" }}>
        {navItems.map(({ id, icon: Icon, label, path }) => {
          const isActive = activeItem === id || location.pathname === path;
          return (
            <MobileNavItem
              key={id}
              active={isActive}
              onClick={(e) => handleNavigation(path, id, e)}
            >
              <ListItemIcon>
                <Icon sx={{ fontSize: { xs: 22, sm: 24 } }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </MobileNavItem>
          );
        })}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, mt: "auto" }}>
        <Button
          onClick={handleLogout}
          startIcon={<LogoutOutlinedIcon />}
          fullWidth
          variant="outlined"
          color="error"
          sx={{
            py: { xs: 1, sm: 1.2 },
            borderRadius: 2,
            textTransform: "none",
            fontSize: { xs: 13, sm: 14 },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  // Mobile / Tablet Layout
  if (isMobile || isTablet) {
    return (
      <>
        {/* Mobile Header */}
        <MobileHeader>
          <IconButton onClick={handleOpenMobileMenu} size="small">
            <MenuOutlinedIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Inventory2OutlinedIcon
                sx={{ color: "#fff", fontSize: { xs: 16, sm: 18 } }}
              />
            </Box>
            <Typography fontWeight={600} fontSize={{ xs: 13, sm: 14 }}>
              AssetInspect
            </Typography>
          </Box>

          <IconButton onClick={handleLogout} size="small">
            <LogoutOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </MobileHeader>

        {/* Spacer for fixed header */}
        <Box sx={{ height: { xs: 56, sm: 60, md: 64 } }} />

        {/* Mobile Drawer */}
        <SwipeableDrawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleCloseMobileMenu}
          onOpen={handleOpenMobileMenu}
          disableBackdropTransition={false}
          swipeAreaWidth={isMobile ? 20 : 30}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: isMobile ? "85vw" : 320,
              boxSizing: "border-box",
              borderRight: "none",
            },
          }}
        >
          {mobileMenuContent}
        </SwipeableDrawer>

        {/* Bottom Navigation Bar */}
        {navItems.length > 0 && (
          <>
            <BottomNavBar elevation={0}>
              <BottomNavigation
                value={bottomNavValue}
                onChange={handleBottomNavChange}
                showLabels={!isMobile}
                sx={{
                  height: { xs: 56, sm: 60 },
                  backgroundColor: "transparent",
                }}
              >
                {navItems.slice(0, isMobile ? 4 : 5).map((item, idx) => (
                  <BottomNavigationAction
                    key={item.id}
                    label={isMobile ? "" : item.label}
                    icon={
                      <item.icon
                        sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }}
                      />
                    }
                    sx={{
                      color:
                        bottomNavValue === idx
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                      "&.Mui-selected": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                ))}
              </BottomNavigation>
            </BottomNavBar>
            {/* Spacer for bottom navigation */}
            <Box sx={{ height: { xs: 56, sm: 60 } }} />
          </>
        )}

        {/* Backdrop for drawer on mobile */}
        <Backdrop
          open={mobileMenuOpen}
          onClick={handleCloseMobileMenu}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        />
      </>
    );
  }

  // Desktop Return
  return (
    <DesktopSidebar iscollapsed={isCollapsed.toString()}>
      {desktopSidebarContent}
    </DesktopSidebar>
  );
}

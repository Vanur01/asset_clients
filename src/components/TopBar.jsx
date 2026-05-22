// components/TopHeader.jsx - Fully Responsive for All Devices (320px - 1200px+)
import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
  InputBase,
  alpha,
  Tooltip,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useAuth } from "../context/AuthContexts";

export default function TopHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New checklist assigned", time: "2 hours ago", read: false },
    { id: 2, title: "Asset inspection due", time: "5 hours ago", read: false },
    { id: 3, title: "Report ready for download", time: "1 day ago", read: true },
    { id: 4, title: "Team member joined", time: "2 days ago", read: true },
  ]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.name || user.email?.split("@")[0] || "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = () => {
    const role = user?.role || "member";
    return role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Team Member";
  };

  const getRoleColor = () => {
    const role = user?.role;
    if (role === "super_admin") return "#ea4335";
    if (role === "admin") return "#fbbc04";
    return "#34a853";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleSearchDrawerOpen = () => setSearchDrawerOpen(true);
  const handleSearchDrawerClose = () => setSearchDrawerOpen(false);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    handleNotificationClose();
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Search results (mock)
  const searchResults = [
    { type: "Asset", name: "Server Rack A-12", path: "/admin/assets" },
    { type: "Checklist", name: "Daily Inspection", path: "/admin/checklists" },
    { type: "Team Member", name: "John Doe", path: "/admin/team" },
  ];

  const filteredResults = searchValue.length > 0 
    ? searchResults.filter(r => r.name.toLowerCase().includes(searchValue.toLowerCase()))
    : [];

  return (
    <>
      <Box
        component="header"
        sx={{
          height: { xs: 56, sm: 60, md: 64, lg: 70 },
          bgcolor: scrolled ? "rgba(255, 255, 255, 0.98)" : "#ffffff",
          borderBottom: "1px solid",
          borderColor: alpha(theme.palette.divider, scrolled ? 0.15 : 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 4 },
          position: "sticky",
          top: 0,
          zIndex: 1100,
          width: "100%",
          boxSizing: "border-box",
          gap: { xs: 1, sm: 1.5, md: 2 },
          backdropFilter: scrolled ? "blur(8px)" : "none",
          transition: "all 0.2s ease",
        }}
      >
        {/* Left Section - Menu & Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5, md: 2 } }}>
          {(isMobile || isTablet) && (
            <Tooltip title="Menu" arrow placement="right">
              <IconButton
                onClick={onMenuToggle}
                sx={{
                  color: "#5f6368",
                  p: { xs: 0.75, sm: 1 },
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  transition: "all 0.2s ease",
                }}
                size="small"
              >
                <MenuIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Right Section - Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
          }}
        >
          {/* User Avatar & Info */}
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.75, sm: 1, md: 1.5 },
              cursor: "pointer",
              p: { xs: 0.5, sm: 0.75 },
              borderRadius: "40px",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
              transition: "all 0.2s ease",
            }}
          >
            <Avatar
              alt={getUserDisplayName()}
              sx={{
                width: { xs: 32, sm: 36, md: 40, lg: 44 },
                height: { xs: 32, sm: 36, md: 40, lg: 44 },
                bgcolor: theme.palette.primary.main,
                fontSize: { xs: 13, sm: 14, md: 16, lg: 18 },
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {getUserInitials()}
            </Avatar>

            {!isMobile && !isTablet && (
              <>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography
                    sx={{
                      fontSize: { md: 13, lg: 14, xl: 15 },
                      fontWeight: 600,
                      color: "#202124",
                      lineHeight: 1.3,
                    }}
                  >
                    {getUserDisplayName()}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: getRoleColor(),
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { md: 10, lg: 11, xl: 12 },
                        color: "#5f6368",
                        lineHeight: 1.2,
                      }}
                    >
                      {getUserRole()}
                    </Typography>
                  </Box>
                </Box>
                <KeyboardArrowDownIcon
                  sx={{ color: "#5f6368", fontSize: { md: 16, lg: 18, xl: 20 } }}
                />
              </>
            )}
          </Box>
        </Box>

        {/* ── User Menu (Desktop) ── */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor) && !isMobile}
          onClose={handleUserMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 3,
            sx: {
              width: { sm: 260, md: 280, lg: 300 },
              mt: 1,
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid #e8eaed",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#202124">
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="#5f6368" display="block">
                {user?.email || "user@example.com"}
              </Typography>
              <Chip
                label={getUserRole()}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: 10,
                  bgcolor: alpha(getRoleColor(), 0.1),
                  color: getRoleColor(),
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          <MenuItem onClick={handleLogout} sx={{ py: 1.2, px: 2 }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#d93025" }} />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: "#d93025" }} />
          </MenuItem>
        </Menu>
      </Box>

      {/* ── Search Drawer (Mobile/Tablet) ── */}
      <SwipeableDrawer
        anchor="top"
        open={searchDrawerOpen}
        onClose={handleSearchDrawerClose}
        onOpen={handleSearchDrawerOpen}
        disableBackdropTransition={false}
        PaperProps={{
          sx: {
            borderBottomLeftRadius: { xs: 20, sm: 24 },
            borderBottomRightRadius: { xs: 20, sm: 24 },
            bgcolor: "#ffffff",
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight={600} fontSize={{ xs: 18, sm: 20 }}>
              Search
            </Typography>
            <IconButton onClick={handleSearchDrawerClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#f1f3f4",
              borderRadius: "28px",
              px: 2,
              height: 48,
              mb: 2,
            }}
          >
            <SearchIcon sx={{ color: "#5f6368", fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Search assets, checklists, team members..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              fullWidth
              autoFocus
              sx={{ fontSize: { xs: 14, sm: 15 } }}
            />
          </Box>

          {searchValue.length > 0 && (
            <Box>
              <Typography variant="caption" color="#5f6368" sx={{ mb: 1, display: "block" }}>
                Search results ({filteredResults.length})
              </Typography>
              <List sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}>
                {filteredResults.map((result, idx) => (
                  <ListItem
                    key={idx}
                    button
                    onClick={handleSearchDrawerClose}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <Chip label={result.type} size="small" sx={{ fontSize: 10, height: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.name}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {searchValue.length > 0 && filteredResults.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="#5f6368">
                No results found for "{searchValue}"
              </Typography>
            </Box>
          )}
        </Box>
      </SwipeableDrawer>

      {/* ── Mobile Notifications Drawer ── */}
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(notificationAnchor) && isMobile}
        onClose={handleNotificationClose}
        onOpen={handleNotificationOpen}
        disableBackdropTransition={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: { xs: 20, sm: 24 },
            borderTopRightRadius: { xs: 20, sm: 24 },
            bgcolor: "#ffffff",
            maxHeight: "80vh",
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={600} fontSize={{ xs: 18, sm: 20 }}>
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  sx={{ ml: 1, bgcolor: "#ea4335", color: "#fff" }}
                />
              )}
            </Typography>
            <IconButton onClick={handleNotificationClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {unreadCount > 0 && (
            <Typography
              variant="caption"
              onClick={handleMarkAllRead}
              sx={{ color: theme.palette.primary.main, cursor: "pointer", display: "block", mb: 2 }}
            >
              Mark all read
            </Typography>
          )}

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <NotificationsActiveIcon sx={{ fontSize: 48, color: "#dadce0", mb: 1 }} />
              <Typography variant="body2" color="#5f6368">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((item) => (
              <Box
                key={item.id}
                onClick={() => handleNotificationClick(item.id)}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: item.read ? "transparent" : alpha(theme.palette.primary.main, 0.05),
                  cursor: "pointer",
                  "&:active": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={item.read ? 400 : 600}
                  color="#202124"
                  sx={{ mb: 0.5 }}
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" color="#5f6368">
                  {item.time}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </SwipeableDrawer>

      {/* ── Mobile User Menu Drawer ── */}
      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(userMenuAnchor) && isMobile}
        onClose={handleUserMenuClose}
        onOpen={handleUserMenuOpen}
        disableBackdropTransition={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: { xs: 20, sm: 24 },
            borderTopRightRadius: { xs: 20, sm: 24 },
            bgcolor: "#ffffff",
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: theme.palette.primary.main,
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color="#202124">
                  {getUserDisplayName()}
                </Typography>
                <Typography variant="caption" color="#5f6368" display="block">
                  {user?.email || "user@example.com"}
                </Typography>
                <Chip
                  label={getUserRole()}
                  size="small"
                  sx={{ mt: 0.5, height: 20, fontSize: 10, bgcolor: alpha(getRoleColor(), 0.1), color: getRoleColor() }}
                />
              </Box>
            </Box>
            <IconButton onClick={handleUserMenuClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.2, borderRadius: 2 }}>
            <ListItemIcon>
              <PersonOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile Settings" />
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.2, borderRadius: 2 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.2, borderRadius: 2 }}>
            <ListItemIcon>
              <HelpOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </MenuItem>

          <Divider sx={{ my: 1.5 }} />

          <MenuItem onClick={handleLogout} sx={{ py: 1.2, borderRadius: 2, color: "#d93025" }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#d93025" }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Box>
      </SwipeableDrawer>
    </>
  );
}
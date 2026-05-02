// pages/Dashboard.jsx - Fully Responsive with Enhanced Adaptability
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Skeleton,
  alpha,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  Bolt as BoltIcon,
  Group as GroupIcon,
  Payments as PaymentsIcon,
  EventBusy as EventBusyIcon,
  AddCircle as AddCircleIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CurrencyRupee as RupeeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContexts";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TaskIcon from "@mui/icons-material/Task";

// ─────────────────────────────────────────────
// Custom color palette
// ─────────────────────────────────────────────
const colors = {
  primary: "#002631",
  primaryContainer: "#003d4d",
  onPrimaryContainer: "#79a8ba",
  secondary: "#516072",
  secondaryContainer: "#d2e1f7",
  onSecondaryContainer: "#556477",
  tertiary: "#331d00",
  tertiaryContainer: "#503000",
  onTertiaryContainer: "#df8f00",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#2e7d32",
  warning: "#ed6c02",
  surface: "#f7f9fb",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainerLowest: "#ffffff",
  surfaceVariant: "#e0e3e5",
  outline: "#71787c",
  outlineVariant: "#c0c8cc",
};

// ─────────────────────────────────────────────
// Enhanced Stat Card Component with better responsiveness
// ─────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendUp = true,
  bgColor,
  iconBg,
  trendColor,
  loading,
  error,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  if (error) {
    return (
      <Fade in>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 1.5 : 2.5,
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            bgcolor: colors.errorContainer,
            border: `1px solid ${alpha(colors.onErrorContainer, 0.2)}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "100%",
            minHeight: { xs: 100, sm: 120 },
          }}
        >
          <ErrorIcon sx={{ color: colors.onErrorContainer, fontSize: { xs: 18, sm: 20 } }} />
          <Typography variant="caption" sx={{ color: colors.onErrorContainer, fontSize: { xs: "0.65rem", sm: "0.7rem" } }}>
            Failed to load {title}
          </Typography>
        </Paper>
      </Fade>
    );
  }

  return (
    <Zoom in style={{ transitionDelay: "100ms" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          bgcolor: bgColor || "background.paper",
          border: "1px solid",
          borderColor: bgColor ? "transparent" : alpha(colors.outlineVariant, 0.5),
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": bgColor
            ? { transform: "translateY(-4px)", boxShadow: 6 }
            : {
                borderColor: colors.outlineVariant,
                transform: "translateY(-4px)",
                boxShadow: `0 8px 24px ${alpha(colors.primary, 0.12)}`,
              },
          position: "relative",
          overflow: "hidden",
          cursor: "default",
          height: "100%",
          minHeight: { xs: 110, sm: 130, md: 140 },
        }}
      >
        {/* Decorative circle for colored cards */}
        {bgColor && (
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              width: { xs: 70, sm: 90, md: 110 },
              height: { xs: 70, sm: 90, md: 110 },
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
        )}

        <Box sx={{ position: "relative", zIndex: 1, height: "100%", width: "215px", display: "flex", flexDirection: "column" }}>
          {/* Icon + Trend Badge Row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: { xs: 1, sm: 1.5, md: 2 },
            }}
          >
            <Box
              sx={{
                p: { xs: 0.7, sm: 1, md: 1.2 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor:
                  iconBg ||
                  (bgColor
                    ? "rgba(255,255,255,0.15)"
                    : colors.secondaryContainer),
                color: bgColor ? "white" : colors.onSecondaryContainer,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: { xs: 14, sm: 16, md: 18, lg: 20 } }} />
            </Box>

            {trend && (
              <Fade in>
                <Box
                  sx={{
                    px: { xs: 0.6, sm: 0.8, md: 1 },
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: bgColor
                      ? "rgba(255,255,255,0.15)"
                      : colors.surfaceContainerLow,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                  }}
                >
                  {trendUp ? (
                    <TrendingUpIcon
                      sx={{
                        fontSize: { xs: 9, sm: 10, md: 11 },
                        color: bgColor ? "white" : colors.success,
                      }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{
                        fontSize: { xs: 9, sm: 10, md: 11 },
                        color: bgColor ? "white" : colors.onErrorContainer,
                      }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: bgColor
                        ? "white"
                        : trendUp
                        ? colors.success
                        : colors.onErrorContainer,
                      fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.65rem" },
                    }}
                  >
                    {trend}
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>

          {/* Label */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: bgColor ? alpha("#fff", 0.8) : colors.secondary,
              textTransform: "uppercase",
              fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.65rem", lg: "0.68rem" },
              mb: 0.5,
              display: "block",
            }}
          >
            {title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: bgColor ? "white" : colors.primary,
              fontSize: {
                xs: "1rem",
                sm: "1.1rem",
                md: "1.25rem",
                lg: "1.5rem",
              },
              lineHeight: 1.2,
              wordBreak: "break-word",
              mt: "auto",
            }}
          >
            {value ?? 0}
          </Typography>
        </Box>
      </Paper>
    </Zoom>
  );
};

// ─────────────────────────────────────────────
// Enhanced Loading Skeleton Component
// ─────────────────────────────────────────────
const DashboardSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 2.5, md: 3 },
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Skeleton variant="text" width={isMobile ? 100 : 150} height={isMobile ? 32 : 40} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="circular" width={isMobile ? 32 : 36} height={isMobile ? 32 : 36} />
          <Skeleton variant="circular" width={isMobile ? 32 : 36} height={isMobile ? 32 : 36} />
        </Box>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <Skeleton
              variant="rounded"
              height={isMobile ? 110 : isTablet ? 125 : 140}
              sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 } }}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
        <Grid item xs={12} lg={6}>
          <Skeleton variant="rounded" height={isMobile ? 220 : isTablet ? 250 : 280} sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 } }} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Skeleton variant="rounded" height={isMobile ? 220 : isTablet ? 250 : 280} sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 } }} />
        </Grid>
      </Grid>

      <Skeleton variant="rounded" height={isMobile ? 180 : isTablet ? 200 : 220} sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 } }} />
    </Box>
  );
};

// ─────────────────────────────────────────────
// Enhanced Empty State Component
// ─────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <Fade in>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 3, sm: 4, md: 5, lg: 6 },
        px: 2,
        textAlign: "center",
      }}
    >
      {Icon && (
        <Icon
          sx={{
            fontSize: { xs: 40, sm: 48, md: 56, lg: 64 },
            color: alpha(colors.outline, 0.4),
            mb: { xs: 1.5, sm: 2 },
          }}
        />
      )}
      <Typography
        variant="h6"
        sx={{
          color: colors.primary,
          fontWeight: 600,
          mb: 0.5,
          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: colors.secondary,
          mb: action ? 2.5 : 0,
          maxWidth: { xs: 280, sm: 320, md: 360 },
          fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>
      {action && action}
    </Box>
  </Fade>
);

// ─────────────────────────────────────────────
// Enhanced Error Display Component
// ─────────────────────────────────────────────
const ErrorDisplay = ({ message, onRetry }) => (
  <Fade in>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: { xs: "40vh", sm: "50vh", md: "60vh" },
        px: 2,
      }}
    >
      <ErrorIcon
        sx={{
          fontSize: { xs: 40, sm: 48, md: 56, lg: 64 },
          color: colors.onErrorContainer,
          mb: { xs: 1.5, sm: 2 },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: colors.onErrorContainer,
          mb: 1,
          textAlign: "center",
          fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
        }}
      >
        Something went wrong
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: colors.secondary,
          mb: 2.5,
          textAlign: "center",
          maxWidth: { xs: 300, sm: 340, md: 380 },
          fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
        }}
      >
        {message || "Failed to load dashboard data. Please try again."}
      </Typography>
      <Button
        variant="contained"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        size="medium"
        sx={{
          bgcolor: colors.onErrorContainer,
          "&:hover": { bgcolor: alpha(colors.onErrorContainer, 0.85) },
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          px: { xs: 2, sm: 3 },
          py: { xs: 0.75, sm: 1 },
        }}
      >
        Retry
      </Button>
    </Box>
  </Fade>
);

// ─────────────────────────────────────────────
// Export Helper — CSV
// ─────────────────────────────────────────────
const exportToCSV = (data, filename) => {
  try {
    if (!data) return;

    const flattenData = (obj, prefix = "") => {
      const result = {};
      for (const key in obj) {
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(result, flattenData(obj[key], `${prefix}${key}_`));
        } else if (Array.isArray(obj[key])) {
          result[`${prefix}${key}`] = JSON.stringify(obj[key]);
        } else {
          result[`${prefix}${key}`] = obj[key];
        }
      }
      return result;
    };

    const flatData = flattenData(data);
    const headers = Object.keys(flatData);
    const csvRows = [headers.join(",")];
    const values = headers.map((header) => {
      const value = flatData[header];
      const escaped =
        typeof value === "string"
          ? `"${value.replace(/"/g, '""')}"`
          : value ?? "";
      return escaped;
    });
    csvRows.push(values.join(","));

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("CSV export error:", error);
    throw new Error("Failed to export CSV");
  }
};

// ─────────────────────────────────────────────
// Export Helper — PDF
// ─────────────────────────────────────────────
const exportToPDF = async (data, filename) => {
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.fontFamily = "Arial, sans-serif";
    element.innerHTML = `
      <h1 style="color:#002631;text-align:center;">Dashboard Report</h1>
      <p style="text-align:center;color:#666;">Generated on ${new Date().toLocaleString()}</p>
      <pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow-x:auto;font-size:12px;">${JSON.stringify(
        data,
        null,
        2
      )}</pre>
    `;
    document.body.appendChild(element);
    await html2pdf()
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(element)
      .save();
    document.body.removeChild(element);
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to export PDF");
  }
};

// ─────────────────────────────────────────────
// Enhanced Revenue Bar Chart with responsive sizing
// ─────────────────────────────────────────────
const RevenueBarChart = ({ data, loading, formatCurrency }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  if (loading) {
    return (
      <Box
        sx={{
          height: { xs: 160, sm: 180, md: 200 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={isMobile ? 24 : 28} sx={{ color: colors.primaryContainer }} />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={AnalyticsIcon}
        title="No revenue data"
        description="Revenue trends will appear here once data is available."
      />
    );
  }

  const maxRevenue = Math.max(...data.map((r) => r.revenue || 0));

  return (
    <Box
      sx={{
        overflowX: "auto",
        width: "100%",
        pb: 1,
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": {
          background: alpha(colors.outline, 0.3),
          borderRadius: 2,
        },
      }}
    >
      <Box
        sx={{
          minWidth: { xs: 320, sm: 400, md: 460 },
          display: "flex",
          alignItems: "flex-end",
          gap: { xs: 0.6, sm: 0.8, md: 1 },
          height: { xs: 140, sm: 160, md: 180 },
          px: 0.5,
        }}
      >
        {data.map((item, idx) => {
          const heightPercent =
            maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 100 : 0;
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: { xs: 28, sm: 32, md: 36 },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: "0.48rem", sm: "0.52rem", md: "0.55rem" },
                  color: colors.outline,
                  whiteSpace: "nowrap",
                }}
              >
                ₹{((item.revenue || 0) / 1000).toFixed(0)}k
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: { xs: 28, sm: 32, md: 44 },
                  bgcolor: colors.primaryContainer,
                  height: `${heightPercent}%`,
                  minHeight: 3,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.6s ease, background-color 0.2s",
                  cursor: "default",
                  "&:hover": { bgcolor: alpha(colors.primaryContainer, 0.7) },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  mt: 0.75,
                  fontSize: { xs: "0.48rem", sm: "0.52rem", md: "0.55rem" },
                  color: colors.outline,
                  transform: isMobile ? "rotate(-30deg)" : "none",
                  transformOrigin: "top left",
                  whiteSpace: "nowrap",
                  display: "block",
                  ml: isMobile ? 1 : 0,
                }}
              >
                {item.month}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────
// Enhanced Subscription Distribution Chart
// ─────────────────────────────────────────────
const SubscriptionDistChart = ({ data, loading, formatCurrency }) => {
  const distColors = [
    colors.primaryContainer,
    colors.onTertiaryContainer,
    colors.tertiaryContainer,
    colors.secondary,
  ];

  if (loading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map((i) => (
          <Box key={i}>
            <Skeleton variant="text" width="50%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" height={8} sx={{ borderRadius: 4 }} />
          </Box>
        ))}
      </Stack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={PaymentsIcon}
        title="No subscription data"
        description="Subscription distribution will appear here."
      />
    );
  }

  const maxCount = Math.max(...data.map((s) => s.count || 0));

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      {data.map((item, idx) => {
        const percentage = maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0;
        const dotColor = distColors[idx % distColors.length];

        return (
          <Box key={idx}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
                width:"490px",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                  sx={{
                    width: { xs: 8, sm: 9, md: 10 },
                    height: { xs: 8, sm: 9, md: 10 },
                    borderRadius: "50%",
                    bgcolor: dotColor,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
                    color: colors.primary,
                  }}
                >
                  {item.plan || "Unknown"}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem" },
                  color: colors.secondary,
                }}
              >
                {item.count || 0} customers
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: { xs: 5, sm: 6, md: 8 },
                borderRadius: 4,
                bgcolor: alpha(colors.primary, 0.07),
                "& .MuiLinearProgress-bar": {
                  bgcolor: dotColor,
                  borderRadius: 4,
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{
                color: colors.outline,
                fontSize: { xs: "0.52rem", sm: "0.55rem", md: "0.6rem" },
                mt: 0.3,
                display: "block",
              }}
            >
              {formatCurrency(item.potentialRevenue || 0)}/mo
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
};

// ─────────────────────────────────────────────
// Main Dashboard Component with Enhanced Responsiveness
// ─────────────────────────────────────────────
const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Enhanced responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));       // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600–900px
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));         // ≥ 900px
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));           // ≥ 1200px
  const isExtraLarge = useMediaQuery(theme.breakpoints.up("xl"));      // ≥ 1536px

  const { user } = useAuth();
  const {
    dashboardData,
    statsData,
    chartData,
    activities,
    loading,
    error,
    loadDashboard,
    exportDashboardReport,
    clearError,
  } = useDashboard();

  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, [retryCount]);

  // ── Toast ──
  const showToast = useCallback((msg, sev = "success") => {
    setToast({ open: true, message: msg, severity: sev });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  // ── Refresh ──
  const handleRefresh = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    showToast("Refreshing dashboard…", "info");
  }, [showToast]);

  // ── Retry on error ──
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    clearError();
  }, [clearError]);

  // ── Export ──
  const handleExport = useCallback(
    async (type) => {
      setExporting(true);
      setExportAnchorEl(null);
      try {
        const exportBlob = await exportDashboardReport();
        if (!exportBlob) throw new Error("No data received");

        const text = await exportBlob.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }

        const filename = `dashboard_report_${new Date().toISOString().split("T")[0]}`;

        if (type === "csv") {
          exportToCSV(data, filename);
          showToast("CSV exported successfully", "success");
        } else if (type === "pdf") {
          await exportToPDF(data, filename);
          showToast("PDF exported successfully", "success");
        }
      } catch (err) {
        console.error("Export error:", err);
        showToast(err.message || "Failed to export dashboard", "error");
      } finally {
        setExporting(false);
      }
    },
    [exportDashboardReport, showToast]
  );

  // ── Indian currency formatter ──
  const formatIndianCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null) return "₹0";
    const num = Number(amount);
    if (isNaN(num)) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString("en-IN")}`;
  }, []);

  // ── Overview data ──
  const overview = useMemo(() => {
    if (user?.role === "super_admin" || user?.role === "admin") {
      return dashboardData?.overview || {};
    }
    return statsData?.overview || {};
  }, [user?.role, dashboardData, statsData]);

  // ── Stats config ──
  const statsToShow = useMemo(() => {
    if (user?.role === "super_admin") {
      return [
        {
          icon: GroupIcon,
          title: "Total Customers",
          value: overview.totalClients,
          trend: `${overview.clientGrowth || 0}%`,
          trendUp: (overview.clientGrowth || 0) >= 0,
          bgColor: colors.primaryContainer,
        },
        {
          icon: CheckCircleIcon,
          title: "Active Customers",
          value: overview.activeClients,
          trend: "8.2%",
          trendUp: true,
          iconBg: colors.secondaryContainer,
        },
        {
          icon: PaymentsIcon,
          title: "Total Revenue",
          value: formatIndianCurrency(overview.totalRevenue || 0),
          trend: "15.3%",
          trendUp: true,
        },
        {
          icon: WarningIcon,
          title: "Expiring Soon",
          value: overview.expiringSoon || 0,
          trend: "3.1%",
          trendUp: false,
          iconBg: colors.errorContainer,
          trendColor: colors.onErrorContainer,
        },
      ];
    } else if (user?.role === "admin") {
      return [
        {
          icon: GroupIcon,
          title: "Team Members",
          value: overview.totalTeamMembers,
          bgColor: colors.primaryContainer,
        },
        {
          icon: CheckCircleIcon,
          title: "Active Team",
          value: overview.activeTeamMembers,
          iconBg: colors.secondaryContainer,
        },
        {
          icon: Inventory2Icon,
          title: "Total Assets",
          value: overview.totalAssets,
        },
        {
          icon: WarningIcon,
          title: "Inspections",
          value: overview.totalInspections,
          iconBg: colors.errorContainer,
        },
      ];
    } else {
      return [
        {
          icon: TaskIcon,
          title: "Total Tasks",
          value: overview.totalTasks,
          bgColor: colors.primaryContainer,
        },
        {
          icon: CheckCircleIcon,
          title: "Completed",
          value: overview.completedTasks,
          iconBg: colors.secondaryContainer,
        },
        {
          icon: AnalyticsIcon,
          title: "Completion Rate",
          value: `${overview.completionRate || 0}%`,
        },
        {
          icon: TrendingUpIcon,
          title: "Performance",
          value: `${overview.performanceScore || 0}%`,
          iconBg: colors.errorContainer,
        },
      ];
    }
  }, [user?.role, overview, formatIndianCurrency]);

  // ── Chart data ──
  const revenueTrend = useMemo(() => chartData?.revenueTrend || [], [chartData]);
  const subscriptionDistribution = useMemo(
    () => chartData?.subscriptionDistribution || [],
    [chartData]
  );

  // ── Quick actions ──
  const quickActions = useMemo(() => {
    const actions = [];
    if (user?.role === "super_admin" || user?.role === "admin") {
      actions.push({
        icon: AddCircleIcon,
        title: "New Checklist",
        desc: "Create inspection form",
        path: "/admin/checklists/custom-builder",
      });
    }
    if (user?.role === "super_admin") {
      actions.push({
        icon: PersonAddIcon,
        title: "Add Client",
        desc: "Register new client",
        path: "/admin/clients",
      });
    }
    actions.push({
      icon: AnalyticsIcon,
      title: "Reports",
      desc: "View analytics",
      path: user?.role === "team" ? "/team/history" : "/admin/reports",
    });
    return actions;
  }, [user?.role]);

  // ── Responsive activity limit ──
  const activityLimit = useMemo(() => {
    if (isMobile) return 3;
    if (isTablet) return 4;
    if (isDesktop && !isLarge) return 5;
    return 6;
  }, [isMobile, isTablet, isDesktop, isLarge]);

  // ── Responsive grid spacing ──
  const gridSpacing = useMemo(() => {
    if (isMobile) return 1.25;
    if (isTablet) return 1.75;
    return 2.25;
  }, [isMobile, isTablet]);

  // ── Responsive padding ──
  const containerPadding = useMemo(() => {
    if (isMobile) return 1.25;
    if (isTablet) return 1.75;
    if (isDesktop && !isLarge) return 2.5;
    return 3.5;
  }, [isMobile, isTablet, isDesktop, isLarge]);

  // ─── Render: initial loading ───
  if (loading && !dashboardData && !statsData) {
    return <DashboardSkeleton />;
  }

  // ─── Render: fatal error ───
  if (error && !dashboardData && !statsData) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />;
  }

  // ─── Main render ───
  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        minHeight: "100%",
        p: containerPadding,
        position: "relative",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Loading progress bar */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <LinearProgress sx={{ height: 2 }} />
        </Box>
      )}

      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: { xs: 2, sm: 2.5, md: 3 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 1 },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.primary,
              fontSize: { xs: "1.2rem", sm: "1.35rem", md: "1.5rem", lg: "1.65rem" },
              lineHeight: 1.2,
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary,
              fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
              display: "block",
              mt: 0.25,
            }}
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>

        <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: colors.surfaceContainerLow,
                "&:hover": { bgcolor: colors.surfaceVariant },
                "&:disabled": { opacity: 0.5 },
              }}
            >
              <RefreshIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export report">
            <IconButton
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              disabled={exporting || loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: colors.surfaceContainerLow,
                "&:hover": { bgcolor: colors.surfaceVariant },
                "&:disabled": { opacity: 0.5 },
              }}
            >
              {exporting ? (
                <CircularProgress size={isMobile ? 14 : 16} />
              ) : (
                <DownloadIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Export menu */}
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={() => setExportAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: `0 4px 20px ${alpha(colors.primary, 0.12)}`,
                border: `1px solid ${alpha(colors.outlineVariant, 0.5)}`,
                minWidth: { xs: 150, sm: 170 },
              },
            }}
          >
            <MenuItem onClick={() => handleExport("csv")} disabled={exporting}>
              <ListItemIcon>
                <CsvIcon fontSize="small" sx={{ color: colors.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as CSV"
                primaryTypographyProps={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleExport("pdf")} disabled={exporting}>
              <ListItemIcon>
                <PdfIcon fontSize="small" sx={{ color: colors.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as PDF"
                primaryTypographyProps={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
              />
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* ── Non-fatal error alert ── */}
      {error && (
        <Fade in>
          <Alert
            severity="error"
            onClose={clearError}
            sx={{ 
              mb: { xs: 2, sm: 2.5 }, 
              borderRadius: 2, 
              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" } 
            }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* ── Stats Grid ── */}
      {statsToShow.length > 0 ? (
        <Grid
          container
          spacing={gridSpacing}
          sx={{ mb: { xs: 2.5, sm: 3, md: 3.5 } }}
        >
          {statsToShow.map((stat, idx) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={6} 
              lg={3} 
              key={idx}
            >
              <StatCard {...stat} loading={loading} />
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && (
          <EmptyState
            icon={InfoIcon}
            title="No stats available"
            description="Dashboard statistics will appear here once data is available."
          />
        )
      )}

      {/* ── Charts Section (super_admin / admin only) ── */}
      {(user?.role === "super_admin" || user?.role === "admin") && (
        <Grid
          container
          spacing={gridSpacing}
          sx={{ mb: { xs: 2.5, sm: 3, md: 3.5 } }}
        >
          {/* Revenue Trend */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                height: "100%",
                bgcolor: "background.paper",
                border: `1px solid ${alpha(colors.outlineVariant, 0.5)}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: colors.primary,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem", lg: "1.05rem" },
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                Revenue Trend (₹)
              </Typography>

              <RevenueBarChart
                data={revenueTrend}
                loading={loading}
                formatCurrency={formatIndianCurrency}
              />
            </Paper>
          </Grid>

          {/* Subscription Distribution */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                height: "100%",
                bgcolor: "background.paper",
                border: `1px solid ${alpha(colors.outlineVariant, 0.5)}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: colors.primary,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem", lg: "1.05rem" },
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                Subscription Distribution
              </Typography>

              <SubscriptionDistChart
                data={subscriptionDistribution}
                loading={loading}
                formatCurrency={formatIndianCurrency}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ── Recent Activity Table ── */}
      <Box sx={{ mb: { xs: 2.5, sm: 3, md: 3.5 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            overflow: "hidden",
            bgcolor: "background.paper",
            border: `1px solid ${alpha(colors.outlineVariant, 0.5)}`,
          }}
        >
          {/* Activity header */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 2, md: 2.5 },
              py: { xs: 1.25, sm: 1.5, md: 1.75 },
              borderBottom: `1px solid ${alpha(colors.outlineVariant, 0.3)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.primary,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem", lg: "1.05rem" },
              }}
            >
              <HistoryIcon
                sx={{
                  color: colors.primaryContainer,
                  fontSize: { xs: 16, sm: 18, md: 20 },
                }}
              />
              Recent Activity
            </Typography>
          </Box>

          {/* Activity body */}
          {loading ? (
            <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
                >
                  <Skeleton variant="circular" width={28} height={28} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="55%" height={16} />
                    <Skeleton variant="text" width="38%" height={12 } />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="No recent activity"
              description="Your recent activities will appear here."
            />
          ) : (
            <TableContainer sx={{ maxHeight: { xs: 260, sm: 300, md: 350, lg: 400 } }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem" },
                        fontWeight: 700,
                        color: colors.secondary,
                        py: { xs: 0.75, sm: 1, md: 1.25 },
                        bgcolor: alpha(colors.surfaceContainerLow, 0.8),
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Activity
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem" },
                        fontWeight: 700,
                        color: colors.secondary,
                        py: { xs: 0.75, sm: 1, md: 1.25 },
                        bgcolor: alpha(colors.surfaceContainerLow, 0.8),
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Details
                    </TableCell>
                    {!isMobile && (
                      <TableCell
                        sx={{
                          fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem" },
                          fontWeight: 700,
                          color: colors.secondary,
                          py: { xs: 0.75, sm: 1, md: 1.25 },
                          bgcolor: alpha(colors.surfaceContainerLow, 0.8),
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          width: { sm: 100, md: 120 },
                        }}
                      >
                        Date
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.slice(0, activityLimit).map((activity, idx) => (
                    <TableRow
                      key={idx}
                      hover
                      sx={{
                        "&:last-child td": { border: 0 },
                        transition: "background-color 0.15s",
                      }}
                    >
                      <TableCell sx={{ py: { xs: 0.9, sm: 1, md: 1.25 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 0.75, sm: 1 },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: { xs: 22, sm: 24, md: 28 },
                              height: { xs: 22, sm: 24, md: 28 },
                              bgcolor: alpha(colors.primary, 0.08),
                              fontSize: { xs: 10, sm: 11, md: 13 },
                            }}
                          >
                            {activity.icon || "📋"}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: colors.primary,
                              fontSize: {
                                xs: "0.6rem",
                                sm: "0.65rem",
                                md: "0.7rem",
                                lg: "0.75rem",
                              },
                              lineHeight: 1.3,
                            }}
                          >
                            {activity.title || "Activity"}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: { xs: 0.9, sm: 1, md: 1.25 } }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.secondary,
                            fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem" },
                            lineHeight: 1.4,
                          }}
                        >
                          {activity.details || "No details"}
                        </Typography>
                      </TableCell>

                      {!isMobile && (
                        <TableCell sx={{ py: { xs: 0.9, sm: 1, md: 1.25 } }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.outline,
                              fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem" },
                              whiteSpace: "nowrap",
                            }}
                          >
                            {activity.timestamp
                              ? new Date(activity.timestamp).toLocaleDateString("en-IN")
                              : "N/A"}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* ── Quick Actions ── */}
      {quickActions.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.primary,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem", lg: "1.05rem" },
            }}
          >
            <BoltIcon
              sx={{
                color: colors.onTertiaryContainer,
                fontSize: { xs: 16, sm: 18, md: 20 },
              }}
            />
            Quick Actions
          </Typography>

          <Grid
            container
            spacing={gridSpacing}
          >
            {quickActions.map((action, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Button
                  fullWidth
                  onClick={() => navigate(action.path)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    p: { xs: 1.5, sm: 1.75, md: 2, lg: 2.5 },
                    bgcolor: colors.primaryContainer,
                    borderRadius: { xs: 2, sm: 2.5, md: 3 },
                    textTransform: "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "100%",
                    width:"362px",
                    minHeight: { xs: 90, sm: 100, md: 110, lg: 120 },
                    "&:hover": {
                      transform: "translateY(-4px)",
                      bgcolor: alpha(colors.primaryContainer, 0.88),
                      boxShadow: `0 8px 24px ${alpha(colors.primary, 0.2)}`,
                    },
                    boxShadow: `0 2px 8px ${alpha(colors.primary, 0.1)}`,
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 0.7, sm: 0.8, md: 0.9, lg: 1 },
                      bgcolor: "rgba(255,255,255,0.13)",
                      borderRadius: 1.5,
                      mb: { xs: 0.75, sm: 1, md: 1.25 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <action.icon
                      sx={{
                        color: "white",
                        fontSize: { xs: 14, sm: 16, md: 18, lg: 20 },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.8rem",
                        md: "0.85rem",
                        lg: "0.9rem",
                      },
                      mb: 0.25,
                      lineHeight: 1.2,
                    }}
                  >
                    {action.title}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.onPrimaryContainer,
                      textAlign: "left",
                      fontSize: { xs: "0.58rem", sm: "0.62rem", md: "0.65rem", lg: "0.68rem" },
                      lineHeight: 1.4,
                    }}
                  >
                    {action.desc}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Toast Notifications ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
        sx={{
          bottom: { xs: 70, sm: 80, md: 24 },
        }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            boxShadow: 4,
            width: { xs: "90vw", sm: "auto" },
            maxWidth: { xs: "90vw", sm: 400 },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
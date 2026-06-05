// src/pages/AssetCategoryPage.jsx
// ── Redesigned · Full Error Handling · Empty States · Admin Only ─────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogContent,
  InputAdornment,
  Tooltip,
  Skeleton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Fade,
  Grow,
  Collapse,
  alpha,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Badge,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Category,
  Close,
  Check,
  Refresh,
  ClearAll,
  ToggleOn,
  ToggleOff,
  FolderOpen,
  Layers,
  ViewModule,
  ViewList,
  ArrowBack,
  SearchOff,
  Lock,
  Warning,
  ErrorOutline,
  CheckCircle,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
  GridView,
  TableRows,
  WifiOff,
  HourglassEmpty,
  Inventory2,
} from "@mui/icons-material";
import { useAssetCategory } from "../context/AssetCategoryContexts";
import { useAuth } from "../context/AuthContexts";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/material/styles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const slideRight = keyframes`from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;
const popIn = keyframes`0%{opacity:0;transform:scale(0.94)}100%{opacity:1;transform:scale(1)}`;
const shake = keyframes`0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}`;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  bg: "#F4F3EF",
  surface: "#FFFFFF",
  surfaceAlt: "#F9F8F5",
  surfaceHov: "#F2F1EC",
  // Borders
  border: "#E6E1D8",
  borderMid: "#D5CEBD",
  // Brand — warm forest ink
  brand: "#2B3D2E",
  brandMid: "#3F5C43",
  brandLight: "#E6EDE7",
  brandGlow: "rgba(43,61,46,0.12)",
  brandPale: "#F0F5F1",
  // Ink
  ink: "#191916",
  inkSec: "#535249",
  inkMut: "#9A9690",
  // Semantic
  green: "#166534",
  greenBg: "#DCFCE7",
  red: "#B91C1C",
  redBg: "#FEE2E2",
  amber: "#92400E",
  amberBg: "#FEF3C7",
  blue: "#1E40AF",
  blueBg: "#DBEAFE",
  // Typography
  font: "'Outfit', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  // Shadows
  sh: {
    xs: "0 1px 2px rgba(25,25,22,0.06)",
    sm: "0 2px 6px rgba(25,25,22,0.07), 0 1px 2px rgba(25,25,22,0.04)",
    md: "0 6px 20px rgba(25,25,22,0.09), 0 2px 6px rgba(25,25,22,0.05)",
    lg: "0 16px 48px rgba(25,25,22,0.12), 0 4px 12px rgba(25,25,22,0.06)",
    xl: "0 28px 72px rgba(25,25,22,0.16), 0 8px 24px rgba(25,25,22,0.07)",
  },
  r: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, bg, delay = 0 }) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: T.r.lg,
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      boxShadow: T.sh.sm,
      animation: `${fadeUp} 0.45s ${delay}s ease both`,
      flex: 1,
      minWidth: 0,
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: T.sh.md, transform: "translateY(-1px)" },
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: T.inkMut,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontFamily: T.font,
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: T.ink,
            fontFamily: T.font,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value ?? "—"}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: T.r.md,
          bgcolor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
    </Stack>
  </Box>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
  <Chip
    label={active ? "Active" : "Inactive"}
    size="small"
    sx={{
      height: 22,
      fontSize: "0.67rem",
      fontWeight: 700,
      fontFamily: T.font,
      bgcolor: active ? T.greenBg : T.surfaceAlt,
      color: active ? T.green : T.inkMut,
      borderRadius: T.r.xs,
      border: `1px solid ${active ? alpha(T.green, 0.25) : T.border}`,
      "& .MuiChip-label": { px: "8px" },
    }}
  />
);

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry, onDismiss }) => (
  <Fade in>
    <Box
      sx={{
        p: "14px 18px",
        borderRadius: T.r.md,
        bgcolor: T.redBg,
        border: `1px solid ${alpha(T.red, 0.22)}`,
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 2,
        animation: `${shake} 0.35s ease`,
      }}
    >
      <ErrorOutline sx={{ color: T.red, fontSize: 20, flexShrink: 0 }} />
      <Typography
        sx={{
          flex: 1,
          fontSize: "0.85rem",
          color: T.red,
          fontFamily: T.font,
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
      <Stack direction="row" spacing={0.75}>
        {onRetry && (
          <Button
            size="small"
            onClick={onRetry}
            sx={{
              textTransform: "none",
              color: T.red,
              fontFamily: T.font,
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: T.r.xs,
              border: `1px solid ${alpha(T.red, 0.35)}`,
              px: 1.5,
              py: 0.25,
              "&:hover": { bgcolor: alpha(T.red, 0.08) },
            }}
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{ color: T.red, borderRadius: T.r.xs }}
          >
            <Close sx={{ fontSize: 15 }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  </Fade>
);

// ─── Network Error ────────────────────────────────────────────────────────────
const NetworkError = ({ onRetry }) => (
  <Box
    sx={{ py: 8, textAlign: "center", animation: `${fadeUp} 0.4s ease both` }}
  >
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        bgcolor: T.redBg,
        border: `1.5px solid ${alpha(T.red, 0.2)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2.5,
      }}
    >
      <WifiOff sx={{ fontSize: 30, color: T.red }} />
    </Box>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "1rem",
        color: T.ink,
        fontFamily: T.font,
        mb: 0.75,
      }}
    >
      Failed to Load
    </Typography>
    <Typography
      sx={{
        fontSize: "0.85rem",
        color: T.inkSec,
        fontFamily: T.font,
        mb: 3,
        maxWidth: 280,
        mx: "auto",
      }}
    >
      Could not fetch categories. Check your connection or permissions.
    </Typography>
    <Button
      onClick={onRetry}
      variant="contained"
      startIcon={<Refresh sx={{ fontSize: 16 }} />}
      sx={{
        textTransform: "none",
        bgcolor: T.brand,
        fontFamily: T.font,
        fontWeight: 700,
        borderRadius: T.r.sm,
        px: 3,
        boxShadow: `0 2px 8px ${T.brandGlow}`,
        "&:hover": { bgcolor: T.brandMid },
      }}
    >
      Try Again
    </Button>
  </Box>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd, hasSearch, searchTerm, onClearSearch }) => (
  <Box
    sx={{ py: 9, textAlign: "center", animation: `${fadeUp} 0.4s ease both` }}
  >
    <Box
      sx={{
        width: 76,
        height: 76,
        borderRadius: "50%",
        bgcolor: hasSearch ? T.surfaceAlt : T.brandPale,
        border: `1.5px solid ${hasSearch ? T.border : alpha(T.brand, 0.2)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2.5,
      }}
    >
      {hasSearch ? (
        <SearchOff sx={{ fontSize: 32, color: T.inkMut }} />
      ) : (
        <Category sx={{ fontSize: 32, color: T.brand }} />
      )}
    </Box>
    <Typography
      sx={{
        fontWeight: 800,
        fontSize: "1.05rem",
        color: T.ink,
        fontFamily: T.font,
        mb: 0.6,
        letterSpacing: "-0.01em",
      }}
    >
      {hasSearch ? `No results for "${searchTerm}"` : "No categories yet"}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.85rem",
        color: T.inkSec,
        fontFamily: T.font,
        mb: 3.5,
        maxWidth: 300,
        mx: "auto",
        lineHeight: 1.6,
      }}
    >
      {hasSearch
        ? "Try different keywords or clear the filters to see all categories"
        : "Create your first category to start organising assets by type"}
    </Typography>
    {hasSearch ? (
      <Button
        variant="outlined"
        startIcon={<ClearAll />}
        onClick={onClearSearch}
        sx={{
          textTransform: "none",
          borderRadius: T.r.sm,
          borderColor: T.border,
          color: T.inkSec,
          fontFamily: T.font,
          fontWeight: 600,
          "&:hover": { bgcolor: T.surfaceAlt },
        }}
      >
        Clear Search
      </Button>
    ) : (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAdd}
        sx={{
          bgcolor: T.brand,
          color: "#fff",
          textTransform: "none",
          borderRadius: T.r.sm,
          fontWeight: 700,
          fontFamily: T.font,
          px: 3,
          boxShadow: `0 2px 8px ${T.brandGlow}`,
          "&:hover": { bgcolor: T.brandMid },
        }}
      >
        Create First Category
      </Button>
    )}
  </Box>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRows = ({ count = 8 }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <TableRow key={i}>
          {[40, 180, 220, 60, 80, 90, 100].map((w, j) => (
            <TableCell key={j} sx={{ py: 1.75 }}>
              <Skeleton
                variant="rounded"
                width={w}
                height={j === 1 ? 34 : 20}
                sx={{ borderRadius: T.r.xs, animationDelay: `${i * 0.05}s` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
  </>
);

// ─── Category Card (card view / mobile) ──────────────────────────────────────
const CategoryCard = ({ cat, onEdit, onDelete, onToggle, index }) => {
  const isActive = cat.isActive !== false;
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${isActive ? T.border : alpha(T.border, 0.6)}`,
        borderRadius: T.r.lg,
        mb: 1.5,
        overflow: "visible",
        opacity: isActive ? 1 : 0.65,
        transition: "all 0.2s ease",
        animation: `${fadeUp} 0.35s ${index * 0.05}s ease both`,
        "&:hover": {
          boxShadow: T.sh.md,
          borderColor: alpha(T.brand, 0.3),
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ p: "18px", "&:last-child": { pb: "18px" } }}>
        <Stack spacing={1.75}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: T.r.md,
                  bgcolor: T.brandPale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1.5px solid ${alpha(T.brand, 0.15)}`,
                  flexShrink: 0,
                }}
              >
                <Category sx={{ fontSize: 20, color: T.brand }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: T.ink,
                    fontFamily: T.font,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {cat.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.65rem",
                    color: T.inkMut,
                    fontFamily: T.fontMono,
                    mt: 0.15,
                  }}
                >
                  #{cat._id?.slice(-8)}
                </Typography>
              </Box>
            </Stack>
            <StatusBadge active={isActive} />
          </Stack>

          {/* Description */}
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: T.inkSec,
              lineHeight: 1.55,
              fontFamily: T.font,
              minHeight: "1.55em",
            }}
          >
            {cat.description || (
              <span style={{ color: T.inkMut, fontStyle: "italic" }}>
                No description added
              </span>
            )}
          </Typography>

          <Divider sx={{ borderColor: T.border }} />

          {/* Meta */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={0.6}>
                <Inventory2 sx={{ fontSize: 13, color: T.brand }} />
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: T.brand,
                    fontFamily: T.font,
                  }}
                >
                  {cat.assetCount ?? 0} assets
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: T.inkMut,
                  fontFamily: T.font,
                }}
              >
                {fmtDate(cat.createdAt)}
              </Typography>
            </Stack>
            {/* Actions */}
            <Stack direction="row" spacing={0.6}>
              <Tooltip
                title={isActive ? "Deactivate" : "Activate"}
                placement="top"
              >
                <IconButton
                  size="small"
                  onClick={() => onToggle(cat)}
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: T.r.xs,
                    bgcolor: alpha(T.border, 0.5),
                    "&:hover": { bgcolor: T.border },
                  }}
                >
                  {isActive ? (
                    <ToggleOn sx={{ fontSize: 17, color: T.green }} />
                  ) : (
                    <ToggleOff sx={{ fontSize: 17, color: T.inkMut }} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit" placement="top">
                <IconButton
                  size="small"
                  onClick={() => onEdit(cat)}
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: T.r.xs,
                    bgcolor: T.brandPale,
                    "&:hover": { bgcolor: alpha(T.brand, 0.15) },
                  }}
                >
                  <Edit sx={{ fontSize: 14, color: T.brand }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" placement="top">
                <IconButton
                  size="small"
                  onClick={() => onDelete(cat)}
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: T.r.xs,
                    bgcolor: alpha(T.redBg, 0.8),
                    "&:hover": { bgcolor: T.redBg },
                  }}
                >
                  <Delete sx={{ fontSize: 14, color: T.red }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─── Category Form Dialog ─────────────────────────────────────────────────────
const CategoryDialog = ({ open, onClose, onSubmit, editData, loading }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        editData
          ? {
              name: editData.name || "",
              description: editData.description || "",
              isActive: editData.isActive !== false,
            }
          : { name: "", description: "", isActive: true },
      );
      setErrors({});
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [editData, open]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Category name is required";
    else if (form.name.trim().length < 2)
      e.name = "At least 2 characters required";
    else if (form.name.trim().length > 80) e.name = "Max 80 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
    });
  };

  const inputRoot = {
    borderRadius: T.r.sm,
    fontSize: "0.875rem",
    fontFamily: T.font,
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: alpha(T.brand, 0.45) },
    "&.Mui-focused fieldset": { borderColor: T.brand, borderWidth: "1.5px" },
    "&.Mui-focused": { boxShadow: `0 0 0 3px ${T.brandGlow}` },
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: T.r.xl,
          boxShadow: T.sh.xl,
          bgcolor: T.surface,
          overflow: "hidden",
          animation: `${popIn} 0.22s ease both`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          background: `linear-gradient(135deg, ${T.brandPale} 0%, ${T.surface} 80%)`,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: T.r.md,
                bgcolor: T.brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 3px 10px ${T.brandGlow}`,
              }}
            >
              {isEdit ? (
                <Edit sx={{ fontSize: 18, color: "#fff" }} />
              ) : (
                <Add sx={{ fontSize: 20, color: "#fff" }} />
              )}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: T.ink,
                  fontFamily: T.font,
                  letterSpacing: "-0.02em",
                }}
              >
                {isEdit ? "Edit Category" : "New Category"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: T.inkMut,
                  fontFamily: T.font,
                }}
              >
                {isEdit
                  ? `Editing "${editData?.name}"`
                  : "Add a new asset category"}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            disabled={loading}
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
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Name */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.67rem",
                fontWeight: 700,
                color: T.inkSec,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                mb: 0.75,
                fontFamily: T.font,
              }}
            >
              Category Name <span style={{ color: T.red }}>*</span>
            </Typography>
            <TextField
              inputRef={nameRef}
              fullWidth
              size="small"
              placeholder="e.g. Electronics, Vehicles, Office Equipment…"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit();
              }}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{ sx: inputRoot }}
              sx={{
                "& .MuiFormHelperText-root": {
                  mt: 0.75,
                  fontSize: "0.75rem",
                  fontFamily: T.font,
                  color: T.red,
                },
              }}
            />
            {form.name.length > 60 && (
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: form.name.length > 80 ? T.red : T.inkMut,
                  fontFamily: T.font,
                  mt: 0.5,
                  textAlign: "right",
                }}
              >
                {form.name.length}/80
              </Typography>
            )}
          </Box>

          {/* Description */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.75}
            >
              <Typography
                sx={{
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  color: T.inkSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontFamily: T.font,
                }}
              >
                Description
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: T.inkMut,
                  fontFamily: T.font,
                }}
              >
                Optional
              </Typography>
            </Stack>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Briefly describe what this category covers…"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              InputProps={{ sx: inputRoot }}
            />
          </Box>

          {/* Status toggle */}
          <Box
            sx={{
              p: "14px 16px",
              borderRadius: T.r.md,
              bgcolor: T.surfaceAlt,
              border: `1px solid ${T.border}`,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: T.ink,
                    fontFamily: T.font,
                  }}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: T.inkMut,
                    fontFamily: T.font,
                    mt: 0.2,
                  }}
                >
                  {form.isActive
                    ? "Visible in asset assignment forms"
                    : "Hidden from asset forms"}
                </Typography>
              </Box>
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: T.brand },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    bgcolor: T.brand,
                  },
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: T.surfaceAlt,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: T.r.sm,
            color: T.inkSec,
            fontFamily: T.font,
            fontWeight: 600,
            px: 2.5,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
            "&:hover": { bgcolor: T.surfaceHov },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : isEdit ? (
              <Check sx={{ fontSize: 16 }} />
            ) : (
              <Add sx={{ fontSize: 18 }} />
            )
          }
          sx={{
            bgcolor: T.brand,
            color: "#fff",
            textTransform: "none",
            borderRadius: T.r.sm,
            fontWeight: 700,
            fontFamily: T.font,
            px: 3,
            boxShadow: `0 2px 8px ${T.brandGlow}`,
            "&:hover": { bgcolor: T.brandMid },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
        </Button>
      </Box>
    </Dialog>
  );
};

// ─── Delete Dialog ────────────────────────────────────────────────────────────
const DeleteDialog = ({ open, onClose, onConfirm, category, loading }) => (
  <Dialog
    open={open}
    onClose={!loading ? onClose : undefined}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: T.r.xl,
        boxShadow: T.sh.xl,
        bgcolor: T.surface,
        animation: `${popIn} 0.2s ease both`,
      },
    }}
  >
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.75} alignItems="center" mb={2.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: T.r.md,
            bgcolor: T.redBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Delete sx={{ color: T.red, fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "0.95rem",
              color: T.ink,
              fontFamily: T.font,
            }}
          >
            Delete Category
          </Typography>
          <Typography
            sx={{ fontSize: "0.72rem", color: T.inkMut, fontFamily: T.font }}
          >
            This action cannot be undone
          </Typography>
        </Box>
      </Stack>
      <Box
        sx={{
          p: "14px 16px",
          borderRadius: T.r.md,
          bgcolor: T.redBg,
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
            lineHeight: 1.55,
          }}
        >
          Delete <strong>"{category?.name}"</strong>? Assets using this category
          will lose their category assignment.
        </Typography>
        {(category?.assetCount ?? 0) > 0 && (
          <Stack direction="row" alignItems="center" spacing={0.75} mt={1.25}>
            <Warning sx={{ fontSize: 14, color: T.amber }} />
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: T.amber,
                fontFamily: T.font,
                fontWeight: 700,
              }}
            >
              {category.assetCount} asset{category.assetCount !== 1 ? "s" : ""}{" "}
              will be affected
            </Typography>
          </Stack>
        )}
      </Box>
      <Stack direction="row" spacing={1.25} justifyContent="flex-end">
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: T.r.sm,
            border: `1px solid ${T.border}`,
            color: T.inkSec,
            fontFamily: T.font,
            fontWeight: 600,
            px: 2.5,
            "&:hover": { bgcolor: T.surfaceAlt },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Delete sx={{ fontSize: 16 }} />
            )
          }
          sx={{
            bgcolor: T.red,
            color: "#fff",
            textTransform: "none",
            borderRadius: T.r.sm,
            fontWeight: 700,
            fontFamily: T.font,
            px: 3,
            boxShadow: `0 2px 8px ${alpha(T.red, 0.25)}`,
            "&:hover": { bgcolor: "#991B1B" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {loading ? "Deleting…" : "Delete Permanently"}
        </Button>
      </Stack>
    </Box>
  </Dialog>
);

// ─── Access Denied ────────────────────────────────────────────────────────────
const AccessDenied = () => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Box
      sx={{
        p: 5,
        textAlign: "center",
        maxWidth: 380,
        animation: `${fadeUp} 0.4s ease both`,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: T.redBg,
          border: `1.5px solid ${alpha(T.red, 0.2)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2.5,
        }}
      >
        <Lock sx={{ fontSize: 30, color: T.red }} />
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.1rem",
          color: T.ink,
          fontFamily: T.font,
          mb: 1,
          letterSpacing: "-0.02em",
        }}
      >
        Admin Access Only
      </Typography>
      <Typography
        sx={{
          fontSize: "0.875rem",
          color: T.inkSec,
          fontFamily: T.font,
          lineHeight: 1.6,
        }}
      >
        Asset Categories can only be managed by administrators. Contact your
        admin for access.
      </Typography>
    </Box>
  </Box>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AssetCategoryPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  if (!isAdmin) return <AccessDenied />;

  const {
    categories,
    loading,
    error,
    pagination,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setError,
  } = useAssetCategory();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const fetchCategories = useCallback(
    async (silent = false) => {
      if (!silent) setFetching(true);
      setFetchError("");
      try {
        const params = { page: page + 1, limit: rowsPerPage };
        if (search.trim()) params.search = search.trim();
        const res = await getAllCategories(params);
        if (res?.success === false) {
          setFetchError(res?.message || "Failed to load categories");
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setFetchError(
            "Session expired or insufficient permissions. Please refresh and log in again.",
          );
        } else if (!navigator.onLine) {
          setFetchError(
            "No internet connection. Check your network and try again.",
          );
        } else {
          setFetchError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load categories",
          );
        }
      } finally {
        setFetching(false);
      }
    },
    [getAllCategories, page, rowsPerPage, search],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
    if (isMobile) setViewMode("card");
  }, [isMobile]);

  const clearSearch = () => {
    setSearch("");
    setPage(0);
  };

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      await createCategory(formData);
      toast("Category created successfully ✓");
      setFormOpen(false);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to create category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await updateCategory(editTarget._id, formData);
      toast("Category updated successfully ✓");
      setEditTarget(null);
      setFormOpen(false);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to update category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteCategory(deleteTarget._id);
      toast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to delete category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    const wasActive = cat.isActive !== false;
    try {
      await updateCategory(cat._id, { isActive: !wasActive });
      toast(`"${cat.name}" ${wasActive ? "deactivated" : "activated"}`);
      fetchCategories(true);
    } catch (e) {
      toast(e?.message || "Failed to update status", "error");
    }
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setFormOpen(true);
  };
  const openNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const busy = loading || fetching;
  const hasSearch = search.trim().length > 0;
  const noData = !busy && !fetchError && categories.length === 0;
  const totalCount = pagination?.total ?? categories.length;
  const activeCount = categories.filter((c) => c.isActive !== false).length;

  // ─── Table headings ──────────────────────────────────────────────────────
  const headCell = (label) => (
    <TableCell
      sx={{
        py: 1.5,
        fontSize: "0.65rem",
        fontWeight: 800,
        color: T.inkSec,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: T.font,
        bgcolor: T.surfaceAlt,
        borderBottom: `2px solid ${T.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </TableCell>
  );

  return (
    <Box sx={{ minHeight: "100vh", fontFamily: T.font }}>
      {/* ── Progress bar ── */}
      {busy && (
        <LinearProgress
          sx={{
            height: 2.5,
            bgcolor: alpha(T.brand, 0.08),
            "& .MuiLinearProgress-bar": { bgcolor: T.brand },
          }}
        />
      )}

      {/* ── Header ── */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2.5, sm: 3 },
          pb: 2.5,
          width:"1165px",
          marginLeft:"35px",
          borderRadius:"12px",
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
          boxShadow: `0 1px 0 ${T.border}`,
          animation: `${fadeIn} 0.35s ease both`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Tooltip title="Back to Assets">
              <IconButton
                onClick={() => navigate("/admin/assets")}
                size="small"
                sx={{
                  bgcolor: T.brandPale,
                  borderRadius: T.r.sm,
                  color: T.brand,
                  border: `1.5px solid ${alpha(T.brand, 0.18)}`,
                  "&:hover": { bgcolor: T.brandLight },
                }}
              >
                <ArrowBack sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  fontWeight: 800,
                  color: T.ink,
                  fontFamily: T.font,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                }}
              >
                Asset Categories
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: T.inkMut,
                  fontFamily: T.font,
                  mt: 0.2,
                }}
              >
                {totalCount} categories · {activeCount} active · Admin
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => fetchCategories()}
                disabled={busy}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: T.r.sm,
                  bgcolor: alpha(T.border, 0.5),
                  border: `1px solid ${T.border}`,
                  "&:hover": { bgcolor: T.border },
                }}
              >
                {busy ? (
                  <CircularProgress size={15} sx={{ color: T.brand }} />
                ) : (
                  <Refresh sx={{ fontSize: 17, color: T.inkSec }} />
                )}
              </IconButton>
            </Tooltip>

            {/* View toggle — desktop only */}
            {!isMobile && (
              <Stack
                direction="row"
                sx={{
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r.sm,
                  overflow: "hidden",
                }}
              >
                {[
                  ["table", <TableRows sx={{ fontSize: 15 }} />, "Table"],
                  ["card", <GridView sx={{ fontSize: 15 }} />, "Cards"],
                ].map(([mode, icon, tip]) => (
                  <Tooltip key={mode} title={tip}>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode(mode)}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 0,
                        bgcolor: viewMode === mode ? T.brand : T.surface,
                        color: viewMode === mode ? "#fff" : T.inkSec,
                        transition: "all 0.15s",
                        "&:hover": {
                          bgcolor:
                            viewMode === mode ? T.brandMid : T.surfaceAlt,
                        },
                      }}
                    >
                      {icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            )}

            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={openNew}
              sx={{
                bgcolor: T.brand,
                color: "#fff",
                textTransform: "none",
                borderRadius: T.r.sm,
                fontWeight: 700,
                fontFamily: T.font,
                fontSize: "0.82rem",
                px: 2.5,
                py: "7px",
                boxShadow: `0 2px 8px ${T.brandGlow}`,
                "&:hover": { bgcolor: T.brandMid },
              }}
            >
              Add Category
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        {/* ── Stats row ── */}
        <Stack
          direction={{ xs: "grid", sm: "row" }}
          sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}
        >
          <StatCard
            label="Total Categories"
            value={totalCount}
            icon={<Category sx={{ fontSize: 20, color: T.brand }} />}
            color={T.brand}
            bg={T.brandPale}
            delay={0}
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={<CheckCircle sx={{ fontSize: 20, color: T.green }} />}
            color={T.green}
            bg={T.greenBg}
            delay={0.07}
          />
          <StatCard
            label="Inactive"
            value={Math.max(0, totalCount - activeCount)}
            icon={<ToggleOff sx={{ fontSize: 20, color: T.inkMut }} />}
            color={T.inkMut}
            bg={T.surfaceAlt}
            delay={0.14}
          />
        </Stack>

        {/* ── Error banners ── */}
        {fetchError && (
          <ErrorBanner
            message={fetchError}
            onRetry={() => fetchCategories()}
            onDismiss={() => setFetchError("")}
          />
        )}
        {error && !fetchError && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {/* ── Search bar ── */}
        <Box
          sx={{
            p: 2,
            borderRadius: T.r.lg,
            bgcolor: T.surface,
            border: `1px solid ${T.border}`,
            boxShadow: T.sh.xs,
            mb: 2.5,
            animation: `${fadeUp} 0.35s 0.1s ease both`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              onKeyDown={(e) => e.key === "Enter" && fetchCategories()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: T.inkMut }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      sx={{ borderRadius: T.r.xs }}
                    >
                      <Close sx={{ fontSize: 13 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: T.r.sm,
                  fontSize: "0.875rem",
                  fontFamily: T.font,
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: alpha(T.brand, 0.45) },
                  "&.Mui-focused fieldset": {
                    borderColor: T.brand,
                    borderWidth: "1.5px",
                  },
                },
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setPage(0);
                  fetchCategories();
                }}
                disabled={busy}
                sx={{
                  bgcolor: T.brand,
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: T.r.sm,
                  fontWeight: 700,
                  fontFamily: T.font,
                  px: 2.5,
                  py: "7.5px",
                  whiteSpace: "nowrap",
                  boxShadow: `0 2px 6px ${T.brandGlow}`,
                  "&:hover": { bgcolor: T.brandMid },
                  "&.Mui-disabled": { opacity: 0.5 },
                }}
              >
                {fetching ? (
                  <CircularProgress size={15} color="inherit" />
                ) : (
                  "Search"
                )}
              </Button>
              {hasSearch && (
                <Button
                  size="small"
                  startIcon={<ClearAll sx={{ fontSize: 14 }} />}
                  onClick={clearSearch}
                  sx={{
                    textTransform: "none",
                    color: T.inkSec,
                    fontFamily: T.font,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    borderRadius: T.r.sm,
                    border: `1px solid ${T.border}`,
                    px: 1.75,
                    "&:hover": { bgcolor: T.surfaceAlt },
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
          {hasSearch && !busy && categories.length > 0 && (
            <Box
              sx={{
                mt: 1.25,
                px: 1,
                py: "6px",
                borderRadius: T.r.xs,
                bgcolor: T.blueBg,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <InfoOutlined sx={{ fontSize: 13, color: T.blue }} />
              <Typography
                sx={{
                  fontSize: "0.73rem",
                  color: T.blue,
                  fontFamily: T.font,
                  fontWeight: 500,
                }}
              >
                {totalCount} result{totalCount !== 1 ? "s" : ""} for "
                <strong>{search}</strong>"
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Main content area ── */}
        <Box
          sx={{
            borderRadius: T.r.lg,
            overflow: "hidden",
            bgcolor: T.surface,
            border: `1px solid ${T.border}`,
            boxShadow: T.sh.sm,
          }}
        >
          {/* Fetch error with retry — full area */}
          {fetchError && !busy && categories.length === 0 && (
            <NetworkError onRetry={() => fetchCategories()} />
          )}

          {/* Skeleton */}
          {busy && categories.length === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "#",
                      "Category",
                      "Description",
                      "Assets",
                      "Status",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          py: 1.5,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: T.inkSec,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontFamily: T.font,
                          bgcolor: T.surfaceAlt,
                          borderBottom: `2px solid ${T.border}`,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <SkeletonRows count={rowsPerPage} />
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty state */}
          {noData && !fetchError && (
            <EmptyState
              onAdd={openNew}
              hasSearch={hasSearch}
              searchTerm={search}
              onClearSearch={clearSearch}
            />
          )}

          {/* Data */}
          {!busy && categories.length > 0 && (
            <>
              {isMobile || viewMode === "card" ? (
                <Box sx={{ p: 2 }}>
                  {categories.map((cat, i) => (
                    <CategoryCard
                      key={cat._id}
                      cat={cat}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                      onToggle={handleToggleActive}
                    />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {[
                          "#",
                          "Category",
                          "Description",
                          "Assets",
                          "Status",
                          "Created",
                          "Actions",
                        ].map((h) => headCell(h))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((cat, idx) => {
                        const isActive = cat.isActive !== false;
                        return (
                          <TableRow
                            key={cat._id}
                            sx={{
                              opacity: isActive ? 1 : 0.6,
                              "&:hover": { bgcolor: T.brandPale },
                              transition: "background 0.15s",
                              animation: `${slideRight} 0.3s ${idx * 0.03}s ease both`,
                            }}
                          >
                            <TableCell
                              sx={{
                                py: 1.75,
                                fontSize: "0.78rem",
                                color: T.inkMut,
                                fontFamily: T.font,
                                fontWeight: 600,
                                pl: 2.5,
                              }}
                            >
                              {page * rowsPerPage + idx + 1}
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: T.r.md,
                                    bgcolor: T.brandPale,
                                    border: `1.5px solid ${alpha(T.brand, 0.14)}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Category
                                    sx={{ fontSize: 16, color: T.brand }}
                                  />
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.85rem",
                                      color: T.ink,
                                      fontFamily: T.font,
                                      letterSpacing: "-0.01em",
                                    }}
                                  >
                                    {cat.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.63rem",
                                      color: T.inkMut,
                                      fontFamily: T.fontMono,
                                    }}
                                  >
                                    #{cat._id?.slice(-8)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell sx={{ py: 1.75, maxWidth: 260 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: T.inkSec,
                                  fontFamily: T.font,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {cat.description || (
                                  <span
                                    style={{
                                      color: T.inkMut,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    No description
                                  </span>
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                  px: 1.25,
                                  py: 0.4,
                                  borderRadius: T.r.xs,
                                  bgcolor: T.brandPale,
                                }}
                              >
                                <Inventory2
                                  sx={{ fontSize: 12, color: T.brand }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    color: T.brand,
                                    fontFamily: T.font,
                                  }}
                                >
                                  {cat.assetCount ?? 0}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <StatusBadge active={isActive} />
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.78rem",
                                  color: T.inkSec,
                                  fontFamily: T.font,
                                }}
                              >
                                {fmtDate(cat.createdAt)}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip
                                  title={isActive ? "Deactivate" : "Activate"}
                                  placement="top"
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleActive(cat)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: T.r.xs,
                                      bgcolor: alpha(T.border, 0.5),
                                      "&:hover": { bgcolor: T.border },
                                    }}
                                  >
                                    {isActive ? (
                                      <ToggleOn
                                        sx={{ fontSize: 16, color: T.green }}
                                      />
                                    ) : (
                                      <ToggleOff
                                        sx={{ fontSize: 16, color: T.inkMut }}
                                      />
                                    )}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEdit(cat)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: T.r.xs,
                                      bgcolor: T.brandPale,
                                      "&:hover": { bgcolor: T.brandLight },
                                    }}
                                  >
                                    <Edit
                                      sx={{ fontSize: 13, color: T.brand }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteTarget(cat)}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: T.r.xs,
                                      bgcolor: alpha(T.redBg, 0.8),
                                      "&:hover": { bgcolor: T.redBg },
                                    }}
                                  >
                                    <Delete
                                      sx={{ fontSize: 13, color: T.red }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              <Box
                sx={{
                  borderTop: `1px solid ${T.border}`,
                  bgcolor: T.surfaceAlt,
                }}
              >
                <TablePagination
                  rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  sx={{
                    "& .MuiTablePagination-toolbar": {
                      fontFamily: T.font,
                      fontSize: "0.8rem",
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      { fontFamily: T.font, fontSize: "0.8rem" },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ── Dialogs ── */}
      <CategoryDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        editData={editTarget}
        loading={saving}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        category={deleteTarget}
        loading={saving}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{
            borderRadius: T.r.md,
            fontFamily: T.font,
            fontSize: "0.82rem",
            fontWeight: 500,
            boxShadow: T.sh.lg,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

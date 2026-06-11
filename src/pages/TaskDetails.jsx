// src/pages/TaskDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Rating,
  Checkbox,
  Tooltip,
  Fade,
  FormGroup,
  FormHelperText,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Draw as DrawIcon,
  QrCode as QrCodeIcon,
  Tag as TagIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentContext";
import { useAuth } from "../context/AuthContexts";

// ─── Theme ───────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: "#0d3d52",
      dark: "#072535",
      light: "#e6f3f8",
      contrastText: "#fff",
    },
    success: { main: "#0ea472" },
    warning: { main: "#e09b2d" },
    error: { main: "#d94f4f" },
    background: { default: "#f4f6f9", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h6: { fontWeight: 700, letterSpacing: "-0.3px" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});

const STATUS_CFG = {
  pending: { label: "Pending", color: "#b45309", bg: "#fef9ee" },
  in_progress: { label: "In Progress", color: "#1d4ed8", bg: "#eff6ff" },
  submitted: { label: "Submitted", color: "#6d28d9", bg: "#f5f3ff" },
  completed: { label: "Completed", color: "#047857", bg: "#ecfdf5" },
  approved: { label: "Approved", color: "#047857", bg: "#ecfdf5" },
  rejected: { label: "Rejected", color: "#b91c1c", bg: "#fef2f2" },
};

const PRIORITY_CFG = {
  low: { label: "Low", color: "#047857", bg: "#ecfdf5" },
  medium: { label: "Medium", color: "#b45309", bg: "#fef9ee" },
  high: { label: "High", color: "#b91c1c", bg: "#fef2f2" },
  critical: { label: "Critical", color: "#7f1d1d", bg: "#fee2e2" },
};

// ─── Signature Canvas ─────────────────────────────────────────────────────────
function SignatureCanvas({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#0d3d52";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL());
  };

  const clearSig = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <Box>
      <Box
        sx={{
          border: "1.5px dashed #cbd5e1",
          borderRadius: 2,
          p: 1,
          bgcolor: "#fafcff",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={140}
          style={{
            display: "block",
            width: "100%",
            height: 140,
            cursor: "crosshair",
            touchAction: "none",
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!value && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <DrawIcon sx={{ fontSize: 28, color: "#c0ccd8", mb: 0.5 }} />
            <Typography variant="caption" color="text.disabled">
              Sign to confirm inspection
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="caption" color="text.disabled">
          Draw your signature above
        </Typography>
        {value && (
          <Button
            size="small"
            onClick={clearSig}
            sx={{ color: "#d94f4f", fontSize: 12, p: 0 }}
          >
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── Image Upload Field ────────────────────────────────────────────────────────
function ImageUploadField({ fieldId, value, onChange }) {
  const [previews, setPreviews] = useState([]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setPreviews((p) => [...p, ...newPreviews]);
    onChange(fieldId, [...(Array.isArray(value) ? value : []), ...files]);
    e.target.value = "";
  };

  const remove = (idx) => {
    URL.revokeObjectURL(previews[idx].url);
    const next = previews.filter((_, i) => i !== idx);
    setPreviews(next);
    onChange(
      fieldId,
      next.map((p) => p.file),
    );
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        component="label"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          border: "1.5px dashed #cbd5e1",
          borderRadius: 2,
          bgcolor: "#fafcff",
          cursor: "pointer",
          "&:hover": {
            bgcolor: alpha("#0d3d52", 0.03),
            borderColor: "#0d3d52",
          },
          transition: "all 0.15s",
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 28, color: "#94a3b8", mb: 0.5 }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Click to upload or drag and drop
        </Typography>
        <Typography variant="caption" color="text.disabled">
          PNG, JPG, HEIC up to 10MB
        </Typography>
        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handleFiles}
        />
      </Box>
      {previews.length > 0 && (
        <ImageList cols={4} gap={8} sx={{ mt: 1.5 }}>
          {previews.map((img, idx) => (
            <ImageListItem
              key={idx}
              sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}
            >
              <img
                src={img.url}
                alt={img.name}
                style={{ height: 90, objectFit: "cover", width: "100%" }}
              />
              <IconButton
                size="small"
                onClick={() => remove(idx)}
                sx={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  bgcolor: "rgba(0,0,0,0.55)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                  width: 22,
                  height: 22,
                }}
              >
                <CloseIcon sx={{ fontSize: 13, color: "white" }} />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
}

// ─── Field Renderer ───────────────────────────────────────────────────────────
function FieldRenderer({ field, value, onChange }) {
  const fieldId = field._id;

  switch (field.type) {
    case "text_input":
      return (
        <TextField
          fullWidth
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder={
            field.placeholder || `Enter ${field.label.toLowerCase()}…`
          }
          required={field.required}
          sx={{ mt: 1 }}
        />
      );

    case "text_area":
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder={field.placeholder || "Enter detailed notes…"}
          required={field.required}
          sx={{ mt: 1 }}
        />
      );

    case "dropdown": {
      return (
        <FormControl
          fullWidth
          sx={{ mt: 1 }}
          size="small"
          required={field.required}
        >
          <Select
            value={value || ""}
            onChange={(e) => onChange(fieldId, e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select an option
            </MenuItem>
            {field.options?.map((opt, i) => (
              <MenuItem key={i} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          {field.required && !value && (
            <FormHelperText error>This field is required</FormHelperText>
          )}
        </FormControl>
      );
    }

    case "checkbox": {
      const isMulti = Array.isArray(field.options) && field.options.length > 0;
      if (isMulti) {
        const selected = Array.isArray(value) ? value : [];
        return (
          <FormGroup sx={{ mt: 1 }}>
            {field.options.map((opt, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(opt)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt]
                        : selected.filter((v) => v !== opt);
                      onChange(fieldId, next);
                    }}
                  />
                }
                label={<Typography variant="body2">{opt}</Typography>}
              />
            ))}
          </FormGroup>
        );
      }
      return (
        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Checkbox
              size="small"
              checked={value === true}
              onChange={(e) => onChange(fieldId, e.target.checked)}
            />
          }
          label={<Typography variant="body2">{field.label}</Typography>}
        />
      );
    }

    case "date":
      return (
        <TextField
          fullWidth
          type="date"
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          InputLabelProps={{ shrink: true }}
          required={field.required}
          sx={{ mt: 1 }}
        />
      );

    case "number":
      return (
        <TextField
          fullWidth
          type="number"
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder={field.placeholder || "Enter a number"}
          inputProps={{ min: field.min, max: field.max }}
          required={field.required}
          sx={{ mt: 1 }}
        />
      );

    case "rating": {
      const max = field.validation?.max || 5;
      return (
        <Box sx={{ mt: 1.5 }}>
          <Rating
            value={parseInt(value) || 0}
            onChange={(_, v) => onChange(fieldId, v)}
            max={max}
            size="large"
          />
          {value ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.3 }}
            >
              {value} / {max}
            </Typography>
          ) : (
            field.required && (
              <FormHelperText error>Please provide a rating</FormHelperText>
            )
          )}
        </Box>
      );
    }

    case "image_upload":
      return (
        <ImageUploadField fieldId={fieldId} value={value} onChange={onChange} />
      );

    case "signature":
      return (
        <Box sx={{ mt: 1 }}>
          <SignatureCanvas
            value={value}
            onChange={(v) => onChange(fieldId, v)}
          />
        </Box>
      );

    default:
      return (
        <TextField
          fullWidth
          multiline
          rows={2}
          value={value || ""}
          onChange={(e) => onChange(fieldId, e.target.value)}
          placeholder="Enter your response…"
          sx={{ mt: 1 }}
        />
      );
  }
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, accent }) {
  return (
    <Box sx={{ py: 0.75 }}>
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mb: 0.2, fontSize: 11 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color: accent || "text.primary" }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { fetchTaskById, submitAssignment, submitting, loading } =
    useTeamAssignment();
  const mountedRef = useRef(true);

  const [task, setTask] = useState(null);
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachPreviews, setAttachPreviews] = useState([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toast = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );

  const loadTask = useCallback(async () => {
    if (!id || id === "undefined" || id === "null") {
      toast("Invalid task ID", "error");
      navigate("/team");
      return;
    }
    const result = await fetchTaskById(id);
    if (!mountedRef.current) return;
    if (result.success) {
      // Normalise: the API returns the full assignment object
      const t = result.task;
      setTask(t);
      // Pre-fill if any saved responses
      const existing = {};
      t?.checklistData?.[0]?.responses?.forEach((r) => {
        existing[r.fieldId] = r.value;
      });
      setResponses(existing);
      if (t?.notes) setNotes(t.notes);
    } else {
      toast(result.error || "Failed to load task", "error");
      navigate("/team");
    }
  }, [id, fetchTaskById, toast, navigate]);

  useEffect(() => {
    if (!id || id === "undefined" || id === "null") {
      toast("Invalid task ID", "error");
      navigate("/team");
      return;
    }
    loadTask();
  }, [id]); // eslint-disable-line

  const handleResponseChange = useCallback((fieldId, value) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  // Attachments section (separate from image_upload fields)
  const handleAttachFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    setAttachPreviews((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: f.size })),
    ]);
    e.target.value = "";
  };

  const removeAttach = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!id || id === "undefined") {
      toast("Invalid assignment ID", "error");
      return;
    }

    const formData = new FormData();

    // Build responses payload — handle image files separately
    const responsesPayload = {};
    Object.entries(responses).forEach(([k, v]) => {
      if (Array.isArray(v) && v[0] instanceof File) {
        // image_upload fields — send files as form data
        v.forEach((file) => formData.append(`field_${k}`, file));
        responsesPayload[k] = `__file_field_${k}`;
      } else {
        responsesPayload[k] = v;
      }
    });

    formData.append("responses", JSON.stringify(responsesPayload));
    if (notes.trim()) formData.append("notes", notes.trim());
    attachments.forEach((file) => formData.append("attachments", file));
    formData.append(
      "inspectorName",
      user?.name || user?.fullName || "Team Member",
    );
    if (user?.email) formData.append("inspectorEmail", user.email);

    const result = await submitAssignment(id, formData);
    if (result.success) {
      toast("Assignment submitted successfully!", "success");
      setSubmitDialogOpen(false);
      setTimeout(() => navigate("/team"), 800);
    } else {
      toast(result.error || "Failed to submit assignment", "error");
    }
  };

  // ─── Derived Data ─────────────────────────────────────────────────────────
  // API detail response: fields in checklistIds[0].fields, asset in assetIds[0]
  const checklist = task?.checklistIds?.[0] || {};
  const fields = checklist.fields || [];
  const assetDetail = task?.assetIds?.[0] || {}; // full asset
  const assetSummary = task?.assets?.[0] || {}; // summary
  const statusKey = (task?.status || "pending").toLowerCase();
  const statusCfg = STATUS_CFG[statusKey] || STATUS_CFG.pending;
  const priorityCfg =
    PRIORITY_CFG[(task?.priority || "medium").toLowerCase()] ||
    PRIORITY_CFG.medium;

  // Progress: count required fields answered
  const requiredFields = fields.filter((f) => f.required);
  const answeredRequired = requiredFields.filter((f) => {
    const v = responses[f._id];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== "" && v !== null && v !== false;
  });
  const progressPct = requiredFields.length
    ? Math.round((answeredRequired.length / requiredFields.length) * 100)
    : 0;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading && !task) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "#f4f6f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress
              size={40}
              thickness={3}
              sx={{ color: "#0d3d52" }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading assignment…
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (!task) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          {/* ── Top Nav ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Tooltip title="Back to tasks">
              <IconButton
                onClick={() => navigate("/team")}
                sx={{
                  bgcolor: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  "&:hover": { bgcolor: alpha("#0d3d52", 0.06) },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ lineHeight: 1.2, color: "#0d3d52" }}
              >
                {checklist.name || "Assignment"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {assetDetail.assetName || assetSummary.assetName || "—"} · Ref #
                {task._id?.slice(-8)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label={statusCfg.label}
                size="small"
                sx={{ bgcolor: statusCfg.bg, color: statusCfg.color }}
              />
              <Chip
                label={priorityCfg.label}
                size="small"
                sx={{ bgcolor: priorityCfg.bg, color: priorityCfg.color }}
              />
            </Stack>
          </Box>

          {/* ── Progress Bar ── */}
          <Paper sx={{ px: 3, py: 2, borderRadius: 3, mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" fontWeight={600} color="#0d3d52">
                Checklist Progress
              </Typography>
              <Typography variant="body2" fontWeight={700} color="#0d3d52">
                {progressPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha("#0d3d52", 0.08),
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#0d3d52",
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {answeredRequired.length} of {requiredFields.length} required
              fields completed
            </Typography>
          </Paper>

          {/* ── Asset Information ── */}
          <Paper sx={{ px: 3, py: 2.5, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#0d3d52"
              sx={{ mb: 2 }}
            >
              Asset Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} sx={{ width: "250px" }}>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Asset Name
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {assetDetail.assetName || assetSummary.assetName || "—"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ width: "250px" }}>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Location
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {assetDetail.currentLocation || "—"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ width: "250px" }}>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Category
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {checklist.category
                      ? checklist.category.charAt(0).toUpperCase() +
                        checklist.category.slice(1)
                      : "—"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ width: "250px" }}>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Last Inspection
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {task.completedAt
                      ? new Date(task.completedAt).toLocaleDateString()
                      : "Not yet inspected"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Checklist Fields ── */}
          <Paper sx={{ px: 3, py: 2.5, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#0d3d52"
              sx={{ mb: 2.5 }}
            >
              {checklist.name || "Inspection Details"}
            </Typography>

            {fields.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <AssignmentIcon
                  sx={{
                    fontSize: 48,
                    color: "#c0ccd8",
                    display: "block",
                    mx: "auto",
                    mb: 1,
                  }}
                />
                <Typography variant="body2" color="text.disabled">
                  No fields found for this checklist.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3} divider={<Divider flexItem />}>
                {fields.map((field, idx) => (
                  <Fade in key={field._id} timeout={100 + idx * 30}>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.3,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#0d3d52"
                        >
                          {field.label}
                        </Typography>
                        {field.required && (
                          <Typography
                            component="span"
                            sx={{
                              color: "#d94f4f",
                              fontSize: 14,
                              lineHeight: 1,
                            }}
                          >
                            *
                          </Typography>
                        )}
                        {!field.required && (
                          <Chip
                            label="Optional"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: 10,
                              bgcolor: "#f1f5f9",
                              color: "#94a3b8",
                              ml: 0.5,
                            }}
                          />
                        )}
                      </Box>
                      <FieldRenderer
                        field={field}
                        value={responses[field._id] ?? ""}
                        onChange={handleResponseChange}
                      />
                    </Box>
                  </Fade>
                ))}
              </Stack>
            )}
          </Paper>

          {/* ── Upload Complete Action (general attachments) ── */}
          <Paper sx={{ px: 3, py: 2.5, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#0d3d52"
              sx={{ mb: 1.5 }}
            >
              Upload Complete Action
            </Typography>
            <Box
              component="label"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                border: "1.5px dashed #cbd5e1",
                borderRadius: 2,
                bgcolor: "#fafcff",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: alpha("#0d3d52", 0.03),
                  borderColor: "#0d3d52",
                },
              }}
            >
              <CloudUploadIcon
                sx={{ fontSize: 28, color: "#94a3b8", mb: 0.5 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" color="text.disabled">
                PNG, JPG, HEIC up to 10MB
              </Typography>
              <input
                type="file"
                multiple
                hidden
                onChange={handleAttachFiles}
                accept="image/*,.pdf,.doc,.docx"
              />
            </Box>
            {attachPreviews.length > 0 && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {attachPreviews.map((f, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.5,
                      py: 1,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          bgcolor: alpha("#0d3d52", 0.08),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <DescriptionIcon
                          sx={{ fontSize: 15, color: "#0d3d52" }}
                        />
                      </Box>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
                        {f.name}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        ({(f.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => removeAttach(idx)}>
                      <CloseIcon sx={{ fontSize: 14, color: "#d94f4f" }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* ── Action Buttons ── */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/team")}
              sx={{ px: 3 }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => setSubmitDialogOpen(true)}
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              sx={{
                px: 5,
                bgcolor: "#0d3d52",
                "&:hover": { bgcolor: "#0a2f40" },
              }}
            >
              {submitting ? "Submitting…" : "Submit Inspection"}
            </Button>
          </Box>
        </Container>

        {/* ── Submit Confirmation Dialog ── */}
        <Dialog
          open={submitDialogOpen}
          onClose={() => !submitting && setSubmitDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CheckCircleOutlineIcon sx={{ color: "#0ea472" }} />
            Confirm Submission
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              You are about to submit this inspection. Once submitted, changes
              can only be made if the administrator requests a revision.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              This action cannot be undone without admin approval.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => setSubmitDialogOpen(false)}
              disabled={submitting}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              sx={{
                flex: 2,
                bgcolor: "#0d3d52",
                "&:hover": { bgcolor: "#0a2f40" },
              }}
              startIcon={
                submitting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : null
              }
            >
              {submitting ? "Submitting…" : "Submit Inspection"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 2 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

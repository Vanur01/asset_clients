// Requires: npm install jspdf html2canvas
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
  Stack,
  Checkbox,
  FormControlLabel,
  Rating,
  TextField,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";

// ── MUI Theme ─────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#144c5c", dark: "#0d3a47", light: "#e8f4f7" },
    background: { default: "#f5f6f7", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: "system-ui,-apple-system,sans-serif",
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        outlined: {
          borderColor: "#e5e7eb",
          color: "#374151",
          "&:hover": { background: "#f0f1f2", borderColor: "#e5e7eb" },
        },
        outlinedPrimary: {
          borderColor: "#144c5c",
          color: "#144c5c",
          "&:hover": { background: "#e8f4f7" },
        },
        containedPrimary: {
          background: "#144c5c",
          "&:hover": { background: "#0d3a47" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: "none", border: "1px solid #e8ecef" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: 13,
          "& fieldset": { borderColor: "#dde3e8" },
          "&:hover fieldset": { borderColor: "#144c5c !important" },
          "&.Mui-focused fieldset": { borderColor: "#144c5c !important" },
        },
        input: { padding: "10px 14px" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontSize: 11, height: 24 },
      },
    },
  },
});

// ── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <Box
      sx={{
        background: "#f0f4f6",
        borderRadius: "10px",
        px: 2.25,
        py: 1.5,
        mb: 2.5,
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1a3a47" }}>
        {title}
      </Typography>
    </Box>
  );
}

// ── Field Label ────────────────────────────────────────────────────────────
function FieldLabel({ label, required }) {
  return (
    <Typography
      sx={{ fontSize: 13, fontWeight: 600, color: "#144c5c", mb: 0.75 }}
    >
      {label}
      {required && " *"}
    </Typography>
  );
}

// ── Dynamic Field Renderer ─────────────────────────────────────────────────
function DynamicField({ field, value, onChange }) {
  const handleChange = (val) => onChange(field._id || field.label, val);

  switch (field.type) {
    case "text_input":
      return (
        <TextField
          fullWidth
          size="small"
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13 },
            "& .MuiOutlinedInput-input": { color: "#374151" },
          }}
        />
      );

    case "text_area":
      return (
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13 },
            "& .MuiOutlinedInput-input": { color: "#374151" },
          }}
        />
      );

    case "dropdown":
      return (
        <FormControl fullWidth size="small">
          <Select
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            displayEmpty
            sx={{
              borderRadius: "8px",
              fontSize: 13,
              color: value ? "#374151" : "#9ca3af",
            }}
          >
            <MenuItem value="" disabled sx={{ fontSize: 13, color: "#9ca3af" }}>
              Select {field.label}
            </MenuItem>
            {(field.options || []).map((opt, i) => (
              <MenuItem key={i} value={opt} sx={{ fontSize: 13 }}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case "checkbox":
      return (
        <Box
          sx={{
            border: "1px solid #dde3e8",
            borderRadius: "8px",
            px: 2,
            py: 1.5,
            background: "#fff",
          }}
        >
          <Stack spacing={1}>
            {(field.options || []).map((item, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={
                      Array.isArray(value) ? value.includes(item) : false
                    }
                    onChange={() => {
                      const curr = Array.isArray(value) ? value : [];
                      const next = curr.includes(item)
                        ? curr.filter((v) => v !== item)
                        : [...curr, item];
                      handleChange(next);
                    }}
                    size="small"
                    sx={{
                      color: "#9ca3af",
                      "&.Mui-checked": { color: "#144c5c" },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13, color: "#374151" }}>
                    {item}
                  </Typography>
                }
                sx={{ mx: 0 }}
              />
            ))}
          </Stack>
        </Box>
      );

    case "rating": {
      const max = field.validation?.max || 5;
      return (
        <Box
          sx={{
            border: "1px solid #dde3e8",
            borderRadius: "8px",
            px: 2,
            py: 1.5,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Rating
            value={value || 0}
            onChange={(_, v) => handleChange(v)}
            max={max}
            sx={{
              "& .MuiRating-iconFilled": { color: "#f59e0b" },
              "& .MuiRating-iconEmpty": { color: "#d1d5db" },
            }}
          />
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            {value ? `${value}/${max}` : `[Rating Scale: 1-${max}]`}
          </Typography>
        </Box>
      );
    }

    case "date":
      return (
        <TextField
          fullWidth
          type="date"
          size="small"
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13 },
            "& .MuiOutlinedInput-input": { color: "#374151" },
          }}
        />
      );

    case "image_upload":
    case "file_upload":
      return (
        <Box
          component="label"
          sx={{
            display: "block",
            border: "1.5px dashed #c6d4da",
            borderRadius: "8px",
            py: 5,
            px: 3,
            textAlign: "center",
            background: "#fff",
            cursor: "pointer",
            "&:hover": { borderColor: "#144c5c", background: "#f0f9fb" },
            transition: "all .12s",
          }}
        >
          <input
            type="file"
            hidden
            accept={field.type === "image_upload" ? "image/*" : "*"}
            multiple
            onChange={(e) => handleChange(Array.from(e.target.files))}
          />
          <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="6" fill="#f0f4f6" />
              <rect
                x="9"
                y="11"
                width="22"
                height="18"
                rx="2"
                stroke="#9ca3af"
                strokeWidth="1.4"
              />
              <path
                d="M14 21l4 4 9-8"
                stroke="#9ca3af"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="27" cy="15" r="3" fill="#c6d4da" />
            </svg>
          </Box>
          <Typography sx={{ fontSize: 13, color: "#374151", mb: 0.5 }}>
            {Array.isArray(value) && value.length > 0
              ? `${value.length} file(s) selected`
              : `Drag and drop ${field.type === "image_upload" ? "images" : "files"} here or click to browse`}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#144c5c" }}>
            {field.type === "image_upload"
              ? "Supported: JPG, PNG (Max 10MB)"
              : "Supported: All formats (Max 10MB)"}
          </Typography>
        </Box>
      );

    case "signature":
      return <SignaturePad value={value} onChange={handleChange} />;

    default:
      return (
        <TextField
          fullWidth
          size="small"
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13 },
          }}
        />
      );
  }
}

// ── Signature Pad ──────────────────────────────────────────────────────────
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const last = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };
  const start = (e) => {
    e.preventDefault();
    last.current = getPos(e, canvasRef.current);
    setDrawing(true);
  };
  const move = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a3a47";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.stroke();
    last.current = pos;
    setHasSig(true);
    onChange && onChange(canvasRef.current.toDataURL());
  };
  const end = () => setDrawing(false);
  const clear = () => {
    canvasRef.current.getContext("2d").clearRect(0, 0, 580, 120);
    setHasSig(false);
    onChange && onChange(null);
  };

  return (
    <Box
      sx={{
        border: "1px solid #dde3e8",
        borderRadius: "8px",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", textAlign: "center" }}>
        {!hasSig && (
          <Typography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              fontSize: 13,
              color: "#9ca3af",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            [Signature Pad — draw here]
          </Typography>
        )}
        <canvas
          ref={canvasRef}
          width={580}
          height={120}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          style={{
            display: "block",
            cursor: "crosshair",
            width: "100%",
            height: 120,
            touchAction: "none",
          }}
        />
      </Box>
      <Divider />
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "#144c5c" }}>
          Sign above using mouse or touch
        </Typography>
        {hasSig && (
          <Button
            size="small"
            onClick={clear}
            sx={{ fontSize: 12, color: "#9ca3af", minWidth: 0, p: 0 }}
          >
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── Sidebar Detail Row ─────────────────────────────────────────────────────
function DetailRow({ iconEl, label, value, isTag }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        py: 1.25,
        borderBottom: "1px solid #f0f1f2",
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "8px",
          background: "#e8f4f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {iconEl}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, color: "#9ca3af", mb: 0.25 }}>
          {label}
        </Typography>
        {isTag ? (
          <Stack direction="row" flexWrap="wrap" gap={0.6} mt={0.25}>
            {(Array.isArray(value) ? value : [value]).map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  background: "#e8f4f7",
                  color: "#144c5c",
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1a3a47" }}>
            {value || "—"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
const IconForm = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="2"
      stroke="#144c5c"
      strokeWidth="1.4"
    />
    <path
      d="M5 6h6M5 9h4"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="2.5" stroke="#144c5c" strokeWidth="1.4" />
    <path
      d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconCal = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="2"
      stroke="#144c5c"
      strokeWidth="1.4"
    />
    <path
      d="M5 1v4M11 1v4M2 7h12"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconHash = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M4 6h8M4 10h8M6.5 3l-1 10M10.5 3l-1 10"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconVer = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8h4M9 8h4M8 3v4M8 9v4"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 2h6l6 6-6 6-6-6V2z"
      stroke="#144c5c"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="5.5" cy="5.5" r="1" fill="#144c5c" />
  </svg>
);

// ── Group fields into sections ─────────────────────────────────────────────
function groupFieldsIntoSections(fields) {
  if (!fields || fields.length === 0) return [];
  const basicTypes = ["text_input", "dropdown", "date"];
  const checkTypes = ["checkbox", "rating"];
  const docTypes = ["image_upload", "file_upload", "text_area", "signature"];

  const basic = fields.filter((f) => basicTypes.includes(f.type));
  const checks = fields.filter((f) => checkTypes.includes(f.type));
  const docs = fields.filter((f) => docTypes.includes(f.type));
  const other = fields.filter(
    (f) => ![...basicTypes, ...checkTypes, ...docTypes].includes(f.type),
  );

  const sections = [];
  if (basic.length > 0)
    sections.push({ title: "Basic Information", fields: basic });
  if (checks.length > 0)
    sections.push({ title: "Safety Checks", fields: checks });
  if (docs.length > 0) sections.push({ title: "Documentation", fields: docs });
  if (other.length > 0)
    sections.push({ title: "Additional Fields", fields: other });
  return sections.length > 0 ? sections : [{ title: "Form Fields", fields }];
}

// ── Loading Skeleton ───────────────────────────────────────────────────────
function FormSkeleton() {
  return (
    <Paper sx={{ borderRadius: "14px", p: { xs: 3, md: 4.5 } }}>
      <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
      <Skeleton
        variant="rectangular"
        height={40}
        sx={{ mb: 2, borderRadius: 2 }}
      />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={50}
          sx={{ mb: 2, borderRadius: 2 }}
        />
      ))}
    </Paper>
  );
}

// ── Build API payload (matches POST /checklists body exactly) ──────────────
// Strips user-entered values; sends only the checklist schema fields.
// The backend persists field definitions — not user responses.
function buildChecklistPayload(checklist) {
  return {
    name: checklist.name,
    description: checklist.description || "",
    checklistType: checklist.checklistType || "custom",
    isGlobal: checklist.isGlobal ?? false,
    category: checklist.category || "general",
    tags: checklist.tags || [],
    fields: (checklist.fields || []).map((field, idx) => {
      const f = {
        type: field.type,
        label: field.label,
        required: field.required ?? false,
        order: field.order ?? idx,
      };
      if (field.placeholder) f.placeholder = field.placeholder;
      if (field.options && field.options.length > 0) f.options = field.options;
      if (field.validation) f.validation = field.validation;
      return f;
    }),
  };
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function CustomChecklist({ checklistId }) {
  const navigate = useNavigate();

  // Pull createChecklist (handles auth + axios) and helpers from context
  const {
    createChecklist,
    getChecklistById,
    convertAPIToUIField,
    loading,
    clearMessages,
  } = useChecklistBuilder();

  const [checklist, setChecklist] = useState(null);
  const [uiFields, setUiFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fetchError, setFetchError] = useState(null);
  const formRef = useRef(null);

  // ── Fetch checklist on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!checklistId) {
      // Demo mode — no real checklistId provided
      const demoChecklist = {
        _id: "demo-001",
        name: "Equipment Safety Inspection",
        description: "Form to document equipment safety inspection results.",
        checklistType: "custom",
        isGlobal: false,
        category: "safety",
        tags: ["safety", "equipment", "inspection"],
        version: 1,
        status: "published",
        createdAt: "2024-11-27T00:00:00.000Z",
        createdBy: { name: "Customer Admin" },
        fields: [
          {
            _id: "f1",
            type: "text_input",
            label: "Equipment Name",
            placeholder: "Enter equipment name",
            required: true,
            order: 0,
          },
          {
            _id: "f2",
            type: "text_input",
            label: "Equipment ID",
            placeholder: "Enter equipment ID",
            required: true,
            order: 1,
          },
          {
            _id: "f3",
            type: "dropdown",
            label: "Location",
            required: true,
            options: ["Warehouse A", "Warehouse B", "Floor 1", "Floor 2"],
            order: 2,
          },
          {
            _id: "f4",
            type: "dropdown",
            label: "Equipment Category",
            required: true,
            options: ["Heavy Machinery", "Electronics", "Tools", "Vehicles"],
            order: 3,
          },
          {
            _id: "f5",
            type: "date",
            label: "Inspection Date",
            required: true,
            order: 4,
          },
          {
            _id: "f6",
            type: "text_input",
            label: "Inspector Name",
            required: true,
            order: 5,
          },
          {
            _id: "f7",
            type: "checkbox",
            label: "Pre-Inspection Checklist",
            required: true,
            options: [
              "Equipment is powered off",
              "Safety gear is available",
              "Area is clear of hazards",
              "Documentation is ready",
            ],
            order: 6,
          },
          {
            _id: "f8",
            type: "rating",
            label: "Overall Equipment Condition",
            required: true,
            validation: { min: 1, max: 5 },
            order: 7,
          },
          {
            _id: "f9",
            type: "image_upload",
            label: "Upload Equipment Photos",
            required: false,
            order: 8,
          },
          {
            _id: "f10",
            type: "text_area",
            label: "Additional Notes",
            required: false,
            order: 9,
          },
          {
            _id: "f11",
            type: "signature",
            label: "Inspector Signature",
            required: true,
            order: 10,
          },
        ],
      };
      setChecklist(demoChecklist);
      setUiFields(demoChecklist.fields.map((f) => ({ ...f, id: f._id })));
      return;
    }

    const fetchChecklist = async () => {
      const result = await getChecklistById(checklistId);
      if (result.success) {
        const data = result.data?.data || result.data;
        setChecklist(data);
        const fields = (data.fields || [])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((f) => convertAPIToUIField(f));
        setUiFields(fields);
      } else {
        setFetchError(result.error || "Failed to load checklist");
      }
    };
    fetchChecklist();
  }, [checklistId, getChecklistById, convertAPIToUIField]);

  // ── Field value change ──────────────────────────────────────────────────
  const handleFieldChange = useCallback((key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Clear form ──────────────────────────────────────────────────────────
  const handleClear = () => {
    setFormValues({});
    setSubmitted(false);
  };

  // ── Submit — calls createChecklist from context (auth-aware, axios) ─────
  //
  // What we POST to /checklists:
  //   { name, description, checklistType, isGlobal, category, tags, fields[] }
  //
  // The fields[] array carries the checklist schema (type, label, options…).
  // User-entered formValues are NOT part of this POST — they are stored
  // in a separate submissions endpoint. Here we are saving the checklist
  // definition itself so it appears in /admin/checklists.
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!checklist) return;

    setSubmitting(true);
    clearMessages();

    try {
      const payload = buildChecklistPayload(checklist);
      const result = await createChecklist(payload);

      if (result.success) {
        setSubmitted(true);
        setSnackbar({
          open: true,
          message: "Checklist saved successfully!",
          severity: "success",
        });
        // Redirect after snackbar is visible
        setTimeout(() => navigate("/admin/checklists"), 1200);
      } else {
        throw new Error(result.error || "Failed to save checklist");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Submission failed. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Download as PDF ─────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!checklist || !formRef.current) return;
    setPdfDownloading(true);
    setSnackbar({
      open: true,
      message: "Generating PDF, please wait…",
      severity: "info",
    });
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const element = formRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;

      // Header
      pdf.setFillColor(20, 76, 92);
      pdf.rect(0, 0, pageW, 14, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(checklist.name || "Checklist Form", margin, 9.5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageW - margin,
        9.5,
        { align: "right" },
      );

      const startY = 18;
      const availableH = pageH - startY - margin;
      let yOffset = 0,
        page = 1;

      while (yOffset < imgH) {
        if (page > 1) {
          pdf.addPage();
          pdf.setFillColor(20, 76, 92);
          pdf.rect(0, 0, pageW, 14, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(checklist.name || "Checklist Form", margin, 9.5);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.text(`Page ${page}`, pageW - margin, 9.5, { align: "right" });
        }

        const sliceH = Math.min(availableH, imgH - yOffset);
        const srcY = (yOffset / imgH) * canvas.height;
        const srcH = (sliceH / imgH) * canvas.height;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        sliceCanvas
          .getContext("2d")
          .drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            srcH,
            0,
            0,
            canvas.width,
            srcH,
          );

        pdf.addImage(
          sliceCanvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          margin,
          startY,
          usableW,
          sliceH,
        );
        yOffset += sliceH;
        page++;
      }

      // Footer
      pdf.setFillColor(240, 244, 246);
      pdf.rect(0, pageH - 8, pageW, 8, "F");
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      const formId =
        checklist._id !== "demo-001" ? checklist._id : "FORM-2024-001";
      pdf.text(
        `Form ID: ${formId} | v${checklist.version || 1}.0 | ${checklist.category || "general"}`,
        margin,
        pageH - 2.5,
      );
      pdf.text(`Total pages: ${page - 1}`, pageW - margin, pageH - 2.5, {
        align: "right",
      });

      pdf.save(
        `${(checklist.name || "checklist").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      setSnackbar({
        open: true,
        message: "PDF downloaded successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      setSnackbar({
        open: true,
        message: "Failed to generate PDF. Please try again.",
        severity: "error",
      });
    } finally {
      setPdfDownloading(false);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────
  const sections = groupFieldsIntoSections(checklist?.fields || []);
  const createdAt = checklist?.createdAt
    ? new Date(checklist.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const createdByName =
    typeof checklist?.createdBy === "object"
      ? checklist?.createdBy?.name || checklist?.createdBy?.email || "Admin"
      : "Admin";

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh" }}>
        {/* ── AppBar ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            width: "1175px",
            borderRadius: 2,
            marginLeft: "30px",
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              minHeight: "60px !important",
              px: 3.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <IconButton
                size="small"
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  width: 32,
                  height: 32,
                }}
                onClick={() => navigate("/admin/checklists")}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="#374151"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
              <Box>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.3,
                  }}
                >
                  {loading && !checklist
                    ? "Loading..."
                    : checklist?.name || "Custom Checklist Builder"}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                  {checklist?.description ||
                    "Create and manage inspection checklists and review customer requests"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.25}>
              <Button
                variant="outlined"
                color="primary"
                disabled={!checklist || loading || pdfDownloading}
                onClick={handleDownloadPDF}
                startIcon={
                  pdfDownloading ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1v8M4 6l3 3 3-3M2 11h10"
                        stroke="#144c5c"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )
                }
                sx={{ fontSize: 13 }}
              >
                {pdfDownloading ? "Generating PDF…" : "Download Custom Form"}
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* ── Body ── */}
        <Box sx={{ width: "1400px", p: { xs: 2, md: 3.5 } }}>
          <Grid container spacing={2.5} alignItems="flex-start">
            {/* ── Form Column ── */}
            <Grid item xs={12} md={9} sx={{ width: "800px" }}>
              {/* Error state */}
              {fetchError && (
                <Paper sx={{ borderRadius: "14px", p: 4, textAlign: "center" }}>
                  <Typography sx={{ color: "#dc2626", fontSize: 15, mb: 1 }}>
                    {fetchError}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </Paper>
              )}

              {/* Loading skeleton */}
              {loading && !checklist && !fetchError && <FormSkeleton />}

              {/* Form */}
              {checklist && !fetchError && (
                <Paper
                  ref={formRef}
                  sx={{ borderRadius: "14px", p: { xs: 3, md: 4.5 } }}
                >
                  {/* Form Title */}
                  <Box
                    sx={{ mb: 3.5, pb: 2.5, borderBottom: "1px solid #f0f1f2" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      mb={0.75}
                    >
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 1000,
                          color: "#1a3a47",
                        }}
                      >
                        {checklist.name}
                      </Typography>
                      {checklist.status && (
                        <Chip
                          label={checklist.status}
                          size="small"
                          sx={{
                            background:
                              checklist.status === "published"
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              checklist.status === "published"
                                ? "#166534"
                                : "#92400e",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    </Stack>
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                      {checklist.description || "Complete all fields below."}
                    </Typography>
                  </Box>

                  {/* ── Dynamic Sections ── */}
                  {sections.map((section, si) => (
                    <Box key={si} sx={{ mb: 3.5 }}>
                      <SectionHeader title={section.title} />
                      {(() => {
                        const inlineTypes = ["text_input", "dropdown", "date"];
                        const rows = [];
                        let i = 0;
                        const sFields = section.fields;
                        while (i < sFields.length) {
                          const curr = sFields[i];
                          const next = sFields[i + 1];
                          if (
                            inlineTypes.includes(curr.type) &&
                            next &&
                            inlineTypes.includes(next.type)
                          ) {
                            rows.push({ type: "pair", fields: [curr, next] });
                            i += 2;
                          } else {
                            rows.push({ type: "single", field: curr });
                            i += 1;
                          }
                        }
                        return rows.map((row, ri) => {
                          if (row.type === "pair") {
                            return (
                              <Grid
                                container
                                spacing={2.5}
                                sx={{ mb: 2.5 }}
                                key={ri}
                              >
                                {row.fields.map((field) => {
                                  const key = field._id || field.label;
                                  return (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={6}
                                      key={key}
                                      sx={{ width: "300px" }}
                                    >
                                      <FieldLabel
                                        label={field.label}
                                        required={field.required}
                                      />
                                      <DynamicField
                                        field={field}
                                        value={formValues[key]}
                                        onChange={handleFieldChange}
                                      />
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            );
                          }
                          const field = row.field;
                          const key = field._id || field.label;
                          return (
                            <Box sx={{ mb: 2.5 }} key={key}>
                              <FieldLabel
                                label={field.label}
                                required={field.required}
                              />
                              <DynamicField
                                field={field}
                                value={formValues[key]}
                                onChange={handleFieldChange}
                              />
                            </Box>
                          );
                        });
                      })()}
                    </Box>
                  ))}

                  {/* ── Footer ── */}
                  <Divider sx={{ mb: 2.5 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                      {checklist._id !== "demo-001"
                        ? `Form ID: ${checklist._id}`
                        : "Form ID: FORM-2024-001"}{" "}
                      | Last Updated: {createdAt}
                    </Typography>
                    <Stack direction="row" spacing={1.25}>
                      <Button
                        variant="outlined"
                        sx={{ fontSize: 13 }}
                        onClick={handleClear}
                        disabled={submitting}
                      >
                        Clear Checklist
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{ fontSize: 13, minWidth: 140 }}
                        startIcon={
                          submitting ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : null
                        }
                      >
                        {submitting
                          ? "Submitting..."
                          : submitted
                            ? "✓ Submitted!"
                            : "Submit Inspection"}
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              )}
            </Grid>

            {/* ── Sidebar ── */}
            <Grid item xs={12} md={3} sx={{ width:"355px"}}>
              <Paper
                sx={{
                  borderRadius: "14px",
                  p: 2.5,
                  position: { md: "sticky" },
                  top: { md: 76 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1a3a47",
                    mb: 0.5,
                  }}
                >
                  Form Details
                </Typography>

                {loading && !checklist ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
                    ))}
                  </>
                ) : checklist ? (
                  <>
                    <DetailRow
                      iconEl={<IconForm />}
                      label="Form Name"
                      value={checklist.name}
                    />
                    <DetailRow
                      iconEl={<IconUser />}
                      label="Created By"
                      value={createdByName}
                    />
                    <DetailRow
                      iconEl={<IconCal />}
                      label="Created On"
                      value={createdAt}
                    />
                    <DetailRow
                      iconEl={<IconForm />}
                      label="Category"
                      value={checklist.category || "Custom Form"}
                    />
                    <DetailRow
                      iconEl={<IconHash />}
                      label="Total Fields"
                      value={String(checklist.fields?.length || 0)}
                    />
                    <DetailRow
                      iconEl={<IconVer />}
                      label="Form Version"
                      value={`v${checklist.version || 1}.0`}
                    />
                    {checklist.tags?.length > 0 && (
                      <DetailRow
                        iconEl={<IconTag />}
                        label="Tags"
                        value={checklist.tags}
                        isTag
                      />
                    )}
                  </>
                ) : null}

                {/* Completion progress */}
                {checklist &&
                  (() => {
                    const required = (checklist.fields || []).filter(
                      (f) => f.required,
                    );
                    const filled = required.filter((f) => {
                      const key = f._id || f.label;
                      const val = formValues[key];
                      return (
                        val !== undefined &&
                        val !== null &&
                        val !== "" &&
                        !(Array.isArray(val) && val.length === 0)
                      );
                    });
                    const pct =
                      required.length > 0
                        ? Math.round((filled.length / required.length) * 100)
                        : 100;
                    return (
                      <Box
                        sx={{
                          mt: 2,
                          background: "#f0f4f6",
                          borderRadius: "10px",
                          px: 2,
                          py: 1.5,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mb={0.75}
                        >
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#1a3a47",
                            }}
                          >
                            Required Fields
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#144c5c",
                              fontWeight: 700,
                            }}
                          >
                            {filled.length}/{required.length}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            background: "#dde3e8",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${pct}%`,
                              background: pct === 100 ? "#16a34a" : "#144c5c",
                              borderRadius: 3,
                              transition: "width .3s ease",
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{ fontSize: 11, color: "#9ca3af", mt: 0.5 }}
                        >
                          {pct === 100
                            ? "All required fields completed ✓"
                            : `${100 - pct}% remaining`}
                        </Typography>
                      </Box>
                    );
                  })()}

                {/* Ready to Assign */}
                <Box
                  sx={{
                    mt: 2,
                    background: "#f0f4f6",
                    borderRadius: "10px",
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:hover": { background: alpha("#144c5c", 0.08) },
                    transition: "background .12s",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7.5l3 3L12 3"
                      stroke="#144c5c"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 500, color: "#144c5c" }}
                  >
                    Ready to Assign
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: "10px", fontSize: 13 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

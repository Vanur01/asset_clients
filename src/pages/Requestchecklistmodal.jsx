// RequestChecklistModal.jsx — Redesigned
// Clean multi-step form with fully responsive layout and consistent field widths.
// Step 1: Basics  |  Step 2: Details + files
// API: submitRequest(FormData) from RequestChecklistContext

import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  alpha,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Repeat as RepeatIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  Tag as TagIcon,
} from "@mui/icons-material";
import { useRequestChecklist } from "../context/RequestChecklistContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#0d4a5c";
const PRIMARY_DARK = "#092f3a";
const PRIMARY_LIGHT = "#e3f0f4";

const CATEGORIES = [
  "Safety & Compliance",
  "Quality Assurance",
  "Maintenance",
  "HR & Onboarding",
  "Operations",
  "Audit",
  "Environmental",
  "Security",
  "Other",
];

const URGENCY_LEVELS = [
  {
    value: "low",
    label: "Low",
    desc: "A few weeks",
    color: "#2e7d32",
    bg: "#f0faf0",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Within a week",
    color: "#c17000",
    bg: "#fff8ee",
  },
  {
    value: "high",
    label: "High",
    desc: "Within 2 days",
    color: "#c62828",
    bg: "#fff0f0",
  },
  {
    value: "critical",
    label: "Critical",
    desc: "Immediately",
    color: "#7f1d1d",
    bg: "#fdf0f0",
  },
];

const USAGE_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "as_needed", label: "As needed" },
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
];

const INIT_FORM = {
  checklistName: "",
  category: "",
  detailedDescription: "",
  businessJustification: "",
  urgencyLevel: "",
  expectedUsageFrequency: "",
  numberOfTeamMembers: "",
  additionalNotes: "",
};
const INIT_ERRORS = {
  checklistName: "",
  category: "",
  detailedDescription: "",
  businessJustification: "",
  urgencyLevel: "",
};

const getFileExt = (name) => name.split(".").pop().toLowerCase();
const fmtSize = (b) =>
  b < 1024
    ? `${b} B`
    : b < 1024 * 1024
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1024 / 1024).toFixed(1)} MB`;

// ─── Step dot ─────────────────────────────────────────────────────────────────
const StepDot = ({ num, active, done }) => (
  <Box
    sx={{
      width: 26,
      height: 26,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      fontSize: 12,
      flexShrink: 0,
      transition: "all 0.2s ease",
      bgcolor: done
        ? "rgba(255,255,255,0.3)"
        : active
          ? "#fff"
          : "rgba(255,255,255,0.12)",
      color: done ? "#fff" : active ? PRIMARY : "rgba(255,255,255,0.4)",
    }}
  >
    {done ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : num}
  </Box>
);

// ─── Urgency card ─────────────────────────────────────────────────────────────
const UrgencyCard = ({ cfg, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      p: "8px 6px",
      borderRadius: "8px",
      border: "0.5px solid",
      borderColor: selected ? cfg.color : "divider",
      bgcolor: selected ? cfg.bg : "grey.50",
      cursor: "pointer",
      width:"132px",
      textAlign: "center",
      transition: "all 0.15s ease",
      "&:hover": { borderColor: cfg.color },
    }}
  >
    <Typography
      variant="caption"
      display="block"
      fontWeight={600}
      sx={{
        color: selected ? cfg.color : "text.primary",
        fontSize: 12,
        mb: 0.25,
      }}
    >
      {cfg.label}
    </Typography>
    <Typography
      variant="caption"
      display="block"
      sx={{ color: "text.disabled", fontSize: 10.5, lineHeight: 1.3 }}
    >
      {cfg.desc}
    </Typography>
  </Box>
);

// ─── Main component ────────────────────────────────────────────────────────────
export default function RequestChecklistModal({ open, onClose, onSuccess }) {
  const { submitRequest } = useRequestChecklist();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState(INIT_ERRORS);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const reset = useCallback(() => {
    setStep(0);
    setForm(INIT_FORM);
    setErrors(INIT_ERRORS);
    setFiles([]);
    setFileError("");
    setApiError("");
    setDragActive(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    reset();
    onClose();
  }, [submitting, reset, onClose]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (apiError) setApiError("");
  };

  const validateStep0 = () => {
    const e = { ...INIT_ERRORS };
    let ok = true;
    if (!form.checklistName.trim()) {
      e.checklistName = "Required";
      ok = false;
    } else if (form.checklistName.trim().length < 3) {
      e.checklistName = "Min 3 characters";
      ok = false;
    }
    if (!form.category) {
      e.category = "Select a category";
      ok = false;
    }
    if (!form.urgencyLevel) {
      e.urgencyLevel = "Select urgency";
      ok = false;
    }
    setErrors(e);
    return ok;
  };

  const validateStep1 = () => {
    const e = { ...INIT_ERRORS };
    let ok = true;
    if (!form.detailedDescription.trim()) {
      e.detailedDescription = "Required";
      ok = false;
    } else if (form.detailedDescription.trim().length < 20) {
      e.detailedDescription = "Min 20 characters";
      ok = false;
    }
    if (!form.businessJustification.trim()) {
      e.businessJustification = "Required";
      ok = false;
    } else if (form.businessJustification.trim().length < 10) {
      e.businessJustification = "Min 10 characters";
      ok = false;
    }
    setErrors(e);
    return ok;
  };

  const processFiles = (raw) => {
    setFileError("");
    const acc = [],
      rej = [];
    Array.from(raw).forEach((f) => {
      const ext = getFileExt(f.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) rej.push(`${f.name}: unsupported`);
      else if (f.size > MAX_FILE_SIZE_BYTES) rej.push(`${f.name}: too large`);
      else acc.push({ file: f, name: f.name, size: f.size });
    });
    if (rej.length) setFileError(rej.join(" · "));
    setFiles((p) => {
      const ex = new Set(p.map((x) => x.name));
      return [...p, ...acc.filter((x) => !ex.has(x.name))];
    });
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const fd = new FormData();
      fd.append("checklistName", form.checklistName.trim());
      fd.append("category", form.category);
      fd.append("detailedDescription", form.detailedDescription.trim());
      fd.append("businessJustification", form.businessJustification.trim());
      fd.append("urgencyLevel", form.urgencyLevel);
      if (form.expectedUsageFrequency)
        fd.append("expectedUsageFrequency", form.expectedUsageFrequency);
      if (form.numberOfTeamMembers)
        fd.append(
          "numberOfTeamMembers",
          parseInt(form.numberOfTeamMembers, 10) || 0,
        );
      if (form.additionalNotes.trim())
        fd.append("additionalNotes", form.additionalNotes.trim());
      files.forEach(({ file }) => fd.append("referenceFiles", file));

      const result = await submitRequest(fd);
      if (result?.success) {
        onSuccess?.(result.data);
        handleClose();
      } else
        setApiError(
          result?.error ||
            result?.message ||
            "Failed to submit. Please try again.",
        );
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = step === 0 ? 40 : 80;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={submitting}
      PaperProps={{
        sx: {
          borderRadius: "14px",
          overflow: "hidden",
          maxHeight: "94vh",
          m: { xs: 1.5, sm: 3 },
        },
      }}
    >
      {/* ── Progress bar ── */}
      <LinearProgress
        variant="determinate"
        value={submitting ? 100 : progressPct}
        sx={{
          height: 3,
          bgcolor: alpha(PRIMARY, 0.1),
          "& .MuiLinearProgress-bar": {
            bgcolor: submitting ? "#2e7d32" : PRIMARY,
            transition: "width 0.4s ease",
          },
        }}
      />

      {/* ── Header ── */}
      <Box sx={{ bgcolor: PRIMARY, px: 2.75, pt: 2.5, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.75,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={500}
              color="white"
              sx={{ lineHeight: 1.3 }}
            >
              Request a new checklist
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: alpha("#fff", 0.55), display: "block", mt: 0.25 }}
            >
              Sent to Super Admin for review and build
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={submitting}
            size="small"
            sx={{
              color: "white",
              ml: 1.5,
              mt: 0.25,
              bgcolor: alpha("#fff", 0.1),
              "&:hover": { bgcolor: alpha("#fff", 0.2) },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Step indicator */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StepDot
            num={<CheckCircleIcon sx={{ fontSize: 14 }} />}
            active={step === 0}
            done={step > 0}
          />
          <Typography
            variant="caption"
            fontWeight={500}
            sx={{
              fontSize: 11,
              color: step === 0 ? "#fff" : alpha("#fff", 0.45),
            }}
          >
            Basics
          </Typography>

          <Box
            sx={{
              flex: 1,
              height: "1.5px",
              borderRadius: "1px",
              mx: 0.5,
              bgcolor: step > 0 ? alpha("#fff", 0.5) : alpha("#fff", 0.18),
              transition: "background 0.3s",
            }}
          />

          <StepDot num={2} active={step === 1} done={false} />
          <Typography
            variant="caption"
            fontWeight={500}
            sx={{
              fontSize: 11,
              color: step === 1 ? "#fff" : alpha("#fff", 0.45),
            }}
          >
            Details & files
          </Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <DialogContent
        sx={{
          p: "20px 22px 10px",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#dde6ea", borderRadius: 2 },
        }}
      >
        {apiError && (
          <Alert
            severity="error"
            onClose={() => setApiError("")}
            sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
          >
            {apiError}
          </Alert>
        )}

        {/* ── STEP 0: Basics ── */}
        {step === 0 && (
          <Stack spacing={1.75}>
            {/* Checklist name — full width */}
            <TextField
              fullWidth
              label="Checklist name *"
              placeholder="e.g. Fire Safety Inspection"
              value={form.checklistName}
              onChange={set("checklistName")}
              error={!!errors.checklistName}
              helperText={errors.checklistName}
              disabled={submitting}
              inputProps={{ maxLength: 120 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon
                      sx={{ fontSize: 16, color: alpha(PRIMARY, 0.5) }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Category + Frequency — equal halves */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6} sx={{width:"270px"}}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={form.category}
                    onChange={set("category")}
                    label="Category *"
                    disabled={submitting}
                    startAdornment={
                      <InputAdornment position="start">
                        <TagIcon
                          sx={{ fontSize: 16, color: alpha(PRIMARY, 0.5) }}
                        />
                      </InputAdornment>
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.75 }}
                    >
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} sx={{width:"270px"}}>
                <FormControl fullWidth>
                  <InputLabel>Usage frequency</InputLabel>
                  <Select
                    value={form.expectedUsageFrequency}
                    onChange={set("expectedUsageFrequency")}
                    label="Usage frequency"
                    disabled={submitting}
                    startAdornment={
                      <InputAdornment position="start">
                        <RepeatIcon
                          sx={{ fontSize: 16, color: alpha(PRIMARY, 0.5) }}
                        />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Not specified</em>
                    </MenuItem>
                    {USAGE_FREQUENCIES.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Urgency cards */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: 12, mb: 0.75 }}
              >
                Urgency level *
              </Typography>
              <Grid container spacing={1}>
                {URGENCY_LEVELS.map((u) => (
                  <Grid item xs={6} sm={3} key={u.value}>
                    <UrgencyCard
                      cfg={u}
                      selected={form.urgencyLevel === u.value}
                      onClick={() => {
                        setForm((p) => ({ ...p, urgencyLevel: u.value }));
                        if (errors.urgencyLevel)
                          setErrors((p) => ({ ...p, urgencyLevel: "" }));
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              {errors.urgencyLevel && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {errors.urgencyLevel}
                </Typography>
              )}
            </Box>

            {/* Team members — full width */}
            <TextField
              fullWidth
              type="number"
              label="Team members using this (optional)"
              placeholder="e.g. 15"
              value={form.numberOfTeamMembers}
              onChange={set("numberOfTeamMembers")}
              disabled={submitting}
              inputProps={{ min: 1, max: 10000 }}
              onKeyDown={(e) =>
                ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupIcon
                      sx={{ fontSize: 16, color: alpha(PRIMARY, 0.5) }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <Stack spacing={1.75}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detailed description *"
              placeholder="Describe the fields, sections, and how this checklist will be used…"
              value={form.detailedDescription}
              onChange={set("detailedDescription")}
              error={!!errors.detailedDescription}
              helperText={
                errors.detailedDescription ||
                `${form.detailedDescription.length} / 2000 — be specific about fields, sections, special requirements`
              }
              disabled={submitting}
              inputProps={{ maxLength: 2000 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Business justification *"
              placeholder="Explain why this checklist is needed and how it benefits operations…"
              value={form.businessJustification}
              onChange={set("businessJustification")}
              error={!!errors.businessJustification}
              helperText={
                errors.businessJustification ||
                `${form.businessJustification.length} / 1000`
              }
              disabled={submitting}
              inputProps={{ maxLength: 1000 }}
            />

            {/* File upload */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ mb: 0.75 }}
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ fontSize: 13 }}
                >
                  Reference files
                </Typography>
                <Tooltip
                  title={`Accepted: ${ALLOWED_EXTENSIONS.join(", ")} · Max ${MAX_FILE_SIZE_MB} MB`}
                >
                  <InfoIcon
                    sx={{
                      fontSize: 14,
                      color: "text.disabled",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
                <Typography variant="caption" color="text.disabled">
                  (optional)
                </Typography>
              </Stack>

              <Box
                onClick={() => !submitting && fileRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.length)
                    processFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                sx={{
                  border: "1.5px dashed",
                  borderColor: dragActive
                    ? PRIMARY
                    : fileError
                      ? "error.main"
                      : "divider",
                  borderRadius: 2,
                  p: 2.5,
                  textAlign: "center",
                  cursor: submitting ? "not-allowed" : "pointer",
                  bgcolor: dragActive ? alpha(PRIMARY, 0.03) : "grey.50",
                  transition: "all 0.15s ease",
                  "&:hover": !submitting
                    ? { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.02) }
                    : {},
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                  onChange={(e) => {
                    if (e.target.files?.length) processFiles(e.target.files);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                  disabled={submitting}
                />
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: alpha(PRIMARY, 0.08),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 0.75,
                  }}
                >
                  <CloudUploadIcon sx={{ color: PRIMARY, fontSize: 18 }} />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                  sx={{ fontSize: 13 }}
                >
                  {dragActive ? "Drop files here" : "Click to upload"}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  PDF, DOC, XLS, images · max {MAX_FILE_SIZE_MB} MB
                </Typography>
              </Box>

              {fileError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {fileError}
                </Typography>
              )}

              {files.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {files.map(({ name, size }, idx) => (
                    <Box
                      key={`${name}-${idx}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: "5px 10px",
                        borderRadius: 1.5,
                        border: "0.5px solid",
                        borderColor: "divider",
                        bgcolor: "grey.50",
                      }}
                    >
                      <AttachFileIcon
                        sx={{
                          fontSize: 13,
                          color: "text.disabled",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ flexShrink: 0 }}
                      >
                        {fmtSize(size)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFiles((p) => p.filter((_, i) => i !== idx))
                        }
                        disabled={submitting}
                        sx={{
                          p: 0.25,
                          color: "text.disabled",
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional notes (optional)"
              placeholder="Any other context to help the Super Admin understand your requirements…"
              value={form.additionalNotes}
              onChange={set("additionalNotes")}
              disabled={submitting}
              inputProps={{ maxLength: 500 }}
              helperText={`${form.additionalNotes.length} / 500`}
            />
          </Stack>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          px: 2.75,
          py: 1.75,
          borderTop: "0.5px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          justifyContent: "space-between",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          disabled={submitting}
          onClick={step === 0 ? handleClose : () => setStep(0)}
          startIcon={step > 0 ? <ArrowBackIcon sx={{ fontSize: 13 }} /> : null}
          sx={{ minWidth: 90, fontSize: 13, borderColor: "divider" }}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step === 0 ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (validateStep0()) setStep(1);
            }}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            sx={{
              minWidth: 130,
              fontSize: 13,
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: PRIMARY_DARK },
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              minWidth: 155,
              fontSize: 13,
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: PRIMARY_DARK },
            }}
          >
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

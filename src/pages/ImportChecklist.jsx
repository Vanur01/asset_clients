// pages/admin/ImportChecklistFields.jsx — Redesigned with Enhanced Design & Dummy Template Download

import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Rating,
  Alert,
  Snackbar,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,Container,
  StepContent,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  alpha,
  Tooltip,
  Grid,
  Fade,
  Grow,
} from "@mui/material";
import {
  ArrowBack,
  Visibility,
  UploadFile,
  InsertDriveFile,
  Close,
  CheckCircle,
  TableChart,
  CloudUpload,
  Description,
  Rule,
  Download,
  Info,
  Checklist as ChecklistIcon,
  Warning,
  FilePresent,
  Check as CheckIcon,
  Clear as ClearIcon,
  HelpOutline,
} from "@mui/icons-material";
import { useChecklistBuilder } from "../context/ChecklistBuilderContext";
import { useNavigate } from "react-router-dom";

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  primary: "#0d474e",
  primaryDark: "#10424b",
  primaryLight: "#E8F3F0",
  primaryGlow: "rgba(10, 92, 75, 0.12)",
  primarySoft: "rgba(10, 92, 75, 0.05)",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAF9",
  border: "#E9EDEC",
  text: {
    primary: "#1A2C28",
    secondary: "#5A6E68",
    disabled: "#9DAEAA",
    hint: "#C2D0CC",
  },
  success: "#0A5C4B",
  error: "#C73A2B",
  warning: "#B96F0F",
  info: "#2E7D8A",
};

// ─── Styled Components ─────────────────────────────────────────────────────
const DropZone = ({ isDragging, hasFile, children, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      border: `2px dashed ${isDragging ? C.primary : hasFile ? C.success : C.border}`,
      borderRadius: "24px",
      backgroundColor: isDragging
        ? alpha(C.primary, 0.04)
        : hasFile
          ? alpha(C.success, 0.02)
          : "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: { xs: 4, sm: 5, md: 6 },
      px: { xs: 2, sm: 3 },
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        borderColor: C.primary,
        backgroundColor: alpha(C.primary, 0.04),
        transform: "scale(1.01)",
      },
    }}
  >
    {children}
  </Box>
);

export default function ImportChecklistFields() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { importFromExcel, loading, error, success, clearMessages } =
    useChecklistBuilder();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importResponse, setImportResponse] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [activeStep, setActiveStep] = useState(0);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setSelectedFile(file);
      setActiveStep(1);
      showSnackbar("File selected successfully!", "success");
    } else {
      showSnackbar("Please upload a valid Excel file (.xlsx or .xls)", "error");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setSelectedFile(file);
      setActiveStep(1);
      showSnackbar("File selected successfully!", "success");
    } else if (file) {
      showSnackbar("Please upload a valid Excel file (.xlsx or .xls)", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Download dummy template
  const handleDownloadTemplate = async () => {
    setDownloadLoading(true);
    try {
      // Create dummy Excel file data
      const dummyData = [
        [
          "Section",
          "Field Name",
          "Field Type",
          "Required",
          "Options",
          "Description",
        ],
        [
          "General Information",
          "Full Name",
          "text_input",
          "Yes",
          "",
          "User's full name",
        ],
        [
          "General Information",
          "Email Address",
          "email_input",
          "Yes",
          "",
          "Valid email address",
        ],
        [
          "General Information",
          "Phone Number",
          "phone_input",
          "No",
          "",
          "Contact number",
        ],
        [
          "Assessment",
          "Satisfaction Rating",
          "rating",
          "Yes",
          "",
          "Rate from 1-5",
        ],
        ["Assessment", "Feedback", "text_area", "No", "", "Detailed feedback"],
        [
          "Assessment",
          "Issue Type",
          "dropdown",
          "Yes",
          "Technical,Billing,General,Other",
          "Select issue category",
        ],
        [
          "Compliance",
          "Terms Accepted",
          "checkbox",
          "Yes",
          "",
          "Check if accepted",
        ],
        [
          "Compliance",
          "Signature",
          "signature",
          "Yes",
          "",
          "Digital signature",
        ],
        [
          "Additional",
          "Attachment",
          "file_upload",
          "No",
          "",
          "Supporting documents",
        ],
      ];

      // Create CSV content (simpler for browser download)
      const csvContent = dummyData
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "checklist_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSnackbar(
        "Template downloaded successfully! Open in Excel and save as .xlsx",
        "success",
      );
    } catch (err) {
      showSnackbar("Failed to download template", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showSnackbar("Please select a file first", "error");
      return;
    }

    setImporting(true);
    const result = await importFromExcel(selectedFile);
    setImporting(false);

    if (result.success) {
      setImportResponse(result.data);
      setImportSuccess(true);
      setActiveStep(2);
      showSnackbar("Checklist imported successfully!", "success");
    } else {
      showSnackbar(result.error || "Failed to import checklist", "error");
    }
  };

  const handlePreview = () => {
    if (!selectedFile) {
      showSnackbar("Please select a file first", "error");
      return;
    }
    setPreviewOpen(true);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResponse(null);
    setImportSuccess(false);
    setActiveStep(0);
    setPreviewOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewChecklist = () => {
    navigate("/admin/checklists");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    clearMessages();
  };

  const renderImportedSections = () => {
    if (!importResponse?.sections) return null;

    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {importResponse.sections.map((section, idx) => (
          <Card
            key={idx}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(C.primary, 0.04),
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: C.primary, fontSize: "0.9rem" }}
              >
                {section.sectionTitle}
              </Typography>
              {section.sectionDescription && (
                <Typography
                  sx={{ fontSize: "0.7rem", color: C.text.secondary, mt: 0.25 }}
                >
                  {section.sectionDescription}
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 2 }}>
              {section.fields.map((field, fIdx) => (
                <Box
                  key={fIdx}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    mb: 1.5,
                    "&:last-child": { mb: 0 },
                  }}
                >
                  <Rule sx={{ fontSize: 14, color: C.primary, mt: 0.2 }} />
                  <Box flex={1}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {field.label}
                      {field.isRequired && (
                        <span style={{ color: C.error, marginLeft: 4 }}>*</span>
                      )}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.65rem", color: C.text.disabled }}
                    >
                      Type: {field.fieldType?.replace("_", " ")}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        ))}
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(C.primary, 0.04),
            borderRadius: "16px",
            mt: 1,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                Total Fields
              </Typography>
              <Typography sx={{ fontWeight: 700, color: C.primary }}>
                {importResponse.totalFields}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                Version
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {importResponse.version || "1.0"}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: "0.7rem", color: C.text.disabled }}>
                Status
              </Typography>
              <Chip
                label={importResponse.status}
                size="small"
                sx={{
                  bgcolor: alpha(C.primary, 0.1),
                  color: C.primary,
                  fontSize: "0.7rem",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    );
  };

  // Steps configuration
  const steps = [
    {
      label: "Upload File",
      icon: <UploadFile sx={{ fontSize: 18 }} />,
      description: "Select your Excel file",
    },
    {
      label: "Review & Import",
      icon: <Visibility sx={{ fontSize: 18 }} />,
      description: "Preview and confirm import",
    },
    {
      label: "Complete",
      icon: <CheckCircle sx={{ fontSize: 18 }} />,
      description: "Checklist created",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.surfaceAlt }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          width:"1145px",
          marginLeft:"35px",
          zIndex: 50,
          borderRadius:"12px",
          bgcolor: C.surface,
          borderBottom: `1px solid ${C.border}`,
          px: { xs: 2, sm: 4 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/admin/checklists")}
              sx={{
                bgcolor: alpha(C.primary, 0.08),
                borderRadius: "14px",
                padding: "10px",
                "&:hover": { bgcolor: alpha(C.primary, 0.12) },
              }}
            >
              <ArrowBack sx={{ color: C.primary , fontSize: 18}} />
            </IconButton>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  fontWeight: 700,
                  color: C.text.primary,
                  letterSpacing: "-0.02em",
                }}
              >
                Import Checklist Fields
              </Typography>
              <Typography
                sx={{ fontSize: "0.8rem", color: C.text.secondary, mt: 0.25 }}
              >
                Upload an Excel sheet to auto-generate checklist fields
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<TableChart sx={{ fontSize: 14 }} />}
            label="Excel Import"
            sx={{
              bgcolor: alpha(C.primary, 0.08),
              color: C.primary,
              fontWeight: 600,
              borderRadius: "12px",
              padding:"10px 20px"
            }}
          />
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: C.surface,
            borderRadius: "24px",
            border: `1px solid ${C.border}`,
            p: 3,
            mb: 3,
          }}
        >
          <Stepper
            activeStep={activeStep}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{
              "& .MuiStepLabel-label": { fontSize: "0.8rem", fontWeight: 500 },
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor:
                          index <= activeStep
                            ? C.primary
                            : alpha(C.text.disabled, 0.2),
                        color: index <= activeStep ? "#fff" : C.text.disabled,
                      }}
                    >
                      {index < activeStep ? (
                        <CheckIcon sx={{ fontSize: 16 }} />
                      ) : (
                        step.icon
                      )}
                    </Box>
                  )}
                >
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {step.label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.7rem", color: C.text.disabled }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Template Download Card */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: alpha(C.info, 0.04),
            borderRadius: "20px",
            border: `1px solid ${alpha(C.info, 0.2)}`,
            p: 2.5,
            mb: 3,
          }}
        >
          <Box
            display="flex"
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "16px",
                  bgcolor: alpha(C.info, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FilePresent sx={{ color: C.info }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: C.text.primary }}>
                  Need a template?
                </Typography>
                <Typography
                  sx={{ fontSize: "0.75rem", color: C.text.secondary }}
                >
                  Download our sample Excel file to get started quickly
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={
                downloadLoading ? <CircularProgress size={16} /> : <Download />
              }
              onClick={handleDownloadTemplate}
              disabled={downloadLoading}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                borderColor: C.info,
                color: C.info,
                "&:hover": {
                  borderColor: C.info,
                  bgcolor: alpha(C.info, 0.08),
                },
              }}
            >
              {downloadLoading ? "Downloading..." : "Download Template"}
            </Button>
          </Box>
        </Paper>

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: C.surface,
            borderRadius: "24px",
            border: `1px solid ${C.border}`,
            overflow: "hidden",
          }}
        >
          {importSuccess ? (
            // Success State
            <Fade in timeout={500}>
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "40px",
                    bgcolor: alpha(C.success, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <CheckCircle sx={{ fontSize: 48, color: C.success }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: C.text.primary,
                    mb: 1,
                  }}
                >
                  Import Successful!
                </Typography>
                <Typography
                  sx={{
                    color: C.text.secondary,
                    mb: 3,
                    maxWidth: 400,
                    mx: "auto",
                  }}
                >
                  Your checklist "{importResponse?.name}" has been created
                  successfully
                </Typography>

                <Box
                  sx={{ maxWidth: 600, mx: "auto", textAlign: "left", mb: 3 }}
                >
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                    Checklist Summary
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: C.text.disabled }}
                      >
                        Name
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {importResponse?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: C.text.disabled }}
                      >
                        Category
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {importResponse?.category || "General"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: C.text.disabled }}
                      >
                        Type
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {importResponse?.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: C.text.disabled }}
                      >
                        Total Fields
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {importResponse?.totalFields}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                    Sections & Fields
                  </Typography>
                  {renderImportedSections()}
                </Box>

                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{ borderRadius: "14px", textTransform: "none" }}
                  >
                    Import Another
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleViewChecklist}
                    sx={{
                      bgcolor: C.primary,
                      borderRadius: "14px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { bgcolor: C.primaryDark },
                    }}
                  >
                    View Checklist
                  </Button>
                </Stack>
              </Box>
            </Fade>
          ) : (
            <Box>
              {/* Drop Zone */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{ p: { xs: 2, sm: 3, md: 4 } }}
              >
                <DropZone
                  isDragging={isDragging}
                  hasFile={!!selectedFile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "20px",
                      bgcolor: alpha(C.primary, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    {selectedFile ? (
                      <InsertDriveFile
                        sx={{ fontSize: 32, color: C.success }}
                      />
                    ) : (
                      <CloudUpload sx={{ fontSize: 32, color: C.primary }} />
                    )}
                  </Box>

                  {selectedFile ? (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: C.text.primary,
                          mb: 0.5,
                          textAlign: "center",
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedFile.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.text.disabled,
                          fontSize: "0.7rem",
                          mb: 1,
                        }}
                      >
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </Typography>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        startIcon={<Close />}
                        sx={{ color: C.error, fontSize: "0.7rem" }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: C.text.primary,
                          mb: 0.5,
                          textAlign: "center",
                        }}
                      >
                        Drop your Excel file here
                      </Typography>
                      <Typography
                        sx={{
                          color: C.text.disabled,
                          fontSize: "0.75rem",
                          mb: 2,
                          textAlign: "center",
                        }}
                      >
                        or click to browse • Supported: .xlsx / .xls
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<UploadFile />}
                        sx={{
                          bgcolor: C.primary,
                          borderRadius: "14px",
                          textTransform: "none",
                          "&:hover": { bgcolor: C.primaryDark },
                        }}
                      >
                        Select File
                      </Button>
                    </>
                  )}
                </DropZone>

                {/* File Requirements */}
                {!selectedFile && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: alpha(C.info, 0.04),
                      borderRadius: "16px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Info sx={{ fontSize: 16, color: C.info }} /> Required
                      Excel Format
                    </Typography>
                    <Grid container spacing={1}>
                      {[
                        "Section - Group your fields into sections",
                        "Field Name - The label for each field",
                        "Field Type - text_input, text_area, dropdown, rating, checkbox, email_input, phone_input, signature, date_picker",
                        "Required - Yes/No (case insensitive)",
                        "Options - Comma-separated for dropdown fields",
                        "Description - Optional field help text",
                      ].map((req, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Rule sx={{ fontSize: 12, color: C.primary }} />
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: C.text.secondary,
                              }}
                            >
                              {req}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              {selectedFile && (
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderTop: `1px solid ${C.border}`,
                    bgcolor: C.surfaceAlt,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<ClearIcon />}
                    sx={{ borderRadius: "14px", textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={handlePreview}
                      startIcon={<Visibility />}
                      sx={{ borderRadius: "14px", textTransform: "none" }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleImport}
                      disabled={importing}
                      startIcon={
                        importing ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CloudUpload />
                        )
                      }
                      sx={{
                        bgcolor: C.primary,
                        borderRadius: "14px",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { bgcolor: C.primaryDark },
                      }}
                    >
                      {importing ? "Importing..." : "Import Checklist"}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Help Section */}
        {!importSuccess && (
          <Paper
            elevation={0}
            sx={{
              bgcolor: C.surface,
              borderRadius: "20px",
              border: `1px solid ${C.border}`,
              p: 2.5,
              mt: 3,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HelpOutline sx={{ fontSize: 18, color: C.primary }} /> Field
              Types Reference
            </Typography>
            <Grid container spacing={2}>
              {[
                { type: "text_input", desc: "Single line text input" },
                { type: "text_area", desc: "Multi-line text area" },
                { type: "dropdown", desc: "Select from options" },
                { type: "checkbox", desc: "Single checkbox toggle" },
                { type: "rating", desc: "Star rating (1-5)" },
                { type: "email_input", desc: "Email address validation" },
                { type: "phone_input", desc: "Phone number format" },
                { type: "signature", desc: "Signature pad" },
                { type: "date_picker", desc: "Calendar date picker" },
                { type: "file_upload", desc: "File attachment" },
              ].map((field) => (
                <Grid item xs={6} sm={4} md={3} key={field.type}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(C.primary, 0.04),
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: C.primary,
                        fontFamily: "monospace",
                      }}
                    >
                      {field.type}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.65rem", color: C.text.disabled }}
                    >
                      {field.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: "28px" } } }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: C.primary }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}
              >
                File Preview
              </Typography>
              <Typography
                sx={{ fontSize: "0.7rem", color: alpha("#fff", 0.7), mt: 0.25 }}
              >
                {selectedFile?.name}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setPreviewOpen(false)}
              sx={{ color: "#fff", bgcolor: alpha("#fff", 0.1) }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "20px",
                bgcolor: alpha(C.primary, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Description sx={{ fontSize: 32, color: C.primary }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.5 }}>
              {selectedFile?.name}
            </Typography>
            <Typography
              sx={{ color: C.text.disabled, fontSize: "0.75rem", mb: 2 }}
            >
              Size: {(selectedFile?.size / 1024).toFixed(1)} KB
            </Typography>

            <Box
              sx={{
                bgcolor: alpha(C.primary, 0.04),
                borderRadius: "16px",
                p: 2,
                textAlign: "left",
                mt: 2,
              }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.85rem" }}>
                Parsing Summary:
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ fontSize: 14, color: C.success }} />
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    Multiple sections support
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ fontSize: 14, color: C.success }} />
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    All field types supported
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ fontSize: 14, color: C.success }} />
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    Required field validation
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ fontSize: 14, color: C.success }} />
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    Dropdown options parsing
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
          <Button
            onClick={() => setPreviewOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "14px", textTransform: "none" }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setPreviewOpen(false);
              handleImport();
            }}
            variant="contained"
            startIcon={<CloudUpload />}
            sx={{
              bgcolor: C.primary,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Import Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            borderRadius: "16px",
            fontWeight: 600,
            bgcolor: snackbarSeverity === "success" ? C.primary : C.error,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

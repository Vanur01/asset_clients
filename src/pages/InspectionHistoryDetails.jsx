// src/pages/InspectionHistoryDetails.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  FlagOutlined as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamAssignment } from "../context/TeamAssignmentContext";

const theme = createTheme({
  palette: {
    primary: { main: "#0d4a5c" },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    info: { main: "#3b82f6" },
  },
  shape: { borderRadius: 12 },
});

const REVIEW_STATUS_CFG = {
  pending_review: { label: "Pending Review", color: "#f59e0b", bg: "#fffbeb" },
  approved: { label: "Approved", color: "#10b981", bg: "#ecfdf5" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "#fef2f2" },
  needs_revision: { label: "Needs Revision", color: "#8b5cf6", bg: "#f5f3ff" },
};

const ReviewStatusChip = ({ status }) => {
  const cfg =
    REVIEW_STATUS_CFG[status?.toLowerCase()] ||
    REVIEW_STATUS_CFG.pending_review;
  return (
    <Chip
      label={cfg.label}
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700 }}
    />
  );
};

export default function InspectionHistoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchInspectionById, exportInspection, loading } =
    useTeamAssignment();

  const [inspection, setInspection] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const toast = useCallback(
    (msg, severity = "success") => setSnack({ open: true, msg, severity }),
    [],
  );

  useEffect(() => {
    console.log("InspectionHistoryDetails - URL params:", { id });
    if (id && id !== "undefined") {
      loadInspection();
    } else {
      console.error("Invalid inspection ID:", id);
      toast("Invalid inspection ID", "error");
      navigate("/team/history");
    }
  }, [id]);

  const loadInspection = async () => {
    if (!id || id === "undefined") {
      toast("Invalid inspection ID", "error");
      navigate("/team/history");
      return;
    }

    console.log("Loading inspection with ID:", id);
    const result = await fetchInspectionById(id);
    console.log("Fetch result:", result);

    if (result.success) {
      setInspection(result.inspection);
      setAssignment(result.assignment);
    } else {
      toast(result.error || "Failed to load inspection", "error");
      navigate("/team/history");
    }
  };

  const handleExport = async (format) => {
    if (!id || id === "undefined") {
      toast("Invalid inspection ID", "error");
      return;
    }
    const result = await exportInspection(id, format);
    if (result.success && result.url) {
      window.open(result.url, "_blank");
    } else {
      toast(result.error || "Export failed", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  if (loading && !inspection) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!inspection) return null;

  const checklistResponses = inspection.checklistResponses || [];
  const attachments = inspection.attachments || [];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3.5 } }}>
          {/* Header */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                  onClick={() => navigate("/team/history")}
                  sx={{ bgcolor: alpha("#0d4a5c", 0.08) }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {inspection.inspectionId || "Inspection Details"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted:{" "}
                    {inspection.submittedAt
                      ? new Date(inspection.submittedAt).toLocaleString()
                      : "N/A"}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                <ReviewStatusChip status={inspection.reviewStatus} />
                <Button
                  size="small"
                  startIcon={<PdfIcon />}
                  onClick={() => handleExport("pdf")}
                  variant="outlined"
                >
                  PDF
                </Button>
                <Button
                  size="small"
                  startIcon={<ExcelIcon />}
                  onClick={() => handleExport("excel")}
                  variant="outlined"
                >
                  Excel
                </Button>
                <Button
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  variant="outlined"
                >
                  Print
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Assignment Info */}
          {assignment && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Assignment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Checklist
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {assignment.checklists?.[0]?.name ||
                        inspection.checklistName ||
                        "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Asset
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {assignment.assets?.[0]?.tagNumber ||
                        inspection.assetTag ||
                        "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body2">
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={assignment.priority || "medium"}
                      size="small"
                      sx={{ bgcolor: alpha("#f59e0b", 0.1), color: "#f59e0b" }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Stats */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Performance Summary
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={2}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h3" fontWeight={800} color="primary">
                        {inspection.performanceRating || 0}
                      </Typography>
                      <Typography variant="caption">
                        Performance Rating
                      </Typography>
                      <Rating
                        value={inspection.performanceRating || 0}
                        readOnly
                        precision={0.5}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Overall Completion
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={inspection.overallCompletionRate || 0}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" fontWeight={700}>
                          {inspection.overallCompletionRate || 0}%
                        </Typography>
                      </Box>
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#ecfdf5" }}
                        >
                          <Typography variant="h6" color="#10b981">
                            {inspection.itemsPassed || 0}
                          </Typography>
                          <Typography variant="caption">Passed</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#fef2f2" }}
                        >
                          <Typography variant="h6" color="#ef4444">
                            {inspection.itemsFailed || 0}
                          </Typography>
                          <Typography variant="caption">Failed</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#f5f3ff" }}
                        >
                          <Typography variant="h6" color="#8b5cf6">
                            {inspection.itemsNA || 0}
                          </Typography>
                          <Typography variant="caption">N/A</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Inspector Information
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 18, color: "#0d4a5c" }} />
                      <Typography variant="body2">
                        {inspection.inspectorName ||
                          inspection.submittedByName ||
                          "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, color: "#0d4a5c" }} />
                      <Typography variant="body2">
                        {inspection.submittedByEmail || "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 18, color: "#0d4a5c" }} />
                      <Typography variant="body2">
                        Submitted:{" "}
                        {inspection.submittedAt
                          ? new Date(inspection.submittedAt).toLocaleString()
                          : "—"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Responses */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Checklist Responses
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  {checklistResponses.length > 0 ? (
                    checklistResponses.map((checklist, idx) => (
                      <Accordion key={idx} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <DescriptionIcon sx={{ color: "#0d4a5c" }} />
                            <Typography fontWeight={600}>
                              {checklist.checklistName}
                            </Typography>
                            <Chip
                              label={`${checklist.completionRate}%`}
                              size="small"
                            />
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Question</TableCell>
                                  <TableCell>Answer</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {checklist.responses?.map(
                                  (response, respIdx) => (
                                    <TableRow key={respIdx}>
                                      <TableCell>{response.label}</TableCell>
                                      <TableCell>
                                        {response.fieldType === "rating" ? (
                                          <Rating
                                            value={
                                              parseInt(response.value) || 0
                                            }
                                            readOnly
                                            size="small"
                                          />
                                        ) : (
                                          response.value || "—"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {response.isValid ? (
                                          <CheckCircleIcon
                                            sx={{
                                              fontSize: 18,
                                              color: "#10b981",
                                            }}
                                          />
                                        ) : (
                                          <ErrorOutlineIcon
                                            sx={{
                                              fontSize: 18,
                                              color: "#ef4444",
                                            }}
                                          />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 4 }}
                    >
                      No responses available
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {inspection.notes && (
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Inspector Notes
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {inspection.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Attachments
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <ImageList cols={3} gap={16}>
                      {attachments.map((attachment, idx) => (
                        <ImageListItem
                          key={idx}
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleImageClick(attachment)}
                        >
                          <img
                            src={`https://assset-management-backend-4.onrender.com/${attachment.filePath?.replace(/\\/g, "/")}`}
                            alt={attachment.originalName}
                            style={{
                              height: 150,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                          <ImageListItemBar
                            title={attachment.originalName}
                            position="bottom"
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* Image Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Attachment Preview</Typography>
              <IconButton onClick={() => setImageDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            {selectedImage && (
              <img
                src={`https://assset-management-backend-4.onrender.com/${selectedImage.filePath?.replace(/\\/g, "/")}`}
                alt={selectedImage.originalName}
                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }}
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack({ ...snack, open: false })}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

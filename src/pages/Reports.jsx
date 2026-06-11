// pages/ReportsDashboard.jsx — Redesigned
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import {
  Box, Typography, Button, Card, CardContent, Grid, Avatar,
  Chip, IconButton, Tooltip, Divider, LinearProgress,
  ToggleButton, ToggleButtonGroup, TextField, InputAdornment,
  MenuItem, Tab, Tabs, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Alert, Snackbar,
  CircularProgress, Skeleton, Stack, alpha, Select, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, useMediaQuery, useTheme,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  InsertChart as ChartIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  TaskAlt as TaskAltIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { useAuth }   from "../context/AuthContexts";
import { useReport } from "../context/ReportContext";
import jsPDF         from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas   from "html2canvas";

// ─── Design Tokens (same system as Dashboard) ─────────────────────────────────
const T = {
  ink:        "#0f1923",
  inkMid:     "#2e3d4a",
  inkLight:   "#516072",
  surface:    "#f7f9fb",
  surfaceMid: "#eef1f5",
  white:      "#ffffff",
  border:     "rgba(81,96,114,0.14)",
  borderMid:  "rgba(81,96,114,0.28)",
  teal:       "#007b6e",
  tealLight:  "#e0f4f1",
  amber:      "#d97706",
  amberLight: "#fef3c7",
  green:      "#16a34a",
  greenLight: "#dcfce7",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  blue:       "#2563eb",
  blueLight:  "#eff6ff",
};

const CHART_COLORS = [T.teal, T.amber, "#4f46e5", "#0891b2", "#7c3aed", "#be123c"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, currency = false) => {
  if (n == null) return "—";
  const v = Number(n);
  return currency ? `₹${v.toLocaleString("en-IN")}` : v.toLocaleString("en-IN");
};

// ─── PDF Export ───────────────────────────────────────────────────────────────
const exportToPDF = async (data, reportType, summary) => {
  const doc    = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const stamp  = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
  const title  = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

  // Header
  doc.setFillColor(15, 25, 35);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${stamp}`, 297 - 14, 13, { align: "right" });

  let y = 30;

  // Summary box
  if (summary && Object.keys(summary).length > 0) {
    doc.setTextColor(81, 96, 114);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 14, y);
    y += 4;

    const pairs = Object.entries(summary).slice(0, 8);
    pairs.forEach(([k, v], i) => {
      const x = 14 + (i % 4) * 68;
      const rowY = y + Math.floor(i / 4) * 14;
      doc.setFillColor(247, 249, 251);
      doc.roundedRect(x, rowY, 64, 12, 2, 2, "F");
      doc.setTextColor(81, 96, 114);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(k.replace(/([A-Z])/g, " $1").trim(), x + 3, rowY + 4.5);
      doc.setTextColor(15, 25, 35);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(String(v ?? "—"), x + 3, rowY + 9.5);
    });
    y += Math.ceil(pairs.length / 4) * 14 + 8;
  }

  // Table
  if (data?.length > 0) {
    const columns = Object.keys(data[0]).slice(0, 10);
    const headers = columns.map(c => c.replace(/([A-Z])/g, " $1").trim());
    const rows    = data.map(row => columns.map(c => String(row[c] ?? "—").slice(0, 60)));

    doc.autoTable({
      head:        [headers],
      body:        rows,
      startY:      y,
      margin:      { left: 14, right: 14 },
      styles:      { fontSize: 7.5, cellPadding: 3, textColor: [15, 25, 35] },
      headStyles:  { fillColor: [15, 25, 35], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [247, 249, 251] },
      tableLineColor: [238, 241, 245],
      tableLineWidth: 0.3,
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(145, 168, 180);
    doc.setFontSize(7);
    doc.text("Confidential — Internal Use Only", 14, 205);
    doc.text(`Page ${i} of ${pageCount}`, 297 - 14, 205, { align: "right" });
  }

  doc.save(`${reportType}_report_${Date.now()}.pdf`);
  return true;
};

// ─── Excel Export ─────────────────────────────────────────────────────────────
const exportToExcel = (data, reportType, summary) => {
  const wb = XLSX.utils.book_new();

  if (data?.length > 0) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Data");
  }

  if (summary && Object.keys(summary).length > 0) {
    const summaryRows = Object.entries(summary).map(([k, v]) => ({ Metric: k, Value: v }));
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");
  }

  XLSX.writeFile(wb, `${reportType}_report_${Date.now()}.xlsx`);
};

// ─── UI Primitives ────────────────────────────────────────────────────────────
const MetricTile = ({ icon: Icon, label, value, color, loading }) => {
  if (loading) return (
    <Box sx={{ p: 2, borderRadius: "12px", bgcolor: T.surfaceMid }}>
      <Skeleton variant="circular" width={36} height={36} sx={{ mb: 1 }} />
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={28} />
    </Box>
  );
  return (
    <Box sx={{ p: 2, borderRadius: "12px", bgcolor: T.surfaceMid }}>
      <Box sx={{ width: 36, height: 36, borderRadius: "9px", bgcolor: alpha(color || T.teal, 0.12), display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
        <Icon sx={{ fontSize: 18, color: color || T.teal }} />
      </Box>
      <Typography sx={{ fontSize: "0.66rem", fontWeight: 600, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.4 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: T.ink, lineHeight: 1 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
};

const EmptyState = ({ icon: Icon, title, desc }) => (
  <Box sx={{ textAlign: "center", py: 7 }}>
    <Icon sx={{ fontSize: 48, color: T.surfaceMid, mb: 1.5 }} />
    <Typography sx={{ fontWeight: 600, color: T.inkMid, fontSize: "0.88rem", mb: 0.5 }}>{title}</Typography>
    <Typography sx={{ fontSize: "0.76rem", color: T.inkLight }}>{desc}</Typography>
  </Box>
);

const StatusChip = ({ status }) => {
  const map = {
    active:   { bg: T.greenLight, color: T.green },
    inactive: { bg: T.redLight,   color: T.red   },
    suspended:{ bg: T.amberLight, color: T.amber  },
    good:     { bg: T.greenLight, color: T.green },
    fair:     { bg: T.amberLight, color: T.amber  },
    poor:     { bg: T.redLight,   color: T.red   },
    excellent:{ bg: T.tealLight,  color: T.teal  },
    critical: { bg: T.redLight,   color: T.red   },
  };
  const s = map[(status || "").toLowerCase()] || { bg: T.surfaceMid, color: T.inkLight };
  return (
    <Chip label={status || "—"} size="small"
      sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600, bgcolor: s.bg, color: s.color }} />
  );
};

const ColHead = ({ children }) => (
  <TableCell sx={{ fontWeight: 700, fontSize: "0.68rem", color: T.inkLight, bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>
    {children}
  </TableCell>
);
const Cell$ = ({ children, bold }) => (
  <TableCell sx={{ fontSize: bold ? "0.74rem" : "0.7rem", fontWeight: bold ? 600 : 400, color: bold ? T.ink : T.inkLight, borderBottom: `1px solid ${T.border}` }}>
    {children}
  </TableCell>
);

// ─── Report Tables ────────────────────────────────────────────────────────────
const ClientReportTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rpp,  setRpp]  = useState(10);
  const [q, setQ]       = useState("");

  if (!data?.length) return <EmptyState icon={BusinessIcon} title="No clients found" desc="Adjust filters and generate the report" />;

  const filtered = data.filter(r =>
    r.customerName?.toLowerCase().includes(q.toLowerCase()) ||
    r.email?.toLowerCase().includes(q.toLowerCase())
  );
  const paged = filtered.slice(page * rpp, page * rpp + rpp);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <TextField
          size="small" placeholder="Search clients…" value={q}
          onChange={e => { setQ(e.target.value); setPage(0); }}
          sx={{ width: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: T.inkLight }} /></InputAdornment> }}
        />
        <Typography sx={{ fontSize: "0.7rem", color: T.inkLight, alignSelf: "center" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["Client", "Contact", "Plan", "Status", "Team", "Assets", "Completion %", "Subscription ends"].map(h => <ColHead key={h}>{h}</ColHead>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: T.surface } }}>
                <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: T.teal, fontSize: "0.7rem" }}>
                      {row.customerName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.74rem", color: T.ink }}>
                      {row.customerName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                  <Typography sx={{ fontSize: "0.68rem", color: T.inkMid }}>{row.email}</Typography>
                  <Typography sx={{ fontSize: "0.63rem", color: T.inkLight }}>{row.phone}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                  <Chip label={row.membershipPlan || "—"} size="small"
                    sx={{ height: 18, fontSize: "0.6rem", fontWeight: 600, bgcolor: T.tealLight, color: T.teal }} />
                </TableCell>
                <Cell$><StatusChip status={row.status} /></Cell$>
                <Cell$>{row.teamCount ?? 0}</Cell$>
                <Cell$>{row.assetCount ?? 0}</Cell$>
                <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress variant="determinate" value={row.completionRate || 0}
                      sx={{ width: 56, height: 4, borderRadius: 4, bgcolor: T.surfaceMid, "& .MuiLinearProgress-bar": { bgcolor: T.teal } }} />
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: T.inkMid }}>
                      {(row.completionRate || 0).toFixed(0)}%
                    </Typography>
                  </Box>
                </TableCell>
                <Cell$>
                  {row.subscriptionEndDate
                    ? new Date(row.subscriptionEndDate).toLocaleDateString("en-IN")
                    : "N/A"}
                </Cell$>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={filtered.length} page={page}
        onPageChange={(_, p) => setPage(p)} rowsPerPage={rpp}
        onRowsPerPageChange={e => { setRpp(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ fontSize: "0.72rem", "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.72rem" } }} />
    </Box>
  );
};

const TeamReportTable = ({ data }) => {
  const [page, setPage]     = useState(0);
  const [rpp,  setRpp]      = useState(10);
  const [roleFilter, setRole] = useState("all");

  if (!data?.length) return <EmptyState icon={PeopleIcon} title="No team members found" desc="Adjust filters and regenerate" />;

  const filtered = roleFilter === "all" ? data : data.filter(r => r.teamRole === roleFilter);
  const paged    = filtered.slice(page * rpp, page * rpp + rpp);
  const perfColor = v => v >= 80 ? T.green : v >= 60 ? T.amber : T.red;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <FormControl size="small" sx={{ width: 170 }}>
          <InputLabel sx={{ fontSize: "0.8rem" }}>Role</InputLabel>
          <Select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(0); }} label="Role" sx={{ fontSize: "0.8rem" }}>
            <MenuItem value="all" sx={{ fontSize: "0.8rem" }}>All roles</MenuItem>
            {["inspector", "senior_inspector", "lead_inspector", "supervisor"].map(r => (
              <MenuItem key={r} value={r} sx={{ fontSize: "0.8rem" }}>{r.replace(/_/g, " ")}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography sx={{ fontSize: "0.7rem", color: T.inkLight, alignSelf: "center" }}>
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["Member", "Role", "Status", "Tasks assigned", "Completion", "On-time", "Score"].map(h => <ColHead key={h}>{h}</ColHead>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: T.surface } }}>
                <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: T.inkLight, fontSize: "0.7rem" }}>
                      {row.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.74rem", color: T.ink }}>
                        {`${row.firstName || ""} ${row.lastName || ""}`.trim()}
                      </Typography>
                      <Typography sx={{ fontSize: "0.63rem", color: T.inkLight }}>{row.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <Cell$>
                  <Chip label={row.teamRole?.replace("_", " ") || "Inspector"} size="small"
                    sx={{ height: 18, fontSize: "0.6rem", bgcolor: T.surfaceMid, color: T.inkMid }} />
                </Cell$>
                <Cell$><StatusChip status={row.status} /></Cell$>
                <Cell$>{row.assignedCount ?? 0}</Cell$>
                <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress variant="determinate" value={row.completionRate || 0}
                      sx={{ width: 50, height: 4, borderRadius: 4, bgcolor: T.surfaceMid, "& .MuiLinearProgress-bar": { bgcolor: perfColor(row.completionRate) } }} />
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: T.inkMid }}>
                      {(row.completionRate || 0).toFixed(0)}%
                    </Typography>
                  </Box>
                </TableCell>
                <Cell$>{(row.onTimeRate || 0).toFixed(0)}%</Cell$>
                <Cell$>
                  <Chip label={row.performanceScore ?? 0} size="small"
                    sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: T.tealLight, color: T.teal }} />
                </Cell$>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={filtered.length} page={page}
        onPageChange={(_, p) => setPage(p)} rowsPerPage={rpp}
        onRowsPerPageChange={e => { setRpp(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.72rem" } }} />
    </Box>
  );
};

const AssetReportTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rpp, setRpp]   = useState(10);
  const [q, setQ]       = useState("");

  const arr = Array.isArray(data) ? data : [];
  const filtered = arr.filter(r =>
    (r.assetName || r.name || "").toLowerCase().includes(q.toLowerCase()) ||
    (r.tagNumber || "").toLowerCase().includes(q.toLowerCase())
  );
  const paged = filtered.slice(page * rpp, page * rpp + rpp);

  if (!arr.length) return <EmptyState icon={InventoryIcon} title="No assets found" desc="Adjust filters and regenerate" />;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search by name or tag…" value={q}
          onChange={e => { setQ(e.target.value); setPage(0); }}
          sx={{ width: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: T.inkLight }} /></InputAdornment> }} />
      </Box>
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["Asset name", "Tag", "Serial", "Category", "Location", "Condition", "Health", "Status"].map(h => <ColHead key={h}>{h}</ColHead>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: T.surface } }}>
                <Cell$ bold>{row.assetName || row.name || "—"}</Cell$>
                <Cell$>{row.tagNumber || row.tag || "—"}</Cell$>
                <Cell$>{row.serialNumber || row.serial || "—"}</Cell$>
                <Cell$>
                  <Chip label={row.assetCategory || row.category || "Uncategorized"} size="small"
                    sx={{ height: 18, fontSize: "0.6rem", bgcolor: T.surfaceMid, color: T.inkMid }} />
                </Cell$>
                <Cell$>{row.currentLocation || row.location || "—"}</Cell$>
                <Cell$><StatusChip status={row.assetCondition || row.condition} /></Cell$>
                <Cell$>
                  <Chip label={`${row.healthScore || row.health_score || 0}%`} size="small"
                    sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: T.greenLight, color: T.green }} />
                </Cell$>
                <Cell$><StatusChip status={row.status || "Active"} /></Cell$>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={filtered.length} page={page}
        onPageChange={(_, p) => setPage(p)} rowsPerPage={rpp}
        onRowsPerPageChange={e => { setRpp(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.72rem" } }} />
    </Box>
  );
};

const GenericReportTable = ({ data, reportType }) => {
  const [page, setPage] = useState(0);
  const [rpp, setRpp]   = useState(10);
  const [q, setQ]       = useState("");

  if (!data?.length) return <EmptyState icon={AssessmentIcon} title="No records found" desc="Try different filters or date range" />;

  const columns = Object.keys(data[0]).slice(0, 8);
  const filtered = q
    ? data.filter(r => columns.some(c => String(r[c] || "").toLowerCase().includes(q.toLowerCase())))
    : data;
  const paged = filtered.slice(page * rpp, page * rpp + rpp);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search…" value={q}
          onChange={e => { setQ(e.target.value); setPage(0); }}
          sx={{ width: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: T.inkLight }} /></InputAdornment> }} />
      </Box>
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <ColHead key={col}>
                  {col.replace(/([A-Z])/g, " $1").trim().toLowerCase()}
                </ColHead>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i} hover sx={{ "&:hover": { bgcolor: T.surface } }}>
                {columns.map((col, j) => (
                  <Cell$ key={col} bold={j === 0}>
                    {String(row[col] ?? "—").slice(0, 60)}
                  </Cell$>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={filtered.length} page={page}
        onPageChange={(_, p) => setPage(p)} rowsPerPage={rpp}
        onRowsPerPageChange={e => { setRpp(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.72rem" } }} />
    </Box>
  );
};

// ─── Chart section ────────────────────────────────────────────────────────────
const ChartPane = ({ title, children }) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: `1px solid ${T.border}`, bgcolor: T.white }}>
    <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: T.ink, mb: 2 }}>{title}</Typography>
    {children}
  </Paper>
);

const NoChart = ({ msg = "No data" }) => (
  <Box height={200} display="flex" alignItems="center" justifyContent="center">
    <Typography sx={{ fontSize: "0.76rem", color: T.inkLight }}>{msg}</Typography>
  </Box>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ReportsDashboard = () => {
  const { user } = useAuth();
  const {
    loading, error, analyticsData, reportData,
    getDashboardAnalytics, getClientReport, getAssetReport, getTeamReport,
    getChecklistReport, getAssignmentReport, getInspectionReport,
    getRevenueReport, getComplianceReport,
    clearError, clearReportData, isAdmin, isSuperAdmin,
  } = useReport();

  const isMobile    = useMediaQuery("(max-width:640px)");
  const reportRef   = useRef();
  const [dateRange, setDateRange]           = useState(30);
  const [reportType, setReportType]         = useState(() =>
    user?.role === "super_admin" ? "clients" : user?.role === "admin" ? "team" : "inspections"
  );
  const [reportFilters, setReportFilters]   = useState({});
  const [filterOpen, setFilterOpen]         = useState(false);
  const [exporting, setExporting]           = useState(false);
  const [generating, setGenerating]         = useState(false);
  const [toast, setToast]                   = useState({ open: false, message: "", severity: "success" });
  const [exportFormat, setExportFormat]     = useState(null);

  const showToast  = useCallback((msg, sev = "success") => setToast({ open: true, message: msg, severity: sev }), []);
  const closeToast = useCallback(() => setToast(p => ({ ...p, open: false })), []);

  useEffect(() => {
    getDashboardAnalytics(dateRange).catch(() => showToast("Could not load analytics", "warning"));
  }, [dateRange]);

  useEffect(() => {
    clearReportData();
  }, [reportType]);

  // Generate report
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const fetchers = {
        clients:     getClientReport,
        assets:      getAssetReport,
        team:        getTeamReport,
        checklists:  getChecklistReport,
        assignments: getAssignmentReport,
        inspections: getInspectionReport,
        revenue:     getRevenueReport,
        compliance:  getComplianceReport,
      };
      const fn = fetchers[reportType];
      if (!fn) { showToast("Unknown report type", "error"); return; }
      const result = await fn(reportFilters);
      if (result?.success) {
        setFilterOpen(false);
        const count = result.data?.data?.length ?? 0;
        showToast(count > 0 ? `${count} record${count !== 1 ? "s" : ""} loaded` : "Report generated — no records match your filters", count > 0 ? "success" : "info");
      } else if (result === null) {
        // error already set in context
      }
    } catch (e) {
      showToast(e.message || "Failed to generate report", "error");
    } finally {
      setGenerating(false);
    }
  }, [reportType, reportFilters, getClientReport, getAssetReport, getTeamReport, getChecklistReport, getAssignmentReport, getInspectionReport, getRevenueReport, getComplianceReport, showToast]);

  // Export
  const handleExport = useCallback(async (format) => {
    if (!reportData?.data?.length) {
      showToast("Generate a report first, then export it.", "warning");
      return;
    }
    setExporting(true);
    try {
      if (format === "pdf") {
        await exportToPDF(reportData.data, reportType, reportData.summary);
        showToast("PDF downloaded");
      } else {
        exportToExcel(reportData.data, reportType, reportData.summary);
        showToast("Excel file downloaded");
      }
    } catch (e) {
      showToast(`Export failed: ${e.message}`, "error");
    } finally {
      setExporting(false);
    }
  }, [reportData, reportType, showToast]);

  // Stat cards
  const statCards = useMemo(() => {
    if (isSuperAdmin) return [
      { icon: BusinessIcon,      label: "Total clients",   value: fmt(analyticsData?.clientGrowth?.total),                 color: T.teal },
      { icon: CurrencyRupeeIcon, label: "Monthly revenue", value: `₹${fmt(analyticsData?.revenueTrend?.current ?? 0)}`,  color: T.green },
      { icon: AssignmentIcon,    label: "Active checklists",value: fmt(analyticsData?.checklistUsage?.active),            color: T.amber },
      { icon: PeopleIcon,        label: "Total team",      value: fmt(analyticsData?.teamStats?.total),                   color: T.blue },
    ];
    return [
      { icon: PeopleIcon,     label: "Team members",  value: fmt(analyticsData?.teamStats?.total),     color: T.teal },
      { icon: InventoryIcon,  label: "Total assets",  value: fmt(analyticsData?.assetStats?.total),    color: T.green },
      { icon: AssignmentIcon, label: "Checklists",    value: fmt(analyticsData?.checklistStats?.total),color: T.amber },
      { icon: TaskAltIcon,    label: "Completion",    value: `${analyticsData?.completionRate ?? 0}%`, color: T.blue },
    ];
  }, [analyticsData, isSuperAdmin]);

  // Chart data (demo / from analytics)
  const areaData  = analyticsData?.revenueTimeline || [
    { name: "Wk 1", value: 12500 }, { name: "Wk 2", value: 14800 },
    { name: "Wk 3", value: 13200 }, { name: "Wk 4", value: 16700 },
  ];
  const pieData = useMemo(() => {
    const byPlan = analyticsData?.planDistribution || {};
    const entries = Object.entries(byPlan);
    return entries.length > 0
      ? entries.map(([name, value]) => ({ name, value }))
      : [{ name: "Basic", value: 2 }, { name: "Professional", value: 2 }, { name: "Enterprise", value: 1 }];
  }, [analyticsData]);

  const renderTable = () => {
    if (!reportData) return null;
    const d = reportData.data || [];
    if (!d.length) return <EmptyState icon={AssessmentIcon} title="No records" desc="Try different filters or date range" />;
    if (reportType === "clients" && isSuperAdmin) return <ClientReportTable data={d} />;
    if (reportType === "team")    return <TeamReportTable data={d} />;
    if (reportType === "assets")  return <AssetReportTable data={d} />;
    return <GenericReportTable data={d} reportType={reportType} />;
  };

  const reportTypeOptions = [
    ...(isSuperAdmin ? [{ value: "clients", label: "Clients" }, { value: "revenue", label: "Revenue" }] : []),
    { value: "assets",      label: "Assets" },
    ...(isAdmin || isSuperAdmin ? [{ value: "team", label: "Team" }] : []),
    { value: "checklists",  label: "Checklists" },
    { value: "assignments", label: "Assignments" },
    { value: "inspections", label: "Inspections" },
    { value: "compliance",  label: "Compliance" },
  ];

  return (
    <Box sx={{ bgcolor: T.surface, minHeight: "100vh", p: { xs: 1.5, sm: 2, md: 3 } }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: T.ink, fontSize: { xs: "1.15rem", sm: "1.4rem" }, letterSpacing: "-0.02em" }}>
            Analytics & reports
          </Typography>
          <Typography sx={{ color: T.inkLight, fontSize: "0.7rem", mt: 0.3 }}>
            {isSuperAdmin ? "Enterprise-wide insights" : isAdmin ? "Team & asset analytics" : "Inspection & compliance reports"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <ToggleButtonGroup size="small" value={dateRange} exclusive
            onChange={(_, v) => v && setDateRange(v)}
            sx={{ "& .MuiToggleButton-root": { fontSize: "0.7rem", py: 0.5, px: 1.5, textTransform: "none", borderColor: T.border, color: T.inkLight, "&.Mui-selected": { bgcolor: T.ink, color: "#fff", borderColor: T.ink } } }}
          >
            <ToggleButton value={7}>7 days</ToggleButton>
            <ToggleButton value={30}>30 days</ToggleButton>
            <ToggleButton value={90}>90 days</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh analytics">
            <IconButton onClick={() => getDashboardAnalytics(dateRange)} disabled={loading}
              sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: "10px" }}>
              {loading ? <CircularProgress size={17} /> : <RefreshIcon sx={{ fontSize: 18, color: T.inkMid }} />}
            </IconButton>
          </Tooltip>

          <Button
            startIcon={<FilterIcon sx={{ fontSize: 16 }} />}
            onClick={() => setFilterOpen(true)}
            sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, color: T.inkMid, borderRadius: "10px", textTransform: "none", fontSize: "0.78rem", fontWeight: 600, px: 1.5 }}
          >
            Filters
          </Button>

          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={15} color="inherit" /> : <AssessmentIcon sx={{ fontSize: 16 }} />}
            onClick={handleGenerate}
            disabled={generating}
            sx={{ bgcolor: T.ink, borderRadius: "10px", textTransform: "none", fontSize: "0.78rem", fontWeight: 600, px: 2, "&:hover": { bgcolor: T.inkMid } }}
          >
            Generate report
          </Button>
        </Stack>
      </Box>

      {/* Global error banner */}
      {error && (
        <Alert severity="error" onClose={clearError}
          sx={{ mb: 2, borderRadius: "12px", fontSize: "0.78rem" }}
          icon={<ErrorIcon sx={{ fontSize: 18 }} />}>
          {error}
        </Alert>
      )}

      {/* Metric tiles */}
      <Grid container spacing={1.5} mb={3}>
        {statCards.map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <MetricTile {...card} loading={loading && !analyticsData} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={7}>
          <ChartPane title={isSuperAdmin ? "Revenue overview" : "Activity overview"}>
            {areaData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.teal} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={T.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.inkLight }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: T.inkLight }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }}
                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                  <Area type="monotone" dataKey="value" stroke={T.teal} fill="url(#rG)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <NoChart msg="Revenue data not available" />}
          </ChartPane>
        </Grid>
        <Grid item xs={12} md={5}>
          <ChartPane title={isSuperAdmin ? "Clients by plan" : "Task distribution"}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius="44%" outerRadius="66%"
                    dataKey="value" paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <NoChart />}
          </ChartPane>
        </Grid>
      </Grid>

      {/* Report result panel */}
      <Paper elevation={0} ref={reportRef}
        sx={{ borderRadius: "14px", border: `1px solid ${T.border}`, bgcolor: T.white, overflow: "hidden", mb: 3 }}>

        {/* Panel header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: T.ink }}>
              {reportTypeOptions.find(o => o.value === reportType)?.label || "Report"} report
            </Typography>
            {reportData && (
              <Typography sx={{ fontSize: "0.65rem", color: T.inkLight, mt: 0.3 }}>
                {reportData.data?.length ?? 0} records · generated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </Typography>
            )}
          </Box>

          {reportData?.data?.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Download as PDF">
                <IconButton onClick={() => handleExport("pdf")} disabled={exporting} size="small"
                  sx={{ bgcolor: T.redLight, borderRadius: "8px", p: 0.8 }}>
                  {exporting ? <CircularProgress size={16} /> : <PdfIcon sx={{ fontSize: 17, color: T.red }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Download as Excel">
                <IconButton onClick={() => handleExport("excel")} disabled={exporting} size="small"
                  sx={{ bgcolor: T.greenLight, borderRadius: "8px", p: 0.8 }}>
                  <ExcelIcon sx={{ fontSize: 17, color: T.green }} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        {/* Summary tiles */}
        {reportData?.summary && Object.keys(reportData.summary).length > 0 && (
          <Box sx={{ px: 2.5, pt: 2, pb: 0 }}>
            <Grid container spacing={1.5} mb={2}>
              {Object.entries(reportData.summary).slice(0, 6).map(([k, v]) => (
                <Grid item xs={6} sm={4} md={2} key={k}>
                  <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: T.surfaceMid }}>
                    <Typography sx={{ fontSize: "0.62rem", color: T.inkLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.3 }}>
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: T.ink }}>
                      {String(v ?? "—")}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ borderColor: T.border, mb: 0 }} />
          </Box>
        )}

        {/* Table */}
        <Box sx={{ p: 2.5 }}>
          {!reportData ? (
            <EmptyState
              icon={AssessmentIcon}
              title="No report generated yet"
              desc="Click Generate report to pull data with the selected filters"
            />
          ) : (
            renderTable()
          )}
        </Box>
      </Paper>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="xs" fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : "18px", border: `1px solid ${T.border}` } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: T.ink }}>Report filters</Typography>
            <IconButton size="small" onClick={() => setFilterOpen(false)} sx={{ borderRadius: "8px" }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: "0.82rem" }}>Report type</InputLabel>
              <Select value={reportType} onChange={e => setReportType(e.target.value)} label="Report type" sx={{ fontSize: "0.82rem" }}>
                {reportTypeOptions.map(o => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.82rem" }}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Start date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
              sx={{ "& label": { fontSize: "0.82rem" }, "& input": { fontSize: "0.82rem" } }}
              onChange={e => setReportFilters(p => ({ ...p, startDate: e.target.value }))} />

            <TextField label="End date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }}
              sx={{ "& label": { fontSize: "0.82rem" }, "& input": { fontSize: "0.82rem" } }}
              onChange={e => setReportFilters(p => ({ ...p, endDate: e.target.value }))} />

            {reportType === "clients" && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: "0.82rem" }}>Membership plan</InputLabel>
                <Select value={reportFilters.membershipPlan || ""} label="Membership plan" sx={{ fontSize: "0.82rem" }}
                  onChange={e => setReportFilters(p => ({ ...p, membershipPlan: e.target.value }))}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All plans</MenuItem>
                  {["basic", "professional", "enterprise"].map(p => (
                    <MenuItem key={p} value={p} sx={{ fontSize: "0.82rem", textTransform: "capitalize" }}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {reportType === "assets" && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: "0.82rem" }}>Asset status</InputLabel>
                <Select value={reportFilters.status || ""} label="Asset status" sx={{ fontSize: "0.82rem" }}
                  onChange={e => setReportFilters(p => ({ ...p, status: e.target.value }))}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All</MenuItem>
                  {["active", "maintenance", "retired"].map(s => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem", textTransform: "capitalize" }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {reportType === "team" && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: "0.82rem" }}>Role</InputLabel>
                <Select value={reportFilters.teamRole || ""} label="Role" sx={{ fontSize: "0.82rem" }}
                  onChange={e => setReportFilters(p => ({ ...p, teamRole: e.target.value }))}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All roles</MenuItem>
                  {["inspector", "senior_inspector", "lead_inspector", "supervisor"].map(r => (
                    <MenuItem key={r} value={r} sx={{ fontSize: "0.82rem" }}>{r.replace(/_/g, " ")}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {(reportType === "inspections" || reportType === "assignments") && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: "0.82rem" }}>Status</InputLabel>
                <Select value={reportFilters.status || ""} label="Status" sx={{ fontSize: "0.82rem" }}
                  onChange={e => setReportFilters(p => ({ ...p, status: e.target.value }))}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All</MenuItem>
                  {["pending", "completed", "overdue", "in_review"].map(s => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s.replace(/_/g, " ")}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button onClick={() => { setReportFilters({}); }}
            sx={{ textTransform: "none", fontSize: "0.78rem", color: T.inkLight }}>
            Clear filters
          </Button>
          <Button onClick={() => setFilterOpen(false)}
            sx={{ textTransform: "none", fontSize: "0.78rem", color: T.inkLight }}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating} variant="contained"
            sx={{ bgcolor: T.ink, borderRadius: "10px", textTransform: "none", fontSize: "0.78rem", fontWeight: 600, "&:hover": { bgcolor: T.inkMid } }}>
            {generating ? <CircularProgress size={16} color="inherit" /> : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled"
          sx={{ borderRadius: "12px", fontSize: "0.78rem" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsDashboard;
// components/modals/AssignmentModal.jsx
// Fixed version — all bugs resolved

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  InputAdornment,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Notes as NotesIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContexts";
import { useAssignment } from "../context/AssignmentContext";
import { useAsset } from "../context/AssetContext";
import axios from "axios";

// ── brand tokens ──────────────────────────────────────────────────────────────
const PRIMARY = "#144c5c";
const PRIMARY_L = "#1a6278";
const BG_LIGHT = "#f0f7f9";
const BORDER = "#d0e4ea";
const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

const PRIORITIES = [
  { value: "low",      label: "Low",      color: "#4caf50" },
  { value: "medium",   label: "Medium",   color: "#ff9800" },
  { value: "high",     label: "High",     color: "#f44336" },
  { value: "critical", label: "Critical", color: "#9c27b0" },
];

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// ── SectionLabel ──────────────────────────────────────────────────────────────
const SectionLabel = ({ Icon, label, count }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
    {Icon && <Icon sx={{ color: PRIMARY, fontSize: 18 }} />}
    <Typography variant="body2" fontWeight={600} color={PRIMARY}>
      {label}
      {count > 0 && (
        <Chip
          label={count}
          size="small"
          sx={{
            ml: 1,
            bgcolor: PRIMARY,
            color: "#fff",
            height: 18,
            fontSize: 11,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      )}
    </Typography>
  </Box>
);

// ── SearchableMultiSelect ─────────────────────────────────────────────────────
// FIX: toggleAll rewritten to batch all id changes in a single setState call,
//      avoiding the race condition where rapid individual onToggle calls cancel each other.
// FIX: multiple=false now correctly hides the "select all" row.
const SearchableMultiSelect = ({
  label,
  items = [],
  selected = [],
  onToggle,       // (id: string) => void  — still used for single-item clicks
  onSetSelected,  // (ids: string[]) => void — NEW: used by toggleAll for batch updates
  loading = false,
  error = null,
  onRetry,
  icon: Icon,
  renderPrimary,
  renderSecondary,
  renderAvatar,
  emptyText = "No items found",
  maxHeight = 260,
  multiple = true,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        renderPrimary(item).toLowerCase().includes(q) ||
        renderSecondary?.(item)?.toLowerCase().includes(q),
    );
  }, [items, query, renderPrimary, renderSecondary]);

  // FIX: derive allSelected from current `selected` prop, not from stale closure
  const filteredIds = useMemo(() => filtered.map((i) => i._id || i.id), [filtered]);
  const allSelected =
    multiple && filteredIds.length > 0 && filteredIds.every((id) => selected.includes(id));

  // FIX: batch toggle — one setState call, no cascading onToggle loops
  const toggleAll = useCallback(() => {
    if (!multiple || !onSetSelected) return;
    if (allSelected) {
      // Deselect all filtered items while keeping any outside the filtered set
      onSetSelected(selected.filter((id) => !filteredIds.includes(id)));
    } else {
      // Add all filtered ids not already selected
      const toAdd = filteredIds.filter((id) => !selected.includes(id));
      onSetSelected([...selected, ...toAdd]);
    }
  }, [multiple, allSelected, filteredIds, selected, onSetSelected]);

  if (loading) {
    return (
      <Box>
        <SectionLabel Icon={Icon} label={label} count={selected.length} />
        <Paper variant="outlined" sx={{ p: 2, border: `1.5px solid ${BORDER}` }}>
          <Stack spacing={1}>
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} variant="rounded" height={50} />
            ))}
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <SectionLabel Icon={Icon} label={label} count={selected.length} />
        <Paper
          variant="outlined"
          sx={{ p: 2, border: `1.5px solid ${BORDER}`, bgcolor: "#fff5f5", textAlign: "center" }}
        >
          <ErrorIcon sx={{ color: "#f44336", fontSize: 40, mb: 1 }} />
          <Typography variant="body2" color="error" gutterBottom>
            Failed to load {label.toLowerCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {error}
          </Typography>
          {onRetry && (
            <Button size="small" onClick={onRetry} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <SectionLabel Icon={Icon} label={label} count={selected.length} />
      <Paper
        variant="outlined"
        sx={{ border: `1.5px solid ${BORDER}`, borderRadius: 2, overflow: "hidden" }}
      >
        {/* Search box */}
        <Box sx={{ p: 1, borderBottom: `1px solid ${BORDER}`, bgcolor: BG_LIGHT }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${label.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#888" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 1.5, fontSize: 13 },
            }}
          />
        </Box>

        {/* Select-all row — only shown when multiple=true and there is more than one filtered item */}
        {multiple && filteredIds.length > 1 && (
          <Box
            onClick={toggleAll}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.8,
              cursor: "pointer",
              bgcolor: allSelected ? "#e8f5e9" : "transparent",
              borderBottom: `1px solid ${BORDER}`,
              "&:hover": { bgcolor: BG_LIGHT },
            }}
          >
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={
                selected.some((id) => filteredIds.includes(id)) && !allSelected
              }
              onChange={toggleAll}
              onClick={(e) => e.stopPropagation()} // prevent double-fire from parent Box click
              sx={{ p: 0.5, mr: 1, color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {allSelected ? "Deselect all" : `Select all (${filteredIds.length})`}
            </Typography>
          </Box>
        )}

        {/* Item list */}
        <List dense disablePadding sx={{ maxHeight, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <ListItem sx={{ justifyContent: "center", py: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {query ? "No matching items found" : emptyText}
              </Typography>
            </ListItem>
          ) : (
            filtered.map((item) => {
              const id = item._id || item.id;
              const checked = selected.includes(id);
              return (
                <ListItem
                  key={id}
                  button
                  onClick={() => onToggle(id)}
                  sx={{
                    px: 1.5,
                    bgcolor: checked ? "#e3f0f5" : "transparent",
                    borderBottom: `1px solid ${BORDER}`,
                    "&:last-child": { borderBottom: "none" },
                    "&:hover": { bgcolor: checked ? "#d4e9f0" : BG_LIGHT },
                    transition: "background 0.15s",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={() => onToggle(id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 0.5, mr: 1, color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
                  />
                  {renderAvatar && (
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      {renderAvatar(item)}
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={checked ? 600 : 400} noWrap>
                        {renderPrimary(item)}
                      </Typography>
                    }
                    secondary={
                      renderSecondary && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {renderSecondary(item)}
                        </Typography>
                      )
                    }
                  />
                  {checked && (
                    <CheckCircleIcon sx={{ fontSize: 16, color: PRIMARY, ml: 0.5 }} />
                  )}
                </ListItem>
              );
            })
          )}
        </List>
      </Paper>
    </Box>
  );
};

// ── SelectedChips ─────────────────────────────────────────────────────────────
const SelectedChips = ({ ids = [], items = [], labelKey = "name", onRemove }) => {
  if (!ids.length) return null;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
      {ids.map((id) => {
        const item = items.find((i) => (i._id || i.id) === id);
        const label = item ? item[labelKey] || item.name || id : id;
        return (
          <Chip
            key={id}
            label={label}
            size="small"
            onDelete={() => onRemove(id)}
            sx={{
              bgcolor: PRIMARY,
              color: "#fff",
              fontSize: 11,
              "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", fontSize: 14 },
            }}
          />
        );
      })}
    </Box>
  );
};

// ── Step indicator ────────────────────────────────────────────────────────────
// FIX: only allow clicking on already-completed steps (idx < step), validated by parent.
const StepIndicator = ({ steps, step, onStepClick }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {steps.map((label, idx) => (
      <React.Fragment key={idx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box
            onClick={() => { if (idx < step) onStepClick(idx); }}
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: idx < step ? "#4caf50" : idx === step ? PRIMARY : "#ccc",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: idx < step ? "pointer" : "default",
              transition: "background 0.2s",
            }}
          >
            {idx < step ? "✓" : idx + 1}
          </Box>
          <Typography
            variant="caption"
            fontWeight={idx === step ? 700 : 400}
            color={idx === step ? PRIMARY : idx < step ? "#4caf50" : "text.secondary"}
          >
            {label}
          </Typography>
        </Box>
        {idx < steps.length - 1 && (
          <Box
            sx={{ flex: 1, height: 2, mx: 1, bgcolor: idx < step ? "#4caf50" : BORDER }}
          />
        )}
      </React.Fragment>
    ))}
  </Box>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const AssignmentModal = ({
  open,
  onClose,
  onSuccess,
  mode = "assign",
  assignmentId,
  preselectedChecklists = [],
  preselectedChecklist,
}) => {
  const { user, token } = useAuth();
  const {
    assignToAdmin,
    assignToTeam,
    reassignToAdmin,
    reassignToTeam,
    assignLoading,
    assignError,
    clearAssign,
  } = useAssignment();

  const { assets, getAllAssets, loading: assetsLoading, error: assetsError } = useAsset();

  // ── Role flags ────────────────────────────────────────────────────────────
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";

  // ── Local data state ──────────────────────────────────────────────────────
  const [checklists, setChecklists]           = useState([]);
  const [recipients, setRecipients]           = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [checklistsError, setChecklistsError]     = useState(null);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsError, setRecipientsError]     = useState(null);
  const [assetsFetchError, setAssetsFetchError]   = useState(null);

  // ── Selection state ───────────────────────────────────────────────────────
  // FIX: stabilise the initial checklist ids with a ref so the useMemo doesn't
  //      fire on every render when the caller passes a literal array `[]`.
  const preselectedChecklistsRef = useRef(preselectedChecklists);
  useEffect(() => { preselectedChecklistsRef.current = preselectedChecklists; }, [preselectedChecklists]);

  const initialChecklistIds = useMemo(() => {
    if (preselectedChecklistsRef.current.length > 0) return preselectedChecklistsRef.current;
    if (preselectedChecklist?._id) return [preselectedChecklist._id];
    return [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedChecklist?._id]);

  const [step, setStep]               = useState(0);
  const [selChecklists, setSelChecklists] = useState(initialChecklistIds);
  const [selAssets, setSelAssets]         = useState([]);
  const [selRecips, setSelRecips]         = useState([]);
  const [dueDate, setDueDate]             = useState(tomorrow());
  const [priority, setPriority]           = useState("medium");
  const [notes, setNotes]                 = useState("");
  const [submitError, setSubmitError]     = useState("");
  const [submitting, setSubmitting]       = useState(false);

  // ── Stable auth headers ───────────────────────────────────────────────────
  // FIX: unified token key lookup order; keep consistent with what the app stores
  const getAuthHeaders = useCallback(() => {
    const accessToken =
      token ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  // ── Data loaders ──────────────────────────────────────────────────────────

  const loadChecklists = useCallback(async () => {
    setChecklistsLoading(true);
    setChecklistsError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/checklists`, {
        headers: getAuthHeaders(),
        // FIX: actually filter for published status as intended
        params: { status: "published" },
      });

      if (response.data?.success) {
        const checklistData = response.data.checklists || [];
        setChecklists(
          checklistData.map((c) => ({
            _id:            c._id,
            id:             c._id,
            name:           c.name || "Untitled Checklist",
            title:          c.name,
            description:    c.description || "",
            checklistType:  c.checklistType || "custom",
            fields:         c.fields || [],
            status:         c.status,
            category:       c.category,
            tags:           c.tags,
            version:        c.version,
            submissionCount: c.submissionCount || 0,
            totalFields:    c.totalFields || c.fields?.length || 0,
            createdAt:      c.createdAt,
          })),
        );
      } else {
        throw new Error(response.data?.message || "Failed to load checklists");
      }
    } catch (err) {
      console.error("[AssignmentModal] loadChecklists:", err);
      setChecklistsError(err.response?.data?.message || err.message || "Failed to load checklists");
      setChecklists([]);
    } finally {
      setChecklistsLoading(false);
    }
  }, [getAuthHeaders]);

  const loadAdmins = useCallback(async () => {
    setRecipientsLoading(true);
    setRecipientsError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/clients`, { headers: getAuthHeaders() });
      if (response.data?.success) {
        setRecipients(
          (response.data.clients || []).map((c) => ({
            _id:            c._id,
            id:             c._id,
            name:           c.customerName || c.name || "Unknown",
            email:          c.email,
            role:           "admin",
            status:         c.status,
            membershipPlan: c.membershipPlan,
            phone:          c.phone,
            initials:       initials(c.customerName || c.name || ""),
          })),
        );
      } else {
        throw new Error(response.data?.message || "Failed to load admins");
      }
    } catch (err) {
      console.error("[AssignmentModal] loadAdmins:", err);
      setRecipientsError(err.response?.data?.message || err.message || "Failed to load admins");
      setRecipients([]);
    } finally {
      setRecipientsLoading(false);
    }
  }, [getAuthHeaders]);

  const loadTeamMembers = useCallback(async () => {
    setRecipientsLoading(true);
    setRecipientsError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/team`, { headers: getAuthHeaders() });
      if (response.data?.success) {
        setRecipients(
          (response.data.members || []).map((m) => ({
            _id:       m.id,
            id:        m.id,
            name:      `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email,
            firstName: m.firstName,
            lastName:  m.lastName,
            email:     m.email,
            role:      m.teamRoleDisplay || m.teamRole || "team",
            department: m.department,
            location:  m.location,
            status:    m.status,
            initials:
              (m.firstName?.[0] || "") + (m.lastName?.[0] || "") ||
              m.email?.[0]?.toUpperCase() ||
              "?",
          })),
        );
      } else {
        throw new Error(response.data?.message || "Failed to load team members");
      }
    } catch (err) {
      console.error("[AssignmentModal] loadTeamMembers:", err);
      setRecipientsError(err.response?.data?.message || err.message || "Failed to load team members");
      setRecipients([]);
    } finally {
      setRecipientsLoading(false);
    }
  }, [getAuthHeaders]);

  const loadRecipients = useCallback(async () => {
    if (isSuperAdmin) await loadAdmins();
    else if (isAdmin) await loadTeamMembers();
  }, [isSuperAdmin, isAdmin, loadAdmins, loadTeamMembers]);

  const loadAssets = useCallback(async () => {
    if (!isAdmin) return;
    setAssetsFetchError(null);
    try {
      const res = await getAllAssets({ limit: 200 });
      if (!res?.success) setAssetsFetchError(res?.message || "Failed to load assets");
    } catch (err) {
      console.error("[AssignmentModal] loadAssets:", err);
      setAssetsFetchError(err.message || "Failed to load assets");
    }
  }, [getAllAssets, isAdmin]);

  // ── Open / reset ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    clearAssign?.();
    setSubmitError("");
    setStep(0);
    setSelChecklists(initialChecklistIds);
    setSelAssets([]);
    setSelRecips([]);
    setDueDate(tomorrow());
    setPriority("medium");
    setNotes("");

    const fetches = [loadChecklists(), loadRecipients()];
    if (isAdmin) fetches.push(loadAssets());
    Promise.all(fetches).catch((e) =>
      console.error("[AssignmentModal] parallel fetch error:", e),
    );
  }, [open]); // intentionally only on open change — loaders are stable callbacks
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // ── Toggle helpers ────────────────────────────────────────────────────────
  // FIX: stable callbacks — no new function reference on every render
  const toggleChecklist = useCallback(
    (id) => setSelChecklists((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]),
    [],
  );
  const toggleAsset = useCallback(
    (id) => setSelAssets((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]),
    [],
  );
  // FIX: super-admin is single-select — toggling the same id deselects, toggling a new id replaces
  const toggleRecipSingle = useCallback(
    (id) => setSelRecips((prev) => (prev[0] === id ? [] : [id])),
    [],
  );
  const toggleRecipMulti = useCallback(
    (id) => setSelRecips((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]),
    [],
  );

  // ── Navigation guards ─────────────────────────────────────────────────────
  const canGoStep1 = isSuperAdmin
    ? selChecklists.length > 0
    : selChecklists.length > 0 || selAssets.length > 0;

  const canGoStep2 = selRecips.length > 0;
  const canSubmit  = !!dueDate && !!priority;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      let result;

      if (mode === "reassign") {
        if (isSuperAdmin) {
          result = await reassignToAdmin(assignmentId, {
            adminId: selRecips[0], dueDate, priority, notes,
          });
        } else {
          result = await reassignToTeam(assignmentId, {
            teamMemberIds: selRecips, dueDate, priority, notes,
          });
        }
      } else {
        if (isSuperAdmin) {
          result = await assignToAdmin({
            checklistIds: selChecklists, adminId: selRecips[0], dueDate, priority, notes,
          });
        } else {
          result = await assignToTeam({
            checklistIds: selChecklists.length ? selChecklists : undefined,
            assetIds:     selAssets.length     ? selAssets     : undefined,
            teamMemberIds: selRecips,
            dueDate, priority, notes,
          });
        }
      }

      if (result?.success) {
        onSuccess?.(result);
        onClose();
      } else {
        setSubmitError(result?.error || "Assignment failed. Please try again.");
      }
    } catch (err) {
      setSubmitError(err.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step labels ───────────────────────────────────────────────────────────
  const steps = isSuperAdmin
    ? ["Select Checklists", "Select Admin", "Details"]
    : ["Select Items", "Select Team Members", "Details"];

  // ── Step 0: items ─────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <SearchableMultiSelect
        label="Checklists"
        items={checklists}
        selected={selChecklists}
        onToggle={toggleChecklist}
        onSetSelected={setSelChecklists}
        loading={checklistsLoading}
        error={checklistsError}
        onRetry={loadChecklists}
        icon={AssignmentIcon}
        renderPrimary={(c) => c.name || "Untitled"}
        renderSecondary={(c) => {
          const parts = [];
          if (c.checklistType)   parts.push(c.checklistType);
          if (c.totalFields)     parts.push(`${c.totalFields} fields`);
          if (c.submissionCount) parts.push(`${c.submissionCount} submissions`);
          return parts.join(" · ") || "No details";
        }}
        renderAvatar={(c) => (
          <Avatar sx={{ width: 28, height: 28, bgcolor: PRIMARY, fontSize: 11 }}>
            {initials(c.name || "C")}
          </Avatar>
        )}
        emptyText="No published checklists found"
      />

      {isAdmin && (
        <SearchableMultiSelect
          label="Assets"
          items={assets || []}
          selected={selAssets}
          onToggle={toggleAsset}
          onSetSelected={setSelAssets}
          loading={assetsLoading}
          error={assetsFetchError || assetsError}
          onRetry={loadAssets}
          icon={InventoryIcon}
          renderPrimary={(a) => a.name || a.assetName || "Unnamed Asset"}
          renderSecondary={(a) =>
            [a.category || a.assetCategory, a.assetTag || a.serialNumber]
              .filter(Boolean)
              .join(" · ") || "—"
          }
          renderAvatar={() => (
            <Avatar sx={{ width: 28, height: 28, bgcolor: "#607d8b", fontSize: 11 }}>
              <InventoryIcon sx={{ fontSize: 14 }} />
            </Avatar>
          )}
          emptyText="No assets found"
        />
      )}

      {(selChecklists.length > 0 || selAssets.length > 0) && (
        <Paper sx={{ p: 1.5, bgcolor: BG_LIGHT, borderRadius: 2 }}>
          <Typography variant="caption" color={PRIMARY} fontWeight={600}>
            Selected items
          </Typography>
          <SelectedChips
            ids={selChecklists}
            items={checklists}
            labelKey="name"
            onRemove={toggleChecklist}
          />
          {isAdmin && (
            <SelectedChips
              ids={selAssets}
              items={assets || []}
              labelKey="name"
              onRemove={toggleAsset}
            />
          )}
        </Paper>
      )}
    </Box>
  );

  // ── Step 1: recipients ────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SearchableMultiSelect
        label={isSuperAdmin ? "Admins" : "Team Members"}
        items={recipients}
        selected={selRecips}
        // FIX: correct single-select handler for super_admin, multi for admin
        onToggle={isSuperAdmin ? toggleRecipSingle : toggleRecipMulti}
        // FIX: batch setter only passed for multi-select (super_admin has no "select all")
        onSetSelected={isSuperAdmin ? undefined : setSelRecips}
        multiple={!isSuperAdmin}
        loading={recipientsLoading}
        error={recipientsError}
        onRetry={loadRecipients}
        icon={isSuperAdmin ? BusinessIcon : PersonIcon}
        renderPrimary={(m) => m.name || m.email || "Unknown"}
        renderSecondary={(m) =>
          isSuperAdmin
            ? [m.email, m.membershipPlan, m.status].filter(Boolean).join(" · ")
            : [m.role, m.department, m.location, m.email].filter(Boolean).join(" · ")
        }
        renderAvatar={(m) => (
          <Avatar sx={{ width: 28, height: 28, bgcolor: PRIMARY, fontSize: 11 }}>
            {m.initials || initials(m.name || "")}
          </Avatar>
        )}
        emptyText={isSuperAdmin ? "No admins found" : "No team members found"}
      />

      {selRecips.length === 0 && (
        <Alert severity="info" sx={{ fontSize: 12, py: 0.5 }}>
          {isSuperAdmin
            ? "Select one admin to assign the checklist(s) to."
            : "Select at least one team member to assign to."}
        </Alert>
      )}

      {selRecips.length > 0 && (
        <Paper sx={{ p: 1.5, bgcolor: BG_LIGHT, borderRadius: 2 }}>
          <Typography variant="caption" color={PRIMARY} fontWeight={600}>
            Selected {isSuperAdmin ? "admin" : "team members"}
          </Typography>
          <SelectedChips
            ids={selRecips}
            items={recipients}
            labelKey="name"
            onRemove={(id) => setSelRecips((prev) => prev.filter((x) => x !== id))}
          />
        </Paper>
      )}
    </Box>
  );

  // ── Step 2: details ───────────────────────────────────────────────────────
  const renderStep2 = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography
          variant="body2" fontWeight={600} color={PRIMARY} mb={0.5}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <ScheduleIcon sx={{ fontSize: 16 }} /> Due Date *
        </Typography>
        <TextField
          fullWidth
          type="date"
          size="small"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          inputProps={{ min: new Date().toISOString().split("T")[0] }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Box>

      <Box>
        <Typography
          variant="body2" fontWeight={600} color={PRIMARY} mb={0.5}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <FlagIcon sx={{ fontSize: 16 }} /> Priority *
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {PRIORITIES.map((p) => (
            <Box
              key={p.value}
              onClick={() => setPriority(p.value)}
              sx={{
                px: 2, py: 0.8, borderRadius: 2, cursor: "pointer",
                border: `2px solid ${priority === p.value ? p.color : BORDER}`,
                bgcolor: priority === p.value ? `${p.color}18` : "#fff",
                display: "flex", alignItems: "center", gap: 0.5,
                transition: "all 0.15s",
                "&:hover": { borderColor: p.color, bgcolor: `${p.color}10` },
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
              <Typography
                variant="caption"
                fontWeight={priority === p.value ? 700 : 400}
                sx={{ color: priority === p.value ? p.color : "text.secondary" }}
              >
                {p.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Typography
          variant="body2" fontWeight={600} color={PRIMARY} mb={0.5}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <NotesIcon sx={{ fontSize: 16 }} /> Notes (optional)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          value={notes}
          placeholder="Add context or instructions for this assignment…"
          onChange={(e) => setNotes(e.target.value)}
          inputProps={{ maxLength: 500 }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <Typography variant="caption" color="text.secondary" align="right" display="block">
          {notes.length}/500
        </Typography>
      </Box>

      {/* Summary */}
      <Paper sx={{ p: 2, bgcolor: BG_LIGHT, borderRadius: 2, border: `1px solid ${BORDER}` }}>
        <Typography variant="caption" color={PRIMARY} fontWeight={700} display="block" mb={1}>
          Assignment Summary
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {selChecklists.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              📋 {selChecklists.length} checklist{selChecklists.length > 1 ? "s" : ""}
            </Typography>
          )}
          {selAssets.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              📦 {selAssets.length} asset{selAssets.length > 1 ? "s" : ""}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            👤 {selRecips.length} recipient{selRecips.length > 1 ? "s" : ""}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📅 Due: {dueDate}
          </Typography>
          <Typography
            variant="caption" color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            🚩 Priority:{" "}
            <Box
              component="span"
              sx={{
                color: PRIORITIES.find((p) => p.value === priority)?.color,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {priority}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: PRIMARY,
          px: 3, py: 2, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AssignmentIcon sx={{ color: "#fff", fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#fff">
              {mode === "reassign" ? "Reassign" : "New Assignment"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Step {step + 1} of 3 — {steps[step]}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Step indicator */}
      <Box
        sx={{
          px: 3, pt: 2, pb: 1, flexShrink: 0,
          bgcolor: BG_LIGHT, borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <StepIndicator steps={steps} step={step} onStepClick={setStep} />
      </Box>

      {/* Content */}
      <DialogContent sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
        {(submitError || assignError) && (
          <Alert
            severity="error"
            icon={<WarningIcon />}
            onClose={() => setSubmitError("")}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {submitError || assignError}
          </Alert>
        )}
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          px: 3, py: 2, flexShrink: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: `1px solid ${BORDER}`, bgcolor: "#fafafa",
        }}
      >
        <Button
          onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
          variant="outlined"
          size="small"
          sx={{ borderColor: BORDER, color: "text.secondary", borderRadius: 2, textTransform: "none" }}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < 2 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            variant="contained"
            size="small"
            disabled={step === 0 ? !canGoStep1 : !canGoStep2}
            sx={{
              bgcolor: PRIMARY, borderRadius: 2, textTransform: "none",
              fontWeight: 600, px: 3,
              "&:hover": { bgcolor: PRIMARY_L },
              "&.Mui-disabled": { bgcolor: "#b0c4cc", color: "#fff" },
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            disabled={!canSubmit || submitting || assignLoading}
            startIcon={
              submitting || assignLoading
                ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                : <CheckCircleIcon />
            }
            sx={{
              bgcolor: PRIMARY, borderRadius: 2, textTransform: "none",
              fontWeight: 600, px: 3,
              "&:hover": { bgcolor: PRIMARY_L },
              "&.Mui-disabled": { bgcolor: "#b0c4cc", color: "#fff" },
            }}
          >
            {submitting || assignLoading
              ? "Assigning…"
              : mode === "reassign" ? "Reassign" : "Assign Now"}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default AssignmentModal;
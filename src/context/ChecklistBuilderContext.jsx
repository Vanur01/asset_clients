// context/ChecklistBuilderContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const ChecklistBuilderContext = createContext();

export const useChecklistBuilder = () => {
  const context = useContext(ChecklistBuilderContext);
  if (!context) {
    throw new Error("useChecklistBuilder must be used within ChecklistBuilderProvider");
  }
  return context;
};

// ─── Field type maps ─────────────────────────────────────────────────────────
// These must exactly match the Mongoose enum values in the backend schema:
// 'text_input','text_area','dropdown','checkbox','rating','image_upload',
// 'signature','date_picker','heading','divider','file_upload','number_input',
// 'email_input','phone_input','url_input','time_picker','datetime_picker',
// 'switch','slider','multi_select'

// UI type  →  API fieldType (backend enum value)
const FIELD_TYPE_MAP = {
  text_input:   "text_input",
  text_area:    "text_area",    // ← was missing; caused "textarea" to fall through
  textarea:     "text_area",    // alias for convenience
  dropdown:     "dropdown",
  checkbox:     "checkbox",
  rating:       "rating",
  image_upload: "image_upload",
  image:        "image_upload", // alias
  signature:    "signature",
  date_picker:  "date_picker",
  // common extras
  number_input: "number_input",
  email_input:  "email_input",
  phone_input:  "phone_input",
  switch:       "switch",
  slider:       "slider",
  multi_select: "multi_select",
};

// API fieldType  →  UI display type
const DISPLAY_FIELD_TYPE_MAP = {
  text_input:   "text_input",
  text_area:    "text_area",
  dropdown:     "dropdown",
  checkbox:     "checkbox",
  rating:       "rating",
  image_upload: "image_upload",
  signature:    "signature",
  date_picker:  "date_picker",
  number_input: "number_input",
  email_input:  "email_input",
  phone_input:  "phone_input",
  switch:       "switch",
  slider:       "slider",
  multi_select: "multi_select",
};

export const ChecklistBuilderProvider = ({ children }) => {
  const { get, post, put, del, delete: deleteMethod, logout } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  // ─── Authenticated axios wrapper ─────────────────────────────────────────
  const makeAuthenticatedRequest = useCallback(async (method, url, data = null) => {
    const accessToken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!accessToken) throw new Error("No authentication token found");

    const config = {
      method,
      url: `https://assset-management-backend-4.onrender.com/api/v1${url}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type":
          data instanceof FormData ? "multipart/form-data" : "application/json",
      },
      data,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        if (logout) logout();
        throw new Error("Session expired. Please login again.");
      }
      throw err;
    }
  }, [logout]);

  // ─── Helper: resolve API fieldType, throw clearly if unknown ─────────────
  const resolveFieldType = useCallback((uiType) => {
    const resolved = FIELD_TYPE_MAP[uiType];
    if (!resolved) {
      console.warn(
        `[ChecklistBuilder] Unknown field type "${uiType}" – falling back to "text_input". ` +
        `Add it to FIELD_TYPE_MAP if this is intentional.`
      );
      return "text_input";
    }
    return resolved;
  }, []);

  // ─── Create Checklist ─────────────────────────────────────────────────────
  const createChecklist = useCallback(async (checklistData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Creating checklist:", JSON.stringify(checklistData, null, 2));

      let response;
      if (post) {
        response = await post("/checklist", checklistData);
      } else {
        response = await makeAuthenticatedRequest("POST", "/checklist", checklistData);
      }

      console.log("Create checklist response:", response);

      if (response?.success || response?.data) {
        setSuccess("Checklist created successfully!");
        return { success: true, data: response.data || response };
      }
      return { success: false, error: response?.message || "Unknown error" };
    } catch (err) {
      console.error("Create checklist error:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Failed to create checklist";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [post, makeAuthenticatedRequest]);

  // ─── Get All Checklists ───────────────────────────────────────────────────
  const getAllChecklists = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let url = "/checklist";
      const q = new URLSearchParams();
      if (filters.type)      q.append("type",      filters.type);
      if (filters.status)    q.append("status",    filters.status);
      if (filters.category)  q.append("category",  filters.category);
      if (filters.search)    q.append("search",    filters.search);
      if (filters.page)      q.append("page",      filters.page);
      if (filters.limit)     q.append("limit",     filters.limit);
      if (q.toString())      url += `?${q.toString()}`;

      const response = get
        ? await get(url)
        : await makeAuthenticatedRequest("GET", url);

      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch checklists";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [get, makeAuthenticatedRequest]);

  // ─── Get Checklist by ID ──────────────────────────────────────────────────
  const getChecklistById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = get
        ? await get(`/checklist/${id}`)
        : await makeAuthenticatedRequest("GET", `/checklist/${id}`);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch checklist";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [get, makeAuthenticatedRequest]);

  // ─── Update Checklist ─────────────────────────────────────────────────────
  const updateChecklist = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = put
        ? await put(`/checklist/${id}`, updateData)
        : await makeAuthenticatedRequest("PUT", `/checklist/${id}`, updateData);

      if (response?.success) {
        setSuccess("Checklist updated successfully!");
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update checklist";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [put, makeAuthenticatedRequest]);

  // ─── Delete Checklist ─────────────────────────────────────────────────────
  const deleteChecklist = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const deleteFunction = del || deleteMethod;
      const response = (deleteFunction && typeof deleteFunction === "function")
        ? await deleteFunction(`/checklist/${id}`)
        : await makeAuthenticatedRequest("DELETE", `/checklist/${id}`);

      const isSuccess =
        response?.success === true ||
        response?.status === "success" ||
        (response && !response.error);

      if (isSuccess) {
        setSuccess("Checklist deleted successfully!");
        return { success: true };
      }
      return { success: false, error: response?.message || "Failed to delete checklist" };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete checklist";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [del, deleteMethod, makeAuthenticatedRequest]);

  // ─── Clone Checklist ──────────────────────────────────────────────────────
  const cloneChecklist = useCallback(async (id, newName) => {
    setLoading(true);
    setError(null);
    try {
      const response = post
        ? await post(`/checklist/clone/${id}`, { newName })
        : await makeAuthenticatedRequest("POST", `/checklist/clone/${id}`, { newName });

      if (response?.success) {
        setSuccess("Checklist cloned successfully!");
        return { success: true, data: response };
      }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to clone checklist";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [post, makeAuthenticatedRequest]);

  // ─── Import from Excel ────────────────────────────────────────────────────
  const importFromExcel = useCallback(async (file, checklistName = null) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("excelFile", file);
      if (checklistName) formData.append("name", checklistName);

      const response = post
        ? await post("/checklist/import-excel", formData)
        : await makeAuthenticatedRequest("POST", "/checklist/import-excel", formData);

      if (response?.success) {
        setSuccess("Checklist imported successfully!");
        return { success: true, data: response._doc || response.data || response };
      }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to import checklist";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [post, makeAuthenticatedRequest]);

  // ─── Global Checklists ────────────────────────────────────────────────────
  const getGlobalChecklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = get
        ? await get("/checklist/global")
        : await makeAuthenticatedRequest("GET", "/checklist/global");
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch global checklists";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [get, makeAuthenticatedRequest]);

  const submitForGlobalApproval = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = post
        ? await post(`/checklist/${id}/submit-for-approval`)
        : await makeAuthenticatedRequest("POST", `/checklist/${id}/submit-for-approval`);
      if (response?.success) { setSuccess("Checklist submitted for approval!"); return { success: true }; }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to submit for approval";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [post, makeAuthenticatedRequest]);

  const approveGlobalChecklist = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = post
        ? await post(`/checklist/${id}/approve`)
        : await makeAuthenticatedRequest("POST", `/checklist/${id}/approve`);
      if (response?.success) { setSuccess("Checklist approved!"); return { success: true }; }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to approve checklist";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [post, makeAuthenticatedRequest]);

  const rejectGlobalChecklist = useCallback(async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = post
        ? await post(`/checklist/${id}/reject`, { reason })
        : await makeAuthenticatedRequest("POST", `/checklist/${id}/reject`, { reason });
      if (response?.success) { setSuccess("Checklist rejected!"); return { success: true }; }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to reject checklist";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [post, makeAuthenticatedRequest]);

  // ─── Assignment APIs ──────────────────────────────────────────────────────
  const assignChecklistToAdmin = useCallback(async (data) => {
    setLoading(true); setError(null);
    try {
      const response = post
        ? await post("/assignments/assign-to-admin", data)
        : await makeAuthenticatedRequest("POST", "/assignments/assign-to-admin", data);
      if (response?.success) { setSuccess("Assigned to admin!"); return { success: true, data: response.data }; }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to assign";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [post, makeAuthenticatedRequest]);

  const assignChecklistToTeam = useCallback(async (data) => {
    setLoading(true); setError(null);
    try {
      const response = post
        ? await post("/assignments/assign-to-team", data)
        : await makeAuthenticatedRequest("POST", "/assignments/assign-to-team", data);
      if (response?.success) { setSuccess("Assigned to team!"); return { success: true, data: response.data }; }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to assign to team";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [post, makeAuthenticatedRequest]);

  const getAssignments = useCallback(async (filters = {}) => {
    setLoading(true); setError(null);
    try {
      let url = "/assignments";
      const q = new URLSearchParams();
      if (filters.status)      q.append("status",      filters.status);
      if (filters.checklistId) q.append("checklistId", filters.checklistId);
      if (filters.assignedTo)  q.append("assignedTo",  filters.assignedTo);
      if (filters.page)        q.append("page",        filters.page);
      if (filters.limit)       q.append("limit",       filters.limit);
      if (q.toString())        url += `?${q.toString()}`;
      const response = get
        ? await get(url)
        : await makeAuthenticatedRequest("GET", url);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch assignments";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [get, makeAuthenticatedRequest]);

  const getAssignmentById = useCallback(async (id) => {
    setLoading(true); setError(null);
    try {
      const response = get
        ? await get(`/assignments/${id}`)
        : await makeAuthenticatedRequest("GET", `/assignments/${id}`);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch assignment";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [get, makeAuthenticatedRequest]);

  const updateAssignmentStatus = useCallback(async (id, status, responseData = null) => {
    setLoading(true); setError(null);
    try {
      const response = put
        ? await put(`/assignments/${id}/status`, { status, responseData })
        : await makeAuthenticatedRequest("PUT", `/assignments/${id}/status`, { status, responseData });
      if (response?.success) { setSuccess("Assignment status updated!"); return { success: true, data: response.data }; }
      return { success: false, error: response?.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update assignment status";
      setError(errorMsg); return { success: false, error: errorMsg };
    } finally { setLoading(false); }
  }, [put, makeAuthenticatedRequest]);

  // ─── Field / Section converters ───────────────────────────────────────────
  const convertUIToAPIField = useCallback((uiField) => ({
    label:       uiField.label,
    fieldType:   resolveFieldType(uiField.type),   // ← uses safe resolver
    isRequired:  uiField.required || false,
    placeholder: uiField.placeholder || "",
    options:     uiField.options || [],
    ratingMax:   uiField.ratingMax || 5,
    checkboxItems: uiField.checkboxItems || [],
    order:       uiField.order || 0,
    columnWidth: uiField.columnWidth || 12,
    validationRules: {
      minLength:    uiField.minLength || null,
      maxLength:    uiField.maxLength || null,
      pattern:      uiField.pattern || null,
    },
  }), [resolveFieldType]);

  const convertAPIToUIField = useCallback((apiField) => ({
    id:           apiField._id || `field_${Date.now()}`,
    label:        apiField.label,
    type:         DISPLAY_FIELD_TYPE_MAP[apiField.fieldType] || "text_input",
    required:     apiField.isRequired,
    placeholder:  apiField.placeholder,
    options:      apiField.options || [],
    ratingMax:    apiField.ratingMax,
    checkboxItems: apiField.checkboxItems,
    order:        apiField.order,
    columnWidth:  apiField.columnWidth,
    minLength:    apiField.validationRules?.minLength,
    maxLength:    apiField.validationRules?.maxLength,
    pattern:      apiField.validationRules?.pattern,
  }), []);

  const convertUIToAPISection = useCallback((section, order) => ({
    sectionTitle:       section.sectionTitle,
    sectionDescription: section.sectionDescription || "",
    fields:             section.fields.map((field, idx) =>
      convertUIToAPIField({ ...field, order: idx })
    ),
    order,
  }), [convertUIToAPIField]);

  const convertAPIToUISection = useCallback((apiSection) => ({
    id:                 apiSection._id,
    sectionTitle:       apiSection.sectionTitle,
    sectionDescription: apiSection.sectionDescription || "",
    fields:             apiSection.fields.map((field, idx) =>
      convertAPIToUIField({ ...field, order: idx })
    ),
  }), [convertAPIToUIField]);

  const prepareChecklistData = useCallback(
    (name, description, type, category, sections, status = "draft") => ({
      name,
      description,
      type,
      category,
      status,
      sections: sections.map((section, idx) =>
        convertUIToAPISection(section, idx)
      ),
    }),
    [convertUIToAPISection]
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const value = {
    loading, error, success,
    createChecklist, getAllChecklists, getChecklistById,
    updateChecklist, deleteChecklist, cloneChecklist, importFromExcel,
    getGlobalChecklists, submitForGlobalApproval, approveGlobalChecklist, rejectGlobalChecklist,
    assignChecklistToAdmin, assignChecklistToTeam,
    getAssignments, getAssignmentById, updateAssignmentStatus,
    convertUIToAPIField, convertAPIToUIField,
    convertUIToAPISection, convertAPIToUISection,
    prepareChecklistData, clearMessages,
    FIELD_TYPE_MAP, DISPLAY_FIELD_TYPE_MAP,
  };

  return (
    <ChecklistBuilderContext.Provider value={value}>
      {children}
    </ChecklistBuilderContext.Provider>
  );
};
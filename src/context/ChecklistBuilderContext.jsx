// context/ChecklistBuilderContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const ChecklistBuilderContext = createContext();

export const useChecklistBuilder = () => {
  const context = useContext(ChecklistBuilderContext);
  if (!context) {
    throw new Error(
      "useChecklistBuilder must be used within ChecklistBuilderProvider",
    );
  }
  return context;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://assset-management-backend-4.onrender.com/api/v1";

// ─────────────────────────────────────────────────────────────────────────────
// Field type maps
//
// BACKEND_FIELD_TYPES  – the exact strings the Mongoose enum accepts
// FRONTEND_TO_BACKEND  – maps any UI label → backend enum value
// BACKEND_TO_FRONTEND  – maps backend value → UI display label
// ─────────────────────────────────────────────────────────────────────────────
export const BACKEND_FIELD_TYPES = [
  "text_input",
  "text_area",
  "dropdown",
  "checkbox",
  "rating",
  "image_upload",
  "signature",
  "date", // ← backend enum uses "date" not "date_picker"
  "file_upload",
];

// Any UI field type → canonical backend enum value
const FRONTEND_TO_BACKEND = {
  text_input: "text_input",
  text_area: "text_area",
  textarea: "text_area", // alias
  dropdown: "dropdown",
  checkbox: "checkbox",
  rating: "rating",
  image_upload: "image_upload",
  image: "image_upload", // alias
  signature: "signature",
  date: "date",
  date_picker: "date", // ← frontend alias → backend "date"
  file_upload: "file_upload",
  file: "file_upload", // alias
};

// Backend enum value → UI display label
const BACKEND_TO_FRONTEND = {
  text_input: "text_input",
  text_area: "text_area",
  dropdown: "dropdown",
  checkbox: "checkbox",
  rating: "rating",
  image_upload: "image_upload",
  signature: "signature",
  date: "date", // keep as "date" in UI too
  file_upload: "file_upload",
};

// ─────────────────────────────────────────────────────────────────────────────
export const ChecklistBuilderProvider = ({ children }) => {
  const {
    get,
    post,
    put,
    del,
    delete: deleteMethod,
    logout,
    token,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ── Authenticated axios fallback ──────────────────────────────────────────
  const makeAuthenticatedRequest = useCallback(
    async (method, url, data = null) => {
      const accessToken =
        token ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!accessToken) throw new Error("No authentication token found");

      const isFormData = data instanceof FormData;
      const fullUrl = `${API_BASE}${url}`;

      const config = {
        method,
        url: fullUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
        ...(data !== null && { data }),
      };

      try {
        console.log(`Making ${method.toUpperCase()} request to: ${fullUrl}`);
        const response = await axios(config);
        return response.data;
      } catch (err) {
        console.error(`Error in ${method.toUpperCase()} ${url}:`, err);

        if (err.response?.status === 401) {
          if (logout) logout();
          throw new Error("Session expired. Please login again.");
        }

        // Log detailed error info for debugging
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
          console.error("Response headers:", err.response.headers);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Request error:", err.message);
        }

        throw err;
      }
    },
    [token, logout],
  );

  // ── Resolve any UI field type → backend enum ──────────────────────────────
  const resolveFieldType = useCallback((uiType) => {
    const resolved = FRONTEND_TO_BACKEND[uiType];
    if (!resolved) {
      console.warn(
        `[ChecklistBuilder] Unknown field type "${uiType}" – falling back to "text_input".`,
      );
      return "text_input";
    }
    return resolved;
  }, []);

  // ── Extract a human-readable error from axios / fetch errors ──────────────
  const extractError = (err, fallback) =>
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback;

  // ── Generic request helper (tries AuthContext methods first) ──────────────
  const request = useCallback(
    async (method, url, data = null) => {
      switch (method.toUpperCase()) {
        case "GET":
          return get
            ? await get(url)
            : await makeAuthenticatedRequest("GET", url);
        case "POST":
          return post
            ? await post(url, data)
            : await makeAuthenticatedRequest("POST", url, data);
        case "PATCH":
          // AuthContext typically exposes `put` but we need PATCH – always use axios
          return await makeAuthenticatedRequest("PATCH", url, data);
        case "PUT":
          return put
            ? await put(url, data)
            : await makeAuthenticatedRequest("PUT", url, data);
        case "DELETE": {
          const deleteFn = del || deleteMethod;
          return deleteFn && typeof deleteFn === "function"
            ? await deleteFn(url)
            : await makeAuthenticatedRequest("DELETE", url);
        }
        default:
          return await makeAuthenticatedRequest(method, url, data);
      }
    },
    [get, post, put, del, deleteMethod, makeAuthenticatedRequest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CREATE CHECKLIST
  //    POST /api/v1/checklists
  //    Body: { name, description, checklistType, isGlobal, globalScope?,
  //            allowedWorkspaces?, category, tags, fields[] }
  // ─────────────────────────────────────────────────────────────────────────
  const createChecklist = useCallback(
    async (checklistData) => {
      setLoading(true);
      setError(null);
      try {
        // Normalise field types before sending
        const normalized = {
          ...checklistData,
          fields: (checklistData.fields || []).map((f, idx) => ({
            ...f,
            type: resolveFieldType(f.type),
            order: f.order ?? idx,
          })),
        };

        const response = await request("POST", "/checklists", normalized);

        if (response?.success || response?.data || response?._id) {
          setSuccess("Checklist created successfully!");
          return { success: true, data: response.data || response };
        }
        return { success: false, error: response?.message || "Unknown error" };
      } catch (err) {
        const msg = extractError(err, "Failed to create checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [request, resolveFieldType],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GET ALL CHECKLISTS
  //    GET /api/v1/checklists?checklistType=&status=&category=&search=&page=&limit=
  // ─────────────────────────────────────────────────────────────────────────
  const getAllChecklists = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams();

        // Backend param is "checklistType" not "type"
        if (filters.checklistType)
          q.append("checklistType", filters.checklistType);
        if (filters.type) q.append("checklistType", filters.type); // legacy alias
        if (filters.isGlobal !== undefined)
          q.append("isGlobal", filters.isGlobal);
        if (filters.status) q.append("status", filters.status);
        if (filters.category) q.append("category", filters.category);
        if (filters.tag) q.append("tag", filters.tag);
        if (filters.search) q.append("search", filters.search);
        if (filters.page) q.append("page", filters.page);
        if (filters.limit) q.append("limit", filters.limit);
        if (filters.sortBy) q.append("sortBy", filters.sortBy);
        if (filters.sortOrder) q.append("sortOrder", filters.sortOrder);

        const url = `/checklists${q.toString() ? `?${q}` : ""}`;

        console.log("[ChecklistBuilder] Fetching checklists with URL:", url);

        const response = await request("GET", url);

        console.log("[ChecklistBuilder] Response received:", response);

        // Handle different response structures
        let checklistsData = response;
        if (response?.data?.checklists) {
          checklistsData = response.data;
        } else if (response?.checklists) {
          checklistsData = response;
        }

        return { success: true, data: checklistsData };
      } catch (err) {
        console.error("[ChecklistBuilder] Error fetching checklists:", err);
        console.error("[ChecklistBuilder] Error response:", err.response?.data);

        const msg = extractError(err, "Failed to fetch checklists");
        setError(msg);

        // Return empty data structure for development to prevent UI crashes
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[ChecklistBuilder] Returning empty checklists array for development",
          );
          return {
            success: true,
            data: {
              checklists: [],
              total: 0,
              page: 1,
              pages: 1,
            },
            _devWarning: msg,
          };
        }

        return { success: false, error: msg, details: err.response?.data };
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GET CHECKLIST BY ID
  //    GET /api/v1/checklists/:id
  // ─────────────────────────────────────────────────────────────────────────
  const getChecklistById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await request("GET", `/checklists/${id}`);
        return { success: true, data: response };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. UPDATE CHECKLIST
  //    PATCH /api/v1/checklists/:id
  // ─────────────────────────────────────────────────────────────────────────
  const updateChecklist = useCallback(
    async (id, updateData) => {
      setLoading(true);
      setError(null);
      try {
        // Normalise field types if fields are included in the update
        const normalized = updateData.fields
          ? {
              ...updateData,
              fields: updateData.fields.map((f, idx) => ({
                ...f,
                type: resolveFieldType(f.type),
                order: f.order ?? idx,
              })),
            }
          : updateData;

        // Always PATCH – AuthContext put() would send PUT
        const response = await makeAuthenticatedRequest(
          "PATCH",
          `/checklists/${id}`,
          normalized,
        );

        if (response?.success || response?.data || response?._id) {
          setSuccess("Checklist updated successfully!");
          return { success: true, data: response.data || response };
        }
        return { success: false, error: response?.message || "Update failed" };
      } catch (err) {
        const msg = extractError(err, "Failed to update checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [makeAuthenticatedRequest, resolveFieldType],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SOFT DELETE CHECKLIST
  //    DELETE /api/v1/checklists/:id
  // ─────────────────────────────────────────────────────────────────────────
  const deleteChecklist = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await request("DELETE", `/checklists/${id}`);
        const isSuccess =
          response?.success === true ||
          response?.status === "success" ||
          (response && !response.error);

        if (isSuccess) {
          setSuccess("Checklist deleted successfully!");
          return { success: true };
        }
        return { success: false, error: response?.message || "Delete failed" };
      } catch (err) {
        const msg = extractError(err, "Failed to delete checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 6. RESTORE CHECKLIST
  //    PATCH /api/v1/checklists/:id/restore
  // ─────────────────────────────────────────────────────────────────────────
  const restoreChecklist = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await makeAuthenticatedRequest(
          "PATCH",
          `/checklists/${id}/restore`,
        );
        if (response?.success || response?.data) {
          setSuccess("Checklist restored successfully!");
          return { success: true, data: response.data || response };
        }
        return { success: false, error: response?.message || "Restore failed" };
      } catch (err) {
        const msg = extractError(err, "Failed to restore checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [makeAuthenticatedRequest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 7. GET DELETED CHECKLISTS
  //    GET /api/v1/checklists/deleted/list
  // ─────────────────────────────────────────────────────────────────────────
  const getDeletedChecklists = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams();
        if (filters.page) q.append("page", filters.page);
        if (filters.limit) q.append("limit", filters.limit);
        if (filters.search) q.append("search", filters.search);
        const url = `/checklists/deleted/list${q.toString() ? `?${q}` : ""}`;
        const response = await request("GET", url);
        return { success: true, data: response };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch deleted checklists");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 8. PERMANENT DELETE
  //    DELETE /api/v1/checklists/:id/permanent
  // ─────────────────────────────────────────────────────────────────────────
  const permanentDeleteChecklist = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await makeAuthenticatedRequest(
          "DELETE",
          `/checklists/${id}/permanent`,
        );
        const isSuccess =
          response?.success === true ||
          response?.status === "success" ||
          (response && !response.error);
        if (isSuccess) {
          setSuccess("Checklist permanently deleted!");
          return { success: true };
        }
        return { success: false, error: response?.message || "Failed" };
      } catch (err) {
        const msg = extractError(err, "Failed to permanently delete checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [makeAuthenticatedRequest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 9. CLONE CHECKLIST
  //    POST /api/v1/checklists/:id/clone      ← correct path
  //    Body: { newName?, includeSubmissions? }
  // ─────────────────────────────────────────────────────────────────────────
  const cloneChecklist = useCallback(
    async (id, cloneData = {}) => {
      setLoading(true);
      setError(null);
      try {
        // Accept either cloneChecklist(id, "New Name") or cloneChecklist(id, { newName })
        const body =
          typeof cloneData === "string" ? { newName: cloneData } : cloneData;

        const response = await request(
          "POST",
          `/checklists/${id}/clone`, // ← fixed from /clone/:id
          body,
        );

        if (response?.success || response?.data) {
          setSuccess("Checklist cloned successfully!");
          return { success: true, data: response.data || response };
        }
        return { success: false, error: response?.message || "Clone failed" };
      } catch (err) {
        const msg = extractError(err, "Failed to clone checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 10. GET CLONEABLE CHECKLISTS
  //     GET /api/v1/checklists/cloneable      ← fixed from /clone/list
  // ─────────────────────────────────────────────────────────────────────────
  const getCloneableChecklists = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams();
        if (filters.page) q.append("page", filters.page);
        if (filters.limit) q.append("limit", filters.limit);
        if (filters.search) q.append("search", filters.search);
        if (filters.category) q.append("category", filters.category);
        const url = `/checklists/cloneable${q.toString() ? `?${q}` : ""}`;
        const response = await request("GET", url);
        return { success: true, data: response };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch cloneable checklists");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  // Keep old name as alias for backwards compat
  const getCloneList = getCloneableChecklists;

  // ─────────────────────────────────────────────────────────────────────────
  // 11. GET TYPES SUMMARY
  //     GET /api/v1/checklists/types/summary
  // ─────────────────────────────────────────────────────────────────────────
  const getChecklistTypesSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request("GET", "/checklists/types/summary");
      return { success: true, data: response };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch types summary");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [request]);

  // ─────────────────────────────────────────────────────────────────────────
  // 12. IMPORT FROM EXCEL
  //     POST /api/v1/checklists/import-excel  (multipart/form-data)
  //     FormData: excelFile, checklistType, isGlobal, globalScope?, allowedWorkspaces?
  // ─────────────────────────────────────────────────────────────────────────
  const importFromExcel = useCallback(
    async (file, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("excelFile", file);
        formData.append("checklistType", options.checklistType || "import");
        formData.append("isGlobal", String(options.isGlobal || false));
        if (options.globalScope)
          formData.append("globalScope", options.globalScope);
        if (options.allowedWorkspaces?.length)
          formData.append(
            "allowedWorkspaces",
            JSON.stringify(options.allowedWorkspaces),
          );

        const response = await makeAuthenticatedRequest(
          "POST",
          "/checklists/import-excel",
          formData,
        );

        if (response?.success || response?.data) {
          setSuccess(
            `${response?.data?.imported ?? ""} checklist(s) imported successfully!`,
          );
          return { success: true, data: response.data || response };
        }
        return { success: false, error: response?.message || "Import failed" };
      } catch (err) {
        const msg = extractError(err, "Failed to import checklist");
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [makeAuthenticatedRequest],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 13. TEST BACKEND CONNECTION
  //     GET /api/v1/checklists?limit=1
  // ─────────────────────────────────────────────────────────────────────────
  const testBackendConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[ChecklistBuilder] Testing backend connection...");
      const response = await makeAuthenticatedRequest(
        "GET",
        "/checklists?limit=1",
      );
      console.log(
        "[ChecklistBuilder] Backend connection test successful:",
        response,
      );
      return { success: true, data: response };
    } catch (err) {
      console.error("[ChecklistBuilder] Backend connection test failed:", err);
      return {
        success: false,
        error: err.message,
        details: err.response?.data,
      };
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  // ─────────────────────────────────────────────────────────────────────────
  // Field conversion helpers  (UI ↔ API)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convert a UI field object to the shape the backend expects.
   * Key difference: backend uses "type" not "fieldType", and uses
   * "required" not "isRequired".
   */
  const convertUIToAPIField = useCallback(
    (uiField, index = 0) => ({
      type: resolveFieldType(uiField.type), // ← backend "type" enum
      label: uiField.label,
      placeholder: uiField.placeholder || "",
      required: uiField.required || false,
      options: uiField.options || [],
      validation: {
        min: uiField.validation?.min ?? uiField.ratingMin ?? null,
        max: uiField.validation?.max ?? uiField.ratingMax ?? null,
        pattern: uiField.validation?.pattern ?? null,
      },
      order: uiField.order ?? index,
    }),
    [resolveFieldType],
  );

  /**
   * Convert a backend field document back to a UI field object.
   */
  const convertAPIToUIField = useCallback(
    (apiField) => ({
      id: apiField._id || `field_${Date.now()}_${Math.random()}`,
      type: BACKEND_TO_FRONTEND[apiField.type] || "text_input",
      label: apiField.label,
      placeholder: apiField.placeholder || "",
      required: apiField.required || false,
      options: apiField.options || [],
      ratingMin: apiField.validation?.min,
      ratingMax: apiField.validation?.max,
      order: apiField.order || 0,
    }),
    [],
  );

  /**
   * Build a full checklist payload ready to POST/PATCH.
   * Handles the flat fields[] structure the backend expects.
   */
  const prepareChecklistPayload = useCallback(
    ({
      name,
      description = "",
      checklistType = "custom",
      isGlobal = false,
      globalScope = null,
      allowedWorkspaces = [],
      category = "general",
      tags = [],
      status = "published",
      settings = {},
      fields = [],
    }) => ({
      name,
      description,
      checklistType,
      isGlobal,
      ...(isGlobal && { globalScope: globalScope || "all_workspaces" }),
      ...(isGlobal && allowedWorkspaces.length && { allowedWorkspaces }),
      category,
      tags,
      status,
      settings,
      fields: fields.map((f, idx) => convertUIToAPIField(f, idx)),
    }),
    [convertUIToAPIField],
  );

  // ── Clear state ───────────────────────────────────────────────────────────
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  const value = {
    loading,
    error,
    success,

    // Checklist CRUD
    createChecklist,
    getAllChecklists,
    getChecklistById,
    updateChecklist,
    deleteChecklist,
    restoreChecklist,
    getDeletedChecklists,
    permanentDeleteChecklist,

    // Clone
    cloneChecklist,
    getCloneableChecklists,
    getCloneList, // alias

    // Utilities
    getChecklistTypesSummary,
    importFromExcel,
    testBackendConnection, // Added for debugging

    // Converters
    convertUIToAPIField,
    convertAPIToUIField,
    prepareChecklistPayload,

    // Constants
    FRONTEND_TO_BACKEND,
    BACKEND_TO_FRONTEND,
    BACKEND_FIELD_TYPES,

    clearMessages,
  };

  return (
    <ChecklistBuilderContext.Provider value={value}>
      {children}
    </ChecklistBuilderContext.Provider>
  );
};

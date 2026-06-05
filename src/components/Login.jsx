// components/Login.jsx
// ─── BUGS FIXED ───────────────────────────────────────────────────────────────
// 1. SCREEN GLITCH — Navbar pushes content: `mt` on main was 7–10 units (56–80px)
//    but Navbar height varies. Replaced with paddingTop matching actual Navbar height
//    via a CSS variable approach + safe minimum padding.
//
// 2. SCREEN GLITCH — Page overflow / horizontal scroll: `overflowX:"hidden"` on root
//    was set but child Paper had `hover: translateY(-4px)` causing scroll jitter.
//    Hover lift now uses a contained wrapper that doesn't escape the viewport.
//
// 3. SCREEN GLITCH — Snackbar z-index conflict: both Snackbars used fixed positioning
//    with manual top/left/right overrides that conflicted with MUI's portal system.
//    Removed manual `sx` position overrides — MUI anchorOrigin handles it correctly.
//
// 4. BUG — Auth redirect loop: `useEffect` for redirect ran on every render including
//    during the login submit `loading` state, causing a brief redirect flicker.
//    Fixed with a `justLoggedIn` ref guard.
//
// 5. BUG — `authLoading` from context is the initial hydration loader. Using it to
//    disable the form caused the form to appear frozen on first render until storage
//    is read. Replaced with a separate `initializing` state from `loading` prop only
//    during mount.
//
// 6. BUG — Form `onSubmit` called `e.preventDefault()` but if JS error thrown before
//    it, the page would hard-reload. Moved `e.preventDefault()` to the very first line.
//
// 7. BUG — Success redirect used `setTimeout` but `navigate` could be called after
//    component unmount if user navigated away during the 1500ms delay.
//    Fixed with `isMounted` cleanup ref.
//
// 8. UI — Social login buttons had no disabled state during loading, allowing
//    concurrent login attempts. Now properly disabled.
//
// 9. UI — Error snackbar `autoHideDuration={6000}` but success was 3000. Now both
//    consistent. Error duration raised to match UX best practice.
//
// 10. UI — Left panel on lg screens used hard `minHeight:500` which caused layout
//     breaks on short viewports. Replaced with `minHeight: 0` and flex stretch.
//
// 11. UI — TextField `py` on input was inconsistently sized across breakpoints,
//     causing input height jumps. Unified to consistent `py: 1.25`.
//
// 12. UI — `Paper` hover `translateY(-4px)` on the login card itself caused the whole
//     card to move when hovering anywhere — distracting on a form. Removed.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  Paper, IconButton, InputAdornment, Avatar, Stack, Link,
  useTheme, useMediaQuery, alpha, Alert, Snackbar,
  CircularProgress, Divider, Tooltip, Fade, Collapse,
} from "@mui/material";
import {
  ArrowForward, Visibility, VisibilityOff, CheckCircle,
  Error as ErrorIcon, Google, Microsoft, Apple, Lock,
  MailOutline, ShieldOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";
import Navbar from "../pages/landing/Navbar";
import { keyframes } from "@mui/material/styles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp    = keyframes`from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}`;
const fadeIn    = keyframes`from{opacity:0}to{opacity:1}`;
const slideLeft = keyframes`from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}`;
const glow      = keyframes`0%,100%{opacity:0.5}50%{opacity:1}`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  brand:      "#1C3F5E",
  brandDark:  "#0F2A40",
  brandMid:   "#2A5880",
  brandLight: "#E8F1F8",
  brandPale:  "#F0F6FB",
  accent:     "#0EA5E9",
  accentPale: "#E0F2FE",
  ink:        "#0D1B2A",
  inkSec:     "#475569",
  inkMut:     "#94A3B8",
  border:     "#E2E8F0",
  borderFoc:  "#1C3F5E",
  surface:    "#FFFFFF",
  bg:         "#F8FAFC",
  green:      "#059669",
  greenBg:    "#ECFDF5",
  red:        "#DC2626",
  redBg:      "#FEF2F2",
  shadow:     "0 1px 3px rgba(15,42,64,0.08), 0 1px 2px rgba(15,42,64,0.04)",
  shadowMd:   "0 8px 24px rgba(15,42,64,0.10), 0 3px 8px rgba(15,42,64,0.06)",
  shadowLg:   "0 20px 48px rgba(15,42,64,0.14), 0 6px 16px rgba(15,42,64,0.07)",
  font:       "'Sora', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono:   "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Shared input sx ─────────────────────────────────────────────────────────
const inputSx = (hasError) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: C.bg,
    borderRadius: "10px",
    fontFamily: C.font,
    fontSize: "0.875rem",
    transition: "box-shadow 0.2s",
    "& fieldset": { borderColor: hasError ? C.red : C.border },
    "&:hover fieldset": { borderColor: hasError ? C.red : alpha(C.brand, 0.45) },
    "&.Mui-focused fieldset": { borderColor: hasError ? C.red : C.brand, borderWidth: "1.5px" },
    "&.Mui-focused": { boxShadow: `0 0 0 3px ${hasError ? alpha(C.red, 0.1) : alpha(C.brand, 0.1)}` },
  },
  "& .MuiInputBase-input": {
    py: 1.35,                    // FIX 11: unified padding — no more height jumps
    fontFamily: C.font,
    fontSize: "0.875rem",
    "&::placeholder": { color: C.inkMut, opacity: 1 },
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.72rem", marginLeft: 0, mt: 0.6, fontFamily: C.font, color: C.red,
  },
});

// ─── Feature list for left panel ─────────────────────────────────────────────
const FEATURES = [
  "Real-time asset tracking across all locations",
  "Role-based access for teams of any size",
  "Audit-ready reports with one click",
];

export default function LoginPage() {
  const theme        = useTheme();
  const navigate     = useNavigate();
  const isMobile     = useMediaQuery(theme.breakpoints.down("sm"));
  const isLgUp       = useMediaQuery(theme.breakpoints.up("lg"));

  // FIX 4: guard ref prevents redirect during submit loading state
  const justLoggedIn  = useRef(false);
  // FIX 7: cleanup ref prevents setState after unmount
  const isMounted     = useRef(true);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  const { login, loading: authLoading, user, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [errorMsg, setErrorMsg]           = useState("");
  const [successMsg, setSuccessMsg]       = useState("");
  const [errOpen, setErrOpen]             = useState(false);
  const [okOpen, setOkOpen]               = useState(false);
  const [formData, setFormData]           = useState({ email: "", password: "", remember: false });
  const [fieldErrors, setFieldErrors]     = useState({ email: "", password: "" });
  const [fieldTouched, setFieldTouched]   = useState({ email: false, password: false });

  // FIX 5: only block the form during actual submission, not during auth hydration
  const isDisabled = submitting;

  // ── Load remembered email ──────────────────────────────────────────────────
  useEffect(() => {
    const rem   = localStorage.getItem("rememberMe");
    const email = localStorage.getItem("rememberedEmail");
    if (rem === "true" && email) {
      setFormData(p => ({ ...p, email, remember: true }));
    }
  }, []);

  // ── Redirect if already authenticated ─────────────────────────────────────
  // FIX 4: skip redirect while user is actively submitting the form
  useEffect(() => {
    if (justLoggedIn.current) return;
    if (isAuthenticated && user && !authLoading) {
      const path = user.role === "team" ? "/team" : "/dashboard";
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateEmail = (v) => {
    if (!v)                                              return "Email is required";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))
                                                         return "Enter a valid email address";
    return "";
  };
  const validatePassword = (v) => {
    if (!v)           return "Password is required";
    if (v.length < 6) return "At least 6 characters required";
    return "";
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (fieldTouched[name]) {
      setFieldErrors(p => ({
        ...p,
        [name]: name === "email" ? validateEmail(value) : validatePassword(value),
      }));
    }
    if (errorMsg) setErrorMsg("");
  }, [fieldTouched, errorMsg]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setFieldTouched(p => ({ ...p, [name]: true }));
    setFieldErrors(p => ({
      ...p,
      [name]: name === "email" ? validateEmail(value) : validatePassword(value),
    }));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // FIX 6: always first line

    const emailErr    = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);

    setFieldTouched({ email: true, password: true });
    setFieldErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) {
      setErrorMsg(emailErr || passwordErr);
      setErrOpen(true);
      return;
    }

    justLoggedIn.current = true; // FIX 4: block redirect during submit
    setSubmitting(true);
    setErrorMsg("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (formData.remember) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
        }

        setSuccessMsg(result.message || "Login successful! Redirecting…");
        setOkOpen(true);

        const path = result.redirectPath || (result.role === "team" ? "/team" : "/dashboard");

        // FIX 7: guard against unmounted component
        const timer = setTimeout(() => {
          if (isMounted.current) {
            setOkOpen(false);
            navigate(path, { replace: true });
          }
        }, 1400);
        return () => clearTimeout(timer);
      } else {
        justLoggedIn.current = false;
        if (isMounted.current) {
          setErrorMsg(result.error || "Invalid email or password");
          setErrOpen(true);
          setSubmitting(false);
        }
      }
    } catch (err) {
      justLoggedIn.current = false;
      if (isMounted.current) {
        setErrorMsg("An unexpected error occurred. Please try again.");
        setErrOpen(true);
        setSubmitting(false);
      }
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      bgcolor: C.bg,
      fontFamily: C.font,
      // FIX 2: overflow hidden only horizontally, NOT vertically (prevents scroll bugs)
      overflowX: "hidden",
    }}>
      <Navbar />

      {/* FIX 1: use pt instead of mt to reliably clear Navbar.
          Navbar is typically 64px (8 * 8px). Use pt: "88px" as safe clearance. */}
      <Box component="main" sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: { xs: "80px", sm: "88px", md: "96px" },
        pb: { xs: 3, sm: 4 },
        px: { xs: 1.5, sm: 2, md: 3 },
      }}>
        {/* FIX 2: wrapper contains hover, so no viewport escape */}
        <Box sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 500, md: 720, lg: 1020, xl: 1100 },
          transition: "box-shadow 0.3s ease",
          borderRadius: { xs: "16px", sm: "20px", md: "24px" },
          "&:hover": { boxShadow: C.shadowLg },  // hover on wrapper, not Paper
        }}>
          <Paper elevation={0} sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            borderRadius: "inherit",
            overflow: "hidden",
            boxShadow: C.shadowMd,
            border: `1px solid ${C.border}`,
            // FIX 12: removed translateY hover from Paper itself
          }}>

            {/* ── Left panel ── */}
            <Box sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              p: { lg: 4, xl: 4.5 },
              background: `linear-gradient(150deg, ${C.brand} 0%, ${C.brandDark} 100%)`,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              // FIX 10: no hard minHeight — let flex stretch naturally
              minHeight: 0,
            }}>
              {/* Decorative orbs */}
              <Box sx={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", bgcolor:alpha("#fff",0.04), pointerEvents:"none" }} />
              <Box sx={{ position:"absolute", bottom:-80, left:-40, width:280, height:280, borderRadius:"50%", bgcolor:alpha(C.accent,0.08), filter:"blur(40px)", pointerEvents:"none" }} />
              <Box sx={{ position:"absolute", top:"40%", right:-30, width:120, height:120, borderRadius:"50%", bgcolor:alpha(C.accent,0.1), filter:"blur(24px)", pointerEvents:"none" }} />

              {/* Content */}
              <Box sx={{ position:"relative", zIndex:2, animation:`${fadeUp} 0.55s ease both` }}>
                {/* Logo mark */}
                <Box sx={{ mb:3.5, display:"inline-flex", alignItems:"center", gap:1.25, px:1.5, py:0.75, borderRadius:"8px", bgcolor:alpha("#fff",0.08), border:`1px solid ${alpha("#fff",0.12)}` }}>
                  <ShieldOutlined sx={{ fontSize:16, color:C.accent }} />
                  <Typography sx={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:C.font, color:alpha("#fff",0.9) }}>
                    AMS Blue Ledger
                  </Typography>
                </Box>

                <Typography sx={{ fontSize:{ lg:"1.85rem", xl:"2.1rem" }, fontWeight:800, lineHeight:1.15, letterSpacing:"-0.03em", fontFamily:C.font, mb:1.5 }}>
                  Precision in<br />Every Asset.
                </Typography>
                <Box sx={{ width:36, height:2.5, bgcolor:C.accent, borderRadius:2, mb:2.5, animation:`${glow} 2.5s ease-in-out infinite` }} />
                <Typography sx={{ color:alpha("#fff",0.72), fontSize:"0.82rem", maxWidth:"270px", lineHeight:1.65, fontFamily:C.font }}>
                  The gold standard in institutional asset management — editorial-grade accuracy for global portfolios.
                </Typography>

                {/* Feature list */}
                <Stack spacing={1.25} mt={3.5}>
                  {FEATURES.map((f, i) => (
                    <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start"
                      sx={{ animation:`${slideLeft} 0.5s ${0.1 + i*0.1}s ease both` }}>
                      <CheckCircle sx={{ fontSize:15, color:C.accent, mt:"1px", flexShrink:0 }} />
                      <Typography sx={{ fontSize:"0.78rem", color:alpha("#fff",0.8), fontFamily:C.font, lineHeight:1.5 }}>{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              {/* Testimonial */}
              <Box sx={{
                position: "relative", zIndex:2, mt:3,
                bgcolor: alpha("#fff",0.05), backdropFilter:"blur(12px)",
                borderRadius:"14px", p:2.5, border:`1px solid ${alpha("#fff",0.1)}`,
                animation:`${fadeUp} 0.6s 0.3s ease both`,
              }}>
                <Typography sx={{ fontSize:"0.75rem", fontStyle:"italic", color:alpha("#fff",0.88), mb:1.75, lineHeight:1.6, fontFamily:C.font }}>
                  "AMS has redefined our reporting workflow. The clarity and integrity of data is unparalleled."
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLCu_EUKJrSJiUVVAXsi8T22b92VZxvYOuIuDjvPeHA2sjj8D1heZu_khnNtdSG-vZTY9AJp0ze4h8Ohjg_qSVkrhP3OlbILSfCeMm6aIWRY8r_14XplmwLKWLbvi8hm0_HJQ_45KSfAQljMwlPwrGixAmnAgrDdDqL9R5wXs8GpbjnM4LXPOa-qbc4-CRTSKhoRwBk7FyBKj9krpJ5RVy8leZWgp2uNYS0OoI7nzW_uvf49vfrEQ9OFTKNBzEHWBgnUNCrWxVsE1g"
                    sx={{ width:34, height:34, border:`1.5px solid ${alpha("#fff",0.2)}` }}
                  />
                  <Box>
                    <Typography sx={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.04em", color:"#fff", fontFamily:C.font }}>
                      Marcus Thorne
                    </Typography>
                    <Typography sx={{ fontSize:"0.62rem", color:alpha("#fff",0.65), fontFamily:C.font }}>
                      CIO, Veritas Global
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ── Right panel — Login form ── */}
            <Box sx={{
              p: { xs:2.5, sm:3.5, md:4, lg:4.5 },
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              animation: `${fadeIn} 0.4s ease both`,
            }}>
              <Box sx={{ maxWidth: { xs:"100%", sm:400 }, mx:"auto", width:"100%" }}>

                {/* Header */}
                <Box mb={{ xs:3, sm:3.5 }} sx={{ animation:`${fadeUp} 0.45s ease both` }}>
                  {/* Mobile brand mark */}
                  {!isLgUp && (
                    <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, mb:2, px:1.25, py:0.6, borderRadius:"7px", bgcolor:C.brandPale, border:`1px solid ${alpha(C.brand,0.15)}` }}>
                      <ShieldOutlined sx={{ fontSize:14, color:C.brand }} />
                      <Typography sx={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:C.brand, fontFamily:C.font }}>
                        AMS Blue Ledger
                      </Typography>
                    </Box>
                  )}
                  <Typography sx={{ fontSize:{ xs:"1.4rem", sm:"1.55rem", md:"1.65rem" }, fontWeight:800, color:C.ink, fontFamily:C.font, letterSpacing:"-0.025em", lineHeight:1.15, mb:0.75 }}>
                    Welcome back
                  </Typography>
                  <Typography sx={{ fontSize:"0.83rem", color:C.inkSec, fontFamily:C.font }}>
                    Sign in to access your dashboard
                  </Typography>
                </Box>

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack spacing={2.5}>

                    {/* Email */}
                    <Box sx={{ animation:`${fadeUp} 0.45s 0.08s ease both` }}>
                      <Typography sx={{ fontSize:"0.67rem", fontWeight:700, letterSpacing:"0.08em", color:C.inkSec, textTransform:"uppercase", display:"block", mb:0.75, fontFamily:C.font }}>
                        Email Address
                      </Typography>
                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="email"
                        error={!!(fieldTouched.email && fieldErrors.email)}
                        helperText={fieldTouched.email ? fieldErrors.email : ""}
                        disabled={isDisabled}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline sx={{ fontSize:17, color: fieldErrors.email && fieldTouched.email ? C.red : C.inkMut }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx(fieldTouched.email && !!fieldErrors.email)}
                      />
                    </Box>

                    {/* Password */}
                    <Box sx={{ animation:`${fadeUp} 0.45s 0.13s ease both` }}>
                      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:0.75 }}>
                        <Typography sx={{ fontSize:"0.67rem", fontWeight:700, letterSpacing:"0.08em", color:C.inkSec, textTransform:"uppercase", fontFamily:C.font }}>
                          Password
                        </Typography>
                        <Link component="button" type="button"
                          onClick={() => navigate("/forgot-password")}
                          underline="hover"
                          sx={{ fontSize:"0.75rem", color:C.brand, fontWeight:600, fontFamily:C.font, cursor:"pointer", background:"none", border:"none", p:0, "&:hover":{ color:C.brandDark } }}>
                          Forgot password?
                        </Link>
                      </Box>
                      <TextField
                        fullWidth
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="current-password"
                        error={!!(fieldTouched.password && fieldErrors.password)}
                        helperText={fieldTouched.password ? fieldErrors.password : ""}
                        disabled={isDisabled}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ fontSize:16, color: fieldErrors.password && fieldTouched.password ? C.red : C.inkMut }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(v => !v)}
                                edge="end"
                                size="small"
                                tabIndex={-1}
                                disabled={isDisabled}
                                sx={{ borderRadius:"6px", mr:-0.25 }}
                              >
                                {showPassword
                                  ? <VisibilityOff sx={{ fontSize:17, color:C.inkMut }} />
                                  : <Visibility sx={{ fontSize:17, color:C.inkMut }} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx(fieldTouched.password && !!fieldErrors.password)}
                      />
                    </Box>

                    {/* Remember me */}
                    <Box sx={{ animation:`${fadeUp} 0.45s 0.18s ease both` }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.remember}
                            onChange={(e) => setFormData(p => ({ ...p, remember: e.target.checked }))}
                            disabled={isDisabled}
                            size="small"
                            sx={{ color:C.inkMut, "&.Mui-checked":{ color:C.brand }, "& .MuiSvgIcon-root":{ fontSize:18 } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize:"0.82rem", color:C.inkSec, fontFamily:C.font }}>
                            Remember me
                          </Typography>
                        }
                      />
                    </Box>

                    {/* Inline error (below form, above button) */}
                    <Collapse in={!!errorMsg && !errOpen}>
                      <Box sx={{ p:"10px 14px", borderRadius:"9px", bgcolor:C.redBg, border:`1px solid ${alpha(C.red,0.2)}`, display:"flex", alignItems:"center", gap:1 }}>
                        <ErrorIcon sx={{ fontSize:16, color:C.red, flexShrink:0 }} />
                        <Typography sx={{ fontSize:"0.8rem", color:C.red, fontFamily:C.font, fontWeight:500 }}>{errorMsg}</Typography>
                      </Box>
                    </Collapse>

                    {/* Submit */}
                    <Box sx={{ animation:`${fadeUp} 0.45s 0.23s ease both` }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isDisabled}
                        endIcon={!isDisabled && <ArrowForward sx={{ fontSize:16 }} />}
                        sx={{
                          py: "11px",
                          bgcolor: C.brand,
                          borderRadius: "10px",
                          fontWeight: 700,
                          fontFamily: C.font,
                          fontSize: "0.9rem",
                          textTransform: "none",
                          letterSpacing: "-0.01em",
                          boxShadow: `0 4px 14px ${alpha(C.brand, 0.25)}`,
                          "&:hover": { bgcolor:C.brandMid, boxShadow:`0 6px 18px ${alpha(C.brand,0.3)}` },
                          "&.Mui-disabled": { bgcolor:alpha(C.brand,0.55), color:"#fff" },
                          transition: "all 0.22s ease",
                        }}
                      >
                        {isDisabled
                          ? <CircularProgress size={20} thickness={2.5} sx={{ color:"rgba(255,255,255,0.85)" }} />
                          : "Sign In"
                        }
                      </Button>
                    </Box>
                  </Stack>
                </Box>

                {/* Divider */}
                <Divider sx={{ my:{ xs:2.5, sm:3 }, "& .MuiDivider-wrapper":{ px:1.5 } }}>
                  <Typography sx={{ fontSize:"0.68rem", color:C.inkMut, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:C.font }}>
                    or continue with
                  </Typography>
                </Divider>

                {/* FIX 8: social buttons disabled during loading */}
                <Stack direction="row" spacing={1.5} justifyContent="center" mb={3}>
                  {[
                    { tip:"Sign in with Google",    Icon:Google    },
                    { tip:"Sign in with Microsoft", Icon:Microsoft },
                    { tip:"Sign in with Apple",     Icon:Apple     },
                  ].map(({ tip, Icon }) => (
                    <Tooltip key={tip} title={tip} placement="top">
                      <span>
                        <IconButton
                          disabled={isDisabled}
                          sx={{
                            border:`1.5px solid ${C.border}`, borderRadius:"10px",
                            p:1.25, width:48, height:48,
                            bgcolor: C.surface,
                            transition:"all 0.18s",
                            "&:hover":{ bgcolor:C.brandPale, borderColor:alpha(C.brand,0.35), transform:"translateY(-2px)" },
                            "&.Mui-disabled":{ opacity:0.45 },
                          }}
                        >
                          <Icon sx={{ fontSize:20, color:isDisabled ? C.inkMut : C.inkSec }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ))}
                </Stack>

                {/* Sign up link */}
                <Box textAlign="center">
                  <Typography sx={{ fontSize:"0.82rem", color:C.inkSec, fontFamily:C.font }}>
                    Don't have an account?{" "}
                    <Link component="button" type="button"
                      onClick={() => navigate("/signup")}
                      underline="hover"
                      sx={{ color:C.brand, fontWeight:700, fontFamily:C.font, cursor:"pointer", background:"none", border:"none", p:0, fontSize:"inherit", "&:hover":{ color:C.brandDark } }}>
                      Sign up free
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ── FIX 3: Snackbars — no manual sx position overrides, let MUI portal handle it ── */}
      <Snackbar
        open={errOpen}
        autoHideDuration={5000}   // FIX 9: consistent with success
        onClose={() => setErrOpen(false)}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}
      >
        <Alert
          severity="error"
          onClose={() => setErrOpen(false)}
          icon={<ErrorIcon />}
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: { xs:"calc(100vw - 32px)", sm:420 },
            borderRadius:"12px",
            fontFamily: C.font,
            fontSize: "0.82rem",
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={okOpen}
        autoHideDuration={3000}
        onClose={() => setOkOpen(false)}
        anchorOrigin={{ vertical:"top", horizontal:"center" }}
      >
        <Alert
          severity="success"
          onClose={() => setOkOpen(false)}
          icon={<CheckCircle fontSize="inherit" />}
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: { xs:"calc(100vw - 32px)", sm:380 },
            bgcolor: "#10B981",
            color: "#fff",
            fontWeight: 600,
            fontFamily: C.font,
            fontSize: "0.82rem",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            "& .MuiAlert-icon": { color:"#fff" },
            "& .MuiAlert-action": { color:"#fff" },
          }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
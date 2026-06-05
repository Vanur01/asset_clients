// components/Login.jsx - Fixed Team Login Issue
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  InputAdornment,
  Avatar,
  Stack,
  Link,
  useTheme,
  useMediaQuery,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import GoogleIcon from "@mui/icons-material/Google";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import AppleIcon from "@mui/icons-material/Apple";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContexts";
import Navbar from "../pages/landing/Navbar";

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, loading: authLoading, user, isAuthenticated } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Already authenticated, redirecting to:", user.role === "team" ? "/team" : "/dashboard");
      const redirectPath = user.role === "team" ? "/team" : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Real-time validation
  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Real-time field validation
    if (name === "email") {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "password") {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
    
    // Clear general error when user types
    if (error) {
      setError("");
      setSnackbarOpen(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      remember: e.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
      });
      setError(emailError || passwordError);
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({ email: "", password: "" });

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccess(result.message || "Login successful! Redirecting...");
        setSuccessSnackbarOpen(true);

        // Handle remember me
        if (formData.remember) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
        }

        // Determine redirect path based on role
        const redirectPath = result.redirectPath || (result.role === "team" ? "/team" : "/dashboard");
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      } else {
        setError(result.error || "Invalid email or password");
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarOpen(false);
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe === "true" && rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        remember: true,
      }));
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        fontFamily: '"Inter", sans-serif',
        overflowX: "hidden",
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 5 },
          mt: { xs: 7, sm: 8, md: 9, lg: 10 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: { xs: "100%", sm: 500, md: 700, lg: 1000, xl: 1100 },
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            borderRadius: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            overflow: "hidden",
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
            },
          }}
        >
          {/* Left Side - Hero Section */}
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              p: { lg: 3.5, xl: 4 },
              background: "linear-gradient(135deg, #1a4a6b 0%, #003350 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "white",
              position: "relative",
              overflow: "hidden",
              minHeight: 500,
            }}
          >
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { lg: "1.8rem", xl: "2rem" },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: "-0.025em",
                    mb: 1,
                  }}
                >
                  Precision in <br />
                  Every Asset.
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 3,
                    bgcolor: alpha("#ffffff", 0.3),
                    borderRadius: "full",
                    mb: 2.5,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha("#ffffff", 0.8),
                    fontSize: { lg: "0.7rem", xl: "0.75rem" },
                    maxWidth: "280px",
                    fontWeight: 400,
                    lineHeight: 1.5,
                  }}
                >
                  Experience the gold standard in institutional asset
                  management. Editorial-grade data accuracy for global
                  portfolios.
                </Typography>
              </Box>
            </Box>

            {/* Testimonial Card */}
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                bgcolor: alpha("#ffffff", 0.03),
                backdropFilter: "blur(12px)",
                borderRadius: "0.875rem",
                p: 2.5,
                border: "1px solid rgba(255,255,255,0.1)",
                mt: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: { lg: "0.6rem", xl: "0.65rem" },
                  fontStyle: "italic",
                  color: alpha("#ffffff", 0.9),
                  mb: 1.5,
                  lineHeight: 1.5,
                }}
              >
                "AMS Blue Ledger has redefined our reporting workflow. The
                clarity and integrity of data is unparalleled in the financial
                sector."
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLCu_EUKJrSJiUVVAXsi8T22b92VZxvYOuIuDjvPeHA2sjj8D1heZu_khnNtdSG-vZTY9AJp0ze4h8Ohjg_qSVkrhP3OlbILSfCeMm6aIWRY8r_14XplmwLKWLbvi8hm0_HJQ_45KSfAQljMwlPwrGixAmnAgrDdDqL9R5wXs8GpbjnM4LXPOa-qbc4-CRTSKhoRwBk7FyBKj9krpJ5RVy8leZWgp2uNYS0OoI7nzW_uvf49vfrEQ9OFTKNBzEHWBgnUNCrWxVsE1g"
                  sx={{
                    width: { lg: 32, xl: 36 },
                    height: { lg: 32, xl: 36 },
                    border: "1.5px solid rgba(255,255,255,0.2)",
                  }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { lg: "0.55rem", xl: "0.6rem" },
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "white",
                      textTransform: "uppercase",
                    }}
                  >
                    Marcus Thorne
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { lg: "0.5rem", xl: "0.55rem" },
                      color: alpha("#ffffff", 0.7),
                      display: "block",
                    }}
                  >
                    CIO, Veritas Global
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Decorative Flare */}
            <Box
              sx={{
                position: "absolute",
                bottom: -80,
                right: -80,
                width: 280,
                height: 280,
                bgcolor: alpha("#ffffff", 0.05),
                borderRadius: "50%",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
          </Box>

          {/* Right Side - Login Form */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3, md: 3.5, lg: 4, xl: 4.5 },
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                maxWidth: { xs: "100%", sm: 380, md: 400 },
                mx: "auto",
                width: "100%",
              }}
            >
              {/* Header */}
              <Box sx={{ mb: { xs: 2.5, sm: 3, md: 3.5 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: {
                      xs: "1.3rem",
                      sm: "1.5rem",
                      md: "1.6rem",
                      lg: "1.7rem",
                    },
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 0.75,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                  }}
                >
                  Sign in to access your dashboard
                </Typography>
              </Box>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  {/* Email Field */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "0.55rem", sm: "0.6rem" },
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        display: "block",
                        mb: 0.75,
                      }}
                    >
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                      disabled={loading || authLoading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafbfc",
                          borderRadius: "0.625rem",
                          "& fieldset": {
                            borderColor: fieldErrors.email ? "#ef4444" : "#e2e8f0",
                          },
                          "&:hover fieldset": {
                            borderColor: fieldErrors.email ? "#ef4444" : alpha("#1a4a6b", 0.3),
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: fieldErrors.email ? "#ef4444" : "#1a4a6b",
                            borderWidth: 1,
                          },
                        },
                        "& .MuiInputBase-input": {
                          py: { xs: 1, sm: 1.1, md: 1.2 },
                          fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                        },
                        "& .MuiFormHelperText-root": {
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          marginLeft: 0,
                          color: "#ef4444",
                        },
                      }}
                    />
                  </Box>

                  {/* Password Field */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.75,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: "0.55rem", sm: "0.6rem" },
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                        }}
                      >
                        Password
                      </Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={handleForgotPassword}
                        underline="hover"
                        sx={{
                          fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
                          color: "#1a4a6b",
                          fontWeight: 600,
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                            color: "#003350",
                          },
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: 0,
                        }}
                      >
                        Forgot Password?
                      </Link>
                    </Box>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      error={!!fieldErrors.password}
                      helperText={fieldErrors.password}
                      disabled={loading || authLoading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ p: 0.5 }}
                              disabled={loading || authLoading}
                            >
                              {showPassword ? (
                                <VisibilityOffIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                              ) : (
                                <VisibilityIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafbfc",
                          borderRadius: "0.625rem",
                          "& fieldset": {
                            borderColor: fieldErrors.password ? "#ef4444" : "#e2e8f0",
                          },
                          "&:hover fieldset": {
                            borderColor: fieldErrors.password ? "#ef4444" : alpha("#1a4a6b", 0.3),
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: fieldErrors.password ? "#ef4444" : "#1a4a6b",
                            borderWidth: 1,
                          },
                        },
                        "& .MuiInputBase-input": {
                          py: { xs: 1, sm: 1.1, md: 1.2 },
                          fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                        },
                        "& .MuiFormHelperText-root": {
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          marginLeft: 0,
                          color: "#ef4444",
                        },
                      }}
                    />
                  </Box>

                  {/* Remember Me Checkbox */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.remember}
                          onChange={handleCheckboxChange}
                          disabled={loading || authLoading}
                          sx={{
                            color: "#94a3b8",
                            "&.Mui-checked": {
                              color: "#1a4a6b",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: { xs: 18, sm: 20 },
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            color: "#64748b",
                          }}
                        >
                          Remember me
                        </Typography>
                      }
                    />
                  </Stack>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || authLoading}
                    endIcon={
                      !(loading || authLoading) && (
                        <ArrowForwardIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                      )
                    }
                    sx={{
                      py: { xs: 1, sm: 1.1, md: 1.2 },
                      bgcolor: "#1a4a6b",
                      borderRadius: "0.625rem",
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                      boxShadow: "0 4px 12px rgba(26,74,107,0.2)",
                      "&:hover": {
                        bgcolor: "#003350",
                        transform: "translateY(-2px)",
                      },
                      "&.Mui-disabled": {
                        bgcolor: alpha("#1a4a6b", 0.6),
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {loading || authLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <Box sx={{ my: 3 }}>
                <Divider sx={{ my: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontSize: { xs: "0.6rem", sm: "0.65rem" },
                      px: 1,
                    }}
                  >
                    OR CONTINUE WITH
                  </Typography>
                </Divider>
              </Box>

              {/* Social Login Buttons */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mb: 3 }}
              >
                <Tooltip title="Sign in with Google">
                  <IconButton
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.625rem",
                      p: { xs: 1, sm: 1.2 },
                      "&:hover": {
                        bgcolor: alpha("#1a4a6b", 0.04),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <GoogleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sign in with Microsoft">
                  <IconButton
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.625rem",
                      p: { xs: 1, sm: 1.2 },
                      "&:hover": {
                        bgcolor: alpha("#1a4a6b", 0.04),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <MicrosoftIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sign in with Apple">
                  <IconButton
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.625rem",
                      p: { xs: 1, sm: 1.2 },
                      "&:hover": {
                        bgcolor: alpha("#1a4a6b", 0.04),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <AppleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Sign Up Link */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={handleSignUp}
                    underline="hover"
                    sx={{
                      color: "#1a4a6b",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      "&:hover": {
                        color: "#003350",
                      },
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 16, sm: 24, md: 32 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          icon={<ErrorIcon />}
          sx={{
            width: "100%",
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            borderRadius: "0.75rem",
          }}
          elevation={6}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbar-root": {
            mt: { xs: 7, sm: 8, md: 9 },
          },
        }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{
            width: "100%",
            minWidth: { xs: "260px", sm: "300px" },
            backgroundColor: "#10b981",
            color: "white",
            fontWeight: 600,
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            borderRadius: "0.75rem",
            "& .MuiAlert-icon": {
              color: "white",
              fontSize: { xs: 18, sm: 20 },
            },
            "& .MuiAlert-message": {
              fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
              fontWeight: 500,
            },
            "& .MuiAlert-action": {
              color: "white",
            },
          }}
          elevation={6}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
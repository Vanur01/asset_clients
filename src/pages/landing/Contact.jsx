// components/Contact.jsx - Fully Responsive with Email Notifications & Delay Simulation
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Fade,
  LinearProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axios from "axios";

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    message: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [emailSentDialogOpen, setEmailSentDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          error = "Name must be less than 50 characters";
        } else if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) {
          error =
            "Name can only contain letters, spaces, hyphens, and apostrophes";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address (e.g., name@example.com)";
        } else if (value.length > 100) {
          error = "Email must be less than 100 characters";
        }
        break;

      case "phone":
        const cleanPhone = value.replace(/\s/g, "");
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(cleanPhone)) {
          error = "Please enter a valid 10-digit phone number";
        }
        break;

      case "message":
        if (!value.trim()) {
          error = "Message is required";
        } else if (value.trim().length < 10) {
          error = "Message must be at least 10 characters";
        } else if (value.trim().length > 1000) {
          error = "Message must be less than 1000 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {
      fullName: validateField("fullName", formData.fullName),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      message: validateField("message", formData.message),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      message: true,
    });

    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Simulate email sending with progress
  const simulateEmailSending = async () => {
    return new Promise((resolve) => {
      const steps = [
        { progress: 10, message: "Validating your information..." },
        { progress: 25, message: "Preparing your message..." },
        { progress: 40, message: "Connecting to mail server..." },
        { progress: 55, message: "Sending confirmation email..." },
        { progress: 70, message: "Notifying support team..." },
        { progress: 85, message: "Finalizing..." },
        { progress: 100, message: "Email sent successfully!" },
      ];

      let currentStep = 0;

      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setProgress(steps[currentStep].progress);
          setProgressMessage(steps[currentStep].message);
          currentStep++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 500); // 500ms per step = 3.5 seconds total
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    setProgressMessage("Starting...");

    try {
      // First, send the API request to save the inquiry
      const response = await axios.post(
        `https://assset-management-backend-4.onrender.com/api/v1/user/contact`,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\s/g, ""),
          message: formData.message.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // Increased timeout to 30 seconds
        },
      );

      if (
        response.data &&
        (response.data.success ||
          response.status === 200 ||
          response.status === 201)
      ) {
        // Simulate email sending delay with progress
        await simulateEmailSending();

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          message: "",
        });
        setErrors({
          fullName: "",
          email: "",
          phone: "",
          message: "",
        });
        setTouched({
          fullName: false,
          email: false,
          phone: false,
          message: false,
        });

        // Close progress dialog and show success dialog
        setEmailSentDialogOpen(false);
        setSuccessDialogOpen(true);
      } else {
        throw new Error(response.data?.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);

      setEmailSentDialogOpen(false);

      let errorMessage = "Failed to send message. Please try again later.";

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          "Server error. Please try again later.";
      } else if (error.request) {
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  // Show email sending progress dialog
  const handleShowProgress = () => {
    setEmailSentDialogOpen(true);
  };

  // Trigger submit with progress dialog
  const handleSubmitWithProgress = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error",
      });
      return;
    }
    handleShowProgress();
    // Small delay to show dialog before starting submission
    setTimeout(() => {
      handleSubmit(e);
    }, 5000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  const handleCloseEmailSentDialog = () => {
    if (!isSubmitting) {
      setEmailSentDialogOpen(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const contactInfo = [
    {
      icon: (
        <LocationOnIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24, lg: 26 } }} />
      ),
      title: "Visit Us",
      details: ["Tech Park, Sector 62", "Noida, UP - 201301", "India"],
      color: "#3b82f6",
      link: "https://maps.google.com",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24, lg: 26 } }} />,
      title: "Call Us",
      details: ["+91 120 456 7890", "Mon-Fri, 9 AM - 6 PM IST"],
      color: "#10b981",
      link: "tel:+911204567890",
    },
    {
      icon: <EmailIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24, lg: 26 } }} />,
      title: "Email Us",
      details: ["support@assetflow.com", "sales@assetflow.com"],
      color: "#8b5cf6",
      link: "mailto:support@assetflow.com",
    },
  ];

  const socialLinks = [
    {
      icon: <LinkedInIcon />,
      url: "https://linkedin.com",
      color: "#0077b5",
      name: "LinkedIn",
    },
    {
      icon: <TwitterIcon />,
      url: "https://twitter.com",
      color: "#1da1f2",
      name: "Twitter",
    },
    {
      icon: <FacebookIcon />,
      url: "https://facebook.com",
      color: "#1877f2",
      name: "Facebook",
    },
    {
      icon: <InstagramIcon />,
      url: "https://instagram.com",
      color: "#e4405f",
      name: "Instagram",
    },
  ];

  return (
    <Box
      id="contact"
      component="section"
      sx={{
        py: { xs: 5, sm: 6, md: 8, lg: 10, xl: 12 },
        px: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 5 },
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: { xs: "auto", sm: "auto", md: "100vh" },
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background Decorations - Responsive */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "3%", sm: "5%", md: "8%", lg: "10%" },
          right: { xs: "-20%", sm: "-15%", md: "-10%", lg: "-5%" },
          width: { xs: "90%", sm: "70%", md: "50%", lg: "40%", xl: "35%" },
          height: { xs: "90%", sm: "70%", md: "50%", lg: "40%", xl: "35%" },
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: "3%", sm: "5%", md: "8%", lg: "10%" },
          left: { xs: "-20%", sm: "-15%", md: "-10%", lg: "-5%" },
          width: { xs: "90%", sm: "70%", md: "50%", lg: "40%", xl: "35%" },
          height: { xs: "90%", sm: "70%", md: "50%", lg: "40%", xl: "35%" },
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 1, sm: 1.5, md: 2, lg: 2.5, xl: 3 },
          maxWidth: {
            xs: "100%",
            sm: "100%",
            md: "90%",
            lg: "1200px",
            xl: "1400px",
          },
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          style={{ width: "100%" }}
        >
          {/* Section Header - Fully Responsive */}
          <motion.div variants={fadeInUp}>
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 4, sm: 5, md: 6, lg: 7, xl: 8 },
              }}
            >
              <Chip
                label="CONTACT US"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: {
                    xs: "0.55rem",
                    sm: "0.6rem",
                    md: "0.65rem",
                    lg: "0.7rem",
                    xl: "0.75rem",
                  },
                  letterSpacing: "0.1em",
                  mb: { xs: 1.5, sm: 2, md: 2.5 },
                  height: { xs: 22, sm: 24, md: 26, lg: 28, xl: 30 },
                  borderRadius: "100px",
                  px: { xs: 1, sm: 1.2, md: 1.5, lg: 1.8, xl: 2 },
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontSize: {
                    xs: "1.6rem",
                    sm: "1.9rem",
                    md: "2.2rem",
                    lg: "2.6rem",
                    xl: "3rem",
                  },
                  fontWeight: 800,
                  mb: { xs: 1, sm: 1.2, md: 1.5 },
                  letterSpacing: "-0.02em",
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                Let's Talk
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.8rem",
                    md: "0.85rem",
                    lg: "0.9rem",
                    xl: "1rem",
                  },
                  maxWidth: {
                    xs: "95%",
                    sm: "85%",
                    md: "75%",
                    lg: "65%",
                    xl: "55%",
                  },
                  mx: "auto",
                  lineHeight: 1.6,
                  px: { xs: 1, sm: 0 },
                }}
              >
                Have questions about AssetFlow? We'd love to hear from you and
                help with any inquiries about our asset management solutions.
              </Typography>
            </Box>
          </motion.div>

          {/* Two Column Layout - Responsive Grid */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 }}
            justifyContent="center"
            alignItems="stretch"
          >
            {/* Contact Information Column */}
            <Grid item xs={12} md={6}>
              <motion.div variants={fadeInUp} style={{ height: "100%" }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: {
                      xs: "1.25rem",
                      sm: "1.5rem",
                      md: "1.75rem",
                      lg: "2rem",
                    },
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    bgcolor: "background.paper",
                    height: "100%",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: isDesktop
                        ? "translateY(-8px)"
                        : "translateY(-4px)",
                      boxShadow: `0 24px 48px -16px ${alpha(theme.palette.common.black, 0.15)}`,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: {
                          xs: "1rem",
                          sm: "1.1rem",
                          md: "1.2rem",
                          lg: "1.3rem",
                          xl: "1.4rem",
                        },
                        mb: 0.75,
                        color: "text.primary",
                      }}
                    >
                      Get in Touch
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.8rem",
                          md: "0.85rem",
                          lg: "0.875rem",
                        },
                        mb: { xs: 2.5, sm: 3, md: 3.5 },
                        lineHeight: 1.5,
                      }}
                    >
                      Our dedicated team is here to assist you with any
                      questions or support needs you may have.
                    </Typography>

                    {/* Contact Info Items */}
                    <Stack
                      spacing={{ xs: 2, sm: 2.5, md: 3 }}
                      sx={{ mb: { xs: 3, sm: 3.5, md: 4 } }}
                    >
                      {contactInfo.map((item, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                          alignItems="flex-start"
                          component="a"
                          href={item.link}
                          target={
                            item.link.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(8px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 40, sm: 44, md: 48, lg: 52, xl: 56 },
                              height: {
                                xs: 40,
                                sm: 44,
                                md: 48,
                                lg: 52,
                                xl: 56,
                              },
                              borderRadius: {
                                xs: "0.875rem",
                                sm: "1rem",
                                md: "1.125rem",
                              },
                              bgcolor: alpha(item.color, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: item.color,
                              flexShrink: 0,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                bgcolor: alpha(item.color, 0.15),
                              },
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                fontSize: {
                                  xs: "0.8rem",
                                  sm: "0.85rem",
                                  md: "0.9rem",
                                  lg: "0.95rem",
                                },
                                color: "text.primary",
                                mb: 0.5,
                              }}
                            >
                              {item.title}
                            </Typography>
                            {item.details.map((line, i) => (
                              <Typography
                                key={i}
                                variant="caption"
                                sx={{
                                  display: "block",
                                  fontSize: {
                                    xs: "0.65rem",
                                    sm: "0.7rem",
                                    md: "0.75rem",
                                    lg: "0.8rem",
                                  },
                                  color: "text.secondary",
                                  lineHeight: 1.4,
                                }}
                              >
                                {line}
                              </Typography>
                            ))}
                          </Box>
                        </Stack>
                      ))}
                    </Stack>

                    {/* Social Links */}
                    <Box
                      sx={{
                        pt: { xs: 2, sm: 2.5, md: 3 },
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: {
                            xs: "0.65rem",
                            sm: "0.7rem",
                            md: "0.75rem",
                          },
                          color: "text.secondary",
                          display: "block",
                          mb: 1.5,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                        }}
                      >
                        CONNECT WITH US
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 1.5, md: 2 }}
                      >
                        {socialLinks.map((social, idx) => (
                          <Tooltip key={idx} title={social.name} arrow>
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: alpha(social.color, 0.08),
                                color: social.color,
                                "&:hover": {
                                  bgcolor: alpha(social.color, 0.15),
                                  transform: "translateY(-3px)",
                                },
                                transition: "all 0.2s ease",
                                width: { xs: 34, sm: 36, md: 40, lg: 44 },
                                height: { xs: 34, sm: 36, md: 40, lg: 44 },
                              }}
                              component="a"
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {React.cloneElement(social.icon, {
                                sx: { fontSize: { xs: 16, sm: 18, md: 20 } },
                              })}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    </Box>

                    {/* Response Time Badge */}
                    <Box
                      sx={{
                        mt: { xs: 2.5, sm: 3, md: 3.5 },
                        pt: { xs: 2, sm: 2.5, md: 3 },
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 14, color: "#10b981" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.65rem",
                            md: "0.7rem",
                          },
                          color: "text.secondary",
                        }}
                      >
                        Average response time: &lt; 2 hours
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Contact Form Column */}
            <Grid item xs={12} md={6}>
              <motion.div variants={fadeInUp} style={{ height: "100%" }}>
                <Card
                  elevation={0}
                  component="form"
                  onSubmit={handleSubmitWithProgress}
                  sx={{
                    borderRadius: {
                      xs: "1.25rem",
                      sm: "1.5rem",
                      md: "1.75rem",
                      lg: "2rem",
                    },
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    bgcolor: "background.paper",
                    height: "100%",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: isDesktop
                        ? "translateY(-8px)"
                        : "translateY(-4px)",
                      boxShadow: `0 24px 48px -16px ${alpha(theme.palette.common.black, 0.15)}`,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: {
                          xs: "1rem",
                          sm: "1.1rem",
                          md: "1.2rem",
                          lg: "1.3rem",
                          xl: "1.4rem",
                        },
                        mb: 0.75,
                        color: "text.primary",
                      }}
                    >
                      Send a Message
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.8rem",
                          md: "0.85rem",
                          lg: "0.875rem",
                        },
                        mb: { xs: 2.5, sm: 3, md: 3.5 },
                      }}
                    >
                      Fill out the form and we'll respond within 24 hours
                    </Typography>

                    <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                      <TextField
                        fullWidth
                        label="Full Name *"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        size="medium"
                        placeholder="John Doe"
                        error={!!errors.fullName && touched.fullName}
                        helperText={touched.fullName && errors.fullName}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.8rem",
                              md: "0.85rem",
                            },
                          },
                          "& .MuiInputBase-root": {
                            fontSize: {
                              xs: "0.8rem",
                              sm: "0.85rem",
                              md: "0.9rem",
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.7rem",
                              md: "0.75rem",
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Email Address *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        size="medium"
                        placeholder="john@example.com"
                        error={!!errors.email && touched.email}
                        helperText={touched.email && errors.email}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.8rem",
                              md: "0.85rem",
                            },
                          },
                          "& .MuiInputBase-root": {
                            fontSize: {
                              xs: "0.8rem",
                              sm: "0.85rem",
                              md: "0.9rem",
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.7rem",
                              md: "0.75rem",
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Phone Number *"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        size="medium"
                        placeholder="9876543210"
                        helperText={
                          (touched.phone && errors.phone) ||
                          "Enter 10-digit mobile number"
                        }
                        error={!!errors.phone && touched.phone}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.8rem",
                              md: "0.85rem",
                            },
                          },
                          "& .MuiInputBase-root": {
                            fontSize: {
                              xs: "0.8rem",
                              sm: "0.85rem",
                              md: "0.9rem",
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.7rem",
                              md: "0.75rem",
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Message *"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        size="medium"
                        placeholder="How can we help you? Please provide details..."
                        error={!!errors.message && touched.message}
                        helperText={touched.message && errors.message}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.8rem",
                              md: "0.85rem",
                            },
                          },
                          "& .MuiInputBase-root": {
                            fontSize: {
                              xs: "0.8rem",
                              sm: "0.85rem",
                              md: "0.9rem",
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.7rem",
                              md: "0.75rem",
                            },
                          },
                        }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        endIcon={
                          !isSubmitting ? (
                            <SendIcon
                              sx={{
                                fontSize: { xs: 16, sm: 17, md: 18, lg: 20 },
                              }}
                            />
                          ) : null
                        }
                        sx={{
                          py: { xs: 1.2, sm: 1.3, md: 1.4, lg: 1.5 },
                          borderRadius: {
                            xs: "0.875rem",
                            sm: "1rem",
                            md: "1.125rem",
                          },
                          fontSize: {
                            xs: "0.8rem",
                            sm: "0.85rem",
                            md: "0.9rem",
                            lg: "0.95rem",
                          },
                          fontWeight: 700,
                          textTransform: "none",
                          bgcolor: theme.palette.primary.main,
                          mt: 1,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                          },
                          "&:active": {
                            transform: "translateY(0)",
                          },
                          transition: "all 0.2s ease",
                          position: "relative",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <CircularProgress
                              size={20}
                              sx={{
                                color: "white",
                                position: "absolute",
                                left: "50%",
                                marginLeft: "-10px",
                              }}
                            />
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>

                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "center",
                          mt: 1,
                          fontSize: {
                            xs: "0.55rem",
                            sm: "0.6rem",
                            md: "0.65rem",
                          },
                          color: "text.secondary",
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 10,
                            mr: 0.5,
                            verticalAlign: "middle",
                          }}
                        />
                        Your information is safe with us. We'll never share your
                        data.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Email Sending Progress Dialog */}
      <Dialog
        open={emailSentDialogOpen}
        onClose={handleCloseEmailSentDialog}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown={isSubmitting}
        PaperProps={{
          sx: {
            borderRadius: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, #0f4c61 0%, #1a6e8a 100%)`,
            p: 2.5,
            textAlign: "center",
          }}
        >
          <HourglassEmptyIcon sx={{ fontSize: 48, color: "#fff", mb: 1 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}
          >
            Sending Your Message
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", mb: 2, lineHeight: 1.6 }}
          >
            {progressMessage}
          </Typography>
          <Box sx={{ width: "100%", mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", display: "block" }}
          >
            Please wait while we send your message...
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", display: "block", mt: 1 }}
          >
            This may take a few seconds
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
            p: 2.5,
            textAlign: "center",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 48, color: "#fff", mb: 1 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#fff", fontSize: "1.1rem" }}
          >
            Message Sent Successfully!
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{ mb: 2, fontWeight: 500, color: "#1f2937" }}
          >
            Thank you for reaching out to us!
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", lineHeight: 1.6 }}
          >
            We have received your message and our support team will respond to
            you within 24 hours. A confirmation email has been sent to{" "}
            <strong>{formData.email}</strong>.
          </Typography>
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#f0fdf4",
              borderRadius: "1rem",
              border: "1px solid #86efac",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#166534", display: "block" }}
            >
              📧 Check your inbox for a confirmation email
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#166534", display: "block", mt: 0.5 }}
            >
              ⏱️ Average response time: 2 hours
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: "center" }}>
          <Button
            onClick={handleCloseSuccessDialog}
            variant="contained"
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              borderRadius: "0.75rem",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          bottom: { xs: 16, sm: 20, md: 24 },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
            borderRadius: { xs: "0.75rem", sm: "1rem" },
          }}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;

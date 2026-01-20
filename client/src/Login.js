import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #ffffff 0%, #F9FAFB 100%)",
  backdropFilter: "blur(10px)",
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: "#1F4ED8",
  color: "white",
  padding: theme.spacing(4),
  borderRadius: "16px 16px 0 0",
  textAlign: "center",
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Login({ onLogin }) {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (tabValue === 0) {
      // Login
      if (!email || !password) {
        setError("Email and password are required");
        return false;
      }
    } else {
      // Signup
      if (!name || !email || !password || !phone) {
        setError("All fields are required");
        return false;
      }
      if (phone.length !== 10 || isNaN(phone)) {
        setError("Phone number must be exactly 10 digits");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (tabValue === 0) {
        // Login
        const res = await axios.post("http://localhost:5000/api/login", {
          email,
          password,
        });
        // Store JWT token and user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          onLogin(res.data.user.role, res.data.user);
        }, 1000);
      } else {
        // Signup
        const res = await axios.post("http://localhost:5000/api/register", {
          name,
          email,
          phone,
          password,
        });
        // Store JWT token and user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccess("Account created successfully! Logging you in...");
        setTimeout(() => {
          onLogin(res.data.user.role, res.data.user);
        }, 1000);
      }
    } catch (err) {
      // Login/Register error handled
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <StyledCard>
          {/* Header */}
          <GradientBox>
            <FavoriteIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
              Help Change Lives
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Join our community of donors
            </Typography>
          </GradientBox>

          <CardContent sx={{ p: 0 }}>
            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                label="Login"
                icon={<LoginIcon />}
                iconPosition="start"
                id="tab-0"
              />
              <Tab
                label="Sign Up"
                icon={<PersonAddIcon />}
                iconPosition="start"
                id="tab-1"
              />
            </Tabs>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ m: 2, mb: 1 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ m: 2, mb: 1 }}>
                {success}
              </Alert>
            )}

            {/* Login Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  placeholder="your@email.com"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showLoginPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  placeholder="Enter your password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          edge="end"
                          sx={{ color: "#1F4ED8" }}
                        >
                          {showLoginPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Login"}
                </Button>
              </Box>
            </TabPanel>

            {/* Sign Up Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  placeholder="Your full name"
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  placeholder="your@email.com"
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  placeholder="10-digit phone number"
                  inputProps={{ maxLength: 10 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showSignupPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  placeholder="Create a strong password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowSignupPassword(!showSignupPassword)
                          }
                          edge="end"
                          sx={{ color: "#1F4ED8" }}
                        >
                          {showSignupPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Create Account"}
                </Button>
              </Box>
            </TabPanel>

            {/* Footer */}
            <Box
              sx={{ p: 3, textAlign: "center", borderTop: "1px solid #eee" }}
            >
              <Typography variant="body2" color="textSecondary">
                Every donation makes a difference ❤️
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
}

export default Login;

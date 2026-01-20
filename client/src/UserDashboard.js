import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RefreshIcon from "@mui/icons-material/Refresh";

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
}));

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
}));

function UserDashboard({ userEmail, onDonateClick, onLogout }) {
  const [user, setUser] = useState(null);
  const [totalDonated, setTotalDonated] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchUserData();
    }
  }, [userEmail]);

  const fetchUserData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/user/profile")
      .then((res) => {
        setUser(res.data);
        const sum = res.data.donations
          .filter((d) => d.status === "Success")
          .reduce((acc, curr) => acc + Number(curr.amount), 0);
        setTotalDonated(sum);
      })
      .catch((err) => {
        // Error loading data
      })
      .finally(() => setLoading(false));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Success: { icon: <CheckCircleIcon />, color: "success" },
      Failed: { icon: <ErrorIcon />, color: "error" },
      Pending: { icon: <HourglassEmptyIcon />, color: "warning" },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return (
      <Chip
        icon={config.icon}
        label={status}
        color={config.color}
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            💙 Donor Dashboard
          </Typography>
          <IconButton
            color="inherit"
            onClick={fetchUserData}
            title="Refresh data"
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setOpenDialog(true)}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your generosity is making a real difference in the world
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid
          container
          spacing={2}
          sx={{
            mb: 4,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
          }}
        >
          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <FavoriteIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Total Donated
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      ₹{totalDonated.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <HistoryIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Donations Made
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      {user?.donations?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Successful Donations
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      {user?.donations?.filter((d) => d.status === "Success")
                        ?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>
        </Grid>

        {/* Donation Button */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={onDonateClick}
            startIcon={<FavoriteBorderIcon />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            Make a Donation
          </Button>
        </Box>

        {/* Recent Donations Table */}
        <StatsCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              💳 Transaction History
            </Typography>

            {user?.donations && user.donations.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ background: "#f5f7fa" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: "33.33%",
                          textAlign: "center",
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: "33.33%",
                          textAlign: "center",
                        }}
                      >
                        Amount
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          width: "33.33%",
                          textAlign: "center",
                        }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...user.donations].reverse().map((donation, index) => (
                      <TableRow key={index} hover>
                        <TableCell
                          sx={{ width: "33.33%", textAlign: "center" }}
                        >
                          {new Date(donation.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            width: "33.33%",
                            textAlign: "center",
                          }}
                        >
                          ₹{donation.amount}
                        </TableCell>
                        <TableCell
                          sx={{ width: "33.33%", textAlign: "center" }}
                        >
                          {getStatusChip(donation.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography color="textSecondary">
                  No donations yet. Start making a difference today! 💚
                </Typography>
              </Box>
            )}
          </CardContent>
        </StatsCard>
      </Container>

      {/* Logout Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpenDialog(false);
              onLogout();
            }}
            variant="contained"
            color="error"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserDashboard;

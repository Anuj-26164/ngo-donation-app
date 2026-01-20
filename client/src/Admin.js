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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.25s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-3px) scale(1.01)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Admin({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [totalCollection, setTotalCollection] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // --- FETCH DATA ---
  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        setUsers(res.data);
        processData(res.data);
      })
      .catch((err) => {
        // Error fetching data
      })
      .finally(() => setLoading(false));
  };

  // --- PROCESS DATA (Calculate Totals) ---
  const processData = (usersData) => {
    let grandTotal = 0;
    let transactions = [];

    usersData.forEach((user) => {
      if (user.donations) {
        user.donations.forEach((donation) => {
          if (donation.status === "Success") {
            grandTotal += Number(donation.amount);
          }
          transactions.push({
            donorName: user.name,
            donorEmail: user.email,
            amount: donation.amount,
            status: donation.status,
            date: donation.date,
          });
        });
      }
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTotalCollection(grandTotal);
    setAllTransactions(transactions);
  };

  // --- ACTION 1: PROMOTE (Make Admin) ---
  const makeAdmin = (email) => {
    axios
      .post("http://localhost:5000/api/promote", { email })
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        // Error updating role
      });
  };

  // --- ACTION 2: DEMOTE (Remove Admin) ---
  const removeAdmin = (email) => {
    axios
      .post("http://localhost:5000/api/demote", { email })
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        // Error updating role
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const isSuperAdmin = currentUser?.email === "admin@gmail.com";

  const handleConfirmAction = () => {
    if (selectedAction === "promote") {
      makeAdmin(selectedEmail);
    } else if (selectedAction === "demote") {
      removeAdmin(selectedEmail);
    }
    setOpenDialog(false);
    setSelectedAction(null);
    setSelectedEmail(null);
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
          <AdminPanelSettingsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            Admin Dashboard
          </Typography>
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
        {/* Welcome */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Admin Panel 🎛️
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage donors, transactions, and system users
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
            lg={3}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Total Collection
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      ₹{totalCollection.toLocaleString()}
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
            lg={3}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Total Users
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      {users.length}
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
            lg={3}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ReceiptIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Total Transactions
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      {allTransactions.length}
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
            lg={3}
            sx={{ display: "flex", minWidth: 0 }}
          >
            <GradientCard
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              sx={{ width: "100%" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <VerifiedUserIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      color="inherit"
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                    >
                      Admin Count
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                    >
                      {users.filter((u) => u.role === "admin").length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ borderRadius: "16px" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Users" id="admin-tab-0" />
            <Tab label="Transactions" id="admin-tab-1" />
          </Tabs>

          {/* Users Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ background: "#f5f7fa" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    {isSuperAdmin && (
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === "admin" ? "Admin" : "User"}
                          color={user.role === "admin" ? "primary" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          {user.role !== "admin" ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                setSelectedAction("promote");
                                setSelectedEmail(user.email);
                                setOpenDialog(true);
                              }}
                            >
                              Make Admin
                            </Button>
                          ) : user.email !== "admin@gmail.com" ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                setSelectedAction("demote");
                                setSelectedEmail(user.email);
                                setOpenDialog(true);
                              }}
                            >
                              Remove Admin
                            </Button>
                          ) : (
                            <Chip label="Superadmin" color="primary" />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Transactions Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ background: "#f5f7fa" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allTransactions.map((txn, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{txn.donorName}</TableCell>
                      <TableCell>{txn.donorEmail}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ₹{txn.amount}
                      </TableCell>
                      <TableCell>
                        {new Date(txn.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusChip(txn.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Container>

      {/* Logout/Action Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background:
              selectedAction === "promote"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : selectedAction === "demote"
                  ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
                  : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.2rem",
            textAlign: "center",
            py: 3,
          }}
        >
          {selectedAction === "promote"
            ? "Promote to Admin?"
            : selectedAction === "demote"
              ? "Remove Admin Rights?"
              : "Sign Out?"}
        </DialogTitle>
        <DialogContent sx={{ py: 3, textAlign: "center" }}>
          <Typography sx={{ color: "#666", fontSize: "1rem" }}>
            {selectedAction === "promote"
              ? `Promote ${selectedEmail} to Admin?`
              : selectedAction === "demote"
                ? `Remove admin rights from ${selectedEmail}?`
                : "Are you sure you want to sign out?"}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            pb: 3,
            pt: 2,
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: "8px",
              color: "#666",
              border: "1px solid #ddd",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: "#f5f5f5",
              },
            }}
          >
            Cancel
          </Button>
          {selectedAction ? (
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              sx={{
                px: 3,
                py: 1,
                borderRadius: "8px",
                background:
                  selectedAction === "demote"
                    ? "#f5576c"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Confirm
            </Button>
          ) : (
            <Button
              onClick={() => {
                setOpenDialog(false);
                onLogout();
              }}
              variant="contained"
              sx={{
                px: 3,
                py: 1,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Sign Out
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Admin;

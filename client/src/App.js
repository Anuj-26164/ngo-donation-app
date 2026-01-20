import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Box, Snackbar, Alert, Fade } from "@mui/material";

import Admin from "./Admin";
import Login from "./Login";
import UserDashboard from "./UserDashboard";
import Navbar from "./Navbar";
import Footer from "./Footer";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1F4ED8",
    },
    secondary: {
      main: "#F97316",
    },
    success: {
      main: "#16A34A",
    },
    background: {
      default: "#F9FAFB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#374151",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Separate Donation Form Component to isolate PayPal
function DonationForm({ currentUser, onBack, setCurrentPage, onError }) {
  const [formData, setFormData] = useState({ amount: "" });
  const [paypalError, setPaypalError] = useState(null);
  const [showTickAnimation, setShowTickAnimation] = useState(false);
  const [showFailAnimation, setShowFailAnimation] = useState(false);

  if (paypalError) {
    return (
      <div className="container">
        <div
          className="card"
          style={{ maxWidth: "500px", position: "relative" }}
        >
          <button onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Payment Error</h2>
            <p>{paypalError}</p>
            <button
              onClick={onBack}
              style={{
                background: "#dc004e",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎉 Show Green Tick Animation
  if (showTickAnimation) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#F9FAFB",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10000,
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          {/* Green Tick Circle */}
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto 30px",
              borderRadius: "50%",
              background: "#16A34A",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              animation: "scaleIn 0.6s ease-out",
            }}
          >
            {/* Checkmark SVG */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                animation: "checkmarkDraw 0.8s ease-out 0.2s forwards",
                opacity: 0,
              }}
            >
              <path
                d="M10 30L24 44L50 16"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h2
            style={{
              color: "#16A34A",
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "10px",
              animation: "fadeIn 0.6s ease-out 0.4s forwards",
              opacity: 0,
            }}
          >
            Payment Received!
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              marginBottom: "20px",
              animation: "fadeIn 0.6s ease-out 0.5s forwards",
              opacity: 0,
            }}
          >
            Thank you for your generous donation
          </p>

          <style>{`
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }

            @keyframes checkmarkDraw {
              from {
                stroke-dasharray: 80;
                stroke-dashoffset: 80;
                opacity: 0;
              }
              to {
                stroke-dasharray: 80;
                stroke-dashoffset: 0;
                opacity: 1;
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ❌ Show Red X Failure Animation (No Sound)
  if (showFailAnimation) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#F9FAFB",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10000,
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          {/* Red X Circle */}
          <div
            style={{
              width: "120px",
              height: "120px",
              margin: "0 auto 30px",
              borderRadius: "50%",
              background: "#DC2626",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              animation: "scaleIn 0.6s ease-out",
            }}
          >
            {/* X SVG */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                animation: "xDraw 0.8s ease-out 0.2s forwards",
                opacity: 0,
              }}
            >
              <path
                d="M15 15L45 45M45 15L15 45"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h2
            style={{
              color: "#DC2626",
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "10px",
              animation: "fadeIn 0.6s ease-out 0.4s forwards",
              opacity: 0,
            }}
          >
            Payment Failed
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              marginBottom: "30px",
              animation: "fadeIn 0.6s ease-out 0.5s forwards",
              opacity: 0,
            }}
          >
            Please try again or contact support
          </p>

          <button
            onClick={() => {
              setShowFailAnimation(false);
              setFormData({ amount: "" });
            }}
            style={{
              background: "#DC2626",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              animation: "fadeIn 0.6s ease-out 0.6s forwards",
              opacity: 0,
            }}
          >
            Try Again
          </button>

          <style>{`
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }

            @keyframes xDraw {
              from {
                stroke-dasharray: 80;
                stroke-dashoffset: 80;
                opacity: 0;
              }
              to {
                stroke-dasharray: 80;
                stroke-dashoffset: 0;
                opacity: 1;
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        background: "#F9FAFB",
        minHeight: "calc(100vh - 64px)",
        pt: 0,
        pb: 0,
        m: 0,
      }}
    >
      <PayPalScriptProvider
        options={{
          "client-id":
            "AdMpAG7oSD6GWweCB1pffd277NvxK7afQFprlXXiqQz6vOcjunYyBNKSn5REmDo2kWrPWz1BScS2SCGV",
        }}
        onError={() =>
          setPaypalError("Failed to load PayPal. Please try again.")
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "calc(100vh - 64px)",
            padding: "30px 20px",
            background: "#F9FAFB",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              padding: "40px",
              position: "relative",
            }}
          >
            <button onClick={onBack} style={styles.backBtn}>
              ← Back
            </button>

            {/* Header Decoration */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h1
                className="title"
                style={{
                  marginTop: "20px",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                }}
              >
                💙 Donate Hope
              </h1>
              <p
                className="subtitle"
                style={{ fontSize: "1.1rem", color: "#666", marginTop: "10px" }}
              >
                Your generosity has the power to change lives.
              </p>
            </div>

            {/* Impact Cards */}
            <div style={{ marginBottom: "25px" }}>
              <h4
                style={{
                  color: "#111827",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                What your donation can do:
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #93c5fd",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#1e40af",
                      marginBottom: "5px",
                    }}
                  >
                    ₹ 500
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#1e3a8a" }}>
                    Feeds a child for a day
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #86efac",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#166534",
                      marginBottom: "5px",
                    }}
                  >
                    ₹ 1,000
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#14532d" }}>
                    Plants 2 saplings
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #f472b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#be185d",
                      marginBottom: "5px",
                    }}
                  >
                    ₹ 5,000
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#831843" }}>
                    Sponsors education for a month
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #fcd34d",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#b45309",
                      marginBottom: "5px",
                    }}
                  >
                    ₹ 10,000
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#78350f" }}>
                    Provides medical aid to 5 people
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #a5b4fc",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#4338ca",
                      marginBottom: "5px",
                    }}
                  >
                    ₹ 25,000
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#312e81" }}>
                    Builds a community library corner
                  </div>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #d8b4fe",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#7e22ce",
                      marginBottom: "5px",
                    }}
                  >
                    ₹ 50,000
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#581c87" }}>
                    Provides vocational training course
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Inputs */}
            <div style={{ marginTop: "30px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    color: "#111827",
                    fontSize: "0.95rem",
                  }}
                >
                  Donor Name
                </label>
                <input
                  type="text"
                  value={currentUser.name || "Anonymous"}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    cursor: "not-allowed",
                    fontWeight: 600,
                    color: "#6b7280",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* 👇 Amount Input in INR (₹) */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 700,
                    color: "#1F4ED8",
                    fontSize: "0.95rem",
                  }}
                >
                  Amount (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 500)"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "10px",
                    border: "2px solid #1F4ED8",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#1F4ED8",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(249, 115, 22, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1F4ED8";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 👇 PAYPAL BUTTONS SECTION 👇 */}
              <div
                style={{
                  marginTop: "30px",
                  padding: "20px",
                  background: "#f0f9ff",
                  borderRadius: "12px",
                  border: "1px solid #e0f2fe",
                }}
              >
                <p
                  style={{
                    margin: "0 0 15px 0",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "#0369a1",
                    fontWeight: 600,
                  }}
                >
                  💳 Choose your payment method
                </p>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  onInit={(data, actions) => {
                    // Open PayPal checkout in new tab
                    actions.disable();
                  }}
                  // A. Create Order (with Auto-Conversion)
                  createOrder={(data, actions) => {
                    if (!formData.amount || formData.amount <= 0) {
                      return actions.reject();
                    }

                    // 💡 SMART CONVERSION: ₹ to $ (Approx 1 USD = 84 INR)
                    // User inputs ₹500 -> PayPal gets $5.95
                    const usdAmount = (formData.amount / 84).toFixed(2);

                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: usdAmount, // Sending Dollars to PayPal
                            currency_code: "USD",
                          },
                          description: `Donation of ₹${formData.amount}`, // Receipt shows INR amount
                        },
                      ],
                    });
                  }}
                  // B. Payment Success
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(async (details) => {
                      const name = details.payer.name.given_name;

                      // 🎉 Save ORIGINAL Rupee Amount (₹) to Database
                      try {
                        await axios.post("http://localhost:5000/api/donate", {
                          email: currentUser.email,
                          amount: formData.amount, // Saving ₹500 (Not dollar amount)
                          status: "Success",
                          transactionId: details.id,
                        });
                        // Database updated with donation
                      } catch (err) {
                        // Show error notification to user
                        onError(
                          "Failed to save donation. Please contact support.",
                          "error",
                        );
                      }

                      // Show green tick animation first
                      setShowTickAnimation(true);

                      // After tick animation completes (1.2s), play sound and confetti then redirect
                      setTimeout(() => {
                        // Play Confirmation Sound
                        try {
                          const audio = new Audio("/confirmationsound.mp3");
                          audio.play();
                        } catch (err) {
                          // Sound playback failed silently
                        }

                        // Create Confetti Animation (synchronized with sound)
                        const confettiPieces = 100;
                        for (let i = 0; i < confettiPieces; i++) {
                          const confetti = document.createElement("div");
                          confetti.style.position = "fixed";
                          confetti.style.width = "10px";
                          confetti.style.height = "10px";
                          confetti.style.left = Math.random() * 100 + "%";
                          confetti.style.top = "-10px";
                          confetti.style.borderRadius = "50%";
                          confetti.style.pointerEvents = "none";
                          confetti.style.zIndex = "9999";

                          const colors = [
                            "#1F4ED8",
                            "#F97316",
                            "#16A34A",
                            "#ec4899",
                            "#f59e0b",
                            "#8b5cf6",
                            "#06b6d4",
                          ];
                          confetti.style.background =
                            colors[Math.floor(Math.random() * colors.length)];

                          document.body.appendChild(confetti);

                          const duration = 2 + Math.random() * 1;
                          const delay = Math.random() * 0.5;
                          const xMove = (Math.random() - 0.5) * 300;

                          setTimeout(() => {
                            confetti.animate(
                              [
                                {
                                  transform: `translate(0, 0) rotate(0deg)`,
                                  opacity: 1,
                                },
                                {
                                  transform: `translate(${xMove}px, ${window.innerHeight + 20}px) rotate(720deg)`,
                                  opacity: 0,
                                },
                              ],
                              {
                                duration: duration * 1000,
                                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                              },
                            ).onfinish = () => confetti.remove();
                          }, delay * 1000);
                        }

                        // Redirect after animation completes
                        setTimeout(() => {
                          setShowTickAnimation(false);
                          setCurrentPage("userDashboard");
                        }, 2000);
                      }, 1200);
                    });
                  }}
                  // C. Error Handling
                  onError={(err) => {
                    // Show failure animation (no sound)
                    setShowFailAnimation(true);

                    // Auto-dismiss after 3 seconds
                    setTimeout(() => {
                      setShowFailAnimation(false);
                      setFormData({ amount: "" });
                    }, 3000);
                  }}
                />
              </div>
              {/* 👆 PAYPAL SECTION ENDS 👆 */}

              {/* Security Badges Section */}
              <div
                style={{
                  marginTop: "30px",
                  padding: "20px",
                  background: "#f0fdf4",
                  borderRadius: "12px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  {/* Badge 1 */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
                      🔒
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#166534",
                        marginBottom: "4px",
                      }}
                    >
                      256-bit SSL Encrypted
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#14532d" }}>
                      Bank-level encryption
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
                      ✓
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#166534",
                        marginBottom: "4px",
                      }}
                    >
                      Secure & Encrypted
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#14532d" }}>
                      PCI DSS compliant
                    </div>
                  </div>

                  {/* Badge 3 */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
                      🛡️
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#166534",
                        marginBottom: "4px",
                      }}
                    >
                      End-to-End Encryption
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#14532d" }}>
                      Protected transmission
                    </div>
                  </div>

                  {/* Badge 4 */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
                      ⚡
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#166534",
                        marginBottom: "4px",
                      }}
                    >
                      Secure Transaction
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#14532d" }}>
                      Real-time processing
                    </div>
                  </div>
                </div>

                {/* Trust message */}
                <div
                  style={{
                    marginTop: "15px",
                    textAlign: "center",
                    paddingTop: "15px",
                    borderTop: "1px solid #bbf7d0",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#14532d",
                      fontWeight: 500,
                    }}
                  >
                    ✅ Your payment information is 100% secure and protected by
                    industry-leading security standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PayPalScriptProvider>
    </Box>
  );
}

function App() {
  // Initialize state from localStorage to prevent multiple renders
  const getInitialState = () => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        const userData = JSON.parse(user);
        return {
          currentUser: userData,
          currentPage: userData.role === "admin" ? "admin" : "userDashboard",
          isLoading: false,
        };
      }
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return {
      currentUser: {},
      currentPage: "login",
      isLoading: false,
    };
  };

  const initialState = getInitialState();
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [currentUser, setCurrentUser] = useState(initialState.currentUser);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const logoutInProgressRef = useRef(false);
  const currentUserRef = useRef(initialState.currentUser);

  // --- LOGIN / LOGOUT LOGIC ---
  const handleLogin = (role, userData) => {
    currentUserRef.current = userData;
    setCurrentUser(userData);
    if (role === "admin") setCurrentPage("admin");
    else setCurrentPage("userDashboard");
  };

  const handleLogout = useCallback(() => {
    // Prevent multiple logout calls
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    // Show logout message only for normal users, not admins
    if (currentUserRef.current?.role !== "admin") {
      setShowLogoutMessage(true);
    }

    // Clear JWT token and user data after a short delay to show the message
    setTimeout(() => {
      // Batch all state updates together for single render
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentPage("login");
      setCurrentUser({});
      currentUserRef.current = {};

      // Reset logout flag after redirect
      setTimeout(() => {
        logoutInProgressRef.current = false;
      }, 50);
    }, 500);
  }, []);

  const handleShowError = (message, severity = "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <div>Loading...</div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App" sx={{ m: 0, p: 0 }}>
        {/* NAVBAR - Show on login page */}
        {currentPage === "login" && <Navbar />}

        {/* Main Content with top padding for fixed navbar */}
        <Box
          sx={{
            pt: currentPage === "login" ? 9 : 0,
            m: 0,
            p: 0,
            transition: "padding 0.3s ease",
          }}
        >
          {/* 1. LOGIN PAGE */}
          <Fade in={currentPage === "login"} timeout={500}>
            <div
              style={{ display: currentPage === "login" ? "block" : "none" }}
            >
              <Login onLogin={handleLogin} />
            </div>
          </Fade>

          {/* 2. ADMIN DASHBOARD */}
          <Fade in={currentPage === "admin"} timeout={500}>
            <div
              style={{ display: currentPage === "admin" ? "block" : "none" }}
            >
              <Admin currentUser={currentUser} onLogout={handleLogout} />
            </div>
          </Fade>

          {/* 3. USER DASHBOARD */}
          <Fade in={currentPage === "userDashboard"} timeout={500}>
            <div
              style={{
                display: currentPage === "userDashboard" ? "block" : "none",
              }}
            >
              {currentUser?.email && (
                <UserDashboard
                  userEmail={currentUser.email}
                  onDonateClick={() => setCurrentPage("donateForm")}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </Fade>

          {/* 4. DONATION PAGE (With INR Support) */}
          <Fade in={currentPage === "donateForm"} timeout={500}>
            <div
              style={{
                display: currentPage === "donateForm" ? "block" : "none",
              }}
            >
              <DonationForm
                currentUser={currentUser}
                onBack={() => setCurrentPage("userDashboard")}
                setCurrentPage={setCurrentPage}
                onError={handleShowError}
              />
            </div>
          </Fade>
        </Box>

        {/* FOOTER - Show on login page */}
        {currentPage === "login" && <Footer />}

        {/* LOGOUT MESSAGE - Only for normal users */}
        <Snackbar
          open={showLogoutMessage}
          autoHideDuration={4000}
          onClose={() => setShowLogoutMessage(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowLogoutMessage(false)}
            severity="info"
            sx={{
              width: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              "& .MuiAlert-icon": {
                color: "white",
              },
            }}
          >
            You've been signed out. Thank you for supporting our mission. We
            hope to see you again soon.
          </Alert>
        </Snackbar>

        {/* ERROR NOTIFICATION */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

const styles = {
  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    color: "#1F4ED8",
    fontWeight: 600,
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
};

export default App;

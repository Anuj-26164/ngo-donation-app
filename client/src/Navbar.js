import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
} from "@mui/material";

function Navbar() {
  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Cells", href: "#cells" },
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Teams", href: "#teams" },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        background: "rgba(31, 78, 216, 0.7)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 4px 16px rgba(31, 78, 216, 0.2)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 0",
            gap: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo and Brand - Left */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: "fit-content",
            }}
          >
            <Box
              component="img"
              src="/nss-logo.png"
              alt="NSS Logo"
              sx={{
                height: "60px",
                width: "60px",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  fontSize: "16px",
                  lineHeight: 1.2,
                  color: "#FFFFFF",
                }}
              >
                National Service Scheme
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "13px",
                  color: "#E0E7FF",
                  fontWeight: 500,
                }}
              >
                IIT ROORKEE
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links - Right */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: "auto",
              gap: 3,
            }}
          >
            {navLinks.map((link) => (
              <Button
                key={link.label}
                href={link.href}
                sx={{
                  color: "#E0E7FF",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  position: "relative",
                  transition: "all 0.3s ease",
                  px: 2,
                  py: 1,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: "2px",
                    background: "#FFFFFF",
                    transition: "width 0.3s ease",
                  },
                  "&:hover": {
                    color: "#FFFFFF",
                  },
                  "&:hover::after": {
                    width: "70%",
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;

import React from "react";
import { Box, Container, Grid, Typography, Link, Divider } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

function Footer() {
  return (
    <Box
      sx={{
        background: "#0F172A",
        color: "#E5E7EB",
        py: 6,
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          sx={{ mb: 4, justifyContent: "space-between" }}
        >
          {/* Left Section - Logo and Organization Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                component="img"
                src="/IITR175.png"
                alt="IIT Roorkee"
                sx={{
                  height: "80px",
                  width: "auto",
                  objectFit: "contain",
                  mb: 1,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#E5E7EB",
                  textAlign: "center",
                }}
              >
                National Service Scheme
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: "13px",
                  color: "#9CA3AF",
                }}
              >
                Serving the nation through community service and social
                responsibility
              </Typography>
            </Box>
          </Grid>

          {/* Middle Section - Address */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: "15px",
                color: "#E5E7EB",
              }}
            >
              📍 Contact Us
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <LocationOnIcon
                sx={{ fontSize: "20px", flexShrink: 0, mt: 0.5 }}
              />
              <Box>
                <Link
                  href="https://maps.app.goo.gl/pjkRLr7pDJnLzEbD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: "none",
                    color: "#E5E7EB",
                    transition: "color 0.3s ease",
                    "&:hover": { color: "#FFFFFF" },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "13px", lineHeight: 1.6, color: "inherit" }}
                  >
                    NSS Office, 2nd floor, Multi Activity Centre
                    <br />
                    IIT Roorkee, Roorkee-247667
                    <br />
                    Uttarakhand, India
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Right Section - Contact Persons */}
          <Grid item xs={12} md={4}>
            {/* General Secretary */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  mb: 0.5,
                  color: "#E5E7EB",
                }}
              >
                Abhishek Mittal
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  mb: 0.5,
                }}
              >
                General Secretary
              </Typography>
              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}
              >
                <PhoneIcon sx={{ fontSize: "16px" }} />
                <Link
                  href="tel:+917999995196"
                  sx={{
                    color: "#9CA3AF",
                    textDecoration: "none",
                    fontSize: "12px",
                    transition: "color 0.3s ease",
                    "&:hover": { color: "#FFFFFF" },
                  }}
                >
                  +91 79999 95196
                </Link>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <EmailIcon sx={{ fontSize: "16px" }} />
                <Link
                  href="mailto:nss@iitr.ac.in"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "12px",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  nss@iitr.ac.in
                </Link>
              </Box>
            </Box>

            {/* Additional Secretary */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  mb: 0.5,
                  color: "#E5E7EB",
                }}
              >
                Vivek Sen
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  mb: 0.5,
                }}
              >
                Additional Secretary
              </Typography>
              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}
              >
                <PhoneIcon sx={{ fontSize: "16px" }} />
                <Link
                  href="tel:+919334221353"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "12px",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  +91 93342 21353
                </Link>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <EmailIcon sx={{ fontSize: "16px" }} />
                <Link
                  href="mailto:nss@iitr.ac.in"
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "12px",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  nss@iitr.ac.in
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "#1E293B" }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            flexDirection: "column",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "12px", color: "#6B7280", textAlign: "center" }}
          >
            © 2026 National Service Scheme, IIT Roorkee. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "12px", color: "#6B7280", textAlign: "center" }}
          >
            💙 Supporting Community Service & Social Development
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

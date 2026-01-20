const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const validator = require("email-validator");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());

// CORS - Restrict to specific origins
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parser with size limit
app.use(express.json({ limit: "10kb" }));

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes (increased for development)
  message: "Too many login attempts, please try again later",
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: "Too many registration attempts, please try again later",
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret-key",
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Admin authorization middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Database connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ngo_project")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return validator.validate(v);
      },
      message: "Invalid email format",
    },
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  donations: [
    {
      amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"],
      },
      date: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        default: "Pending",
      },
      transactionId: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  action: String,
  performedBy: String,
  targetUser: String,
  timestamp: { type: Date, default: Date.now },
  details: Object,
  ipAddress: String,
});

const User = mongoose.model("User", userSchema);
const AuditLog = mongoose.model("AuditLog", auditLogSchema);

// Initialize super admin only if it doesn't exist
async function initializeSuperAdmin() {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: superAdminEmail });

    if (!existingAdmin) {
      // Only create if environment variable is set
      if (process.env.SUPER_ADMIN_PASSWORD) {
        const hashedPassword = await bcrypt.hash(
          process.env.SUPER_ADMIN_PASSWORD,
          10,
        );
        await User.create({
          name: "Super Admin",
          email: superAdminEmail,
          phone: "0000000000",
          password: hashedPassword,
          role: "admin",
        });
        console.log("✅ Super Admin initialized");
      } else {
        console.log(
          "ℹ️ Super Admin email set but no password provided - skipping auto-creation",
        );
      }
    } else {
      console.log("ℹ️ Super Admin already exists");
    }
  } catch (err) {
    console.error("❌ Error initializing super admin:", err.message);
  }
}

initializeSuperAdmin();

// ============================================
// ROUTES - AUTHENTICATION & USER MANAGEMENT
// ============================================

// A. REGISTER / SIGNUP
app.post("/api/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Input validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.validate(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "user",
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "dev-secret-key",
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// B. LOGIN
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📝 Login attempt for:", email);

    // Input validation
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!validator.validate(email)) {
      console.log("❌ Invalid email format:", email);
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user (need password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✓ User found:", email);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✓ Password valid for:", email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev-secret-key",
      { expiresIn: "24h" },
    );

    console.log("✓ Token generated for:", email);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// C. GET USER PROFILE (Protected)
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// D. ADD DONATION (Protected)
app.post("/api/donate", authenticate, async (req, res) => {
  try {
    const { amount, status, transactionId } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!["Pending", "Success", "Failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.donations.push({
      amount: Number(amount),
      status,
      transactionId,
      date: new Date(),
    });

    await user.save();

    res.json({
      message: "Donation recorded",
      donation: user.donations[user.donations.length - 1],
    });
  } catch (err) {
    console.error("Donation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/donate/update", authenticate, async (req, res) => {
  const { donationId, status, transactionId } = req.body;

  if (!donationId || !["Pending", "Success", "Failed"].includes(status)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const user = await User.findOne({
    _id: req.user.userId,
    "donations._id": donationId,
  });

  if (!user) {
    return res.status(404).json({ message: "Donation not found" });
  }

  const donation = user.donations.id(donationId);
  donation.status = status;
  if (transactionId) donation.transactionId = transactionId;

  await user.save();

  res.json({ donation });
});


// E. GET ALL USERS (Admin only - Protected)
app.get("/api/users", authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// E.5 GET CURRENT USER PROFILE (Protected - for regular users)
app.get("/api/user/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// F. PROMOTE TO ADMIN (Admin only - Protected)
app.post("/api/promote", authenticate, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.validate(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Prevent promoting super admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@gmail.com";
    if (email === superAdminEmail) {
      return res.status(403).json({ message: "Cannot promote super admin" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already admin" });
    }

    user.role = "admin";
    await user.save();

    // Log action
    await AuditLog.create({
      action: "PROMOTE",
      performedBy: req.user.email,
      targetUser: email,
      details: { from: "user", to: "admin" },
    });

    res.json({ message: "User promoted to admin" });
  } catch (err) {
    console.error("Promote error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// G. DEMOTE FROM ADMIN (Admin only - Protected)
app.post("/api/demote", authenticate, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.validate(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Prevent demoting super admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@gmail.com";
    if (email === superAdminEmail) {
      return res.status(403).json({ message: "Cannot demote super admin" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    user.role = "user";
    await user.save();

    // Log action
    await AuditLog.create({
      action: "DEMOTE",
      performedBy: req.user.email,
      targetUser: email,
      details: { from: "admin", to: "user" },
    });

    res.json({ message: "User demoted successfully" });
  } catch (err) {
    console.error("Demote error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// H. PAYHERE HASH GENERATION (Protected)
app.post("/api/generate-hash", authenticate, (req, res) => {
  try {
    const { order_id, amount, currency } = req.body;

    // Credentials from environment
    const merchant_id = process.env.MERCHANT_ID;
    const merchant_secret = process.env.MERCHANT_SECRET;

    if (!merchant_id || !merchant_secret) {
      console.error("Missing merchant credentials");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Validate amount
    const amountNum = parseFloat(amount.toString().replace(/,/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const amountFormatted = amountNum.toFixed(2);

    // Hash generation
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase();

    const hashString =
      merchant_id + order_id + amountFormatted + "LKR" + hashedSecret;
    const hash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    res.json({ hash });
  } catch (err) {
    console.error("Hash generation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📍 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// NEW CODE (Use this)
mongoose.connect('mongodb://127.0.0.1:27017/ngo_project')
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.error("MongoDB Error:", err));
// 2. DEFINE USER SCHEMA (Updated with Password & Role)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true }, // Ensure unique emails
    phone: String,
    password: { type: String, required: true }, // New Field
    role: { type: String, default: 'user' },    // New Field: 'user' or 'admin'
    donations: [{
        amount: String,
        date: { type: Date, default: Date.now },
        status: String
    }]
});

const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// A. REGISTER / SIGNUP
app.post('/api/register', async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        // ... (existing check for user existence) ...

        // 👇 CHANGE THIS LINE 👇
        // If email is 'admin@gmail.com', make them Admin. Everyone else is User.
        const role = (email === "admin@gmail.com") ? "admin" : "user"; 

        const newUser = new User({ name, email, phone, password, role: role }); // Use the variable
        await newUser.save();
        res.json({ message: "Registration Successful", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B. REAL LOGIN (Checks DB for Email & Password)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Simple password check (In production, use hashing like bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        // Return user info AND their role
        res.json({ 
            message: "Login Success", 
            user: { 
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                role: user.role 
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// C. ADD DONATION (For existing users)
app.post('/api/donate', async (req, res) => {
    const { email, amount, status } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            user.donations.push({ amount, status });
            await user.save();
            res.json({ message: "Donation Added" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// D. GET ALL USERS (For Admin Dashboard)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ _id: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// E. PROMOTE TO ADMIN (Superadmin Power)
app.post('/api/promote', async (req, res) => {
    const { email } = req.body;
    try {
        await User.findOneAndUpdate({ email }, { role: 'admin' });
        res.json({ message: "User Promoted to Admin" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// F. PAYHERE HASH GENERATION
app.post('/api/generate-hash', (req, res) => {
    const merchantSecret = process.env.MERCHANT_SECRET;
    const merchantId = process.env.MERCHANT_ID;
    const { order_id, amount, currency } = req.body;
    
    if (!merchantSecret) return res.status(500).json({ error: "Merchant Secret missing" });

    const hash = crypto.createHash('md5')
        .update(merchantId + order_id + amount + currency + crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase())
        .digest('hex').toUpperCase();
    
    res.json({ hash });
});

// G. DEMOTE TO USER (With Superadmin Protection)
app.post('/api/demote', async (req, res) => {
    const { email } = req.body;

    // 🔒 SECURITY CHECK: Prevent Superadmin Demotion
    // Make sure this email matches EXACTLY with your Superadmin email
    if (email === 'admin@gmail.com') { 
        return res.status(403).json({ message: "Action Denied! Cannot demote Super Admin." });
    }

    try {
        // Role wapas 'user' kar do
        await User.findOneAndUpdate({ email }, { role: 'user' });
        res.json({ message: "User Demoted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));
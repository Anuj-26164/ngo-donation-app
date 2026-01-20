# Quick Start Guide - Security Implementation

## Prerequisites

- Node.js v14+ and npm installed
- MongoDB running on 127.0.0.1:27017 (or configure MONGO_URI in .env)
- Two terminal windows

## Step 1: Setup Environment Variables

Create `server/.env` file with:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ngo_project
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SUPER_ADMIN_EMAIL=admin@gmail.com
SUPER_ADMIN_PASSWORD=admin123456
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYHERE_MERCHANT_ID=your-payhere-merchant-id
PAYHERE_MERCHANT_SECRET=your-payhere-secret
CLIENT_URL=http://localhost:3000
```

## Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Step 3: Start the Application

### Terminal 1 - Start Backend Server

```bash
cd server
npm start
# Server runs on http://localhost:5000
```

You should see:

```
Server running on port 5000
Connected to MongoDB
Super Admin initialized: admin@gmail.com
```

### Terminal 2 - Start Frontend Application

```bash
cd client
npm start
# Frontend opens on http://localhost:3000
```

## Step 4: Test the Application

### Create Account (Signup)

1. Go to <http://localhost:3000>
2. Click "Signup" tab
3. Enter:
   - Name: John Doe
   - Email: <user@example.com>
   - Phone: 9876543210
   - Password: password123
4. Click "Sign Up"
5. Should see: "Account created successfully!"
6. Token stored in localStorage

### Login with Existing Account

1. Click "Login" tab
2. Enter:
   - Email: <user@example.com>
   - Password: password123
3. Click "Login"
4. Should see User Dashboard

### Access Admin Panel

1. Login with super admin:
   - Email: <admin@gmail.com>
   - Password: admin123456
2. You should see Admin Dashboard
3. Can view users, promote/demote, view transactions

### Test Rate Limiting

1. Click Logout
2. Try to login 6 times rapidly with wrong password
3. On 6th attempt: "Too many login attempts"

## Security Features Active

✅ **JWT Authentication** - All API calls require valid token
✅ **Password Hashing** - All passwords stored as bcrypt hashes
✅ **Rate Limiting** - Prevents brute force attacks
✅ **Input Validation** - Email, phone, password validated
✅ **CORS Protection** - Only localhost:3000 allowed
✅ **Security Headers** - Helmet.js protecting against common attacks
✅ **Auto Token Refresh** - axios interceptor handles token inclusion
✅ **Session Persistence** - Token stored in localStorage

## API Examples with JWT

### Register New User

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "pass123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "john@example.com", "role": "user" }
}
```

### Make Authenticated Request

```bash
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Response:
{ "id": "...", "email": "john@example.com", "role": "user" }
```

### Admin Operations (Promote User)

```bash
curl -X POST http://localhost:5000/api/promote \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'

# Response: 200 OK (user promoted to admin)
```

## Troubleshooting

### "Cannot find module 'dotenv'"

```bash
cd server
npm install dotenv
```

### MongoDB Connection Error

```bash
# Ensure MongoDB is running:
mongod

# Or update MONGO_URI in .env to your MongoDB connection
```

### Port Already in Use

```bash
# Change PORT in .env to 5001, 5002, etc.
# Or kill process using port 5000:
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### axios is not defined in Login.js

```bash
# Ensure axiosConfig.js is in client/src/
# And imported in index.js
```

## File Structure Reference

```
ngo-donation-app/
├── server/
│   ├── .env                    # Environment variables (CREATE THIS)
│   ├── server.js               # Main backend (UPDATED)
│   ├── package.json            # Dependencies (UPDATED)
│   └── node_modules/           # npm packages
├── client/
│   ├── src/
│   │   ├── axiosConfig.js     # NEW - Axios interceptor
│   │   ├── App.js             # UPDATED - JWT session mgmt
│   │   ├── Login.js           # UPDATED - Token storage
│   │   ├── Admin.js           # Uses JWT via interceptor
│   │   ├── UserDashboard.js   # Uses JWT via interceptor
│   │   └── index.js           # UPDATED - Import axiosConfig
│   ├── package.json
│   └── node_modules/
├── SECURITY_IMPLEMENTATION.md # NEW - Detailed implementation docs
└── SECURITY_ANALYSIS.md       # Original vulnerability analysis
```

## Next Steps

1. **Production Deployment**:
   - Change JWT_SECRET to strong random string
   - Set NODE_ENV=production
   - Configure SSL/HTTPS
   - Use MongoDB Atlas

2. **Database Backup**:
   - If existing data, migrate & hash passwords
   - Run `db.users.updateMany({}, ...bcrypt logic)`

3. **Testing**:
   - Test all admin functions
   - Verify rate limiting works
   - Test token expiration after 24 hours

4. **Monitoring**:
   - Set up error logging
   - Monitor login attempts
   - Alert on suspicious activity

## Support & Documentation

- See `SECURITY_IMPLEMENTATION.md` for detailed security info
- See `SECURITY_ANALYSIS.md` for vulnerability details
- Check server console for JWT and rate limit logs

**All critical and high-priority vulnerabilities have been fixed!** 🔒

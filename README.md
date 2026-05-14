# CareConnect Hub - Hospital Management System

Here you can test the Live Deployment
https://careconnect-hub-one.vercel.app/

## Quick Start Guide

This is a simple hospital management app with registration and login.

### Prerequisites
1. Node.js installed
2. MongoDB installed and running (or use MongoDB Atlas)

### Running the Application

#### Step 1: Start MongoDB
Make sure MongoDB is running:
- Local: `mongod` (or start MongoDB service)
- Or use MongoDB Atlas (cloud)

#### Step 2: Start the Backend
```bash
cd careconnect-hub/backend
npm install (already done)
npm run dev
```
The backend will start on http://localhost:5001

#### Step 3: Start the Frontend
Open a new terminal:
```bash
cd careconnect-hub
npm install (already done)
npm run dev
```
The frontend will start on http://localhost:8080

### How It Works

#### Registration (Frontend → Backend)
1. User fills form on RegisterPage
2. AuthContext.register() calls apiRequest("/api/auth/register")
3. Frontend sends POST to /api/auth/register
4. Backend creates user in MongoDB
5. Backend returns token + user data
6. Frontend saves to localStorage

#### Login (Frontend → Backend)
1. User fills form on LoginPage
2. AuthContext.login() calls apiRequest("/api/auth/login")
3. Frontend sends POST to /api/auth/login
4. Backend verifies password with MongoDB
5. Backend returns token + user data
6. Frontend saves to localStorage

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new account |
| POST | /api/auth/login | Login to account |
| GET | /api/auth/me | Get current user |
| GET | /health | Health check |

### Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running: `mongod`
- Or check MONGO_URI in backend/.env

**API Requests Failing:**
- Make sure backend is running on port 5001
- Check browser console for errors

**Login/Register Not Working:**
- Open browser DevTools → Network tab
- Check if requests are being made
- Check response from server


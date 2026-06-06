# 🏥 CareConnect Hub

CareConnect Hub is a state-of-the-art, real-time hospital management and telemedicine platform. It bridges the gap between patients and healthcare providers by combining smart token-based queue systems, instant appointment scheduling, simulated payment processing, and secure live WebRTC video consultations into a single, cohesive portal.

---

## ✨ Key Features

### 👤 Patient Portal
- **Dashboard & Vitals:** Personal profile management alongside a live vitals tracker (Blood Pressure, Heart Rate, Temperature, Blood Sugar) with interactive sparkline visualizers.
- **Smart Token Queue System:** Generate queuing tokens for specific departments and track real-time queue position and estimated wait times.
- **Appointment Scheduler:** A seamless multi-step appointment booking flow (Select Department & Doctor ➡️ Select Date & Time ➡️ Patient Details).
- **Simulated Payment Gateway:** Pay consultation fees via dummy Credit Card credentials or a simulated UPI QR Code scanner.
- **Telemedicine Integration:** Instantly unlock and join secure video call rooms directly from your token history upon payment.

### 🛡️ Admin Portal
- **Key Statistics Dashboard:** Real-time statistics displaying total users, active/completed/cancelled appointments, active tokens, and department lists.
- **User & Doctor Management:** View registered users, update permissions, assign doctor directories, and manage departments.
- **Queue Operations:** Call token numbers, change their status, and send automated notifications when a patient's turn is active.

### 🔌 Real-Time & Communications
- **Socket.io Signaling:** Broadcasts token updates, queue notifications, and real-time page updates to dashboards instantly.
- **WebRTC Consultations:** Direct peer-to-peer video/audio calling with mute/unmute and camera toggles.
- **Email Notifications:** Lazily initialized Resend/Nodemailer service sending automated alerts when a token shifts to `in-progress`.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 (Vite, JavaScript)
- **Styling:** Tailwind CSS + Radix UI (Shadcn CSS UI)
- **Animations:** Framer Motion + GSAP (GreenSock) for micro-interactions + Lenis for smooth scroll effects
- **State & Data Fetching:** TanStack React Query + React Router DOM v6
- **Real-Time Connection:** Socket.io Client

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB + Mongoose (with fail-safe memory fallbacks for local-only development)
- **Authentication:** JWT (JSON Web Tokens), Bcryptjs, and Google OAuth
- **WebSockets:** Socket.io
- **Emails:** Nodemailer + Resend API

---

## 📂 Project Structure

```
medicare/
├── frontend/             # React SPA (Vite)
│   ├── src/
│   │   ├── assets/       # Static assets (images, logos)
│   │   ├── components/   # Layouts, Modals, Shared UI (Shadcn)
│   │   ├── contexts/     # Auth & Theme State Providers
│   │   ├── hooks/        # Custom utility hooks
│   │   ├── lib/          # API helpers and Socket connection
│   │   └── pages/        # Dashboard, Tokens, Booking, Admin pages
│   └── package.json
│
└── backend/              # Node.js REST API & WS Server
    ├── config/           # Database connections
    ├── controllers/      # Route controllers (Auth, Admin, Tokens, etc.)
    ├── middleware/       # JWT Auth and Admin filters
    ├── models/           # Mongoose Database schemas
    ├── routes/           # REST endpoints
    ├── services/         # Mail / Notification services
    ├── utils/            # Helper files and database checks
    ├── server.js         # Entrypoint & Socket.io handling
    └── package.json
```

---

## 🚀 Getting Started

Follow these steps to run the development environment locally.

### 📋 Prerequisites
- **Node.js** (v18.x or higher recommended)
- **MongoDB** instance (local server or Atlas cluster URI)

---

### 1️⃣ Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env` file in the root of the `backend` folder:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   MONGO_DB_NAME=careconnect
   JWT_SECRET=your_jwt_secret_key
   
   # Optional configurations:
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   RESEND_API_KEY=your_resend_api_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```
4. Start the server in hot-reload development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5001`.*

---

### 2️⃣ Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5001
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend application will start on `http://localhost:5173`.*

---

## 🔑 Default Accounts (Demo Mode)

To explore the dashboard without registering, use the pre-seeded credentials:

* **Administrator Access**
  * **Email:** `samar@gmail.com`
  * **Password:** `samarpreet`

---

## 🤝 Collaboration Workflow

To contribute changes to CareConnect Hub:
1. Make your changes locally.
2. Commit your code:
   ```bash
   git add .
   git commit -m "Describe your changes here"
   ```
3. Push to your branch:
   ```bash
   git push origin main
   ```

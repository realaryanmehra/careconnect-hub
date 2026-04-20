# 🏥 Hospital Management System - Complete Frontend Logic Guide

**Complete Overview of how the Frontend works**

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Application Flow](#application-flow)
3. [State Management (AuthContext)](#state-management)
4. [Routing & Protection](#routing--protection)
5. [Key Components & Logic](#key-components--logic)
6. [Data Flow](#data-flow)
7. [Page Logic Explained](#page-logic-explained)

---

## Architecture Overview

### **High-Level Structure**
```
┌─────────────────────────────────────────┐
│           Browser              │
│  (User opens app)                       │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │    main.jsx            │
    │  (Entry point)         │
    │  Creates React root    │
    └────────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │         App.jsx (Main Component)       │
    │  Sets up all Providers & Routes        │
    └────────┬─────────────────────────┬─────┘
             │                         │
             ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   Providers:     │      │    Routes:       │
    │ - AuthProvider   │      │ - Home (/)       │
    │ - QueryClient    │      │ - Login          │
    │ - TooltipProvider│      │ - Register       │
    │ - Toaster        │      │ - Tokens         │
    │ - Sonner         │      │ - Appointments   │
    └──────────────────┘      │ - Dashboard      │
                              │ - Admin          │
                              │ - Departments    │
                              └──────────────────┘
```

### **Folder Structure**
```
src/
├── main.jsx                    ← Entry point
├── App.jsx                     ← Routes & Providers
├── contexts/
│   └── AuthContext.jsx         ← Global auth state
├── components/
│   ├── Header.jsx              ← Navigation
│   ├── Footer.jsx              ← Footer
│   ├── Layout.jsx              ← Page wrapper
│   ├── ProtectedRoute.jsx       ← Auth-guard
│   ├── AdminRoute.jsx           ← Admin-guard
│   └── ui/                      ← 40+ ShadcN UI components
├── pages/
│   ├── Index.jsx               ← Home
│   ├── LoginPage.jsx           ← Login form
│   ├── RegisterPage.jsx        ← Register form
│   ├── TokensPage.jsx          ← Token management
│   ├── AppointmentsPage.jsx    ← Book appointment
│   ├── DashboardPage.jsx       ← Patient dashboard
│   ├── AdminDashboard.jsx      ← Admin panel
│   ├── DepartmentsPage.jsx     ← Departments
│   └── NotFound.jsx            ← 404 page
├── hooks/
│   ├── use-mobile.jsx          ← Mobile detection
│   └── use-toast.js            ← Toast notifications
└── lib/
    ├── api.js                  ← API requests
    └── utils.js                ← Helper functions (cn)
```

---

## Application Flow

### **User Journey - Step by Step**

#### **1️⃣ When User Opens the App**
```javascript
// main.jsx - Renders App into DOM
createRoot(document.getElementById("root")).render(<App />)
```

#### **2️⃣ App Component Initialization**
```javascript
// App.jsx
const App = () => {
  return (
    <QueryClientProvider>        {/* React Query setup */}
      <AuthProvider>             {/* Auth context setup */}
        <BrowserRouter>          {/* Router setup */}
          <Routes>
            {/* All routes here */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
```

#### **3️⃣ AuthProvider Checks Login Status**
When AuthProvider mounts, it runs this logic:

```javascript
useEffect(() => {
  // Load saved auth from localStorage
  const savedToken = localStorage.getItem("careconnect_auth_token");
  const savedUser = localStorage.getItem("careconnect_auth_user");
  
  // Restore auth state from storage
  if (savedToken) setToken(savedToken);
  if (savedUser) setUser(JSON.parse(savedUser));
  
  // Stop loading spinner
  setLoading(false);
}, []);
```

**What happens:**
- ✅ If user previously logged in → token/user are restored
- ✅ User stays logged in (persistent login)
- ✅ If token is invalid → handled by API error

#### **4️⃣ Route Matching**
Browser URL matches a route in App.jsx:
- `/` → Index (home page) - **No protection**
- `/login` → LoginPage - **No protection**
- `/register` → RegisterPage - **No protection**
- `/appointments` → **Protected (ProtectedRoute)**
- `/dashboard` → **Protected (ProtectedRoute)**
- `/admin` → **Protected (ProtectedRoute) + Admin only (AdminRoute)**

---

## State Management

### **How AuthContext Works**

The **AuthContext** is the central hub for all authentication logic.

#### **What It Stores**
```javascript
{
  token: "jwt_token_here",          // JWT from backend
  user: {
    _id: "user_id",
    name: "John Doe",
    email: "john@email.com",
    role: "admin" or "patient"      // Determines if admin
  },
  loading: true/false,              // Still checking login?
  isAuthenticated: true/false,      // Has valid token?
  isAdmin: true/false,              // Is admin user?
  login: async function,            // Login method
  register: async function,         // Register method
  logout: function                  // Logout method
}
```

#### **How Login Works**

```javascript
const login = async ({ email, password }) => {
  // Step 1: Send credentials to backend
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  
  // Step 2: Backend returns token and user object
  // Example response:
  // {
  //   token: "eyJhbGciOiJIUzI1NiIs...",
  //   user: { _id: "123", name: "Dr. Samar", email: "drsamar@gmail.com", role: "admin" }
  // }
  
  // Step 3: Save token & user to localStorage (persist login)
  persistAuth(data.token, data.user);
  
  // Step 4: Update React state
  setToken(data.token);
  setUser(data.user);
  
  // Step 5: Return user object so LoginPage can redirect
  return data.user;
};
```

#### **How Register Works**
```javascript
const register = async ({ name, email, password }) => {
  // Similar to login:
  // 1. Send data to backend
  // 2. Backend creates user and returns token + user object
  // 3. Save to localStorage
  // 4. Update state
  // 5. Return user object
};
```

#### **How Logout Works**
```javascript
const logout = () => {
  // Clear everything
  setToken(null);
  setUser(null);
  localStorage.removeItem("careconnect_auth_token");
  localStorage.removeItem("careconnect_auth_user");
};
```

#### **How useAuth Hook Works**
```javascript
// Any component can access auth anywhere:
const MyComponent = () => {
  const { token, user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  // Now you can:
  // - Check if logged in: if (isAuthenticated) { ... }
  // - Check if admin: if (isAdmin) { ... }
  // - Access user data: user.name
  // - Call logout: logout()
};
```

### **Storage Keys** (localStorage)
```
careconnect_auth_token  → "eyJhbGciOiJIUzI1NiIs..."
careconnect_auth_user   → '{"_id":"123","name":"John","role":"admin"}'
```

---

## Routing & Protection

### **How Protected Routes Work**

#### **ProtectedRoute - Basic Authentication Guard**

```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();  // Where are we?
  
  // Step 1: Loading
  if (loading) return null;  // Show nothing while checking
  
  // Step 2: Check auth
  if (!isAuthenticated) {
    // Not logged in? Redirect to login
    return <Navigate 
      to="/login" 
      replace 
      state={{ from: location }}  // Remember where they came from
    />;
  }
  
  // Step 3: Show protected content
  return children;
};
```

**Example Usage in App.jsx:**
```javascript
<Route path="/appointments" element={
  <ProtectedRoute>
    <AppointmentsPage />
  </ProtectedRoute>
} />
```

**What Happens:**

| Scenario | Result |
|----------|--------|
| User NOT logged in, visits `/appointments` | Redirected to `/login` |
| User logged in, visits `/appointments` | AppointmentsPage shows |
| User logs in from `/login` | Redirected to original page (from state) |

#### **AdminRoute - Admin-Only Guard**

```javascript
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return null;
  
  // If not admin, redirect to patient dashboard
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  
  // If admin, show content
  return children;
};
```

**Stacking Protection:**
```javascript
<Route path="/admin" element={
  <ProtectedRoute>                {/* Check: authenticated? */}
    <AdminRoute>                  {/* Check: admin? */}
      <AdminDashboard />
    </AdminRoute>
  </ProtectedRoute>
} />
```

**Security Flow:**
1. User must be logged in (ProtectedRoute)
2. User must have `role: "admin"` (AdminRoute)
3. Non-admin users → redirected to `/dashboard`
4. Non-authenticated users → redirected to `/login`

---

## Key Components & Logic

### **1. Header Component**

```javascript
const Header = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  // Different navigation for admin vs regular users
  const navItems = isAdmin
    ? [
        { label: "Home", path: "/" },
        { label: "Admin Dashboard", path: "/admin" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Dashboard", path: "/dashboard" },
        { label: "Tokens", path: "/tokens" },
        { label: "Book Appointment", path: "/appointments" },
        { label: "Departments", path: "/departments" },
      ];
  
  return (
    <header>
      {/* Logo/Brand */}
      <Link to="/">MediCare</Link>
      
      {/* Navigation with active highlighting */}
      {navItems.map(item => (
        <Link 
          to={item.path}
          className={
            location.pathname === item.path
              ? "bg-primary"  // Highlight active
              : "muted"
          }
        >
          {item.label}
        </Link>
      ))}
      
      {/* Auth buttons */}
      {!isAuthenticated && (
        <>
          <Button>Login</Button>
          <Button>Register</Button>
        </>
      )}
      
      {isAuthenticated && (
        <>
          <span>Hi, {user.name}</span>
          <Button onClick={logout}>Logout</Button>
        </>
      )}
      
      {/* Mobile menu */}
      {mobileOpen && <MobileMenu />}
    </header>
  );
};
```

### **2. LoginPage Component**

```javascript
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call login from AuthContext
      const loggedInUser = await login({ email, password });
      
      // Show success message
      toast({ title: "Logged in successfully" });
      
      // Redirect based on user role
      if (loggedInUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Show error message
      toast({ 
        title: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <Input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Layout>
  );
};
```

### **3. API Request System**

#### **apiRequest - Basic HTTP**
```javascript
export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`http://localhost:5001${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  
  return data;
};
```

**Usage:**
```javascript
// Register new user
const user = await apiRequest("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name, email, password })
});
```

#### **authRequest - Authenticated HTTP**
```javascript
export const authRequest = async (path, options = {}) => {
  const token = localStorage.getItem('careconnect_auth_token');
  
  if (!token) throw new Error('Not authenticated');
  
  // Add Authorization header
  return apiRequest(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,  // Send token with request
      ...options.headers
    }
  });
};
```

**Usage:**
```javascript
// Get admin data (requires token)
const data = await authRequest('/api/admin/users');
// Backend receives: Authorization: Bearer eyJhbGci...
```

#### **Pre-built API Functions**
```javascript
// Get logged-in user's dashboard
export const getDashboard = () => authRequest('/api/dashboard');

// Get all tokens for current user
export const getTokens = () => authRequest('/api/tokens');

// Generate new token
export const generateToken = (data) => authRequest('/api/tokens', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

---

## Data Flow

### **Login Data Flow**

```
User types email/password
        ↓
User clicks "Sign In"
        ↓
LoginPage.handleSubmit() called
        ↓
authContext.login() called
        ↓
apiRequest("/api/auth/login") [POST with credentials]
        ↓
Backend validates email/password
        ↓
Backend returns: { token: "...", user: {...} }
        ↓
Frontend receives response
        ↓
persistAuth() saves to localStorage
        ↓
React state updated: token, user set
        ↓
Cookie/Header ready for next requests
        ↓
Navigate to /admin or /dashboard based on role
```

### **Accessing Protected Resource**

```
User visits /appointments
        ↓
ProtectedRoute component renders
        ↓
Checks: isAuthenticated?
        ↓
YES → Show AppointmentsPage
        ↓
Component mounts, calls: getTokens()
        ↓
getTokens() calls: authRequest('/api/tokens')
        ↓
authRequest adds: Authorization: Bearer {token}
        ↓
Backend checks token validity
        ↓
Token valid? Return tokens data
        ↓
Component receives data, display tokens
```

### **State Management Flow**

```
AuthContext (root)
├── token (JWT string)
├── user (user object)
├── loading (boolean)
├── login() method
├── register() method
└── logout() method
     ↓
useAuth() hook
     ↓
All components can access:
├── Header (show/hide auth buttons)
├── ProtectedRoute (guard routes)
├── AdminRoute (guard admin routes)
├── LoginPage (perform login)
├── RegisterPage (perform register)
└── Any other component
```

---

## Page Logic Explained

### **Index (Home Page) - `/`**

```javascript
const Index = () => {
  return (
    <Layout>
      {/* Hero section with background image */}
      <section className="hero">
        <h1>Your Health, Our Priority</h1>
        <Button>Book Appointment</Button>
        <Button>Check Token Status</Button>
      </section>
      
      {/* Stats cards with animation */}
      <section className="stats">
        {/* 50+ Doctors, 10K+ Patients, etc. */}
      </section>
      
      {/* Features with Framer Motion */}
      <section className="features">
        {/* Smart Token Queue, Easy Appointments, etc. */}
      </section>
      
      {/* Departments showcase */}
      <section className="departments">
        {/* 6 department cards */}
      </section>
      
      {/* Call-to-action */}
      <section className="cta">
        {/* Final "Book Appointment" button */}
      </section>
    </Layout>
  );
};
```

**Key Features:**
- ✅ No authentication required
- ✅ Hero image with overlay
- ✅ Animated stats and features
- ✅ Department cards with icons
- ✅ Responsive grid layout

### **LoginPage - `/login`**

**Flow:**
1. User enters email & password
2. Click "Sign In"
3. Validation check (email format, password length)
4. API call to `/api/auth/login`
5. Backend validates credentials
6. Success → token + user returned
7. Token saved to localStorage
8. React state updated
9. User redirected to `/admin` (if admin) or `/dashboard`
10. Error → toast notification shown

**Key Logic:**
```javascript
// Get returned user object (not context, to avoid timing issues)
const loggedInUser = await login({ email, password });

// Check role and redirect accordingly
if (loggedInUser?.role === 'admin') {
  navigate('/admin');
} else {
  navigate('/dashboard');
}
```

### **TokensPage - `/tokens`**

**Allowed:** Only logged-in users (ProtectedRoute)

**Features:**
1. **Generate Token:**
   - Select department dropdown
   - Enter patient name
   - Click "Generate Token"
   - API POST to `/api/tokens`
   - Show generated token number

2. **View Tokens:**
   - Fetch all user's tokens: `getTokens()`
   - Display in table with columns: Number, Department, Status, Created
   - Search by token number or patient name
   - Status badges: Waiting (yellow), In Progress (blue), Completed (green)

3. **Status Updates:**
   - Real-time status display
   - Estimated wait time

**Data Flow:**
```javascript
const [tokens, setTokens] = useState([]);

useEffect(() => {
  // When component mounts, fetch tokens
  getTokens().then(data => setTokens(data.tokens));
}, []);

const handleGenerate = async (data) => {
  // Generate new token
  const newToken = await generateToken(data);
  // Refresh list
  await getTokens().then(data => setTokens(data.tokens));
};
```

### **AppointmentsPage - `/appointments`**

**Allowed:** Only logged-in users (ProtectedRoute)

**Multi-Step Form:**

```
Step 1: Select Department & Doctor
  ├─ Dropdown with 6 departments
  ├─ Dynamically show 5-10 doctors per department
  └─ Next button

Step 2: Select Date & Time
  ├─ Date picker
  ├─ Time slots (9:00 AM - 4:00 PM)
  └─ Next button

Step 3: Patient Details
  ├─ Patient name field
  ├─ Phone number field
  ├─ Notes textarea (optional)
  └─ Book Appointment button

Confirmation
  ├─ Show success message
  └─ Display booked appointment details
```

**Logic:**
```javascript
const [step, setStep] = useState(1);
const [selectedDept, setSelectedDept] = useState("");
const [selectedDoctor, setSelectedDoctor] = useState("");
const [selectedDate, setSelectedDate] = useState("");
const [selectedTime, setSelectedTime] = useState("");
const [patientName, setPatientName] = useState("");
const [phone, setPhone] = useState("");

const handleBook = async () => {
  const appointmentData = {
    department: selectedDept,
    doctor: selectedDoctor,
    date: selectedDate,
    time: selectedTime,
    patientName,
    phone
  };
  
  const result = await bookAppointment(appointmentData);
  toast({ title: "Appointment booked!" });
};
```

### **DashboardPage - `/dashboard`**

**Allowed:** Only logged-in users (ProtectedRoute)

**Sections:**

1. **Patient Info Card**
   - Name, ID, Age, Blood Type, Phone
   - Edit button (future feature)

2. **Active Tokens Tab**
   - Current tokens with position in queue
   - Estimated time to call
   - Real-time status

3. **Appointments Tab**
   - All user's appointments
   - Filter upcoming vs completed
   - Details: Doctor, Department, Date, Time, Status

4. **Medical Records Tab**
   - Lab reports
   - Diagnostics
   - Download option

5. **Prescriptions Tab**
   - Current medications
   - Dosage and frequency
   - Duration

**Data Fetching:**
```javascript
const [dashboard, setDashboard] = useState(null);

useEffect(() => {
  // Fetch dashboard data on mount
  getDashboard().then(data => setDashboard(data));
}, []);
```

### **AdminDashboard - `/admin`**

**Allowed:** Only logged-in admin users (ProtectedRoute + AdminRoute)

**Features:**

1. **Statistics Cards**
   - Total Users, Total Appointments, Total Tokens
   - Active Appointments, Completed Appointments
   - Tokens In Queue

2. **Users Tab**
   - Table of all registered users
   - Columns: Name, Email, Role, Appointment Count, Token Count, Join Date
   - Search by name/email
   - Click "View Details" → Modal shows:
     - User information
     - All user's appointments
     - All user's tokens

3. **Appointments Tab**
   - Table of all appointments
   - Columns: Patient, Doctor, Department, Date, Time, Phone, Status
   - Search by patient name
   - Filter by status (upcoming, in-progress, completed, cancelled)

4. **Queue Tokens Tab**
   - Table of all tokens
   - Columns: Token #, Patient, Department, Position, Status, Est. Time
   - Search by token number
   - Filter by status

5. **Settings Tab**
   - System information
   - Last refresh time
   - Database status

**API Calls:**
```javascript
const [users, setUsers] = useState([]);
const [appointments, setAppointments] = useState([]);
const [tokens, setTokens] = useState([]);

const fetchData = async () => {
  // Parallel fetch for performance
  const [ud, ad, td] = await Promise.all([
    authRequest('/api/admin/users'),
    authRequest('/api/admin/appointments'),
    authRequest('/api/admin/tokens')
  ]);
  
  setUsers(ud.users);
  setAppointments(ad.appointments);
  setTokens(td.tokens);
};

useEffect(() => {
  fetchData();
  // Refresh every 30 seconds
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, []);
```

### **DepartmentsPage - `/departments`**

**Allowed:** All users (no protection)

**Display:**
- 6 department cards
- Each shows: Icon, Name, Description, Doctor Count
- "Book Now" button links to `/appointments`

---

## Component Hierarchy

```
<App>
  <QueryClientProvider>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            
            <!-- Public Routes -->
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            
            <!-- Protected Routes - Logged in only -->
            <Route path="/tokens" element={<ProtectedRoute><TokensPage /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            
            <!-- Admin Routes - Logged in + Admin only -->
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <!-- 404 -->
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
</App>

        ↓ (wraps all routes)

<Layout>
  <Header>
    {/* Navigation - changes based on isAdmin */}
  </Header>
  
  <main>
    {/* Route content here */}
  </main>
  
  <Footer>
    {/* Footer content */}
  </Footer>
</Layout>
```

---

## Key Patterns Used

### **1. Context API Pattern**
- Single source of truth (AuthContext)
- useAuth() hook for accessing state
- Providers wrap entire app

### **2. Protected Route Pattern**
- ProtectedRoute guards authenticated routes
- AdminRoute guards admin-only routes
- Stacking for double protection

### **3. Form Handling Pattern**
- useState for form fields
- onChange handlers update state
- onSubmit prevents default and validates

### **4. API Request Pattern**
- apiRequest() for public endpoints
- authRequest() for authenticated endpoints
- Bearer token in Authorization header

### **5. Conditional Rendering Pattern**
- `isAuthenticated` → show/hide auth buttons
- `isAdmin` → show admin nav items
- `loading` → show loading state

### **6. Multi-Step Form Pattern**
- State tracks current step
- Next/Previous buttons update step
- Final submit saves data

---

## Security Considerations

### **✅ What's Protected**
- JWT token stored in localStorage
- Token sent with Authorization header on authenticated requests
- Protected routes check authentication before showing content
- Admin routes check admin role before showing admin features

### **⚠️ Potential Improvements**
- Store token in httpOnly cookie (more secure than localStorage)
- Token refresh mechanism (currently no expiration check)
- CSRF protection for POST requests
- Rate limiting on API endpoints
- Input validation on frontend (already basic)

---

## Summary

The frontend is a React SPA with these key characteristics:

1. **Authentication:** AuthContext manages login/logout globally
2. **Routing:** React Router with ProtectedRoute guards
3. **State:** localStorage persists auth, React state for page state
4. **API:** authRequest() adds JWT token to all requests
5. **UI:** ShadcN components + Tailwind CSS + Framer Motion
6. **Pages:** 9 pages with different protection levels
7. **Admin:** Special admin dashboard with user/appointment/token management

**The Flow:** User logs in → token saved → protected routes unlock → API requests include token → backend validates token → user can access resources.


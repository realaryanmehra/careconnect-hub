// ============================================
// SIMPLIFIED AuthContext.jsx - Authentication State Management
// ============================================
// This file manages the user's authentication state (logged in/out)
// It provides functions to login, register, and logout

// ============================================
// Import React hooks and utilities
// ============================================
import { createContext, useContext, useEffect, useState } from "react";

// Import the API helper for making requests
import { apiRequest } from "@/lib/api";

// ============================================
// Create the Auth Context
// ============================================
// This creates a "container" to store authentication data
// that can be accessed from any component
const AuthContext = createContext(null);

// ============================================
// Storage Keys
// ============================================
// Keys used to store auth data in browser's localStorage
// localStorage persists even after browser is closed
const STORAGE_TOKEN_KEY = "careconnect_auth_token";
const STORAGE_USER_KEY = "careconnect_auth_user";

// ============================================
// AuthProvider Component
// ============================================
// This component wraps your entire app and provides auth functionality
// Any component can now access auth state using useAuth() hook
export const AuthProvider = ({ children }) => {
  // ============================================
  // State Variables
  // ============================================
  // token: The authentication token (string or null)
  const [token, setToken] = useState(null);
  
  // user: The logged-in user's information (object or null)
  const [user, setUser] = useState(null);
  
  // loading: Whether we're still loading saved auth data
  const [loading, setLoading] = useState(true);

  // ============================================
  // useEffect - Load saved auth data on app start
  // ============================================
  // This runs once when the component mounts
  useEffect(() => {
    // 1. Get saved token from localStorage
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    
    // 2. Get saved user data from localStorage
    const savedUser = localStorage.getItem(STORAGE_USER_KEY);

    // 3. If token exists, restore it to state
    if (savedToken) {
      setToken(savedToken);
    }

    // 4. If user data exists, restore it to state
    if (savedUser) {
      try {
        // Parse JSON string back to JavaScript object
        setUser(JSON.parse(savedUser));
      } catch {
        // If parsing fails, remove corrupted data
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }

    // 5. Finished loading
    setLoading(false);
  }, []); // Empty dependency array = run only once

  // ============================================
  // persistAuth - Save auth data to state AND localStorage
  // ============================================
  // Parameters:
  //   - nextToken: The new authentication token
  //   - nextUser: The new user object
  const persistAuth = (nextToken, nextUser) => {
    // Update state (makes it available to components immediately)
    setToken(nextToken);
    setUser(nextUser);

    // Save to localStorage (persists across browser sessions)
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
  };

  // ============================================
  // login - Authenticate user with email and password
  // ============================================
  // Parameters:
  //   - email: User's email address
  //   - password: User's password
  // Returns: The user object
  const login = async ({ email, password }) => {
    // Make API request to login endpoint
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Save the token and user data
    persistAuth(data.token, data.user);
    
    // Return the user data
    return data.user;
  };

  // ============================================
  // register - Create a new user account
  // ============================================
  // Parameters:
  //   - name: User's full name
  //   - email: User's email address
  //   - password: User's password
  // Returns: The newly created user object
  const register = async ({ name, email, password }) => {
    // Make API request to register endpoint
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    // Save the token and user data
    persistAuth(data.token, data.user);
    
    // Return the user data
    return data.user;
  };

  // ============================================
  // logout - Sign out the current user
  // ============================================
  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);

    // Remove from localStorage
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  // ============================================
  // Create the value object to provide to components
  // ============================================
  const value = {
    token,           // The auth token (null if not logged in)
    user,            // User object (null if not logged in)
    loading,         // Whether auth is still loading
    isAuthenticated: Boolean(token),  // True if user is logged in
    login,           // Function to login
    register,        // Function to register
    logout,          // Function to logout
  };

  // ============================================
  // Provide the value to all child components
  // ============================================
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// useAuth - Hook to access auth state and functions
// ============================================
// Use this in any component to get access to auth functionality
// Example: const { user, logout } = useAuth();
export const useAuth = () => {
  // Get the context value
  const context = useContext(AuthContext);
  
  // If used outside AuthProvider, show error
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  
  // Return the context value
  return context;
};

/* 
   HOW TO USE THIS FILE:
   
   // In any component, import and use:
   import { useAuth } from "@/contexts/AuthContext";
   
   function MyComponent() {
     // Get auth data and functions
     const { 
       user,           // User object if logged in, null if not
       token,         // Auth token if logged in
       isAuthenticated, // Boolean - true if logged in
       loading,       // True while checking saved auth
       login,         // Function: login({ email, password })
       register,      // Function: register({ name, email, password })
       logout         // Function: logout()
     } = useAuth();
     
     if (loading) return <div>Loading...</div>;
     
     if (!isAuthenticated) return <div>Please login</div>;
     
     return <div>Hello, {user.name}!</div>;
   }

   WHAT HAPPENS WHEN USER LOGINS:
   1. login() called with email/password
   2. API request made to server
   3. Server returns token and user data
   4. persistAuth() saves to state AND localStorage
   5. isAuthenticated becomes true
   6. All components re-render with new user data

   WHAT HAPPENS ON PAGE REFRESH:
   1. App loads
   2. useEffect runs
   3. Reads token and user from localStorage
   4. Restores state (user stays logged in!)
*/


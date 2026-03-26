// ============================================
// SIMPLIFIED ProtectedRoute.jsx - Route Guard Component
// ============================================
// This component protects routes that require authentication
// If user is not logged in, they are redirected to login page

// ============================================
// Import React Router components
// ============================================
import { Navigate, useLocation } from "react-router-dom";

// Import auth context to check login status
import { useAuth } from "@/contexts/AuthContext";

// ============================================
// ProtectedRoute Component
// ============================================
// This component wraps other components that need protection
// It checks if user is logged in before showing the content

const ProtectedRoute = ({ children }) => {
  // ============================================
  // Get authentication status from useAuth hook
  // ============================================
  // isAuthenticated: true if user is logged in, false if not
  // loading: true if still checking saved login status
  const { isAuthenticated, loading } = useAuth();

  // ============================================
  // Get current location (URL)
  // ============================================
  // This helps us redirect user back to the page they tried
  // to access after they login successfully
  const location = useLocation();

  // ============================================
  // Step 1: Show nothing while loading
  // ============================================
  // While checking if user is logged in, don't show anything
  // This prevents "flashing" of protected content
  if (loading) {
    return null;
  }

  // ============================================
  // Step 2: Redirect to login if not authenticated
  // ============================================
  // If user is not logged in:
  // - Redirect them to /login page
  // - Use 'replace' to replace current history entry
  // - Pass 'location' in state so we know where they wanted to go
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ============================================
  // Step 3: Show protected content
  // ============================================
  // User is logged in, so show the protected component
  return children;
};

// Export so we can use it in App.jsx
export default ProtectedRoute;

/* 
   HOW IT WORKS (Step by Step):
   
   Scenario: User tries to visit /dashboard without logging in
   
   1. ProtectedRoute wraps DashboardPage in App.jsx
   2. Component mounts and calls useAuth()
   3. useAuth checks if token exists in localStorage
   4. If loading=true, return null (show nothing)
   5. Once loading=false, check isAuthenticated
   6. isAuthenticated is false (no token)
   7. Navigate to "/login" with state: { from: /dashboard }
   8. User sees login page
   
   Scenario: User logs in successfully
   
   1. LoginPage calls login() from useAuth
   2. login() saves token to localStorage
   3. Auth state updates, isAuthenticated = true
   4. User is redirected to /dashboard (from location state)
   5. ProtectedRoute now sees isAuthenticated = true
   6. DashboardPage is rendered!

   USAGE IN App.jsx:
   
   <Route 
     path="/dashboard" 
     element={
       <ProtectedRoute>
         <DashboardPage />
       </ProtectedRoute>
     } 
   />

   WHY USE 'state={{ from: location }}'?
   
   This saves the original URL the user tried to visit.
   After login, we can redirect them back to that page!
   
   In LoginPage, you'll see:
   const location = useLocation();
   const from = location.state?.from?.pathname || "/dashboard";
   navigate(from, { replace: true });
*/


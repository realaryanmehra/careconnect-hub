// ============================================
// SIMPLIFIED LoginPage.jsx - User Login Page
// ============================================
// This page allows users to log into their accounts

// ============================================
// Import React and hooks
// ============================================
import { useState } from "react";

// ============================================
// Import React Router components
// ============================================
// Link: Creates clickable links to other pages
// useLocation: Gets the current URL (to know where to redirect back)
// useNavigate: Programmatic navigation (redirect after login)
import { Link, useLocation, useNavigate } from "react-router-dom";

// ============================================
// Import UI components (from your design system)
// ============================================
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ============================================
// Import toast hook for notifications
// ============================================
import { useToast } from "@/hooks/use-toast";

// ============================================
// Import Layout component (page wrapper)
// ============================================
import Layout from "@/components/Layout";

// ============================================
// Import auth functions
// ============================================
import { useAuth } from "@/contexts/AuthContext";

// ============================================
// LoginPage Component
// ============================================
const LoginPage = () => {
  // ============================================
  // State variables for form fields
  // ============================================
  // useState creates reactive variables that trigger re-render when changed
  
  const [email, setEmail] = useState("");      // User's email
  const [password, setPassword] = useState(""); // User's password
  const [submitting, setSubmitting] = useState(false); // Loading state

  // ============================================
  // Get toast function for showing notifications
  // ============================================
  const { toast } = useToast();

  // ============================================
  // Get login function and current user from AuthContext
  // ============================================
  const { login, user } = useAuth();

  // ============================================
  // Get navigate function for redirecting
  // ============================================
  const navigate = useNavigate();

  // ============================================
  // Get current location (where user came from)
  // ============================================
  const location = useLocation();

  // Determine where to redirect after login
  // Default to /dashboard, or the page they tried to visit
  const from = location.state?.from?.pathname || "/dashboard";

  // ============================================
  // onSubmit - Handle form submission
  // ============================================
  // This runs when user clicks "Sign In" button
  const onSubmit = async (e) => {
    // Prevent default form submission (which would reload page)
    e.preventDefault();
    
    // Set loading state to show spinner
    setSubmitting(true);
    
    try {
      // Call login function from AuthContext
      // This makes API call and saves auth token
      // Use the returned user object instead of context state to avoid timing issues
      const loggedInUser = await login({ email, password });
      
      // Show success notification
      toast({ title: "Logged in successfully" });
      
      // Admin-specific redirect - check returned user, not context state
      if (loggedInUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
      
    } catch (error) {
      // Show error notification
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive", // Red/error style
      });
    } finally {
      // Always run this - reset loading state
      setSubmitting(false);
    }
  };

  // ============================================
  // Render the page
  // ============================================
  return (
    // Wrap with Layout for consistent header/footer
    <Layout>
      <section className="container py-16">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8 shadow-medium">
          
          {/* Page Title */}
          <h1 className="text-3xl font-extrabold text-foreground">Login</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Access your patient dashboard and appointments.
          </p>

          {/* Login Form */}
          <form className="space-y-4 mt-8" onSubmit={onSubmit}>
            
            {/* Email Field */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Email
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                // Update email state when user types
                onChange={(e) => setEmail(e.target.value)}
                required // HTML5 validation
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                // Update password state when user types
                onChange={(e) => setPassword(e.target.value)}
                required // HTML5 validation
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Link to Register page for new users */}
          <p className="text-sm text-muted-foreground mt-5">
            New user?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

// Export so it can be used in App.jsx
export default LoginPage;

/* 
   HOW THE LOGIN FLOW WORKS:
   
   1. User enters email and password
   2. User clicks "Sign In" button
   3. onSubmit function runs:
      a. Prevents page reload
      b. Sets submitting=true (shows loading)
      c. Calls login() from AuthContext
      d. login() makes API call to server
      e. Server validates credentials
      f. Server returns token and user data
      g. Token saved to localStorage
      h. toast shows success message
      i. User redirected to dashboard
   4. If error:
      a. catch block runs
      b. toast shows error message
   
   WHAT HAPPENS WHEN login() IS CALLED:
   
   1. apiRequest("/api/auth/login", {...}) is called
   2. Fetch sends POST request to server
   3. Server validates email/password
   4. Server returns { token: "...", user: {...} }
   5. AuthContext saves token to localStorage
   6. Auth state updates (isAuthenticated = true)
   7. ProtectedRoute sees user is now logged in
   8. User can access protected routes!

   STATE EXPLANATION:
   
   useState("") - Creates a variable that:
   - Has an initial value ("")
   - Can be updated with setEmail("new value")
   - When updated, component re-renders with new value
   
   The form inputs are "controlled components" - 
   their value comes from state, changes update state.
*/


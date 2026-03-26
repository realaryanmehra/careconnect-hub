// ============================================
// SIMPLIFIED RegisterPage.jsx - User Registration Page
// ============================================
// This page allows new users to create an account

// ============================================
// Import React and hooks
// ============================================
import { useState } from "react";

// ============================================
// Import React Router components
// ============================================
// Link: Creates clickable links to other pages
// useNavigate: Programmatic navigation (redirect after registration)
import { Link, useNavigate } from "react-router-dom";

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
// RegisterPage Component
// ============================================
const RegisterPage = () => {
  // ============================================
  // State variables for form fields
  // ============================================
  // Each useState creates a reactive variable
  
  const [name, setName] = useState("");         // User's full name
  const [email, setEmail] = useState("");        // User's email
  const [password, setPassword] = useState("");  // User's password
  const [submitting, setSubmitting] = useState(false); // Loading state

  // ============================================
  // Get toast function for showing notifications
  // ============================================
  const { toast } = useToast();

  // ============================================
  // Get register function from AuthContext
  // ============================================
  const { register } = useAuth();

  // ============================================
  // Get navigate function for redirecting
  // ============================================
  const navigate = useNavigate();

  // ============================================
  // onSubmit - Handle form submission
  // ============================================
  // This runs when user clicks "Sign Up" button
  const onSubmit = async (e) => {
    // Prevent default form submission (which would reload page)
    e.preventDefault();
    
    // Set loading state to show spinner
    setSubmitting(true);
    
    try {
      // Call register function from AuthContext
      // This makes API call to create new account
      await register({ name, email, password });
      
      // Show success notification
      toast({ title: "Registration successful" });
      
      // Redirect to dashboard after successful registration
      navigate("/dashboard", { replace: true });
      
    } catch (error) {
      // Show error notification
      toast({
        title: "Registration failed",
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
          <h1 className="text-3xl font-extrabold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Register to book appointments and manage your care.
          </p>

          {/* Registration Form */}
          <form className="space-y-4 mt-8" onSubmit={onSubmit}>
            
            {/* Full Name Field */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                // Update name state when user types
                onChange={(e) => setName(e.target.value)}
                required // HTML5 validation
              />
            </div>

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
                placeholder="Minimum 6 characters"
                value={password}
                // Update password state when user types
                onChange={(e) => setPassword(e.target.value)}
                minLength={6} // Minimum 6 characters
                required // HTML5 validation
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Link to Login page for existing users */}
          <p className="text-sm text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

// Export so it can be used in App.jsx
export default RegisterPage;

/* 
   HOW THE REGISTRATION FLOW WORKS:
   
   1. User enters name, email, and password
   2. User clicks "Sign Up" button
   3. onSubmit function runs:
      a. Prevents page reload
      b. Sets submitting=true (shows loading)
      c. Calls register() from AuthContext
      d. register() makes API call to server
      e. Server creates new user account
      f. Server returns token and user data
      g. Token saved to localStorage
      h. toast shows success message
      i. User redirected to dashboard
   4. If error:
      a. catch block runs
      b. toast shows error message
   
   DIFFERENCE BETWEEN LOGIN AND REGISTER:
   
   - Login: User already has an account, verify credentials
   - Register: Create new user account
   
   Both use similar flow because after either action,
   the user ends up logged in with a valid token!

   WHAT HAPPENS WHEN register() IS CALLED:
   
   1. apiRequest("/api/auth/register", {...}) is called
   2. Fetch sends POST request to server with name, email, password
   3. Server creates new user in database
   4. Server returns { token: "...", user: {...} }
   5. AuthContext saves token to localStorage
   6. Auth state updates (isAuthenticated = true)
   7. User is redirected to dashboard
*/


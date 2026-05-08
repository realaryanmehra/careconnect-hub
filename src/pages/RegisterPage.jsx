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
import { useGoogleLogin } from "@react-oauth/google";

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
  const [age, setAge] = useState("");           // User's age
  const [bloodGroup, setBloodGroup] = useState(""); // User's blood group
  const [phone, setPhone] = useState("");        // User's phone
  const [submitting, setSubmitting] = useState(false); // Loading state

  // ============================================
  // Get toast function for showing notifications
  // ============================================
  const { toast } = useToast();

  // ============================================
  // Get register function from AuthContext
  // ============================================
  const { register, loginWithGoogle } = useAuth();

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
      await register({ name, email, password, age, bloodGroup, phone });
      
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

  // Google Login functionality
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        await loginWithGoogle(tokenResponse.credential || tokenResponse.access_token || tokenResponse.id_token);
        toast({ title: "Registered/Logged in successfully with Google" });
        navigate("/dashboard", { replace: true });
      } catch (error) {
        toast({
          title: "Google Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => {
      toast({
        title: "Google Registration failed",
        description: "An error occurred during Google authentication.",
        variant: "destructive",
      });
    }
  });

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

            {/* Age and Blood Group (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Age
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Blood Group
                </label>
                <Input
                  type="text"
                  placeholder="e.g. A+"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign Up"}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200" 
              disabled={submitting} 
              onClick={() => googleLogin()}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.71 16.7 5.84 14.12H2.17V16.97C3.99 20.58 7.73 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.12C5.62 13.46 5.49 12.75 5.49 12C5.49 11.25 5.62 10.54 5.84 9.88V7.03H2.17C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.17 16.97L5.84 14.12Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.37 3.85C17.46 2.07 14.97 1 12 1C7.73 1 3.99 3.42 2.17 7.03L5.84 9.88C6.71 7.3 9.13 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              Continue with Google
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


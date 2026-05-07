import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/api";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
    }

    if (password.length < 6) {
      return toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
    }

    setSubmitting(true);
    
    try {
      await apiRequest(`/api/auth/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      
      setSuccess(true);
      toast({ title: "Password reset successful", description: "You can now log in with your new password." });
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message || "Invalid or expired reset token",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="container py-16">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8 shadow-medium">
          <h1 className="text-3xl font-extrabold text-foreground">Reset Password</h1>
          
          {!success ? (
            <>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your new password below.
              </p>
              <form className="space-y-4 mt-8" onSubmit={onSubmit}>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="mt-8 text-center p-4 bg-green-50 text-green-800 rounded-lg">
              <p className="font-medium">Password Reset Successfully</p>
              <p className="text-sm mt-1">Redirecting to login page...</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ResetPasswordPage;

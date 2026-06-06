import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      
      setSuccess(true);
      toast({ title: "Reset link sent", description: "If an account exists with this email, you will receive a password reset link." });
    } catch (error) {
      toast({
        title: "Request failed",
        description: error.message || "An error occurred",
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
          <h1 className="text-3xl font-extrabold text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {!success ? (
            <form className="space-y-4 mt-8" onSubmit={onSubmit}>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending link..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="mt-8 text-center p-4 bg-green-50 text-green-800 rounded-lg">
              <p className="font-medium">Check your email</p>
              <p className="text-sm mt-1">We've sent a password reset link to {email}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary font-medium hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPasswordPage;

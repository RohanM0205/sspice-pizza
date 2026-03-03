import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setEmailNotConfirmed(false);

      await signIn(email, password);

      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      if (err.message?.includes("Email not confirmed")) {
        setEmailNotConfirmed(true);
      } else {
        toast.error(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation email sent again!");
    }
  };

  return (
    <main>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md">
          <h1 className="font-display text-2xl font-bold text-center mb-6">
            Sign In
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {emailNotConfirmed && (
            <div className="mt-4 text-center">
              <p className="text-sm text-yellow-500">
                Please confirm your email before signing in.
              </p>
              <button
                onClick={handleResendConfirmation}
                className="text-primary text-sm mt-2 underline"
              >
                Resend confirmation email
              </button>
            </div>
          )}

          <p className="text-center mt-4 text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default LoginPage;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await signUp(form.email, form.password, form.name, form.phone);

      setEmailSent(true);
      toast.success("Account created! Please confirm your email.");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: form.email,
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
            Create Account
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              type="tel"
              placeholder="Phone"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {emailSent && (
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default RegisterPage;
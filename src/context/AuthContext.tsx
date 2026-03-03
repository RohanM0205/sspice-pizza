import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  role: "customer" | "admin" | "superadmin" | "delivery" | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] =
    useState<"customer" | "admin" | "superadmin" | "delivery" | null>(null);
  const [loading, setLoading] = useState(true);

  const detectRole = async (userId: string) => {
    const { data } = await supabase
      .from("admin_users")
      .select("role")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (data?.role) {
      setRole(data.role);
    } else {
      setRole("customer");
    }
  };

  const ensureCustomerExists = async (authUser: User) => {
    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (!data) {
      await supabase.from("customers").insert([
        {
          auth_user_id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || "",
        },
      ]);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from("customers").insert([
        {
          auth_user_id: data.user.id,
          email,
          name,
          phone,
        },
      ]);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser(data.user); // set immediately
      detectRole(data.user.id);
      ensureCustomerExists(data.user);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  
    setUser(null);
    setRole(null);
  
    window.location.href = "/"; // force refresh state cleanly
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        setUser(session.user); // set immediately
        detectRole(session.user.id);
        ensureCustomerExists(session.user);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    };

    init();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          detectRole(session.user.id);
          ensureCustomerExists(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Role = "customer" | "admin" | "superadmin" | "delivery";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Checking permissions...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
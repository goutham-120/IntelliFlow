import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function RoleGuard({ allowedRoles = [], children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

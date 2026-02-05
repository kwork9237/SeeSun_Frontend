// RoleGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleGuard({ allow, fallback = "/" }) {
  const location = useLocation();
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!role) return <Navigate to={fallback} replace />;

  const ok = allow.includes(role);
  if (!ok) return <Navigate to={fallback} replace />;

  return <Outlet />;
}

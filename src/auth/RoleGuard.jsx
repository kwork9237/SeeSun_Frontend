import { Navigate, Outlet, useLocation } from "react-router-dom";

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * allow: ["ROLE_ADMIN","ROLE_MENTOR","ROLE_MENTEE"] 형태로 넣는 걸 추천
 */
export default function RoleGuard({ allow, children, fallback = "/" }) {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role; // ✅ TokenProvider에서 넣은 claim key와 동일해야 함

  if (!role) {
    // role claim 없으면 안전하게 차단
    return <Navigate to={fallback} replace />;
  }

  const ok = allow.includes(role);
  if (!ok) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet/>
  // return children;
}

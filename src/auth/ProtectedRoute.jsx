// /src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // ✅ 로그인 후 원래 가려던 페이지로 돌아오게 state에 저장
    return <Navigate to="/Login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;

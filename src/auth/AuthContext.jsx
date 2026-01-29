// /src/auth/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ 토큰이 있으면 로그인 상태로 시작
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));

  const isLoggedIn = !!accessToken;

  const login = (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
  };

  // ✅ 다른 탭에서 로그인/로그아웃 반영
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "accessToken") {
        setAccessToken(localStorage.getItem("accessToken"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ accessToken, isLoggedIn, login, logout }),
    [accessToken, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

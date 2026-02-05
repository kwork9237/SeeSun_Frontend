import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

export default function MyPageGate() {
  const [mbType, setMbType] = useState(undefined); // ✅ null 말고 undefined로 시작

  useEffect(() => {
    let alive = true;

    apiClient
      .get("/mypage/member-type")
      .then((res) => {
        if (alive) setMbType(res.data);
      })
      .catch(() => {
        if (alive) setMbType(-1);
      });

    return () => {
      alive = false;
    };
  }, []);

  // ✅ 로딩 표시
  if (mbType === undefined) return <div className="pt-20 text-center">Loading...</div>;

  if (mbType === 0) return <Navigate to="admin" replace />;
  if (mbType === 1) return <Navigate to="mentee" replace />;
  if (mbType === 2) return <Navigate to="mento" replace />;

  return <Navigate to="/" replace />;
}

import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const FailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 토스가 보내준 에러 메시지 받기
  const errorMessage = searchParams.get("message") || "결제가 취소되었습니다.";
  const errorCode = searchParams.get("code");

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "red" }}>결제 실패</h1>
      
      <div style={{ margin: "20px 0", fontSize: "18px" }}>
        <p><strong>이유:</strong> {errorMessage}</p>
        <p style={{ color: "#888", fontSize: "14px" }}>코드: {errorCode}</p>
      </div>

      <button 
        onClick={() => navigate("/lecture")} // 강의 목록이나 이전 페이지로 이동
        style={{
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        돌아가기
      </button>
    </div>
  );
};

export default FailPage;
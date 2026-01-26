import React, { useEffect , useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isRun = useRef(false);

  useEffect(() => {
    // 1. 만약 이미 실행된 적이 있다면? -> 여기서 멈춰! (함수 종료)
    if (isRun.current) {
        return;
    }
    // 2. 실행된 적 없다면? -> 깃발 꽂고 진행시켜!
    isRun.current = true;

    // URL에 있는 파라미터 꺼내기
    const requestData = {
      paymentKey: searchParams.get("paymentKey"),
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
    };

    // 백엔드로 최종 승인 요청
    axios.post(
      "/api/orders/confirm", // 1번: 주소
      requestData,           // 2번: 보낼 데이터
      {                      // 3번: 설정 (🔥여기에 넣어야 합니다!)
        headers: {
          Authorization: null // "토큰 없이 가!" (헤더 비우기)
        }
      }
    )
    .then(() => {
      alert("결제가 정상적으로 완료되었습니다!");
      navigate("/"); 
    })
    .catch((err) => {
      // catch는 이미 에러난 뒤라서 여기 넣으면 늦습니다!
      console.error("승인 실패:", err);
      alert("결제 승인 중 오류가 발생했습니다.");
      navigate("/fail");
    });
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>결제 처리 중입니다...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}
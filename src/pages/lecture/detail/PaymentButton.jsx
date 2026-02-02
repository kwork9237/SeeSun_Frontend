import React, { useState } from "react"; // useState 추가
import { loadTossPayments } from "@tosspayments/payment-sdk";
import axios from "axios";

const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY; 

// 1. props에 disabled를 추가해서 EnrollCard에서 보낸 신호를 받습니다.
export default function PaymentButton({ lectureId, className, buttonText, disabled }) {
  // 중복 클릭 방지를 위한 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    // ★ [방어막] 이미 로딩 중이거나, 정원이 꽉 찼으면 실행 안 함
    if (isLoading || disabled) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    try {
      setIsLoading(true); // ★ 클릭하자마자 로딩 시작 (중복 클릭 원천 봉쇄)

      // 2. 백엔드 주문 요청
      const res = await axios.post("/api/orders/request", 
        { le_id: lectureId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { orderId, amount, orderName, customerName } = res.data;

      // 3. 토스 결제창 호출
      const tossPayments = await loadTossPayments(clientKey);
      
      await tossPayments.requestPayment("카드", {
        amount: amount,
        orderId: orderId,
        orderName: orderName,
        customerName: customerName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      
    } catch (err) {
      console.error("주문 생성 에러:", err);
      // 에러 발생 시 다시 버튼을 누를 수 있게 로딩 해제
      setIsLoading(false); 
      
      // 백엔드에서 던진 정원 초과 에러(GlobalException) 처리
      const errorMessage = err.response?.data?.message || "결제 요청 중 오류가 발생했습니다.";
      alert(errorMessage);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      className={className}
      // ★ HTML 버튼 자체를 비활성화해서 스타일과 클릭을 모두 막음
      disabled={disabled || isLoading}
    >
      {isLoading ? "처리 중..." : (buttonText || "결제하기")}
    </button>
  );
}
import React from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import axios from "axios";

const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY; 

// 1. 이제 props에서 memberId는 받지 않아도 됩니다. (백엔드가 토큰으로 식별함)
export default function PaymentButton({ lectureId, className, buttonText }) {

  const handlePayment = async () => {
    // ★ 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    try {
      // 2. 백엔드 주문 요청
      const res = await axios.post("/api/orders/request", 
        { 
          le_id: lectureId // mb_id는 뺍니다. (백엔드가 토큰에서 mbId를 직접 추출함)
        },
        {
          headers: {
            // ★ 이 헤더가 있어야 백엔드의 user 객체가 null이 되지 않습니다.
            Authorization: `Bearer ${token}` 
          }
        }
      );

      // 백엔드 OrdersService.java에서 반환한 4가지 정보 추출
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
      // 백엔드에서 401(Unauthorized)이 오면 토큰 만료 처리 등을 할 수 있습니다.
      alert("결제 요청 중 오류가 발생했습니다. 다시 로그인 후 시도해주세요.");
    }
  };

  return (
    <button onClick={handlePayment} className={className}>
      {buttonText || "결제하기"}
    </button>
  );
}
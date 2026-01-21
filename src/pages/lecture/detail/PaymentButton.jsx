import React from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import axios from "axios";

const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY; 

// 1. 여기서 className(디자인), buttonText(글자)까지 총 4개를 받습니다.
export default function PaymentButton({ memberId, lectureId, className, buttonText }) {

  const handlePayment = async () => {
    try {
      // 2. 백엔드로 보낼 때는 memberId, lectureId 만 보냅니다.
      const res = await axios.post("/api/orders/request", {
        mb_id: memberId,
        le_id: lectureId,
      });

      const { orderId, amount, orderName, customerName } = res.data;

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
      console.error(err);
      alert("결제 에러! 백엔드 로그 확인 필요");
    }
  };

  return (
    // 3. 받아온 디자인(className)을 여기에 적용!
    <button onClick={handlePayment} className={className}>
      {buttonText || "결제하기"}
    </button>
  );
}
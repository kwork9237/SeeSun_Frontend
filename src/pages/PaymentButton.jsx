import React from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk"; // 👈 위젯 대신 이거 씁니다!
import axios from "axios";

// 아까 test.html에서 성공했던 그 키를 넣으세요!
const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY; 

export default function PaymentButton({ memberId, lectureId, price }) {

  const handlePayment = async () => {
    try {
      // 1. 백엔드에 주문 요청 (이건 이미 잘 되고 있음)
      const res = await axios.post("/api/orders/request", {
        mbId: memberId,
        leId: lectureId
      });

      const { orderId, amount, orderName, customerName } = res.data;

      // 2. 토스 결제창 띄우기 (일반 결제 방식)
      const tossPayments = await loadTossPayments(clientKey);
      
      await tossPayments.requestPayment("카드", {
        amount: amount,
        orderId: orderId,
        orderName: orderName,
        customerName: customerName,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
      
    } catch (err) {
      console.error(err);
      alert("결제 요청 중 에러가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>{price}원 결제하기</h1>
      {/* 위젯 DIV 같은 거 필요 없음! 버튼 하나면 끝! */}
      <button 
        onClick={handlePayment}
        style={{ 
          padding: "15px 30px", 
          background: "#3182f6", 
          color: "#fff", 
          border: "none", 
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        결제하기
      </button>
    </div>
  );
}
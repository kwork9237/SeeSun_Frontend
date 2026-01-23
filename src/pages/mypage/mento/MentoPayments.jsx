import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MentoPayment = () => {
  const [history, setHistory] = useState([]);
  
  // 테스트용 ID (나중에 토큰이나 props로 대체하세요)
  const memberId = 3; 

  useEffect(() => {
    // 백엔드 API 호출 (주소는 그대로 유지)
    axios.get(`/api/orders/history/${memberId}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error("결제 내역 로딩 실패", err));
  }, []);

  return (
      <div className="w-full">
      
        {/* 1. 타이틀을 박스 밖으로 뺐습니다 (Main Title) */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900">결제 내역 </h2>

        {/* 2. 리스트 내용만 감싸는 하얀 박스 시작 */}
        <div className="bg-white border border-gray-200 rounded-[20px] p-8 shadow-sm min-h-[500px]">
      

      {history.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-400">
          아직 결제한 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            
            // 회색 카드 박스 디자인
            <div 
              key={index} 
              className="flex flex-col md:flex-row justify-between items-center bg-[#F3F4F6] px-8 py-6 rounded-[20px]"
            >
              
              {/* 1. 날짜 및 시간 */}
              <div className="text-center md:text-left mb-4 md:mb-0 w-full md:w-1/4">
                <div className="text-xl font-bold text-gray-900 tracking-tight">
                  {item.date_part}
                </div>
                <div className="text-lg text-gray-500 mt-1 font-medium">
                  {item.time_part}
                </div>
              </div>

              {/* 2. 강의 제목 및 결제 수단 */}
              <div className="text-center mb-4 md:mb-0 w-full md:w-2/4">
                <div className="text-xl font-bold text-gray-800 mb-1 truncate px-4">
                  {item.lecture_title}
                </div>
                <div className="text-gray-500 font-medium">
                  {item.method || '카드 결제'}
                </div>
              </div>

              {/* 3. 가격 및 상태 */}
              <div className="text-center md:text-right w-full md:w-1/4">
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {Number(item.cost).toLocaleString()} 원
                </div>
                <div className="text-gray-500 font-medium">
                  결제완료
                </div>
              </div>

            </div>
          ))}
        </div>
        )}
        </div>
    </div>
  );
};

export default MentoPayment;
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
// 경로가 맞는지 꼭 확인하세요! (보통 components 폴더가 src 밑에 있다면 ../../../가 맞습니다)
import PaymentButton from './PaymentButton';

const EnrollCard = ({ lecture, activeDays, activeTimes, weekDays, formatDate }) => {

  // ============================================================
  // [1] 나중에 로그인 기능 완성되면 주석 풀고 사용할 코드 (Real Mode)
  // ============================================================
  /*
  const [memberId, setMemberId] = useState(null);

  useEffect(() => {
    // 저장된 키 이름(userInfo)과 내부 변수명(mbId)은 실제 로그인 코드에 맞춰 수정 필요
    const userInfo = localStorage.getItem('userInfo'); 
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setMemberId(parsed.mbId); 
      } catch (e) {
        console.error("회원 정보 파싱 에러", e);
      }
    }
  }, []);
  */

  // ============================================================
  // [2] 현재 개발 단계에서 사용할 하드코딩 (Test Mode)
  // ============================================================
  // ★ 중요: DB에 실제로 존재하는 회원 ID (예: 1, 3, 8 등)를 적어주세요.
  const memberId = 2; 


  return (
    <div className="sticky top-28 bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-gray-200/60 overflow-hidden">
      <div className="p-8">
        <p className="text-center text-[10px] font-black text-gray-300 mb-4 tracking-widest uppercase">
           멘토가 지정한 강의 일정
        </p>

        {/* 날짜 표시 */}
        <div className="bg-gray-50 rounded-2xl py-3.5 px-4 mb-8 text-center border border-gray-100/50">
          <span className="text-[15px] font-black text-gray-800">
            {lecture.startDate ? formatDate(lecture.startDate) : '날짜 미정'} — {lecture.endDate ? formatDate(lecture.endDate) : '날짜 미정'}
          </span>
        </div>

        {/* 요일 선택 UI */}
        <div className="flex justify-between mb-8 gap-1.5">
          {weekDays.map((day) => (
            <div 
              key={day.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all
                ${activeDays.includes(day.value) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-gray-50 text-gray-300 border border-gray-100'}`}
            >
              {day.label}
            </div>
          ))}
        </div>

        {/* 시간대 목록 */}
        <div className="grid grid-cols-2 gap-2.5 mb-10">
          {activeTimes.map((time, idx) => (
            <div key={idx} className="py-3.5 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl text-center text-xs font-black shadow-sm">
              {time}
            </div>
          ))}
        </div>

        {/* 가격 표시 */}
        <div className="text-center mb-10">
          <span className="text-4xl font-black text-gray-900">
            ₩{(lecture.cost || 0).toLocaleString()}
          </span>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          
          {/* ★ 핵심 수정 사항 ★
              1. PaymentButton 사용
              2. memberId는 하드코딩된 값(1) 사용 -> 나중에 state로 교체
              3. lectureId는 props로 받은 진짜 데이터(lecture.leId) 사용
              4. price는 보안상 삭제함
              5. className으로 팀원 디자인 그대로 적용
          */}
          <PaymentButton 
             memberId={memberId}
             lectureId={lecture.leId}
             buttonText="Enroll Now"
             className="w-full bg-[#FF6B4E] text-white py-5 rounded-[20px] font-black text-xl hover:bg-[#FF5A36] transition-all shadow-xl shadow-orange-100"
          />

          <button className="w-full bg-white text-gray-500 py-4 rounded-[20px] font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <Heart size={16} /> Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollCard;
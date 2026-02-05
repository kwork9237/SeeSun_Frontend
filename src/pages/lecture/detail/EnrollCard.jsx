import React from 'react';
import { Heart } from 'lucide-react';
// 경로가 프로젝트 구조에 맞는지 확인하세요!
import PaymentButton from './PaymentButton';

const EnrollCard = ({ lecture, activeDays, activeTimes, weekDays, formatDate }) => {
  console.log("🎯 현재 강의 데이터:", lecture);
  console.log("📊 current:", lecture.currentStudents, " / max:", lecture.maxStudents);
  
  // 1. [집계 로직] 현재 수강 인원과 최대 정원을 비교하여 정원 초과 여부 확인
  // 백엔드 Mapper에서 계산되어 넘어온 데이터를 활용합니다.
  const currentStudents = lecture.currentStudents || 0;
  const maxStudents = lecture.maxStudents || 0;
  const isFull = currentStudents >= maxStudents && maxStudents > 0;

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

        {/* 가격 및 수강 현황 표시 */}
        <div className="text-center mb-10">
          <div className="text-4xl font-black text-gray-900">
            ₩{(lecture.cost || 0).toLocaleString()}
          </div>
          {/* 수강 인원 현황 시각화 */}
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold 
            ${isFull ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}></span>
            수강 현황: {currentStudents} / {maxStudents}명
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          
          {/* [핵심 방어 로직 적용]
              1. isFull 상수에 따라 buttonText 동적 변경
              2. isFull 상수에 따라 스타일(회색/주황색) 및 클릭 막기 적용
          */}
          <PaymentButton 
             lectureId={lecture.leId}
             buttonText={isFull ? "정원 초과 (Sold Out)" : "결제하기"}
             disabled={isFull}
             className={`w-full py-5 rounded-[20px] font-black text-xl transition-all shadow-xl 
               ${isFull 
                 ? 'bg-gray-300 text-white cursor-not-allowed shadow-none' 
                 : 'bg-[#FF6B4E] text-white hover:bg-[#FF5A36] shadow-orange-100'}`}
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
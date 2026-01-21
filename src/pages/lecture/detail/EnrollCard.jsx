import React from 'react';
import { Clock, FileText, Monitor, Heart } from 'lucide-react';

const EnrollCard = ({ lecture, activeDays, activeTimes, weekDays, formatDate }) => {
  
  const handleEnroll = () => {
    // 작업할 결제 및 API 연동 구역
    alert(`${lecture.title} 수강 신청 및 결제 페이지로 이동합니다.`);
  };

  return (
    <div className="sticky top-28 bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-gray-200/60 overflow-hidden">
      <div className="p-8">
        <p className="text-center text-[10px] font-black text-gray-300 mb-4 tracking-widest uppercase">
           멘토가 지정한 강의 일정
        </p>
        <div className="bg-gray-50 rounded-2xl py-3.5 px-4 mb-8 text-center border border-gray-100/50">
          <span className="text-[15px] font-black text-gray-800">
            {formatDate(lecture.startDate)} — {formatDate(lecture.endDate)}
          </span>
        </div>

        {/* 요일 선택 UI: activeDays 배열에 포함된 요일만 진한 색상 적용 */}
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

        <div className="grid grid-cols-2 gap-2.5 mb-10">
          {activeTimes.map((time, idx) => (
            <div key={idx} className="py-3.5 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl text-center text-xs font-black shadow-sm">
              {time}
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <span className="text-4xl font-black text-gray-900">₩{(lecture.cost || 0).toLocaleString()}</span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleEnroll}
            className="w-full bg-[#FF6B4E] text-white py-5 rounded-[20px] font-black text-xl hover:bg-[#FF5A36] transition-all shadow-xl shadow-orange-100"
          >
            Enroll Now
          </button>
          <button className="w-full bg-white text-gray-500 py-4 rounded-[20px] font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <Heart size={16} /> Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollCard;
import React from 'react';

const Overview = ({ lecture }) => {
  if (!lecture) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-12">
      {/* 1. 강의 상세 설명 (content 필드 사용) */}
      <section>
        <h2 className="text-2xl font-black text-gray-900 mb-6">강의 상세 설명</h2>
        <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap font-medium bg-gray-50 p-8 rounded-[24px] border border-gray-100">
          {lecture.content || "멘토가 작성한 상세 강의 설명이 여기에 표시됩니다."}
        </div>
      </section>

      {/* 2. 강의 요약 정보 */}
      <section className="grid grid-cols-2 gap-6">
        <div className="p-6 border border-gray-100 rounded-2xl">
          <p className="text-xs text-gray-400 font-black uppercase mb-1">언어</p>
          <p className="text-lg font-black text-gray-900">{lecture.categoryName}</p>
        </div>
        <div className="p-6 border border-gray-100 rounded-2xl">
          <p className="text-xs text-gray-400 font-black uppercase mb-1">총 강의시간</p>
          <p className="text-lg font-black text-gray-900">{lecture.totalHours} 시간</p>
        </div>
      </section>
    </div>
  );
};

export default Overview;
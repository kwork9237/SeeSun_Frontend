import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Video, User, Star, 
  Edit3, Share2, Plus, Clock, Calendar 
} from 'lucide-react';

const MentoHome = () => {
  const navigate = useNavigate();

  // =========================================================================
  // 1. [더미 데이터] 수업 일정 (나중엔 DB에서 가져옴)
  // =========================================================================
  const todaySchedules = [
    {
      id: 1,
      time: '14:00 - 15:00',
      title: '비즈니스 영어 회화 - 실전편',
      roomName: '화상 강의실 A',
      menteeName: '김철수',
      status: 'LIVE', // LIVE: 진행중, WAITING: 대기중
    },
    {
      id: 2,
      time: '16:00 - 17:00',
      title: '일본어 프리토킹 (초급)',
      roomName: '화상 강의실 B',
      menteeName: '박민수',
      status: 'WAITING',
    }
  ];

  // =========================================================================
  // 2. [더미 데이터] 개설한 강의 목록
  // =========================================================================
  const myClasses = [
    {
      id: 101,
      title: '비즈니스 영어 회화 - 초급반',
      rating: 4.8,
      studentCount: 12,
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300&h=200' 
    },
    {
      id: 102,
      title: '실전 리액트 프로그래밍',
      rating: 5.0,
      studentCount: 8,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=300&h=200'
    }
  ];

  // =========================================================================
  // 3. 날짜 계산 로직 (UI용)
  // =========================================================================
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const dates = [2, 3, 4, 5, 6, 7, 8]; // 2월 1주차 예시 날짜
  const currentDayIndex = 2; // '수요일'을 오늘로 가정 (인덱스 0~6)

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ---------------------------------------------------------------------- */}
      {/* 섹션 1: 수업 일정 관리 (주간 캘린더) */}
      {/* ---------------------------------------------------------------------- */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
            <Calendar className="text-orange-500" size={20}/>
            수업 일정 관리
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
            <button className="hover:bg-gray-100 p-1 rounded"><ChevronLeft size={18}/></button>
            <span>2026년 2월 1주차</span>
            <button className="hover:bg-gray-100 p-1 rounded"><ChevronRight size={18}/></button>
          </div>
        </div>

        {/* 요일/날짜 행 */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {days.map((day, idx) => {
            const isToday = idx === currentDayIndex;
            return (
              <div key={day} className={`text-center py-4 flex flex-col gap-1 ${isToday ? 'bg-orange-50/50' : ''}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-orange-600' : 'text-gray-400'}`}>{day}</span>
                <span className={`text-lg font-bold ${isToday ? 'text-orange-600 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mx-auto' : 'text-gray-700'}`}>
                  {dates[idx]}
                </span>
                {isToday && <div className="w-1 h-1 bg-orange-500 rounded-full mx-auto mt-1"></div>}
              </div>
            );
          })}
        </div>

        {/* 일정 리스트 영역 */}
        <div className="p-6 space-y-4">
          {/* 컬럼 헤더 */}
          <div className="grid grid-cols-12 text-xs font-bold text-gray-400 px-4 mb-2">
            <div className="col-span-2">시간</div>
            <div className="col-span-5">강의명</div>
            <div className="col-span-3">멘티</div>
            <div className="col-span-2 text-center">입장 / 상태</div>
          </div>

          {/* 리스트 아이템 */}
          {todaySchedules.map((schedule) => (
            <div key={schedule.id} className="grid grid-cols-12 items-center bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
              
              {/* 시간 */}
              <div className="col-span-2 font-bold text-gray-800 text-sm flex items-center gap-2">
                {schedule.status === 'LIVE' && <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>}
                {schedule.time}
              </div>

              {/* 강의명 */}
              <div className="col-span-5">
                <div className="font-bold text-gray-900 text-sm">{schedule.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{schedule.roomName}</div>
              </div>

              {/* 멘티 */}
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                   <User size={12}/>
                </div>
                <span className="text-sm font-medium text-gray-700">{schedule.menteeName}</span>
              </div>

              {/* 버튼 (상태에 따라 다름) */}
              <div className="col-span-2 flex justify-center">
                {schedule.status === 'LIVE' ? (
                  <button className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-200 transition flex items-center gap-2">
                    <Video size={14} /> 강의실 입장
                  </button>
                ) : (
                  <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed">
                    입장 대기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ---------------------------------------------------------------------- */}
      {/* 섹션 2: 개설한 강의 관리 */}
      {/* ---------------------------------------------------------------------- */}
      <section>
         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
           <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
           개설한 강의 관리
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 강의 카드들 */}
            {myClasses.map((lecture) => (
              <div key={lecture.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
                 {/* 이미지 & 뱃지 */}
                 <div className="h-32 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                    <img src={lecture.image} alt="강의 썸네일" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                 </div>
                 
                 {/* 정보 */}
                 <h4 className="font-bold text-gray-900 mb-1 truncate">{lecture.title}</h4>
                 <div className="flex items-center gap-3 text-xs text-gray-500 mb-5">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                       <Star size={12} fill="currentColor"/> {lecture.rating}
                    </div>
                    <div>수강생 {lecture.studentCount}명</div>
                 </div>

                 {/* 버튼 그룹 */}
                 <div className="flex gap-2">
                    <button 
                      onClick={() => alert('강의 수정 페이지로 이동')}
                      className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                    >
                       <Edit3 size={14}/> 강의 수정
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
                       <Share2 size={14}/> 공유
                    </button>
                 </div>
              </div>
            ))}

            {/* 새 강의 만들기 버튼 (카드 형태) */}
            <button 
              onClick={() => navigate('/lecture/create')} // 강의 생성 페이지로 이동
              className="h-full min-h-[250px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all gap-3"
            >
               <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white">
                 <Plus size={24}/>
               </div>
               <span className="font-bold text-sm">새 강의 만들기</span>
            </button>

         </div>
      </section>

    </div>
  );
};

export default MentoHome;
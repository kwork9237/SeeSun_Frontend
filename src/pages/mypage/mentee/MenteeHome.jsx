import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Video, Star, Search, Calendar, BookOpen 
} from 'lucide-react';
import apiClient from '../../../api/apiClient';

const MenteeHome = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // =================================================================
  // 1. 상태 관리 (State)
  // =================================================================
  
  // 서버에서 받아올 데이터 저장 (일정 목록, 수강 중인 강의 목록)
  const [schedules, setSchedules] = useState([]);   
  const [myLectures, setMyLectures] = useState([]); 
  
  // 캘린더 기준 날짜 (기본값: 오늘)
  // 이 날짜를 기준으로 "이번 주" 월~일요일을 계산함
  const [baseDate, setBaseDate] = useState(new Date()); 
  
  // 오늘 날짜를 "YYYY-MM-DD" 문자열로 반환하는 함수 (초기값 설정용)
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 사용자가 달력에서 클릭한(선택한) 날짜 (기본값: 오늘)
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayString());

  // =================================================================
  // 2. 데이터 불러오기 (API 호출)
  // =================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 3. API 요청 (헤더에 토큰 포함)
        // 백엔드 컨트롤러: /api/mentee/home (멘티용 홈 데이터)
        const response = await apiClient.get('/mentee/home');
        
        // 4. 받아온 데이터 확인 및 상태 업데이트
        console.log("멘티 데이터:", response.data);
        setSchedules(response.data.schedules || []);   // 일정 데이터 저장
        setMyLectures(response.data.myLectures || []); // 강의 데이터 저장

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        // 필요 시 에러 처리 로직 추가 (예: 토큰 만료 시 로그아웃 처리 등)
      }
    };

    fetchData(); // 함수 실행
  }, []); // 빈 배열([]): 컴포넌트가 처음 렌더링될 때 딱 한 번만 실행

  // =================================================================
  // 3. 날짜 계산 및 유틸 함수 (캘린더 로직)
  // =================================================================
  
  // Date 객체를 "YYYY-MM-DD" 문자열로 변환 (비교 및 필터링용 키값)
  const formatDateKey = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // baseDate를 기준으로 "월요일 ~ 일요일" 7일치 날짜 배열 생성
  const getCalendarDays = () => {
    const days = [];
    const currentDay = baseDate.getDay(); // 0(일) ~ 6(토)
    
    // 현재 요일을 기준으로 이번 주 월요일이 며칠 전인지 계산
    // (일요일(0)이면 -6일 전, 그 외에는 1 - 현재요일)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; 
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + mondayOffset + i); // 월요일부터 +0, +1, +2...
      days.push(d);
    }
    return days;
  };

  const weekDates = getCalendarDays(); // 이번 주 7일 날짜 리스트
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 요일 이름 반환 헬퍼 (일요일 처리)
  const getDayName = (dateObj) => {
      const idx = dateObj.getDay(); // 0: 일요일
      if (idx === 0) return '일';
      return dayNames[idx - 1] || '토';
  };

  // 선택된 날짜(selectedDateStr)와 일치하는 스케줄만 필터링
  const filteredSchedules = schedules.filter(s => s.scheduleDate === selectedDateStr);
  
  // 시간 포맷팅 (HH:mm:ss -> HH:mm)
  const formatTime = (time) => time ? time.substring(0, 5) : '';

  // =================================================================
  // 4. 화면 렌더링 (UI)
  // =================================================================
  return (
    <div className="space-y-8 animate-fade-in p-2">
      
      {/* ------------------------------------------------------- */}
      {/* 섹션 1: 나의 수업 일정 (주간 달력 + 일정 리스트) */}
      {/* ------------------------------------------------------- */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        
        {/* 상단 헤더: 제목 및 주차 이동 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <Calendar className="text-blue-500" size={20}/> 
            <span>나의 수업 일정</span>
          </div>
          
          {/* 주차 이동 컨트롤러 (이전 주 / 다음 주) */}
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            {/* 이전 주 버튼: 현재 날짜에서 -7일 */}
            <button 
              onClick={() => { const newDate = new Date(baseDate); newDate.setDate(baseDate.getDate() - 7); setBaseDate(newDate); }} 
              className="hover:bg-gray-200 p-1 rounded transition text-gray-500"
            >
              <ChevronLeft size={18}/>
            </button>
            
            {/* 현재 표시 중인 월/주차 정보 */}
            <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
              {baseDate.getMonth() + 1}월 {Math.ceil(baseDate.getDate() / 7)}주차
            </span>
            
            {/* 다음 주 버튼: 현재 날짜에서 +7일 */}
            <button 
              onClick={() => { const newDate = new Date(baseDate); newDate.setDate(baseDate.getDate() + 7); setBaseDate(newDate); }} 
              className="hover:bg-gray-200 p-1 rounded transition text-gray-500"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* 요일별 날짜 버튼 (월~일) */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDates.map((dateObj, idx) => {
            const thisDateStr = formatDateKey(dateObj); // YYYY-MM-DD
            const isSelected = thisDateStr === selectedDateStr; // 선택된 날짜인지 확인
            // 해당 날짜에 스케줄이 있는지 확인 (파란 점 표시용)
            const hasSchedule = schedules.some(s => s.scheduleDate === thisDateStr);

            return (
              <button 
                key={idx} 
                onClick={() => setSelectedDateStr(thisDateStr)} // 날짜 클릭 시 선택 상태 변경
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all border
                  ${isSelected 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105' // 선택됨
                    : 'bg-white text-gray-500 border-transparent hover:bg-gray-50' // 선택 안 됨
                  }`}
              >
                <span className="text-xs font-medium mb-1 opacity-80">{getDayName(dateObj)}</span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
                {/* 스케줄이 있으면 파란 점 표시 */}
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasSchedule && !isSelected ? 'bg-blue-400' : 'bg-transparent'}`}></div>
              </button>
            );
          })}
        </div>

        {/* 선택한 날짜의 일정 목록 표시 */}
        <div className="space-y-3">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 font-bold text-sm px-3 py-1.5 rounded-lg">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                  <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {schedule.title}
                  </div>
                </div>
                
                {/* 강의실 입장 버튼 */}
                {/* 아까 이야기한 대로, 여기서 onClick에 navigate(`/classroom/${schedule.leId}`) 추가 가능 */}
                <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm">
                  <Video size={16} /> 강의실 입장
                </button>
              </div>
            ))
          ) : (
            // 일정이 없을 때 표시할 화면
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-400 font-medium text-sm">오늘은 예정된 수업이 없어요! ☕</p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------- */}
      {/* 섹션 2: 수강 중인 강의 목록 (카드 리스트) */}
      {/* ------------------------------------------------------- */}
      <section>
         <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
           <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
           수강 중인 강의 목록
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 강의 목록 매핑 (leId를 키값으로 사용) */}
            {myLectures.map((lecture) => (
              <div key={lecture.leId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full">
                 
                 {/* 카드 상단: 아이콘 및 평점 */}
                 <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                       <BookOpen size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                       <Star size={12} className="text-yellow-400 fill-yellow-400"/> 
                       {lecture.avgScore || "0.0"}
                    </div>
                 </div>
                 
                 {/* 강의 제목 및 내용 */}
                 <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                    {lecture.title}
                 </h4>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                    {lecture.content ? lecture.content : "화이팅! 열심히 공부해봅시다."}
                 </p>
                 
                 {/* 카드 하단: 신청일 */}
                 <div className="pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-xs text-gray-400 font-medium">
                      신청일: {lecture.modifiedAt ? String(lecture.modifiedAt).split('T')[0] : "날짜 없음"}
                    </span>
                 </div>
              </div>
            ))}

            {/* 새로운 강의 찾기 버튼 (마지막에 항상 고정) */}
            <button 
              onClick={() => navigate('/lecture')} 
              className="min-h-[220px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all gap-2 bg-gray-50/50"
            >
               <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:border-blue-200">
                 <Search size={24}/>
               </div>
               <span className="font-bold text-sm">새로운 강의 찾기</span>
            </button>
         </div>
      </section>
    </div>
  );
};

export default MenteeHome;
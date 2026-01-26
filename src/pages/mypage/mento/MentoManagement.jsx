import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Video, Star, Plus, Calendar, BookOpen, Users // 👈 [추가] Users 아이콘 임포트
} from 'lucide-react';

/**
 * [협업 노트] MentoManagement Component
 * 작성자: Gemini
 * 설명: 멘토 마이페이지 - '내 수업 관리' 및 '개설 강의 관리' 화면
 * * 주요 기능:
 * 1. 주간 달력 및 수업 일정(Schedule) 확인/입장
 * 2. 개설한 강의(Lecture) 목록 조회 및 수강 현황(인원수) 모니터링
 * 3. 새로운 강의 개설 페이지 이동
 */
const MentoManagement = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------------
  // 1. 사용자 인증 정보 (User Context)
  // ----------------------------------------------------------------
  // 로컬 스토리지에서 유저 정보 파싱 (로그인 상태가 아니면 null)
  const storedInfo = JSON.parse(localStorage.getItem('userInfo'));
  // [Dev Note] 테스트용 memberId: 3 (실제 배포 시 예외처리 필요)
  const memberId = storedInfo ? storedInfo.mbId : 3; 

  // ----------------------------------------------------------------
  // 2. 상태 관리 (State Management)
  // ----------------------------------------------------------------
  const [schedules, setSchedules] = useState([]);   // 수업 일정 데이터
  const [myLectures, setMyLectures] = useState([]); // 개설 강의 데이터
  
  // 달력 기준 날짜 (기본값: 오늘)
  const [baseDate, setBaseDate] = useState(new Date()); 
  
  // 오늘 날짜를 'YYYY-MM-DD' 문자열로 변환 (초기 선택값)
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayString());

  // ----------------------------------------------------------------
  // 3. API 데이터 호출 (Data Fetching)
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // [Dev Note] 보안 토큰 적용 시 아래 주석 코드로 대체 예정
        /* * const token = localStorage.getItem('accessToken');
         * const res = await axios.get('/api/mento/home', {
         * headers: { Authorization: `Bearer ${token}` }
         * });
         */

        // [현재] URL 파라미터로 ID 전달
        const res = await axios.get(`/api/mento/home/${memberId}`);
        
        console.log("🔥 [MentoManagement] 데이터 로드 완료:", res.data); 
        
        // 데이터가 없을 경우 빈 배열로 초기화하여 렌더링 에러 방지
        setSchedules(res.data.schedules || []);
        // myCreatedLectures 또는 myLectures 등 백엔드 응답 키값에 맞춰 매핑
        // (Controller에서 'myCreatedLectures'로 보냈다면 수정 필요, 현재는 코드 그대로 유지)
        setMyLectures(res.data.myCreatedLectures || res.data.myLectures || []);
      } catch (err) {
        console.error("❌ 데이터 로딩 실패:", err);
      }
    };
    fetchData();
  }, [memberId]);

  // ----------------------------------------------------------------
  // 4. 날짜 및 달력 로직 (Calendar Logic)
  // ----------------------------------------------------------------
  // Date 객체 -> 'YYYY-MM-DD' 변환
  const formatDateKey = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 현재 기준 날짜가 포함된 주(Week)의 날짜 배열 생성
  const getCalendarDays = () => {
    const days = [];
    const currentDay = baseDate.getDay(); 
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 월요일 시작 기준 보정
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + mondayOffset + i);
      days.push(d);
    }
    return days;
  };

  const weekDates = getCalendarDays();
  const dayNames = ['월', '화', '수', '목', '금', '토', '일']; 

  const getDayName = (dateObj) => {
    const idx = dateObj.getDay(); 
    if (idx === 0) return '일';
    return dayNames[idx - 1] || '토';
  };

  // 선택된 날짜에 해당하는 스케줄만 필터링
  const filteredSchedules = schedules.filter(s => s.scheduleDate === selectedDateStr);
  const formatTime = (time) => time ? time.substring(0, 5) : '';

  // ----------------------------------------------------------------
  // 5. 렌더링 (Render UI)
  // ----------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fade-in p-2">
      
      {/* === [Section 1] 수업 일정 관리 (달력 & 리스트) === */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* 달력 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <Calendar className="text-orange-500" size={20}/>
            <span>내 수업 관리</span>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            <button 
              onClick={() => {
                const newDate = new Date(baseDate);
                newDate.setDate(baseDate.getDate() - 7);
                setBaseDate(newDate);
              }} 
              className="hover:bg-gray-200 p-1 rounded transition text-gray-500"
            >
              <ChevronLeft size={18}/>
            </button>
            <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
              {baseDate.getMonth() + 1}월 {Math.ceil(baseDate.getDate() / 7)}주차
            </span>
            <button 
              onClick={() => {
                const newDate = new Date(baseDate);
                newDate.setDate(baseDate.getDate() + 7);
                setBaseDate(newDate);
              }} 
              className="hover:bg-gray-200 p-1 rounded transition text-gray-500"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* 주간 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDates.map((dateObj, idx) => {
            const thisDateStr = formatDateKey(dateObj);
            const isSelected = thisDateStr === selectedDateStr;
            const hasSchedule = schedules.some(s => s.scheduleDate === thisDateStr);

            return (
              <button 
                key={idx} 
                onClick={() => setSelectedDateStr(thisDateStr)} 
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all border
                  ${isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}`}
              >
                <span className="text-xs font-medium mb-1 opacity-80">
                  {getDayName(dateObj)}
                </span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasSchedule && !isSelected ? 'bg-orange-400' : 'bg-transparent'}`}></div>
              </button>
            );
          })}
        </div>

        {/* 스케줄 리스트 */}
        <div className="space-y-3">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-50 text-orange-600 font-bold text-sm px-3 py-1.5 rounded-lg">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                  <div className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {schedule.title}
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm">
                  <Video size={16} /> 입장
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-400 font-medium text-sm">일정이 없습니다. ☕</p>
            </div>
          )}
        </div>
      </section>

      {/* === [Section 2] 개설한 강의 목록 (수강생 현황 추가) === */}
      <section>
         <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
           <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
           개설한 강의 목록
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myLectures.map((lecture) => (
              <div key={lecture.leId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full">
                 
                 {/* 1. 상단 아이콘 및 평점 */}
                 <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                       <BookOpen size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                       <Star size={12} className="text-yellow-400 fill-yellow-400"/> 
                       {lecture.avgScore || "0.0"}
                    </div>
                 </div>

                 {/* 2. 강의 제목 및 내용 */}
                 <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                    {lecture.title}
                 </h4>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                    {lecture.content ? lecture.content : "강의 설명이 없습니다."}
                 </p>

                 {/* 3. [추가됨] 하단 정보바: 수강생 현황 (현재/최대) */}
                 <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">수강 현황</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Users size={14} className="text-gray-500"/>
                        {/* 현재 수강생 (Orders 테이블 집계) */}
                        <span className="text-sm font-bold text-blue-600">
                           {lecture.currentStudents || 0}
                        </span>
                        <span className="text-xs text-gray-300">/</span>
                        {/* 최대 정원 (Schedule 테이블 Max값) */}
                        <span className="text-sm font-bold text-gray-400">
                           {lecture.maxStudents ? lecture.maxStudents : "∞"}
                        </span>
                    </div>
                 </div>

              </div>
            ))}

            {/* 새로운 강의 개설 버튼 */}
            <button 
              onClick={() => navigate('/lecture/create')}
              className="min-h-[220px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all gap-2 bg-gray-50/50"
            >
               <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:border-orange-200">
                 <Plus size={24}/>
               </div>
               <span className="font-bold text-sm">새로운 강의 개설하기</span>
            </button>
         </div>
      </section>
    </div>
  );
};

export default MentoManagement;
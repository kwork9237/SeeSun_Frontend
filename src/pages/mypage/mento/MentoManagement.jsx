import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Video, Star, Plus, Calendar, BookOpen, Users 
} from 'lucide-react';
import apiClient from '../../../api/apiClient';

/**
 * [멘토 홈 화면] MentoManagement
 * - 기능 1: 멘토의 수업 일정 확인 (오늘 내가 가르쳐야 할 수업)
 * - 기능 2: 멘토가 개설한 강의 목록 조회 및 수강생 현황 파악
 * - 기능 3: 새로운 강의 개설 페이지로 이동
 */
const MentoManagement = () => {
  const navigate = useNavigate(); // 페이지 이동 훅

  // ----------------------------------------------------------------
  // 1. 상태 관리 (State Definition)
  // ----------------------------------------------------------------
  const [schedules, setSchedules] = useState([]);   // 수업 일정 (내가 가르치는 수업)
  const [myLectures, setMyLectures] = useState([]); // 개설 강의 목록 (내가 만든 강의)
  const [loading, setLoading] = useState(true);     // 데이터 로딩 중 여부
  
  // 캘린더 기준 날짜 (기본값: 오늘)
  const [baseDate, setBaseDate] = useState(new Date()); 
  
  // 오늘 날짜를 "YYYY-MM-DD" 문자열로 반환 (초기 선택값)
  const getTodayString = () => {
    const d = new Date();
    // getMonth()는 0부터 시작하므로 +1 필요
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  // 사용자가 달력에서 클릭한 날짜
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayString());

  // ----------------------------------------------------------------
  // 2. 데이터 호출 (API Fetching)
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // 로딩 시작
        
        // 3. 멘토용 홈 데이터 요청 (GET /api/mento/home)
        // 헤더에 토큰을 담아서 보냄 -> 백엔드에서 토큰으로 멘토 ID 식별
        const res = await apiClient.get('/mento/home');
        
        console.log("✅ 멘토 홈 데이터:", res.data); 
        
        // 4. 받아온 데이터 상태에 저장
        setSchedules(res.data.schedules || []);
        
        // 중요: 백엔드에서 보내주는 키값('myCreatedLectures')을 확인해야 함
        // 멘티는 'myLectures'(수강목록), 멘토는 'myCreatedLectures'(개설목록)일 가능성이 높음
        setMyLectures(res.data.myCreatedLectures || []);
        
      } catch (err) {
        console.error("❌ 데이터 로딩 실패:", err);
        // 401 Unauthorized 에러 발생 시 로그인 페이지로 이동
        if (err.response && err.response.status === 401) {
            navigate('/login');
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };
    fetchData();
  }, [navigate]);

  // ----------------------------------------------------------------
  // 3. 날짜 관련 헬퍼 함수 (Calendar Logic)
  // ----------------------------------------------------------------
  
  // 날짜 객체 -> "YYYY-MM-DD" 변환
  const formatDateKey = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 이번 주 7일 날짜 배열 생성 (월요일 시작 기준 아님, 현재 로직은 일~토 또는 월~일 조정 가능)
  const getCalendarDays = () => {
    const days = [];
    const currentDay = baseDate.getDay(); // 0(일) ~ 6(토)
    
    // 월요일을 주의 시작으로 맞추기 위한 계산
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; 
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + mondayOffset + i);
      days.push(d);
    }
    return days;
  };

  const weekDates = getCalendarDays(); // 화면에 뿌릴 7일치 날짜들
  const dayNames = ['월', '화', '수', '목', '금', '토', '일']; 

  // 요일 이름 반환
  const getDayName = (dateObj) => {
    const idx = dateObj.getDay(); 
    return idx === 0 ? '일' : dayNames[idx - 1];
  };

  // 선택된 날짜와 일치하는 스케줄만 필터링
  const filteredSchedules = schedules.filter(s => s.scheduleDate === selectedDateStr);
  
  // 시간 포맷 (HH:mm:ss -> HH:mm)
  const formatTime = (time) => time ? time.substring(0, 5) : '';

  // 강의실 입장 로직
  const handleEnterLectureRoom = async (leId) => {
  try {
    const res = await apiClient.post(
      "/lectures/sessions/create",
      null,                   // body 항목에서 보낼 것이 없음
      { params: { leId } }
    );

    const roomUuid = res.data.roomUuid;

    // 멘토 실시간 강의실로 이동
    navigate(`/mentor/lecture/${roomUuid}`);
  } catch (e) {
    console.error(e);
    if (e.response?.status === 401) {
      navigate("/login");
      return;
    }
    alert("강의실 입장 실패");
  }
};


  // ----------------------------------------------------------------
  // 4. 렌더링 (UI Rendering)
  // ----------------------------------------------------------------
  
  // 데이터 로딩 중일 때 표시할 간단한 화면
  if (loading) return <div className="p-10 text-center font-bold text-gray-500">데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-8 animate-fade-in p-2">
      
      {/* === [섹션 1] 수업 일정 관리 (오렌지 테마) === */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        
        {/* 헤더: 내 수업 관리 & 주차 이동 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <Calendar className="text-orange-500" size={20}/> {/* 멘토는 오렌지색 포인트 */}
            <span>내 수업 관리</span>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            {/* 이전 주 이동 */}
            <button onClick={() => {
                const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d);
            }} className="hover:bg-gray-200 p-1 rounded transition text-gray-500"><ChevronLeft size={18}/></button>
            
            <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
              {baseDate.getMonth() + 1}월 {Math.ceil(baseDate.getDate() / 7)}주차
            </span>
            
            {/* 다음 주 이동 */}
            <button onClick={() => {
                const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d);
            }} className="hover:bg-gray-200 p-1 rounded transition text-gray-500"><ChevronRight size={18}/></button>
          </div>
        </div>

        {/* 주간 달력 그리드 (요일 버튼들) */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDates.map((dateObj, idx) => {
            const dateStr = formatDateKey(dateObj);
            const isSelected = dateStr === selectedDateStr;
            // 해당 날짜에 수업이 있는지 확인
            const hasSchedule = schedules.some(s => s.scheduleDate === dateStr);

            return (
              <button key={idx} onClick={() => setSelectedDateStr(dateStr)} 
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all border
                  ${isSelected 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105' // 선택됨
                    : 'bg-white text-gray-500 border-transparent hover:bg-gray-50' // 선택 안 됨
                  }`}
              >
                <span className="text-xs font-medium mb-1 opacity-80">{getDayName(dateObj)}</span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
                {/* 수업 있는 날 오렌지 점 표시 */}
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasSchedule && !isSelected ? 'bg-orange-400' : 'bg-transparent'}`}></div>
              </button>
            );
          })}
        </div>

        {/* 선택한 날짜의 스케줄 리스트 */}
        <div className="space-y-3">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-50 text-orange-600 font-bold text-sm px-3 py-1.5 rounded-lg">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                  <div className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{schedule.title}</div>
                </div>
                {/* 강의실 입장 버튼 */}
                <button 
                  onClick={() => handleEnterLectureRoom(schedule.leId)}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm">
                  <Video size={16} /> 입장
                </button>
              </div>
            ))
          ) : (
            // 일정이 없을 때
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-400 font-medium text-sm">일정이 없습니다. ☕</p>
            </div>
          )}
        </div>
      </section>

      {/* === [섹션 2] 개설한 강의 목록 (카드 리스트) === */}
      <section>
         <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
           <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
           개설한 강의 목록
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 내가 만든 강의 카드 매핑 */}
            {myLectures.map((lecture) => (
              <div key={lecture.leId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full">
                 <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><BookOpen size={24} /></div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                       <Star size={12} className="text-yellow-400 fill-yellow-400"/> {lecture.avgScore || "0.0"}
                    </div>
                 </div>
                 <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">{lecture.title}</h4>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                    {lecture.content || "강의 설명이 없습니다."}
                 </p>
                 
                 {/* 하단: 수강생 현황 (멘토 전용 정보) */}
                 <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">수강 현황</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Users size={14} className="text-gray-500"/>
                        {/* 현재 수강생 / 최대 수강생 */}
                        <span className="text-sm font-bold text-blue-600">{lecture.currentStudents || 0}</span>
                        <span className="text-xs text-gray-300">/</span>
                        <span className="text-sm font-bold text-gray-400">{lecture.maxStudents || "∞"}</span>
                    </div>
                 </div>
              </div>
            ))}

            {/* [중요] 새로운 강의 개설 버튼 (멘토 전용 기능) */}
            <button onClick={() => navigate('/lecture/create')}
              className="min-h-[220px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all gap-2 bg-gray-50/50"
            >
               <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm mb-2"><Plus size={24}/></div>
               <span className="font-bold text-sm">새로운 강의 개설하기</span>
            </button>
         </div>
      </section>
    </div>
  );
};

export default MentoManagement;
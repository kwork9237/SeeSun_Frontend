import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Video, Star, Plus, Calendar, BookOpen, Users 
} from 'lucide-react';

/**
 * 멘토 마이페이지 - 대시보드 (일정 관리 및 개설 강의 현황)
 */
const MentoManagement = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------------------
  // 1. 상태 관리 (State)
  // ----------------------------------------------------------------
  const [schedules, setSchedules] = useState([]);   // 수업 일정
  const [myLectures, setMyLectures] = useState([]); // 개설 강의 목록
  const [loading, setLoading] = useState(true);     // 로딩 상태
  
  const [baseDate, setBaseDate] = useState(new Date()); 
  
  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayString());

  // ----------------------------------------------------------------
  // 2. 데이터 호출 (토큰 기반)
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // ★ [수정] 주소에서 ID를 제거하고 헤더에 토큰을 실어 보냅니다.
        const res = await axios.get('/api/mento/home', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("✅ 데이터 로드 완료:", res.data); 
        
        setSchedules(res.data.schedules || []);
        // 백엔드 컨트롤러의 리턴 키값('myCreatedLectures')에 맞춰 매핑
        setMyLectures(res.data.myCreatedLectures || []);
      } catch (err) {
        console.error("❌ 데이터 로딩 실패:", err);
        if (err.response && err.response.status === 401) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ----------------------------------------------------------------
  // 3. 날짜 관련 헬퍼 함수
  // ----------------------------------------------------------------
  const formatDateKey = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCalendarDays = () => {
    const days = [];
    const currentDay = baseDate.getDay(); 
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; 
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
    return idx === 0 ? '일' : dayNames[idx - 1];
  };

  const filteredSchedules = schedules.filter(s => s.scheduleDate === selectedDateStr);
  const formatTime = (time) => time ? time.substring(0, 5) : '';

  // ----------------------------------------------------------------
  // 4. 렌더링
  // ----------------------------------------------------------------
  if (loading) return <div className="p-10 text-center font-bold text-gray-500">데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-8 animate-fade-in p-2">
      
      {/* === [섹션 1] 수업 일정 관리 === */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <Calendar className="text-orange-500" size={20}/>
            <span>내 수업 관리</span>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            <button onClick={() => {
                const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d);
            }} className="hover:bg-gray-200 p-1 rounded transition text-gray-500"><ChevronLeft size={18}/></button>
            <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
              {baseDate.getMonth() + 1}월 {Math.ceil(baseDate.getDate() / 7)}주차
            </span>
            <button onClick={() => {
                const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d);
            }} className="hover:bg-gray-200 p-1 rounded transition text-gray-500"><ChevronRight size={18}/></button>
          </div>
        </div>

        {/* 주간 그리드 */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDates.map((dateObj, idx) => {
            const dateStr = formatDateKey(dateObj);
            const isSelected = dateStr === selectedDateStr;
            const hasSchedule = schedules.some(s => s.scheduleDate === dateStr);

            return (
              <button key={idx} onClick={() => setSelectedDateStr(dateStr)} 
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all border
                  ${isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}`}
              >
                <span className="text-xs font-medium mb-1 opacity-80">{getDayName(dateObj)}</span>
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
                  <div className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{schedule.title}</div>
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

      {/* === [섹션 2] 개설한 강의 목록 === */}
      <section>
         <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
           <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
           개설한 강의 목록
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                 <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">수강 현황</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Users size={14} className="text-gray-500"/>
                        <span className="text-sm font-bold text-blue-600">{lecture.currentStudents || 0}</span>
                        <span className="text-xs text-gray-300">/</span>
                        <span className="text-sm font-bold text-gray-400">{lecture.maxStudents || "∞"}</span>
                    </div>
                 </div>
              </div>
            ))}
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
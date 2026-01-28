import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Video, Star, Search, Calendar, BookOpen 
} from 'lucide-react';

const MentoHome = () => {
  const navigate = useNavigate();

  // 1. 로그인 정보

  const [schedules, setSchedules] = useState([]);   
  const [myLectures, setMyLectures] = useState([]); 
  
  // 날짜 관련 (밀림 방지 로직 적용됨)
  const [baseDate, setBaseDate] = useState(new Date()); 
  
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayString());

  // =================================================================
  // 2. 데이터 불러오기
  // =================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response; // 나중에 변수명 충돌 방지를 위해 미리 선언

        // 토큰(Token) 사용 시 
        
        // 1. 저장된 토큰 꺼내기
        const token = localStorage.getItem('accessToken'); 

        // 2. 토큰이 없으면 로그인 페이지로 튕겨내기 (선택사항)
        if (!token) {
           alert("로그인이 필요합니다.");
           navigate('/login');
           return;
        }

        // 3. 헤더에 토큰을 실어서 요청 (URL에 ID가 필요 없어짐!)
        response = await axios.get('/api/mentee/home', {
           headers: {
              Authorization: `Bearer ${token}` // 
           }
        });
        

        console.log("멘티 데이터:", response.data);
        setSchedules(response.data.schedules || []);
        setMyLectures(response.data.myLectures || []);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };
    fetchData();
  }, []); // 나중에 토큰 방식으로 바꾸면 [memberId] 의존성은 제거해도 됩니다.

  // 3. 날짜 유틸
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
      if (idx === 0) return '일';
      return dayNames[idx - 1] || '토';
  };

  const filteredSchedules = schedules.filter(s => s.scheduleDate === selectedDateStr);
  const formatTime = (time) => time ? time.substring(0, 5) : '';

  return (
    <div className="space-y-8 animate-fade-in p-2">
      
      {/* === 섹션 1: 나의 수업 일정 === */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <Calendar className="text-blue-500" size={20}/> {/* 파란색 포인트 */}
            <span>나의 수업 일정</span>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            <button onClick={() => { const newDate = new Date(baseDate); newDate.setDate(baseDate.getDate() - 7); setBaseDate(newDate); }} className="hover:bg-gray-200 p-1 rounded transition text-gray-500"><ChevronLeft size={18}/></button>
            <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">{baseDate.getMonth() + 1}월 {Math.ceil(baseDate.getDate() / 7)}주차</span>
            <button onClick={() => { const newDate = new Date(baseDate); newDate.setDate(baseDate.getDate() + 7); setBaseDate(newDate); }} className="hover:bg-gray-200 p-1 rounded transition text-gray-500"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDates.map((dateObj, idx) => {
            const thisDateStr = formatDateKey(dateObj);
            const isSelected = thisDateStr === selectedDateStr;
            const hasSchedule = schedules.some(s => s.scheduleDate === thisDateStr);

            return (
              <button key={idx} onClick={() => setSelectedDateStr(thisDateStr)} 
                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all border
                  ${isSelected ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}`}
              >
                <span className="text-xs font-medium mb-1 opacity-80">{getDayName(dateObj)}</span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasSchedule && !isSelected ? 'bg-blue-400' : 'bg-transparent'}`}></div>
              </button>
            );
          })}
        </div>

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
                <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm">
                  <Video size={16} /> 강의실 입장
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-400 font-medium text-sm">오늘은 예정된 수업이 없어요! ☕</p>
            </div>
          )}
        </div>
      </section>

      {/* === 섹션 2: 수강 중인 강의 목록 === */}
      <section>
         <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
           <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
           수강 중인 강의 목록
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myLectures.map((lecture) => (
              <div key={lecture.leId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full">
                 <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                       <BookOpen size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                       <Star size={12} className="text-yellow-400 fill-yellow-400"/> 
                       {lecture.avgScore || "0.0"}
                    </div>
                 </div>
                 <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                    {lecture.title}
                 </h4>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                    {lecture.content ? lecture.content : "화이팅! 열심히 공부해봅시다."}
                 </p>
                 <div className="pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-xs text-gray-400 font-medium">
                      신청일: {lecture.modifiedAt ? String(lecture.modifiedAt).split('T')[0] : "날짜 없음"}
                    </span>
                 </div>
              </div>
            ))}

            {/* 강의 찾기 버튼 (멘티 전용) */}
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

export default MentoHome;
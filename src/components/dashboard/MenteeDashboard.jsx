import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const MenteeDashboard = ({ memberInfo }) => {
  
  // 1. [DB: Lecture_Session] 오늘의 수업 데이터 (가장 빠른 1개)
  const upcomingClass = {
    title: "비즈니스 영어 회화 - 실전",
    mentor: "James Wilson",
    date: "2026.02.06 (금)",
    time: "19:00 ~ 20:00",
    isLive: true // 수업 시간이 되면 true
  };

  // 2. [DB: Member_Enrollment] 통계 데이터
  const stats = {
    current: 3,    // 현재 듣는 강의 수
    completed: 12  // 완료한 강의 수
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. 인삿말 섹션 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, <span className="text-primary">{memberInfo.mb_nickname}</span>님!
        </h1>
        <p className="text-gray-500 mt-2">
          오늘도 SeeSun과 함께 새로운 언어 세상을 경험해 보세요. ☀️
        </p>
      </div>

      {/* 2. 곧 수업 예정 강의 (와이어프레임 상단 긴 박스) */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 mb-3 ml-1">곧 수업 예정 강의</h3>
        
        <Card padding="medium" className="border border-gray-200 shadow-sm hover:border-primary transition duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* 강의 정보 */}
            <div className="flex-1 space-y-1">
              <div className="mb-2">
                 {upcomingClass.isLive && <Badge variant="danger" className="animate-pulse mr-2">LIVE</Badge>}
                 <span className="text-sm font-bold text-blue-600">수업 10분 전</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {upcomingClass.title}
              </h2>
              <p className="text-gray-600 font-medium">
                멘토 {upcomingClass.mentor}
              </p>
              <div className="text-sm text-gray-400 font-medium pt-2">
                {upcomingClass.date} &nbsp;|&nbsp; {upcomingClass.time}
              </div>
            </div>

            {/* 입장 버튼 (우측 배치) */}
            <div className="w-full md:w-auto">
              <Button variant="primary" size="large" className="w-full md:w-auto shadow-lg shadow-blue-100">
                강의실 입장 <i className="fa-solid fa-arrow-right-to-bracket ml-2"></i>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. 통계 박스 (와이어프레임 하단 2개 박스) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 현재 듣는 강의 수 */}
        <Card padding="large" className="flex flex-col items-center justify-center h-48 border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer group">
          <h4 className="text-lg font-bold text-gray-500 mb-3 group-hover:text-blue-600 transition">현재 듣는 강의 수</h4>
          <p className="text-6xl font-black text-gray-900 group-hover:scale-110 transition duration-300">
            {stats.current}
          </p>
        </Card>

        {/* 완료한 강의 수 */}
        <Card padding="large" className="flex flex-col items-center justify-center h-48 border border-gray-200 hover:border-green-400 hover:bg-green-50/30 transition cursor-pointer group">
          <h4 className="text-lg font-bold text-gray-500 mb-3 group-hover:text-green-600 transition">완료한 강의 수</h4>
          <p className="text-6xl font-black text-gray-900 group-hover:scale-110 transition duration-300">
            {stats.completed}
          </p>
        </Card>

      </section>
      
    </div>
  );
};

export default MenteeDashboard;
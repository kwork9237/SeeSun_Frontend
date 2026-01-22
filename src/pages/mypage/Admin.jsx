import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Admin = () => {
  // --- 상태 관리 (State) ---
  const [dashboardStats, setDashboardStats] = useState({
    newMentorCount: 0,
    reportedLectureCount: 0,
    inquiryCount: 0
  });

  // --- 데이터 가져오기 (API 호출) ---
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // [TODO] 실제 백엔드 API 주소로 변경해주세요.
        const response = await axios.get('/api/mypage/dashboard-stats');
        
        setDashboardStats({
          newMentorCount: response.data.newMentorCount || 0,
          reportedLectureCount: response.data.reportedLectureCount || 0,
          inquiryCount: response.data.inquiryCount || 0,
        });

      } catch (error) {
        console.error("관리자 대시보드 데이터를 불러오는데 실패했습니다.", error);
        // 임의 데이터 설정 코드를 삭제했습니다.
      }
    };

    fetchAdminStats();
  }, []);

  // --- 이벤트 핸들러 ---
  const handleNavClick = (menuName) => {
    alert(`'${menuName}' 페이지로 이동합니다.`);
  };

  const handleAuthClick = (type) => {
    if (type === 'signin') {
      alert("로그인 화면으로 이동합니다.");
    } else if (type === 'start') {
      alert("회원가입 프로세스를 시작합니다.");
    }
  };

  const handleLogoClick = () => {
    alert("메인 홈페이지로 이동합니다.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="font-sans min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827]">
      {/* --- Header --- */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* 로고 */}
        <div 
          className="flex items-center font-bold text-xl cursor-pointer select-none" 
          onClick={handleLogoClick}
        >
          <span className="text-[#FF6B4A] mr-2 text-2xl">☁️</span>
          <span className="tracking-tight">LinguaConnect</span>
        </div>
        
        {/* 네비게이션 */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
          {['How it Works', 'Languages', 'Mentors', 'Pricing'].map((item) => (
            <span 
              key={item}
              className="cursor-pointer hover:text-[#FF6B4A] transition-colors" 
              onClick={() => handleNavClick(item)}
            >
              {item}
            </span>
          ))}
        </nav>
        
        {/* 인증 버튼 */}
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 text-sm font-semibold text-[#FF6B4A] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors" 
            onClick={() => handleAuthClick('signin')}
          >
            Sign In
          </button>
          <button 
            className="px-4 py-2 text-sm font-semibold text-white bg-[#FF6B4A] rounded-lg hover:bg-[#ff5530] shadow-sm transition-colors" 
            onClick={() => handleAuthClick('start')}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* --- Body Area --- */}
      <div className="flex flex-1 max-w-[1400px] w-full mx-auto">
        
        {/* --- Sidebar --- */}
        <aside className="w-[260px] py-8 px-4 bg-white border-r border-gray-100 hidden lg:flex flex-col shrink-0">
          {/* 프로필 섹션 */}
          <div className="flex items-center mb-10 px-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-400 text-xl">
              👤
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-gray-800">Administrator</span>
              <span className="text-xs text-[#FF6B4A] font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-1">
                MASTER
              </span>
            </div>
          </div>

          {/* 메뉴 리스트 */}
          <div className="space-y-8">
            {/* 그룹 1 */}
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Dashboard</div>
              <ul className="space-y-1">
                <li>
                  <div className="flex items-center px-3 py-2.5 bg-orange-50 text-[#FF6B4A] rounded-lg cursor-pointer font-medium">
                    <span className="mr-3 text-lg">🏠</span> 홈
                  </div>
                </li>
              </ul>
            </div>

            {/* 그룹 2 */}
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Management</div>
              <ul className="space-y-1">
                <li>
                  <Link to="/mypage/mentorequests" className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg transition-colors group">
                    <span className="mr-3 text-gray-400 group-hover:text-[#FF6B4A]">👥</span> 멘토 승인 관리
                  </Link>
                </li>
                <li>
                  <div className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg cursor-pointer transition-colors group">
                    <span className="mr-3 text-gray-400 group-hover:text-[#FF6B4A]">📋</span> 전체 회원 조회
                  </div>
                </li>
              </ul>
            </div>

            {/* 그룹 3 */}
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Contents</div>
              <ul className="space-y-1">
                <li>
                  <Link to="/mypage/leturereport" className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg transition-colors group">
                    <span className="mr-3 text-gray-400 group-hover:text-[#FF6B4A]">🚨</span> 강의 신고 관리
                  </Link>
                </li>
              </ul>
            </div>

            {/* 그룹 4 */}
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Support</div>
              <ul className="space-y-1">
                <li>
                  <Link to="/mypage/suggestonsmanage" className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg transition-colors group">
                    <span className="mr-3 text-gray-400 group-hover:text-[#FF6B4A]">💬</span> 건의 사항 관리
                  </Link>
                </li>
                <li>
                  <div className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg cursor-pointer transition-colors group">
                    <span className="mr-3 text-gray-400 group-hover:text-[#FF6B4A]">📢</span> 공지 사항 작성
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main className="flex-1 p-8 lg:p-12">
          <div className="flex justify-between items-end mb-8">
             <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
             <span className="text-sm text-gray-500">오늘의 주요 현황을 확인하세요.</span>
          </div>

          {/* 알림 섹션 (스크린샷의 파란 박스 스타일 적용) */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-6 mb-10 shadow-sm">
            <div className="flex items-center mb-4">
              <span className="text-[#2563EB] text-lg mr-2">🔔</span>
              <h2 className="text-[#1E40AF] font-bold text-lg">승인 및 처리 대기 현황</h2>
              <span className="ml-2 bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {dashboardStats.newMentorCount + dashboardStats.reportedLectureCount}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* 항목 1 */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800">신규 멘토 신청이 접수되었습니다.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">대기 건수: <strong className="text-[#FF6B4A]">{dashboardStats.newMentorCount}</strong>건</span>
                  <button className="px-4 py-1.5 text-sm bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors">바로가기</button>
                </div>
              </div>

              {/* 항목 2 */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800">신고 접수된 강의가 있습니다.</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-sm text-gray-500 font-medium">미처리 건수: <strong className="text-[#EF4444]">{dashboardStats.reportedLectureCount}</strong>건</span>
                  <button className="px-4 py-1.5 text-sm border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">확인하기</button>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 요약 카드 (그리드) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 카드 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-gray-500 text-sm font-medium mb-2">총 멘토 신청</div>
               <div className="flex items-baseline">
                 <span className="text-3xl font-bold text-gray-900">{dashboardStats.newMentorCount}</span>
                 <span className="ml-1 text-sm text-gray-400">건 (Today)</span>
               </div>
            </div>

            {/* 카드 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-gray-500 text-sm font-medium mb-2">신고된 강의</div>
               <div className="flex items-baseline">
                 <span className="text-3xl font-bold text-gray-900">{dashboardStats.reportedLectureCount}</span>
                 <span className="ml-1 text-sm text-gray-400">건 (Today)</span>
               </div>
            </div>

            {/* 카드 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-gray-500 text-sm font-medium mb-2">처리 가능한 건의사항</div>
               <div className="flex items-baseline">
                 <span className="text-3xl font-bold text-gray-900">{dashboardStats.inquiryCount}</span>
                 <span className="ml-1 text-sm text-gray-400">건</span>
               </div>
            </div>
          </div>
          
           {/* 차트 영역 (플레이스홀더) */}
           <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-[300px] flex flex-col justify-center items-center">
                <div className="text-gray-300 text-5xl mb-4">📊</div>
                <div className="text-xl font-bold text-gray-700 mb-2">상세 통계 분석</div>
                <div className="text-gray-400">(2차 구현 예정: 주간/월간 가입자 추이 등)</div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Admin;
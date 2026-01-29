import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- 아이콘 컴포넌트 ---
const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Clipboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  ),
  Siren: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C4 2 5 5 5 5C5 5 2 7 2 7C2 7 5 5 5 5C5 5 4 2 4 2Z"/><path d="M20 2C20 2 19 5 19 5C19 5 22 7 22 7C22 7 19 5 19 5C19 5 20 2 20 2Z"/></svg>
  ),
  MessageSquare: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Megaphone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
  )
};

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
        const response = await axios.get('/api/admin/dashboard-stats');
        setDashboardStats({
          newMentorCount: response.data.newMentorCount || 0,
          reportedLectureCount: response.data.reportedLectureCount || 0,
          inquiryCount: response.data.inquiryCount || 0,
        });
      } catch (error) {
        console.error("관리자 대시보드 데이터를 불러오는데 실패했습니다.", error);
        setDashboardStats({
          newMentorCount: 5,
          reportedLectureCount: 2,
          inquiryCount: 12
        });
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827] font-sans">
      
      {/* --- Header --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full top-0 z-20">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer text-inherit no-underline">
          <span className="text-orange-500 text-2xl leading-none">●</span> 
          <span className="font-bold text-xl tracking-tight text-gray-900">LinguaConnect</span>
        </Link>
        
        {/* 우측 유저 메뉴 */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 text-sm font-semibold text-[#FF6B4A] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            Sign In
          </button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-[#FF6B4A] rounded-lg hover:bg-[#ff5530] shadow-sm transition-colors">
            Get Started
          </button>
        </div>
      </header>

      {/* --- Body Area --- */}
      <div className="flex flex-1 pt-16">
        
        {/* --- Sidebar --- */}
        <aside className="w-64 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto z-10 flex flex-col pt-8 px-6 border-r border-gray-100">
          
          {/* 프로필 섹션 */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-base">Administrator</span>
              <span className="text-[10px] font-bold text-[#FF6B4A] bg-[#FFF0EB] px-2 py-0.5 rounded-sm w-fit mt-1">MASTER</span>
            </div>
          </div>

          {/* 메뉴 리스트 */}
          <nav className="flex-1 space-y-8">
            
            {/* DASHBOARD */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dashboard</div>
              <Link to="/mypage" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                <span className="text-orange-500"><Icons.Home /></span>
                <span className="text-sm font-bold">홈</span>
              </Link>
            </div>

            {/* MANAGEMENT */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Management</div>
              <div className="space-y-1">
                <Link to="/mypage/mentorequests" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-purple-500"><Icons.Users /></span>
                  <span className="text-sm font-medium">멘토 승인 관리</span>
                </Link>
                
                {/* [수정] 전체 회원 조회 링크 연결 (MemberManage.jsx) */}
                <Link to="/mypage/membermanage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-orange-400"><Icons.Clipboard /></span>
                  <span className="text-sm font-medium">전체 회원 조회</span>
                </Link>
              </div>
            </div>

            {/* CONTENTS */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contents</div>
              <div className="space-y-1">
                <Link to="/mypage/leturereport" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-pink-500"><Icons.Siren /></span>
                  <span className="text-sm font-medium">강의 신고 관리</span>
                </Link>
              </div>
            </div>

            {/* SUPPORT */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Support</div>
              <div className="space-y-1">
                <Link to="/mypage/suggestonsmanage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-[#A78BFA]"><Icons.MessageSquare /></span>
                  <span className="text-sm font-medium">건의 사항 관리</span>
                </Link>
                <Link to="/mypage/notification" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                   <span className="text-rose-500"><Icons.Megaphone /></span>
                  <span className="text-sm font-medium">공지 사항 작성</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* --- Main Content --- */}
        <main className="flex-1 ml-64 p-8 lg:p-12">
          <div className="flex justify-between items-end mb-8">
             <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
             <span className="text-sm text-gray-500">오늘의 주요 현황을 확인하세요.</span>
          </div>

          {/* 알림 섹션 */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-6 mb-10 shadow-sm">
            <div className="flex items-center mb-4">
              <span className="text-[#2563EB] text-lg mr-2">🔔</span>
              <h2 className="text-[#1E40AF] font-bold text-lg">승인 및 처리 대기 현황</h2>
              <span className="ml-2 bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {dashboardStats.newMentorCount + dashboardStats.reportedLectureCount}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* 1. 신규 멘토 신청 알림 */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800">신규 멘토 신청이 접수되었습니다.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">대기 건수: <strong className="text-[#FF6B4A]">{dashboardStats.newMentorCount}</strong>건</span>
                  <Link to="/mypage/mentorequests" className="px-4 py-1.5 text-sm bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors">
                    바로가기
                  </Link>
                </div>
              </div>

              {/* 2. 신고된 강의 알림 */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800">신고 접수된 강의가 있습니다.</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-sm text-gray-500 font-medium">미처리 건수: <strong className="text-[#EF4444]">{dashboardStats.reportedLectureCount}</strong>건</span>
                  <Link to="/mypage/leturereport" className="px-4 py-1.5 text-sm border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    확인하기
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-gray-500 text-sm font-medium mb-2">총 멘토 신청</div>
               <div className="flex items-baseline">
                 <span className="text-3xl font-bold text-gray-900">{dashboardStats.newMentorCount}</span>
                 <span className="ml-1 text-sm text-gray-400">건 (Today)</span>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-gray-500 text-sm font-medium mb-2">신고된 강의</div>
               <div className="flex items-baseline">
                 <span className="text-3xl font-bold text-gray-900">{dashboardStats.reportedLectureCount}</span>
                 <span className="ml-1 text-sm text-gray-400">건 (Today)</span>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-gray-500 text-sm font-medium mb-2">처리 가능한 건의사항</div>
               <div className="flex items-baseline">
                 <span className="text-3xl font-bold text-gray-900">{dashboardStats.inquiryCount}</span>
                 <span className="ml-1 text-sm text-gray-400">건</span>
               </div>
            </div>
          </div>
          
           {/* 차트 영역 */}
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
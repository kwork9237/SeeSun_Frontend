import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
  ),
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const LectureReport = () => {
  // --- 상태 관리 ---
  const [reports, setReports] = useState([]);

  // --- 데이터 조회 (Axios) ---
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/admin/reports');
         setReports(response.data);
        setReports([]); // 임시로 빈 배열
      } catch (error) {
        console.error('강의 신고 목록 조회 실패:', error);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827] font-sans">
      
      {/* 1. 상단 네비게이션 (헤더) - Fixed */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full top-0 z-20">
        <Link to="/" className="flex items-center gap-2 cursor-pointer text-inherit no-underline">
          <span className="text-orange-500 text-2xl leading-none">●</span> 
          <span className="font-bold text-xl tracking-tight text-gray-900">LinguaConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 text-sm font-semibold text-[#FF6B4A] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            Sign In
          </button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-[#FF6B4A] rounded-lg hover:bg-[#ff5530] shadow-sm transition-colors">
            Get Started
          </button>
        </div>
      </header>

      {/* 2. 메인 레이아웃 */}
      <div className="flex flex-1 pt-16">
        
        {/* --- 왼쪽 사이드바 --- */}
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
            
            {/* Dashboard */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dashboard</div>
              {/* 홈 버튼: 클릭 시 /mypage 로 이동 */}
              <Link to="/mypage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <span className="text-orange-500"><Icons.Home /></span>
                <span className="text-sm font-medium">홈</span>
              </Link>
            </div>

            {/* Management */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Management</div>
              <div className="space-y-1">
                <Link to="/mypage/mentorequests" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-purple-500"><Icons.Users /></span>
                  <span className="text-sm font-medium">멘토 승인 관리</span>
                </Link>
                <div className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                  <span className="text-orange-400"><Icons.Clipboard /></span>
                  <span className="text-sm font-medium">전체 회원 조회</span>
                </div>
              </div>
            </div>

            {/* Contents (현재 페이지 Active) */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contents</div>
              <div className="space-y-1">
                {/* Active 상태 스타일 적용 */}
                <Link to="/mypage/leturereport" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                  <span className="text-pink-500"><Icons.Siren /></span>
                  <span className="text-sm font-bold">강의 신고 관리</span>
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Support</div>
              <div className="space-y-1">
                <Link to="/mypage/suggestonsmanage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-[#A78BFA]"><Icons.MessageSquare /></span>
                  <span className="text-sm font-medium">건의 사항 관리</span>
                </Link>
                <div className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                   <span className="text-rose-500"><Icons.Megaphone /></span>
                  <span className="text-sm font-medium">공지 사항 작성</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* --- 오른쪽 메인 컨텐츠 --- */}
        <main className="flex-1 ml-64 p-8 lg:p-12">
          
          <div className="flex justify-between items-end mb-8">
             <div>
                <h1 className="text-2xl font-bold text-gray-900">강의 신고 관리</h1>
                <span className="text-sm text-gray-500 mt-2 block">접수된 강의 신고 내역을 확인하고 처리합니다.</span>
             </div>
          </div>

          {/* 테이블 카드 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4 w-[10%] text-center">NO</th>
                    <th className="px-6 py-4 w-[15%]">구분</th>
                    <th className="px-6 py-4 w-[35%]">신고 대상 (강의 제목)</th>
                    <th className="px-6 py-4 w-[25%]">신고 사유</th>
                    <th className="px-6 py-4 w-[15%] text-right">신고자</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* 데이터 맵핑 (현재는 빈 상태) */}
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      {/* 데이터 렌더링 로직 추가 예정 */}
                    </tr>
                  ))}
                  
                  {/* 데이터가 없을 때 */}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan="5" className="h-[500px]">
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                           <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                              <Icons.AlertTriangle />
                           </div>
                           <span className="font-medium text-gray-500">접수된 신고 내역이 없습니다.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 페이지네이션 */}
            <div className="mt-auto border-t border-gray-100 p-4 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500">
                  총 신고 내역: <strong className="text-gray-900">{reports.length}</strong>건
              </span>
              <div className="flex items-center gap-1">
                <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 transition-colors"><Icons.ChevronLeft /></button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#FF6B4A] text-white font-bold text-sm shadow-sm">1</button>
                <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 transition-colors"><Icons.ChevronRight /></button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default LectureReport;
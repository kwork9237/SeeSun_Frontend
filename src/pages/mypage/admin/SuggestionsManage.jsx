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
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  FileText: () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
  )
};

const SuggestionsManage = () => {
  // 1. 상태 관리: 건의사항 목록, 로딩 상태
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };

  // 3. 백엔드 데이터 Fetch (useEffect)
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // AdminController에 만든 주소 호출
        const response = await axios.get('http://localhost:8080/api/admin/suggestions');
        console.log('건의사항 데이터:', response.data);
        setSuggestions(response.data);
      } catch (error) {
        console.error('건의사항 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-800 font-sans">
      
      {/* 1. 상단 네비게이션 (헤더) */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full top-0 z-20">
        {/* 로고 영역 */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer text-inherit no-underline">
          <span className="text-orange-500 text-2xl leading-none">●</span> 
          <span className="font-bold text-xl tracking-tight text-gray-900">LinguaConnect</span>
        </Link>

        {/* 우측 유저 메뉴 */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">관리자</span>님, 환영합니다.
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
            로그아웃
          </button>
        </div>
      </header>

      {/* 2. 메인 레이아웃 */}
      <div className="flex flex-1 pt-16">
        
        {/* 왼쪽 사이드바 */}
        <aside className="w-64 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto z-10 flex flex-col pt-8 px-6">
          
          {/* 프로필 섹션 */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
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
              <Link to="/mypage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <span className="text-orange-500"><Icons.Home /></span>
                <span className="text-sm font-medium">홈</span>
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
                <div className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                  <span className="text-orange-400"><Icons.Clipboard /></span>
                  <span className="text-sm font-medium">전체 회원 조회</span>
                </div>
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
                <Link to="/mypage/suggestonsmanage" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                  <span className="text-[#A78BFA]"><Icons.MessageSquare /></span>
                  <span className="text-sm font-bold">건의 사항 관리</span>
                </Link>
                {/* --- 공지 사항 작성 (Notification) 링크 적용 --- */}
                <Link to="/mypage/notification" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                   <span className="text-rose-500"><Icons.Megaphone /></span>
                  <span className="text-sm font-medium">공지 사항 작성</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* 오른쪽 메인 컨텐츠 */}
        <main className="flex-1 ml-64 p-10 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto">
            
            {/* 페이지 헤더 */}
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">건의 사항 관리</h1>
                <p className="text-sm text-gray-500 mt-2">사용자가 접수한 건의 사항을 확인하고 관리합니다.</p>
              </div>
              <div className="flex gap-2">
                 <select className="border border-gray-200 rounded text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm">
                   <option>전체 보기</option>
                   <option>처리중</option>
                   <option>완료</option>
                 </select>
              </div>
            </div>

            {/* 게시판 테이블 영역 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
              
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-[80px_100px_1fr_120px_120px_100px] bg-[#F9FAFB] border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-6 text-center">
                <div>NO</div>
                <div>구분</div>
                <div className="text-left px-2">제목</div>
                <div>작성자</div>
                <div>작성일</div>
                <div>상태</div>
              </div>

              {/* 테이블 바디 */}
              <div className="divide-y divide-gray-50 flex-1">
                {/* 로딩 중일 때 표시 */}
                {loading && (
                    <div className="p-10 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
                )}

                {/* 데이터 렌더링 */}
                {!loading && suggestions.map((item) => (
                  <div 
                    key={item.sgId} 
                    className="grid grid-cols-[80px_100px_1fr_120px_120px_100px] py-4 px-6 items-center text-sm hover:bg-gray-50 transition-colors cursor-pointer text-center"
                  >
                    <div className="text-gray-400">{item.sgId}</div>
                    <div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        일반 {/* DB에 타입 컬럼이 없어서 고정값 */}
                      </span>
                    </div>
                    <div className="text-left px-2 font-medium text-gray-800 truncate">
                      {item.title}
                    </div>
                    <div className="text-gray-600">{item.mbId}</div>
                    <div className="text-gray-500 text-xs">{formatDate(item.createdAt)}</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        접수 {/* DB에 상태 컬럼이 없어서 고정값 */}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* 데이터가 없을 경우 (빈 상태) */}
                {!loading && suggestions.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                     <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                        <Icons.FileText />
                     </div>
                     <span className="text-sm font-medium text-gray-500">등록된 건의 사항이 없습니다.</span>
                   </div>
                )}
              </div>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-8 flex justify-center items-center gap-2">
              <button className="p-2 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
                <Icons.ChevronLeft />
              </button>
              
              <button className="w-9 h-9 flex items-center justify-center rounded bg-orange-500 text-white font-bold text-sm shadow-sm hover:bg-orange-600 transition-colors">
                1
              </button>
              
              <button className="p-2 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
                <Icons.ChevronRight />
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default SuggestionsManage;
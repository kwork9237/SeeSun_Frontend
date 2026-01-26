import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- 아이콘 컴포넌트 ---
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clipboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>,
  Siren: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C4 2 5 5 5 5C5 5 2 7 2 7C2 7 5 5 5 5C5 5 4 2 4 2Z"/><path d="M20 2C20 2 19 5 19 5C19 5 22 7 22 7C22 7 19 5 19 5C19 5 20 2 20 2Z"/></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Megaphone: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  File: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const MentoRequest = () => {
  const [requests, setRequests] = useState([]);
  
  // 승인된 ID들을 저장할 상태 (LocalStorage 연동)
  const [approvedIds, setApprovedIds] = useState(() => {
    const saved = localStorage.getItem('approvedMentoRequests');
    return saved ? JSON.parse(saved) : [];
  });

  // --- 1. 백엔드에서 데이터 조회 ---
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/admin/pending');
        setRequests(response.data);
      } catch (error) {
        console.error('멘토 요청 목록 조회 실패:', error);
      }
    };
    fetchRequests();
  }, []);

  // --- 2. 승인 버튼 핸들러 ---
  const handleApprove = async (reqId, mbId) => {
    if (approvedIds.includes(reqId)) return;

    if (window.confirm(`회원번호 ${mbId}님의 멘토 신청을 승인하시겠습니까?`)) {
      try {
        const response = await axios.post('/api/admin/approve', { reqId: reqId });
        
        if (response.data === "SUCCESS") {
            alert(`회원번호 ${mbId}님이 멘토로 승인되었습니다.`);
            
            const newApprovedIds = [...approvedIds, reqId];
            setApprovedIds(newApprovedIds);
            localStorage.setItem('approvedMentoRequests', JSON.stringify(newApprovedIds));
            
        } else {
            alert("승인 처리에 실패했습니다.");
        }
      } catch (error) {
        console.error("승인 요청 중 에러 발생:", error);
        alert("서버 오류로 승인하지 못했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827] font-sans">
      
      {/* 헤더 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full top-0 z-20">
        <Link to="/" className="flex items-center gap-2 cursor-pointer text-inherit no-underline">
          <span className="text-orange-500 text-2xl leading-none">●</span> 
          <span className="font-bold text-xl tracking-tight text-gray-900">LinguaConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 text-sm font-semibold text-[#FF6B4A] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">Sign In</button>
          <button className="px-4 py-1.5 text-sm font-semibold text-white bg-[#FF6B4A] rounded-lg hover:bg-[#ff5530] shadow-sm transition-colors">Get Started</button>
        </div>
      </header>

      {/* 바디 */}
      <div className="flex flex-1 pt-16">
        
        {/* 사이드바 */}
        <aside className="w-64 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto z-10 flex flex-col pt-8 px-6 border-r border-gray-100">
          
          {/* 프로필 섹션 */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <Icons.Users />
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
                <Link to="/mypage/mentorequests" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                  <span className="text-purple-500"><Icons.Users /></span>
                  <span className="text-sm font-bold">멘토 승인 관리</span>
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
                <Link to="/mypage/suggestonsmanage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-[#A78BFA]"><Icons.MessageSquare /></span>
                  <span className="text-sm font-medium">건의 사항 관리</span>
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

        {/* 메인 컨텐츠 */}
        <main className="flex-1 ml-64 p-8 lg:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
             <div>
                <h1 className="text-2xl font-bold text-gray-900">멘토 신청 승인/반려</h1>
                <span className="text-sm text-gray-500 mt-2 block">신청자의 정보를 확인하고 승인 처리합니다.</span>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4 w-[25%]">신청자 ID</th>
                    <th className="px-6 py-4 w-[35%]">상세 정보</th>
                    <th className="px-6 py-4 w-[25%]">첨부 파일</th>
                    <th className="px-6 py-4 w-[15%] text-center">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => {
                    const isApproved = approvedIds.includes(req.reqId);

                    return (
                      <tr key={req.reqId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold mr-3 shrink-0">M</div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">회원번호: {req.mbId}</span>
                              <span className="text-xs text-gray-500">ID: {req.mbId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex flex-col">
                             <div className="flex items-center mb-1">
                                  <span className="bg-orange-100 text-[#FF6B4A] text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 mr-2">요청내용</span>
                                  <span className="text-xs font-semibold text-gray-700">전문 멘토 신청</span>
                             </div>
                             <span className="text-xs text-gray-500 leading-snug break-keep">{req.details}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center p-2 border border-gray-200 rounded-lg bg-gray-50 max-w-fit cursor-pointer hover:bg-gray-100 transition-all">
                            <Icons.File className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600 underline decoration-gray-400 underline-offset-2 truncate max-w-[150px]">
                              {req.attachment || '파일 없음'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                            <button 
                              onClick={() => !isApproved && handleApprove(req.reqId, req.mbId)} 
                              disabled={isApproved}
                              className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-colors whitespace-nowrap
                                ${isApproved 
                                  ? 'bg-gray-300 text-red-600 cursor-not-allowed'
                                  : 'text-white bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                              {isApproved ? '승인완료' : '승인'}
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="4" className="h-[500px]">
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                           <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300"><Icons.Clipboard /></div>
                           <span className="font-medium text-gray-500">등록된 요청이 없습니다.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-auto border-t border-gray-100 p-4 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500">대기 중인 신청: <strong className="text-gray-900">{requests.filter(r => !approvedIds.includes(r.reqId)).length}</strong>건</span>
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

export default MentoRequest;
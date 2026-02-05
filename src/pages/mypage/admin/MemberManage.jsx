import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- 아이콘 컴포넌트 ---
const Icons = {
  Home: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Users: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Clipboard: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>),
  Siren: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C4 2 5 5 5 5C5 5 2 7 2 7C2 7 5 5 5 5C5 5 4 2 4 2Z"/><path d="M20 2C20 2 19 5 19 5C19 5 22 7 22 7C22 7 19 5 19 5C19 5 20 2 20 2Z"/></svg>),
  MessageSquare: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  Megaphone: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>),
  Search: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const MemberManage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(""); 

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getRoleName = (typeId) => {
    switch (typeId) {
      case 0: return <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">관리자</span>;
      case 1: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">일반 회원</span>;
      case 2: return <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-bold">멘토</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded text-xs">기타</span>;
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/members', {
        params: { keyword: keyword } 
      });
      setMembers(response.data);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchMembers();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-800 font-sans">
      
      {/* 헤더 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full top-0 z-20">
        <Link to="/" className="flex items-center gap-2 cursor-pointer text-inherit no-underline">
          <span className="text-orange-500 text-2xl leading-none">●</span> 
          <span className="font-bold text-xl tracking-tight text-gray-900">LinguaConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600"><span className="font-semibold text-gray-800">관리자</span>님, 환영합니다.</div>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded hover:bg-gray-100 transition-colors">로그아웃</button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* 사이드바 */}
        <aside className="w-64 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto z-10 flex flex-col pt-8 px-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-base">Administrator</span>
              <span className="text-[10px] font-bold text-[#FF6B4A] bg-[#FFF0EB] px-2 py-0.5 rounded-sm w-fit mt-1">MASTER</span>
            </div>
          </div>

          <nav className="flex-1 space-y-8">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dashboard</div>
              <Link to="/mypage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <span className="text-orange-500"><Icons.Home /></span>
                <span className="text-sm font-medium">홈</span>
              </Link>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Management</div>
              <div className="space-y-1">
                <Link to="/mypage/mentorequests" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-purple-500"><Icons.Users /></span>
                  <span className="text-sm font-medium">멘토 승인 관리</span>
                </Link>
                <Link to="/mypage/members" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                  <span className="text-orange-400"><Icons.Clipboard /></span>
                  <span className="text-sm font-bold">전체 회원 조회</span>
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contents</div>
              <div className="space-y-1">
                <Link to="/mypage/leturereport" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-pink-500"><Icons.Siren /></span>
                  <span className="text-sm font-medium">강의 신고 관리</span>
                </Link>
              </div>
            </div>
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

        {/* 메인 컨텐츠 */}
        <main className="flex-1 ml-64 p-10 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">전체 회원 조회</h1>
                <p className="text-sm text-gray-500 mt-2">가입된 모든 회원의 정보를 조회하고 관리합니다.</p>
              </div>
              
              {/* [수정] 검색바 + 파란색 버튼 */}
              <div className="flex gap-2">
                 <div className="relative">
                    <input 
                       type="text" 
                       placeholder="이름, 아이디, 닉네임 검색" 
                       className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 shadow-sm w-64"
                       value={keyword}
                       onChange={(e) => setKeyword(e.target.value)}
                       onKeyDown={handleKeyDown}
                    />
                    <span 
                       className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
                       onClick={fetchMembers}
                    >
                       <Icons.Search />
                    </span>
                 </div>
                 {/* [추가] 파란색 검색 버튼 */}
                 <button 
                    onClick={fetchMembers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm shadow-sm"
                 >
                    검색
                 </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider text-center">
                      <th className="px-6 py-4 w-[8%]">NO</th>
                      <th className="px-6 py-4 w-[22%] text-left">아이디 (Username)</th>
                      <th className="px-6 py-4 w-[15%]">이름</th>
                      <th className="px-6 py-4 w-[15%]">닉네임</th>
                      <th className="px-6 py-4 w-[15%]">전화번호</th>
                      <th className="px-6 py-4 w-[10%]">유형</th>
                      <th className="px-6 py-4 w-[15%]">가입일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-center text-sm text-gray-700">
                    {loading && (
                       <tr><td colSpan="7" className="p-10 text-gray-500">데이터를 불러오는 중입니다...</td></tr>
                    )}

                    {!loading && members.map((member) => (
                      <tr key={member.mbId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-400">{member.mbId}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 text-left">{member.username}</td>
                        <td className="px-6 py-4">{member.name}</td>
                        <td className="px-6 py-4">{member.nickname}</td>
                        <td className="px-6 py-4 text-gray-500">{member.phone || '-'}</td>
                        <td className="px-6 py-4">{getRoleName(member.mbTypeId)}</td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(member.createdAt)}</td>
                      </tr>
                    ))}

                    {!loading && members.length === 0 && (
                       <tr><td colSpan="7" className="p-20 text-gray-400">검색 결과가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
};

export default MemberManage;
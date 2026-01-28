import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 아이콘 컴포넌트 ---
const Icons = {
  Home: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Users: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Clipboard: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>),
  Siren: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C4 2 5 5 5 5C5 5 2 7 2 7C2 7 5 5 5 5C5 5 4 2 4 2Z"/><path d="M20 2C20 2 19 5 19 5C19 5 22 7 22 7C22 7 19 5 19 5C19 5 20 2 20 2Z"/></svg>),
  MessageSquare: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  Megaphone: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>),
  ArrowLeft: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>),
  // Trash 아이콘 사용하지 않음
};

const SuggestionDetail = () => {
  const { sgId } = useParams();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/suggestions/${sgId}`);
        setSuggestion(response.data);
      } catch (error) {
        console.error('건의사항 상세 조회 실패:', error);
        alert('존재하지 않거나 삭제된 게시글입니다.');
        navigate('/mypage/suggestonsmanage');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [sgId, navigate]);

  // handleDelete 함수 삭제됨

  if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
  if (!suggestion) return null;

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
                <div className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                  <span className="text-orange-400"><Icons.Clipboard /></span>
                  <span className="text-sm font-medium">전체 회원 조회</span>
                </div>
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
                <Link to="/mypage/suggestonsmanage" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                  <span className="text-[#A78BFA]"><Icons.MessageSquare /></span>
                  <span className="text-sm font-bold">건의 사항 상세</span>
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">건의 사항 상세</h1>
                <p className="text-sm text-gray-500 mt-2">사용자가 보낸 건의 사항 내용을 확인합니다.</p>
              </div>
              <button onClick={() => navigate('/mypage/suggestonsmanage')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
                <Icons.ArrowLeft /> 목록으로
              </button>
            </div>

            {/* 내용 카드 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{suggestion.title}</h2>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">작성자</span><span>{suggestion.mbId}</span></div>
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">작성일</span><span>{formatDate(suggestion.createdAt)}</span></div>
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">조회수</span><span>{suggestion.viewCount}</span></div>
                </div>
              </div>
              <div className="p-8 min-h-[300px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {suggestion.content}
              </div>
            </div>

            {/* 하단 버튼 그룹 제거됨 */}
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default SuggestionDetail;
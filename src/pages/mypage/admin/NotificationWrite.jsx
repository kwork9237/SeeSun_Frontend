import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 아이콘 컴포넌트 ---
const Icons = {
  Home: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Users: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Clipboard: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>),
  Siren: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C4 2 5 5 5 5C5 5 2 7 2 7C2 7 5 5 5 5C5 5 4 2 4 2Z"/><path d="M20 2C20 2 19 5 19 5C19 5 22 7 22 7C22 7 19 5 19 5C19 5 20 2 20 2Z"/></svg>),
  MessageSquare: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  Megaphone: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>),
  Save: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>),
  X: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 12"/></svg>)
};

const NotificationWrite = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    // 관리자(작성자)의 실제 회원 번호(PK)를 넣어야 합니다. (예: 1)
    mbId: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    try {
      await axios.post('/api/admin/notices', formData);
      alert('공지사항이 등록되었습니다.');
      navigate('/mypage/notification');
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
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
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">관리자</span>님, 환영합니다.
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 pt-16">
        
        {/* 사이드바 (모든 메뉴 포함) */}
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
            {/* Dashboard */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dashboard</div>
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

            {/* Contents */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contents</div>
              <div className="space-y-1">
                <Link to="/mypage/leturereport" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-pink-500"><Icons.Siren /></span>
                  <span className="text-sm font-medium">강의 신고 관리</span>
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
                {/* 현재 활성화된 메뉴 표시 (공지사항) */}
                <Link to="/mypage/notification" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                   <span className="text-rose-500"><Icons.Megaphone /></span>
                  <span className="text-sm font-bold">공지 사항 작성</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* 오른쪽 메인 컨텐츠 */}
        <main className="flex-1 ml-64 p-10 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">공지 사항 등록</h1>
              <p className="text-sm text-gray-500 mt-2">새로운 공지사항을 작성하여 회원들에게 알립니다.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="mb-8">
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="공지 내용을 상세히 입력하세요..."
                  className="w-full h-64 px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Link 
                  to="/mypage/notification" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  <Icons.X />
                  취소
                </Link>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF6B4A] text-white font-bold text-sm hover:bg-[#ff5530] shadow-sm hover:shadow transition-all"
                >
                  <Icons.Save />
                  등록 완료
                </button>
              </div>

            </form>

          </div>
        </main>
      </div>
    </div>
  );
}

export default NotificationWrite;
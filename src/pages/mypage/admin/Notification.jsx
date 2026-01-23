'use client';

import { useState } from 'react';

const Notification = () => {
  // 샘플 데이터 (공지사항 목록)
  const [notices, setNotices] = useState([
    { id: 1, title: '2월 시스템 점검 안내', writer: '관리자', lastModified: '2026-01-23 14:00', views: 125, status: '공개' },
    { id: 2, title: '개인정보 처리방침 변경 안내', writer: '운영팀', lastModified: '2026-01-20 09:30', views: 342, status: '공개' },
    { id: 3, title: '신규 멘토링 기능 업데이트', writer: '관리자', lastModified: '2026-01-15 18:00', views: 890, status: '비공개' },
  ]);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans text-gray-700">
      
      {/* ================= 사이드바 (Sidebar) ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 flex items-center gap-2">
          {/* 로고 영역 */}
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-xl font-bold text-gray-800">LinguaConnect</span>
        </div>

        {/* 프로필 카드 */}
        <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
            <IconUser size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-800">Administrator</div>
            <div className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold inline-block">MASTER</div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="px-4 space-y-6">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">DASHBOARD</div>
            {/* 홈: 주황색 집 아이콘 */}
            <MenuItem icon={<IconHome size={18} className="text-orange-500" />} text="홈" />
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">MANAGEMENT</div>
            {/* 멘토 승인: 보라색 유저 아이콘 */}
            <MenuItem icon={<IconUsers size={18} className="text-violet-500" />} text="멘토 승인 관리" />
            {/* 전체 회원: 주황색 파일/문서 아이콘 */}
            <MenuItem icon={<IconFile size={18} className="text-orange-500" />} text="전체 회원 조회" />
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">CONTENTS</div>
            {/* 강의 신고: 핑크색 종 아이콘 */}
            <MenuItem icon={<IconBell size={18} className="text-pink-500" />} text="강의 신고 관리" />
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">SUPPORT</div>
            {/* 건의 사항: 보라색 말풍선 아이콘 */}
            <MenuItem icon={<IconMessageSquare size={18} className="text-violet-500" />} text="건의 사항 관리" />
            
            {/* [변경됨] 공지 사항 관리: 붉은색 확성기 아이콘 적용 */}
            <MenuItem icon={<IconMegaphone size={18} className="text-rose-500" />} text="공지 사항 관리" active />
          </div>
        </nav>
      </aside>

      {/* ================= 메인 영역 (Header + Content) ================= */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* 헤더 (Header) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">관리자</span>님, 환영합니다.
            </span>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              <IconLogOut size={14} />
              로그아웃
            </button>
          </div>
        </header>

        {/* 컨텐츠 (Main Content) */}
        <main className="p-8">
          {/* 페이지 타이틀 섹션 */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">공지 사항 관리</h1>
              <p className="text-gray-500 text-sm">등록된 공지 사항 목록을 확인하고 관리합니다.</p>
            </div>
            
            {/* 필터 드롭다운 */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">
                전체 보기
                <IconChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* 테이블 영역 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">NO</th>
                  <th className="px-6 py-4">제목</th>
                  <th className="px-6 py-4 w-32 text-center">작성자</th>
                  <th className="px-6 py-4 w-48 text-center">마지막 수정 시간</th>
                  <th className="px-6 py-4 w-24 text-center">조회수</th>
                  <th className="px-6 py-4 w-24 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notices.length > 0 ? (
                  notices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-center text-gray-400">{notice.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-700">{notice.title}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{notice.writer}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{notice.lastModified}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{notice.views}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          notice.status === '공개' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {notice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  // 데이터가 없을 때 표시
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <IconMegaphone size={24} className="text-gray-300" />
                        </div>
                        <p>등록된 공지 사항이 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 하단 공지사항 작성 버튼 영역 */}
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-sm">
              <IconPen size={16} />
              공지 사항 작성
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

// 사이드바 메뉴 아이템 컴포넌트
const MenuItem = ({ icon, text, active = false }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        active
          ? 'bg-orange-50 text-orange-600 font-bold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
};

/* =================================================================
   아이콘 컴포넌트 정의 (lucide-react 대체용 SVG)
   ================================================================= */
const IconHome = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const IconUsers = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const IconFile = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const IconBell = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const IconMessageSquare = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

// [추가] 확성기 아이콘 (Megaphone)
const IconMegaphone = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
);

const IconLogOut = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

const IconChevronDown = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const IconUser = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const IconPen = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);

export default Notification;
import React from 'react';

const LectureReport = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">
      
      {/* 1. 헤더 (상단 네비게이션) */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white fixed w-full top-0 z-10 box-border">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-bold text-xl">
            <span className="text-orange-500 text-2xl">●</span> 
            <span>LinguaConnect</span>
          </div>
        </div>

        {/* 네비게이션 링크 */}
        <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
          {['How it Works', 'Languages', 'Mentors', 'Pricing'].map((item) => (
            <button 
              key={item} 
              className="bg-transparent border-none cursor-pointer text-inherit hover:text-gray-900 transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* 인증 버튼 */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 border border-orange-300 text-orange-500 rounded bg-transparent cursor-pointer hover:bg-orange-50 transition-colors">
            Sign In
          </button>
          <button className="px-4 py-1.5 bg-orange-500 text-white rounded border-none cursor-pointer shadow-sm hover:bg-orange-600 transition-colors">
            Get Started
          </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 레이아웃 (사이드바 + 본문) */}
      <div className="flex flex-1 pt-16">
        
        {/* 왼쪽 사이드바 */}
        <aside className="w-64 flex flex-col border-r border-gray-200 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto bg-white p-6 box-border z-0">
          
          {/* 프로필 영역 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">관리자 페이지</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="font-semibold text-sm">admin</div>
                <span className="text-xs bg-gray-100 border border-gray-300 px-2 py-[2px] rounded-full text-gray-500 inline-block mt-1">
                  관리자
                </span>
              </div>
            </div>
          </div>

          {/* 메뉴 네비게이션 */}
          <nav className="flex flex-col gap-6">
            
            {/* 대시보드 */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">대시보드</div>
              <div className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="text-sm">홈</span>
              </div>
            </div>

            {/* 회원 관리 */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">회원 관리</div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                <li className="p-2 border border-gray-200 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                  멘토 승인 관리 (요청 기능 N)
                </li>
                <li className="p-2 border border-gray-200 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                  전체 회원 조회 (선택사항)
                </li>
              </ul>
            </div>

            {/* 콘텐츠 관리 (현재 활성화됨) */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">콘텐츠 관리</div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                {/* 활성화 스타일 적용: 진한 테두리, 굵은 글씨, 배경색 */}
                <li className="p-2 border border-gray-300 rounded text-sm font-bold bg-gray-50 cursor-pointer text-gray-800 shadow-sm">
                  강의 신고 관리 (요청 기능 N)
                </li>
              </ul>
            </div>

            {/* 고객센터 관리 */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">고객센터 관리</div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                <li className="p-2 border border-gray-200 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                  건의 사항 관리 (요청 기능 N)
                </li>
                <li className="p-2 border border-gray-200 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                  공지 사항 작성
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* 오른쪽 메인 콘텐츠 */}
        <main className="flex-1 ml-64 p-10 bg-white">
          <h1 className="text-2xl font-bold mb-6">강의 신고 관리 (게시판 형식)</h1>

          {/* 테이블 영역 */}
          <div className="border border-gray-300 rounded-lg min-h-[500px] flex flex-col shadow-sm">
            
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[0.5fr_1fr_3fr_3fr_1fr] gap-4 border-b border-gray-300 p-4 font-bold text-lg bg-white rounded-t-lg items-center">
              <div>NO</div>
              <div>구분</div>
              <div>신고 대상 (강의 제목)</div>
              <div>신고 사유</div>
              <div className="text-right">신고자</div>
            </div>

            {/* 테이블 본문 (텍스트 설명) */}
            <div className="flex-1 p-6 text-gray-800 text-lg leading-loose">
              <p>신고 접수된 강의 리스트</p>
              <p>신고 접수된 강의 리스트 클릭 시 상세 모달 출력</p>
              <p>구분 : 강의 상세 페이지, 추후 개발될 녹화 영상에 대한 구분</p>
            </div>

          </div>

          {/* 페이징 처리 (하단) */}
          <div className="mt-8 text-center text-gray-700 font-bold">
            페이징 처리
          </div>
        </main>

      </div>
    </div>
  );
}

export default LectureReport;
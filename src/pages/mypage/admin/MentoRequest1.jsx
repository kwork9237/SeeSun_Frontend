// 멘토 요청 관리 페이지

import React, { useState } from 'react';
import { Home, User } from 'lucide-react';

const mentoRequests1 = () => {
  // 실제 데이터가 들어올 상태 (초기값은 빈 배열)
  const [mentoRequests, setMentoRequests] = useState([]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
      
      {/* --- Top Navigation Header --- */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="text-orange-500 text-2xl">
            {/* 로고 아이콘 */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="inline-block"
            >
              <circle cx="9" cy="12" r="6" fill="#F97316" />
              <circle cx="15" cy="12" r="6" fill="#F97316" fillOpacity="0.7" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            LinguaConnect
          </span>
        </div>

        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-orange-500">How it Works</a>
          <a href="#" className="hover:text-orange-500">Languages</a>
          <a href="#" className="hover:text-orange-500">Mentors</a>
          <a href="#" className="hover:text-orange-500">Pricing</a>
        </nav>

        <div className="flex items-center space-x-3">
          <button className="px-5 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded hover:bg-orange-50 transition">
            Sign In
          </button>
          <button className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600 shadow-sm transition">
            Get Started
          </button>
        </div>
      </header>

      {/* --- Main Body Layout --- */}
      <div className="flex flex-1">
        
        {/* --- Sidebar (Left) --- */}
        <aside className="w-64 border-r border-gray-200 p-6 flex flex-col space-y-8 bg-white">
          <div className="mb-2">
            <h2 className="text-lg font-bold mb-4">관리자 페이지</h2>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <User size={24} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">admin</div>
                <div className="mt-1">
                  <span className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-500">
                    관리자
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-gray-500 mb-2">대시보드</div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded border border-gray-200 text-gray-900 font-medium cursor-pointer">
                <Home size={18} />
                <span>홈</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-500 mb-2">회원 관리</div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>멘토 승인 관리 (요청 기능 N)</span>
                </li>
                <li className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>전체 회원 조회 (선택 사항)</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-500 mb-2">콘텐츠 관리</div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>강의 신고 관리 (요청 기능 N)</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-500 mb-2">고객센터 관리</div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>건의 사항 관리 (요청 기능 N)</span>
                </li>
                <li className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>공지 사항 작성</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* --- Main Content (Right) --- */}
        <main className="flex-1 p-10 bg-white">
          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            신규 멘토 신청자 (게시판 형식)
          </h1>

          <div className="border border-gray-200 rounded-lg shadow-sm min-h-[500px] flex flex-col">
            
            {/* Header Column */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                신규 멘토 신청자 정보 컬럼들
              </h3>
            </div>

            {/* List Area */}
            <div className="flex-1 p-6 space-y-4">
              {mentoRequests.length > 0 ? (
                mentoRequests.map((request, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded transition-colors"
                  >
                    <div className="text-lg font-medium text-gray-900">
                      {/* 데이터 필드명은 백엔드 응답에 맞춰 수정하세요 */}
                      {request.title} 
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                      정보 상세보기
                    </button>
                  </div>
                ))
              ) : (
                /* 데이터가 없을 경우 보여질 화면 (선택 사항) */
                <div className="h-full flex items-center justify-center text-gray-400">
                  {/* 데이터가 없습니다. */}
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="py-6 border-t border-gray-100 flex justify-center items-center">
              <span className="text-gray-500 font-medium">페이징 처리</span>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};

export default mentoRequests1;
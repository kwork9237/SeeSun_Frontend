import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const MainHeader = () => {
  return (
    // h-20: 높이 80px
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 h-20">
      
      {/* ★ 수정된 부분 ★
        기존: max-w-7xl mx-auto (가운데로 모음)
        변경: w-full px-10 (화면 꽉 채우고 양옆 여백만 줌)
      */}
      <div className="w-full h-full flex items-center justify-between px-6 md:px-10">
        
        {/* 1. 로고 (왼쪽 끝) */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-orange-500 transform group-hover:scale-110 transition-transform duration-200">
             <MessageCircle size={32} fill="currentColor" className="text-orange-500" />
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans">
            Lingua<span className="text-orange-500">Connect</span>
          </span>
        </Link>

        {/* 2. 가운데 메뉴 링크 (화면 작으면 숨김) */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          <NavLink href="#" label="How it Works" />
          <NavLink href="#" label="Languages" />
          <NavLink href="#" label="Mentors" />
          <NavLink href="#" label="Pricing" />
        </nav>

        {/* 3. 우측 버튼 영역 (오른쪽 끝) */}
        <div className="flex items-center gap-3">
          <button 
            className="px-5 py-2.5 text-orange-500 font-bold border-2 border-orange-500 rounded-lg 
                       hover:bg-orange-50 transition-all duration-200 text-sm"
          >
            Sign In
          </button>

          <button 
            className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-lg border-2 border-orange-500
                       hover:bg-orange-600 hover:border-orange-600 shadow-sm transition-all duration-200 text-sm"
          >
            Get Started
          </button>
        </div>

      </div>
    </header>
  );
};

// 메뉴 링크용 컴포넌트
const NavLink = ({ href, label }) => (
  <a 
    href={href} 
    className="text-gray-600 font-medium hover:text-orange-500 transition-colors duration-200 text-sm lg:text-base"
  >
    {label}
  </a>
);

export default MainHeader;
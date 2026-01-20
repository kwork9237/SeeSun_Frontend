// 마이페이지 등 기존 푸터가 너무 부담스러운 경우 사용하는 푸터
import React from 'react';
import { Link } from 'react-router-dom';

const SimpleFooter = () => {
  return (
    <footer className="py-6 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-400">
        <p>© 2026 SeeSun. All rights reserved.</p>
        <div className="flex gap-4">
            <Link to="/Privacy" className="hover:text-gray-600">개인정보처리방침</Link>
            <Link to="/Terms" className="hover:text-gray-600">이용약관</Link>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
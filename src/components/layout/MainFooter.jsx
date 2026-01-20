import React from 'react';
import { Link } from 'react-router-dom';

const MainFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 하단: 링크 모음 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Learn 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wider">Learn</h3>
            <ul className="space-y-4 text-sm">
              {/* 튜터 찾기 -> 강의 찾기(LectureList) */}
              <li><Link to="/LectureList" className="hover:text-primary transition">강의 찾기</Link></li>
              {/* 통합 대시보드(마이페이지)로 연결 */}
              <li><Link to="/MyPage" className="hover:text-primary transition">1:1 화상 강의실</Link></li>
            </ul>
          </div>

          {/* Teach 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wider">Teach</h3>
            <ul className="space-y-4 text-sm">
              {/* 멘토 지원/가입 페이지(Mento) */}
              <li>
                <Link to="/Mento" className="text-white font-bold hover:text-secondary transition flex items-center gap-2">
                  멘토 지원하기 <span className="bg-secondary text-[10px] px-1.5 rounded text-white">HOT</span>
                </Link>
              </li>
              <li><Link to="/GuideMentor" className="hover:text-primary transition">강사 가이드</Link></li>
              <li><Link to="/GuidePayment" className="hover:text-primary transition">수익 정산 안내</Link></li>
            </ul>
          </div>

          {/* Support 섹션 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base uppercase tracking-wider">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/Suggestions" className="hover:text-primary transition">공지사항</Link></li>
              <li><Link to="/FAQ" className="hover:text-primary transition">자주 묻는 질문</Link></li>
            </ul>
          </div>
        </div>

        {/* 최하단: Copyright 및 팀명 */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 SeeSun. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/Privacy" className="hover:text-white transition">개인정보처리방침</Link>
            <Link to="/Terms" className="hover:text-white transition">이용약관</Link>
            <span className="text-slate-400 font-medium">Designed by Team SeeSun</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
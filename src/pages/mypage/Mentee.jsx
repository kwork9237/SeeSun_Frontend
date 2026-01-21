import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
// Heart(찜하기), Settings(설정) 아이콘 추가
import { Home, BookOpen, User, CreditCard, UserX, Heart } from 'lucide-react';

const Mentee = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* [왼쪽] 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        
        {/* 프로필 영역 */}
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={20}/>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">사용자 이름</div>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">멘티</span>
              </div>
            </div>
        </div>

        {/* 메뉴 리스트 (그룹화 적용) */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          
          {/* 1. 대시보드 그룹 */}
          <MenuGroup label="대시보드">
            <SidebarItem to="/mentee/home" icon={<Home size={18}/>} label="홈" />
          </MenuGroup>

          {/* 2. 강의 그룹 */}
          <MenuGroup label="강의">
            <SidebarItem to="/mentee/classes" icon={<BookOpen size={18}/>} label="내 강의실" />
            {/* 아직 페이지가 없으므로 클릭 안 되게 처리 (예시) */}
          </MenuGroup>

          {/* 3. 회원 설정 그룹 */}
          <MenuGroup label="회원 설정">
            <SidebarItem to="/mentee/profile" icon={<User size={18}/>} label="프로필 설정" />
            <SidebarItem to="/mentee/payments" icon={<CreditCard size={18}/>} label="결제 내역" />
          </MenuGroup>

        </nav>

        {/* 하단 버튼 영역 */}
        <div className="p-4 border-t border-gray-100 space-y-1 bg-white">
            <button 
              className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
            >
              <UserX size={16} /> 회원 탈퇴
            </button>

        </div>
      </aside>

      {/* [오른쪽] 메인 컨텐츠 */}
      <main className="flex-1 min-w-0">
          <div className="p-10 pb-20">
            <Outlet />
          </div>
      </main>

    </div>
  );
};

// [새로 만든 컴포넌트] 메뉴 그룹 (소제목 + 아이템들)
const MenuGroup = ({ label, children }) => {
  return (
    <div className="flex flex-col gap-1">
      {/* 소제목 스타일 */}
      <span className="text-xs font-bold text-gray-400 px-4 mb-1">{label}</span>
      {children}
    </div>
  );
};

// 사이드바 아이템 디자인
const SidebarItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
         ${isActive 
           ? 'bg-orange-50 text-orange-600' 
           : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Mentee;
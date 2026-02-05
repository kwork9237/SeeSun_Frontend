import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, User, Clipboard, Siren, MessageSquare, Megaphone } from "lucide-react";

const Admin = () => {
  return (
    <div className="flex min-h-screen pt-20 bg-gray-50 font-sans">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-20 h-[calc(100vh-5rem)] z-10">
        {/* 프로필 영역 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
              <User size={20} />
            </div>
            <div>
              {/* ★ 받아온 닉네임 표시 */}
              <div className="font-bold text-gray-900 text-sm">
                Administrator
              </div>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                MASTER
              </span>
            </div>
          </div>
        </div>
        
        {/* 메뉴 리스트 */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <MenuGroup label="대시보드">
            <SidebarItem
              to="home"
              icon={<Home size={18} />}
              label="홈"
            />
          </MenuGroup>

          <MenuGroup label="관리">
            <SidebarItem
              to="mentorequests"
              icon={<Users size={18} />}
              label="멘토 승인 관리"
            />
            <SidebarItem
              to="membermanage"
              icon={<Clipboard size={18} />}
              label="전체 회원 조회"
            />
          </MenuGroup>

          <MenuGroup label="콘텐츠">
            <SidebarItem
              to="leturereport"
              icon={<Siren size={18} />}
              label="강의 신고 관리"
            />
          </MenuGroup>

          <MenuGroup label="지원">
            <SidebarItem
              to="suggestonsmanage"
              icon={<MessageSquare size={18} />}
              label="건의 사항 관리"
            />
            <SidebarItem
              to="notification"
              icon={<Megaphone size={18} />}
              label="공지 사항 작성"
            />
          </MenuGroup>
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 min-w-0">
        <div className="p-10 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// 하위 컴포넌트 유지
const MenuGroup = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-bold text-gray-400 px-4 mb-1">{label}</span>
    {children}
  </div>
);

const SidebarItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
       ${isActive ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Admin;
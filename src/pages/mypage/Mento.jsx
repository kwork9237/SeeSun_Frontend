import { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { Home, BookOpen, User, CreditCard, UserX, AlertTriangle, X } from "lucide-react";
import apiClient from "../../api/apiClient";

// AuthContext import
import { useAuth } from "../../auth/AuthContext";

const Mento = () => {
  const navigate = useNavigate();
  
  // [추가] 로그아웃 함수 가져오기
  const { logout } = useAuth();

  // 1. 상태(State) 정의
  const [userInfo, setUserInfo] = useState({
    mbId: null, 
    name: "", 
    nickname: "로딩중...", 
    email: "", 
  });

  const [loading, setLoading] = useState(true);

  // 2. 백엔드에서 정보 가져오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const response = await apiClient.get("/members/profile");
        console.log("백엔드에서 받은 데이터:", response.data);

        setUserInfo({
          mbId: response.data.mbId,
          name: response.data.name,
          nickname: response.data.nickname, 
          email: response.data.email, 
        });
      } catch (error) {
        console.error("정보 로딩 실패:", error);
        if (error.response && error.response.status === 401) {
          // 회원탈퇴후에 메인화면으로 이동하고자 변경함
          logout();
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyInfo();
  }, [navigate, logout]); // ✅ 의존성 추가

  // 3. 회원 탈퇴
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leavePw, setLeavePw] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLeavePw("");
    setConfirmText("");
  };

  const handleDeleteMember = async () => {
    if (!leavePw) return alert("비밀번호를 입력해주세요.");
    if (confirmText !== "회원탈퇴") return alert("'회원탈퇴'라는 문구를 정확히 입력해주세요.");

    try {
      await apiClient.delete("/members/me", {
        data: {
          password: leavePw, 
        },
      });

      alert("탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다. 🙇‍♂️");

      // [수정] AuthContext logout 실행 (헤더 갱신)
      logout();
      
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("탈퇴 실패: 비밀번호가 일치하지 않거나 서버 오류입니다.");
    }
  };

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
              {/* 받아온 닉네임 표시 */}
              <div className="font-bold text-gray-900 text-sm">
                {loading ? "..." : userInfo.nickname}
              </div>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">멘토</span>
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <MenuGroup label="대시보드">
            <SidebarItem to="home" icon={<Home size={18} />} label="홈" />
          </MenuGroup>

          <MenuGroup label="강의">
            <SidebarItem to="classes" icon={<BookOpen size={18} />} label="내 강의실" />
            {/* ✨ [차이점 2] 멘토에게만 있는 '강의 관리' 메뉴 */}
            <SidebarItem
              to="management"
              icon={<BookOpen size={18} />}
              label="내 강의 관리"
            />
          </MenuGroup>

          <MenuGroup label="회원 설정">
            <SidebarItem to="profile" icon={<User size={18} />} label="프로필 설정" />
            <SidebarItem to="payments" icon={<CreditCard size={18} />} label="결제 내역" />
          </MenuGroup>
        </nav>

        {/* 탈퇴 버튼 */}
        <div className="p-4 border-t border-gray-100 space-y-1 bg-white">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
          >
            <UserX size={16} /> 회원 탈퇴
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 min-w-0">
        <div className="p-10 pb-20">
          <Outlet />
        </div>
      </main>

      {/* 회원탈퇴모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-red-100 transform transition-all scale-100">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce-short">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">정말 떠나시겠어요?</h3>
              <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                탈퇴를 원하시면 비밀번호를 입력하고,
                <br />
                아래 입력창에 <span className="text-red-600 font-bold">"회원탈퇴"</span>를
                입력해주세요.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">비밀번호</label>
                <input
                  type="password"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-red-500 transition-colors font-bold text-sm"
                  placeholder="비밀번호를 입력하세요"
                  value={leavePw}
                  onChange={(e) => setLeavePw(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">확인 문구</label>
                <input
                  type="text"
                  placeholder='"회원탈퇴" 입력'
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-red-500 focus:bg-white transition-colors font-bold text-sm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeleteMember()}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 bg-gray-100 text-gray-700 font-black py-4 rounded-xl hover:bg-gray-200 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteMember}
                  className={`flex-1 text-white font-black py-4 rounded-xl shadow-lg transition transform 
                     ${confirmText === "회원탈퇴" ? "bg-red-600 hover:bg-red-700 hover:-translate-y-1 shadow-red-200 cursor-pointer" : "bg-red-300 cursor-not-allowed"}`}
                >
                  탈퇴하기
                </button>
              </div>
            </div>

            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
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

export default Mento;
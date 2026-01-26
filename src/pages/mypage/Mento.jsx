import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, BookOpen, User, CreditCard, UserX, AlertTriangle, X } from 'lucide-react';

const Mento = () => {
  const navigate = useNavigate();
  
  // =========================================================================
  // 사용자 ID 및 정보 (개발용 하드코딩) 나중에 토큰 변환 필요
  // =========================================================================
  const memberId = 3; 
  const userName = "멘토 테스트"; 

  // --- [상태 관리] ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leavePw, setLeavePw] = useState('');       // 비밀번호
  const [confirmText, setConfirmText] = useState(''); // 확인 문구 ("회원탈퇴")

  // --- [모달 닫기 및 초기화] ---
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLeavePw('');
    setConfirmText('');
  };

  // --- [기능] 회원 탈퇴 요청 ---
  const handleDeleteMember = async () => {
    // 1. 비밀번호 입력 확인
    if (!leavePw) return alert("비밀번호를 입력해주세요.");

    // 2. 확인 문구 검사
    if (confirmText !== "회원탈퇴") {
      return alert("'회원탈퇴'라는 문구를 정확히 입력해주세요.");
    }

    try {
      // 임시 API 요청 나중에 토큰 업데이트 필요
      await axios.delete(`/api/member/leave/${memberId}`, {
        data: { password: leavePw } // 백엔드는 password로 받음 (값은 leavePw)
      });

      alert("탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다. 🙇‍♂️");
      
      localStorage.removeItem('accessToken'); 
      localStorage.removeItem('userInfo');

      navigate('/'); 
    } catch (err) {
      console.error(err);
      alert("탈퇴 실패: 비밀번호가 일치하지 않거나 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* [왼쪽] 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen z-10">
        
        {/* 프로필 영역 */}
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                <User size={20}/>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{userName}</div>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">멘토</span>
              </div>
            </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <MenuGroup label="대시보드">
            <SidebarItem to="/mento/Mthome" icon={<Home size={18}/>} label="홈" />
          </MenuGroup>

          <MenuGroup label="강의">
            <SidebarItem to="/mento/Mtclasses" icon={<BookOpen size={18}/>} label="내 강의실" />
            <SidebarItem to="/mento/Mtmanagement" icon={<BookOpen size={18}/>} label="내 강의 관리" />
          </MenuGroup>

          <MenuGroup label="회원 설정">
            <SidebarItem to="/mento/Mtprofile" icon={<User size={18}/>} label="프로필 설정" />
            <SidebarItem to="/mento/Mtpayments" icon={<CreditCard size={18}/>} label="결제 내역" />
          </MenuGroup>
        </nav>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-100 space-y-1 bg-white">
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
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


      {/* ================= [모달] 회원 탈퇴 ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-red-100 transform transition-all scale-100">
             
             {/* 헤더 */}
             <div className="flex flex-col items-center mb-6 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce-short">
                  <AlertTriangle className="text-red-600" size={32} />
               </div>
               <h3 className="text-2xl font-black text-gray-900">정말 떠나시겠어요?</h3>
               <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                 탈퇴를 원하시면 비밀번호를 입력하고,<br/>
                 아래 입력창에 <span className="text-red-600 font-bold">"회원탈퇴"</span>를 입력해주세요.
               </p>
             </div>
             
             {/* 입력 폼 영역 */}
             <div className="space-y-4">
               
               {/* 1. 비밀번호 입력 */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">비밀번호</label>
                 <input 
                   type="password" 
                   placeholder="비밀번호 입력" 
                   className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-red-500 transition-colors font-bold text-sm"
                   value={leavePw} 
                   onChange={(e) => setLeavePw(e.target.value)} 
                 />
               </div>

               {/* 2. 확인 문구 입력 (추가됨) */}
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">확인 문구</label>
                 <input 
                   type="text" 
                   placeholder='"회원탈퇴" 입력' 
                   className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-red-500 focus:bg-white transition-colors font-bold text-sm"
                   value={confirmText} 
                   onChange={(e) => setConfirmText(e.target.value)} 
                   // 엔터키 치면 바로 실행
                   onKeyDown={(e) => e.key === 'Enter' && handleDeleteMember()}
                 />
               </div>
               
               {/* 버튼 그룹 */}
               <div className="flex gap-3 mt-6">
                 <button onClick={closeDeleteModal} className="flex-1 bg-gray-100 text-gray-700 font-black py-4 rounded-xl hover:bg-gray-200 transition">
                    취소
                 </button>
                 <button 
                   onClick={handleDeleteMember} 
                   // 문구가 일치하지 않으면 버튼을 흐릿하게 만듦 (UX)
                   className={`flex-1 text-white font-black py-4 rounded-xl shadow-lg transition transform 
                     ${confirmText === "회원탈퇴" 
                        ? 'bg-red-600 hover:bg-red-700 hover:-translate-y-1 shadow-red-200 cursor-pointer' 
                        : 'bg-red-300 cursor-not-allowed'}`}
                 >
                   탈퇴하기
                 </button>
               </div>
             </div>

             {/* 닫기 버튼 */}
             <button onClick={closeDeleteModal} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600"><X size={24}/></button>
          </div>
        </div>
      )}

    </div>
  );
};

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
       ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Mento;
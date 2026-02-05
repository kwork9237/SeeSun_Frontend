import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../common/Modal"; // 공통 모달 컴포넌트 경로 확인 필요

/**
 * [Layout Component] 마이페이지 사이드바
 * - 와이어프레임 구조 반영: 대시보드 / 강의 / 회원 설정
 */
const Sidebar = ({ memberInfo, activeMenu, onMenuClick }) => {
  const navigate = useNavigate();

  // 회원 탈퇴 모달 상태 관리
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");

  const targetText = "회원탈퇴하기";

  // 회원 탈퇴 핸들러
  const handleWithdraw = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    try {
      await axios.delete(`/api/mypage/withdraw`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          mb_uid: memberInfo.mb_uid,
          mb_password: withdrawPassword,
        },
      });

      alert("탈퇴 처리가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");
      localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("탈퇴 에러:", error);
      if (error.response && error.response.status === 403) {
        alert("권한이 없거나 비밀번호가 일치하지 않습니다.");
      } else {
        alert("탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 멘토 여부 확인 (데이터에 따라 'MENTOR' 혹은 'mentor' 대소문자 주의)
  const isMentor = memberInfo.role === "2";

  return (
    <>
      {/* 사이드바 컨테이너 */}
      <aside className="fixed top-20 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-80px)] z-40 shadow-sm overflow-y-auto">
        {/* 1. 프로필 요약 섹션 */}
        <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-slate-50/50">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden mb-3 relative">
            {memberInfo.mb_icon ? (
              <img
                src={`${memberInfo.mb_icon}`}
                alt="프로필"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `/images/default.png`;
                }}
              />
            ) : (
              <img
                src={`https://randomuser.me/api/portraits/men/32.jpg`} // 임시 이미지 (나중에 /images/default.png로 변경)
                alt="기본프로필"
                className="w-full h-full object-cover"
              />
            )}
            {/* 멘토일 경우 인증 마크 표시 예시 */}
            {isMentor && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                <i className="fa-solid fa-check text-white text-[10px]"></i>
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-800">{memberInfo.mb_nickname || "사용자"}</h2>

          {/* 역할 배지 */}
          <span
            className={`mt-1 px-3 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border
                        ${
                          isMentor
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
          >
            {isMentor ? "MENTOR" : "MENTEE"}
          </span>
        </div>

        {/* 2. 네비게이션 메뉴 (와이어프레임 구조 반영) */}
        <nav className="flex-1 p-4 space-y-6">
          {/* [대시보드] */}
          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">대시보드</div>
            <MenuButton
              active={activeMenu === "dashboard"}
              onClick={() => onMenuClick("dashboard")}
              icon="fa-house"
              label="홈"
            />
          </div>

          {/* [강의] */}
          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">강의</div>
            <div className="space-y-1">
              <MenuButton
                active={activeMenu === "my-lectures"}
                onClick={() => onMenuClick("my-lectures")}
                icon="fa-book-open"
                label="내 강의"
              />
              <MenuButton
                active={activeMenu === "wishlist"}
                onClick={() => onMenuClick("wishlist")}
                icon="fa-heart"
                label="찜한 강의"
              />
              {/* 멘토일 때만 보이는 메뉴 */}
              {isMentor && (
                <MenuButton
                  active={activeMenu === "manage-class"}
                  onClick={() => onMenuClick("manage-class")}
                  icon="fa-chalkboard-user"
                  label="강의 관리"
                  highlight={true}
                />
              )}
            </div>
          </div>

          {/* [회원 설정] */}
          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">회원 설정</div>
            <div className="space-y-1">
              <MenuButton
                active={activeMenu === "profile"}
                onClick={() => onMenuClick("profile")}
                icon="fa-user-gear"
                label="프로필 설정"
              />

              {/* 멘티일 때만 보이는 멘토 신청 메뉴 */}
              {!isMentor && (
                <MenuButton
                  active={activeMenu === "mentor-apply"}
                  onClick={() => navigate("/Mento")} // 멘토 신청 페이지로 이동
                  icon="fa-user-graduate"
                  label="멘토 신청"
                />
              )}

              <MenuButton
                active={activeMenu === "payment"}
                onClick={() => onMenuClick("payment")}
                icon="fa-credit-card"
                label="결제 내역"
              />
            </div>
          </div>
        </nav>

        {/* 3. 하단 탈퇴 버튼 */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i> 회원 탈퇴
          </button>
        </div>
      </aside>

      {/* 회원 탈퇴 모달 (기존 로직 유지) */}
      <Modal
        isOpen={isWithdrawModalOpen}
        title="정말 탈퇴하시겠습니까?"
        confirmText="탈퇴하기"
        isConfirmDisabled={confirmInput !== targetText || withdrawPassword === ""}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setConfirmInput("");
          setWithdrawPassword("");
        }}
        onConfirm={handleWithdraw}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            탈퇴 시 모든 학습 기록이 삭제되며{" "}
            <span className="text-red-600 font-bold underline">복구가 불가능</span>합니다.
          </p>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-[10px] font-bold text-red-400 mb-1 uppercase">
              안전한 탈퇴를 위해 아래 문구를 입력하세요
            </p>
            <p className="font-black text-red-600 mb-2">"{targetText}"</p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="문구를 입력해주세요"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">비밀번호 확인</label>
            <input
              type="password"
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-all text-sm"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

/** * 메뉴 버튼 서브 컴포넌트
 * highlight 옵션: 멘토 관리 같은 중요 메뉴 강조용
 */
const MenuButton = ({ active, onClick, icon, label, highlight = false }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-bold transition-all text-sm ${
      active
        ? "bg-primary text-white shadow-md" // 활성화 상태
        : highlight
          ? "text-primary bg-blue-50 hover:bg-blue-100" // 강조 버튼 (비활성)
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900" // 일반 버튼
    }`}
  >
    <div className={`w-6 text-center ${active ? "text-white" : "text-gray-400"}`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <span>{label}</span>
  </button>
);

export default Sidebar;

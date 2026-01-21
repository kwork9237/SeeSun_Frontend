import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import NotificationDropdown from "../common/NotificationDropdown"; // 새로 만든 알림 컴포넌트

const MainHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // 외부 클릭 감지를 위한 Ref
  const notificationRef = useRef(null);

  // 외부 클릭 시 알림창 닫기 로직
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (confirmLogout) {
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-20 transition-all">
      {/* Grid 레이아웃으로 중앙 탭 고정 (1:auto:1 비율) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between md:grid md:grid-cols-[1fr_auto_1fr] items-center">
        {/* 1. 좌측: 로고 */}
        <div
          className="flex items-center gap-2 cursor-pointer justify-self-start"
          onClick={() => navigate("/")}
        >
          <span className="text-xl font-extrabold text-gray-900 tracking-tight font-sans">
            SeeSun
          </span>
        </div>

        {/* 2. 중앙: 메뉴 */}
        <div className="hidden md:flex gap-8 justify-self-center">
          <Link
            to="/LectureList"
            className="text-gray-600 hover:text-primary font-bold text-base transition py-2"
          >
            강의 찾기
          </Link>
          <Link
            to="/Suggestions"
            className="text-gray-600 hover:text-primary font-bold text-base transition py-2"
          >
            건의 사항
          </Link>
        </div>

        {/* 3. 우측: 로그인/알림 */}
        <div className="flex items-center gap-3 justify-self-end">
          {isLoggedIn ? (
            <>
              {/* 알림 영역 (현재 기능 비활성화)*/}
              {false && (
                <div className="relative" ref={notificationRef}>
                  <button
                    className="relative p-2 text-gray-700 hover:text-primary transition-colors focus:outline-none mr-2"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <i className="fa-solid fa-bell text-xl"></i>
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  {/* 알림 드롭다운 컴포넌트 */}
                  {showNotifications && <NotificationDropdown />}
                </div>
              )}

              {/* 마이페이지 */}
              <Link to="/MyPage">
                <Button variant="primary" size="small">
                  마이페이지
                </Button>
              </Link>

              {/* 로그아웃 */}
              <Button variant="ghost" size="small" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              {/* 비로그인 상태 */}
              <Link to="/Join">
                <Button variant="primary" size="small">
                  회원가입
                </Button>
              </Link>
              <Link to="/Login">
                <Button variant="ghost" size="small">
                  로그인
                </Button>
              </Link>

            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainHeader;

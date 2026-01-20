// 헤더 알람 기능 (현재 헤더에선 비활성화 처리)
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. 더미 데이터 (나중엔 API로 변경)
  const notifications = [
    {
      id: 1,
      type: "alert", // 긴급/시스템
      message: "서버 점검이 예정되어 있습니다. (02:00~04:00)",
      time: "방금 전",
      isRead: false,
    },
    {
      id: 2,
      type: "lecture", // 강의 관련
      message: "'비즈니스 영어' 강의가 1시간 뒤 시작됩니다.",
      time: "1시간 전",
      isRead: false,
    },
    {
      id: 3,
      type: "payment", // 결제 관련
      message: "강의 결제가 완료되었습니다. (James Wilson)",
      time: "어제",
      isRead: true,
    },
    {
      id: 4,
      type: "welcome", // 가입 인사
      message: "SeeSun에 오신 것을 환영합니다! 튜터링을 시작해보세요.",
      time: "2일 전",
      isRead: true,
    },
  ];

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 2. 외부 클릭 감지 로직 (드롭다운 열린 상태에서 다른 곳 누르면 닫힘)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    // 화면 전체에 클릭 이벤트 감지기를 붙임
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 컴포넌트가 사라질 때 감지기 떼기 (메모리 누수 방지)
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 3. 아이콘/색상 결정 헬퍼 함수
  const getIconStyles = (type) => {
    switch (type) {
      case "lecture":
        return { icon: "fa-video", bg: "bg-blue-100", text: "text-blue-600" };
      case "payment":
        return { icon: "fa-credit-card", bg: "bg-orange-100", text: "text-orange-600" };
      case "alert":
        return { icon: "fa-triangle-exclamation", bg: "bg-red-100", text: "text-red-600" };
      default:
        return { icon: "fa-bell", bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 알림 버튼 (종 아이콘) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
      >
        <i className="fa-regular fa-bell text-xl"></i>
        
        {/* 읽지 않은 알림이 있을 때만 빨간 점(뱃지) 표시 */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 드롭다운 패널 (isOpen일 때만 보임) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
          
          {/* 패널 헤더 */}
          <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">알림</h3>
            <button className="text-xs text-blue-600 hover:underline">
              모두 읽음 처리
            </button>
          </div>

          {/* 알림 리스트 (스크롤 가능) */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((item) => {
                const style = getIconStyles(item.type);
                return (
                  <div
                    key={item.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-none ${
                      !item.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* 아이콘 영역 */}
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                      <i className={`fa-solid ${style.icon}`}></i>
                    </div>

                    {/* 텍스트 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!item.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}>
                        {item.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                    </div>

                    {/* 읽지 않음 표시 (작은 빨간 점) */}
                    {!item.isRead && (
                      <div className="shrink-0 pt-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                새로운 알림이 없습니다.
              </div>
            )}
          </div>

          {/* 패널 푸터 (전체보기 링크) */}
          <Link
            to="/MyPage/Notifications"
            className="block py-3 text-center text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-t border-gray-100"
            onClick={() => setIsOpen(false)}
          >
            알림 전체 보기
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
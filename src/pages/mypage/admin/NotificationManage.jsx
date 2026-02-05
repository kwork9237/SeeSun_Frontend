import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import apiClient from "../../../api/apiClient";

const NotificationManage = () => {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  // 날짜 포맷 (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await apiClient.get("/admin/notices");
        console.log("백엔드 응답 데이터:", response.data);
        setNotices(response.data);
      } catch (error) {
        console.error("데이터 조회 에러:", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지 사항 관리</h1>
          <p className="text-sm text-gray-500 mt-2">
            전체 회원에게 전달할 공지사항을 작성하고 관리합니다.
          </p>
        </div>

        <Link to="/mypage/admin/notificationwrite">
          {/* [수정됨] 새 공지 작성 버튼 파란색으로 변경 */}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Edit3 />새 공지 작성
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        <div className="grid grid-cols-[80px_1fr_120px_120px_100px] bg-[#F9FAFB] border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-6 text-center">
          <div>NO</div>
          <div className="text-left px-2">제목</div>
          <div>작성자</div>
          <div>작성일</div>
          <div>조회수</div>
        </div>

        <div className="divide-y divide-gray-50 flex-1">
          {notices.map((notice) => (
            <div
              key={notice.ntId}
              onClick={() => navigate(`/mypage/admin/notification/${notice.ntId}`)}
              className="grid grid-cols-[80px_1fr_120px_120px_100px] py-4 px-6 items-center text-sm hover:bg-gray-50 transition-colors cursor-pointer text-center"
            >
              <div className="text-gray-400">{notice.ntId}</div>
              <div className="text-left px-2 font-medium text-gray-800 truncate hover:text-orange-500 hover:underline">
                {notice.title}
              </div>
              <div className="text-gray-600">{notice.mbId}</div>
              <div className="text-gray-500 text-xs">{formatDate(notice.createdAt)}</div>
              <div className="text-gray-400 text-xs">{notice.viewCount}</div>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                <Bell />
              </div>
              <span className="text-sm font-medium text-gray-500">
                등록된 공지 사항이 없습니다.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center items-center gap-2">
        <button
          className="p-2 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          disabled
        >
          <ChevronLeft />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded bg-orange-500 text-white font-bold text-sm shadow-sm hover:bg-orange-600 transition-colors">
          1
        </button>
        <button
          className="p-2 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          disabled
        >
          <ChevronRight />
        </button>
      </div>
    </>
  );
};

export default NotificationManage;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash, Edit } from "lucide-react";
import apiClient from "../../../api/apiClient";

const NotificationDetail = () => {
  const { ntId } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await apiClient.get(`/admin/notices/${ntId}`);
        setNotice(response.data);
      } catch (error) {
        console.error("공지사항 상세 조회 실패:", error);
        navigate("/mypage/admin/notification");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [ntId, navigate]);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      try {
        await apiClient.delete(`/admin/notices/${ntId}`);
        alert("삭제되었습니다.");
        navigate("/mypage/admin/notification"); // 삭제 후 목록으로 이동
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 수정 핸들러
  const handleEdit = () => {
    navigate(`/mypage/admin/notification/edit/${ntId}`);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
  if (!notice) return null;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">공지 사항 상세</h1>
            <p className="text-sm text-gray-500 mt-2">공지사항 내용을 확인합니다.</p>
          </div>
          <button
            onClick={() => navigate("/mypage/admin/notification")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold"
          >
            <ArrowLeft /> 목록으로
          </button>
        </div>

        {/* 내용 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{notice.title}</h2>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">작성자</span>
                <span>{notice.mbId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">작성일</span>
                <span>{formatDate(notice.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">조회수</span>
                <span>{notice.viewCount}</span>
              </div>
            </div>
          </div>
          <div className="p-8 min-h-[300px] text-gray-800 leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </div>

        {/* 하단 버튼 그룹 */}
        <div className="mt-6 flex justify-end gap-3">
          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Trash />
            삭제
          </button>

          {/* 수정 버튼 */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit />
            수정
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDetail;

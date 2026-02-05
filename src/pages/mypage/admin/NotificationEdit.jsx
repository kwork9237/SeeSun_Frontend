import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import apiClient from "../../../api/apiClient";

const NotificationEdit = () => {
  const { ntId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ntId: "",
    title: "",
    content: "",
    mbId: "",
  });

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await apiClient.get(`/admin/notices/${ntId}`);
        setFormData({
          ntId: response.data.ntId,
          title: response.data.title,
          content: response.data.content,
          mbId: response.data.mbId,
        });
        setLoading(false);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        alert("게시글 정보를 불러오지 못했습니다.");
        navigate("/mypage/notification");
      }
    };
    fetchDetail();
  }, [ntId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 2. 수정 요청 (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      await apiClient.put(`/admin/notices/${ntId}`, formData);
      alert("공지사항이 수정되었습니다.");

      // [수정됨] 수정 완료 후 목록 페이지로 이동
      navigate("/mypage/admin/notification");
    } catch (error) {
      console.error("공지사항 수정 실패:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">데이터를 불러오는 중...</div>;

  return (
    <>
      {/* 페이지 헤더 - 목록으로 버튼 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지 사항 수정</h1>
          <p className="text-sm text-gray-500 mt-2">등록된 공지사항의 내용을 수정합니다.</p>
        </div>
        <button
          onClick={() => navigate("/mypage/admin/notification")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold"
        >
          <ArrowLeft /> 목록으로
        </button>
      </div>

      {/* 작성 폼 영역 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
      >
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
          />
        </div>

        <div className="mb-8">
          <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full h-64 px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all resize-none text-sm leading-relaxed"
          ></textarea>
        </div>

        {/* 하단 버튼 그룹 */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(`/mypage/notification/${ntId}`)} // 취소 시 상세 페이지로 이동
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <X />
            취소
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-sm hover:shadow transition-all"
          >
            <Save />
            수정 완료
          </button>
        </div>
      </form>
    </>
  );
};

export default NotificationEdit;

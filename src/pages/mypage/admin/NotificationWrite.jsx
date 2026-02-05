import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Save, X } from "lucide-react";
import apiClient from "../../../api/apiClient";

const NotificationWrite = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    // 관리자(작성자)의 실제 회원 번호(PK)를 넣어야 합니다. (예: 1)
    mbId: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    try {
      await apiClient.post("/admin/notices", formData);
      alert("공지사항이 등록되었습니다.");
      navigate("/mypage/admin/notification");
    } catch (error) {
      console.error("공지사항 등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">공지 사항 등록</h1>
        <p className="text-sm text-gray-500 mt-2">
          새로운 공지사항을 작성하여 회원들에게 알립니다.
        </p>
      </div>

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
            placeholder="공지사항 제목을 입력하세요"
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
            placeholder="공지 내용을 상세히 입력하세요..."
            className="w-full h-64 px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all resize-none text-sm leading-relaxed"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            to="/mypage/admin/notification"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <X />
            취소
          </Link>

          {/* [수정됨] 등록 완료 버튼 색상 파란색으로 변경 */}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-sm hover:shadow transition-all"
          >
            <Save />
            등록 완료
          </button>
        </div>
      </form>
    </>
  );
};

export default NotificationWrite;

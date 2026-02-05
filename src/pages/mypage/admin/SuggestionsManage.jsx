import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import axios from "axios";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../../api/apiClient";

const SuggestionsManage = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식
  };

  // 백엔드 데이터 Fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await apiClient.get("/admin/suggestions");
        console.log("건의사항 데이터:", response.data);
        setSuggestions(response.data);
      } catch (error) {
        console.error("건의사항 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">건의 사항 관리</h1>
          <p className="text-sm text-gray-500 mt-2">
            사용자가 접수한 건의 사항을 확인하고 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          {/* 상태 필터가 필요 없다면 이 select 박스도 제거 가능하지만, 일단 유지했습니다 */}
          <select className="border border-gray-200 rounded text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm">
            <option>전체 보기</option>
            <option>처리중</option>
            <option>완료</option>
          </select>
        </div>
      </div>

      {/* 게시판 테이블 영역 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        {/* 테이블 헤더 - [수정됨] 상태 컬럼 제거 */}
        <div className="grid grid-cols-[80px_100px_1fr_120px_120px] bg-[#F9FAFB] border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-6 text-center">
          <div>NO</div>
          <div>구분</div>
          <div className="text-left px-2">제목</div>
          <div>작성자</div>
          <div>작성일</div>
          {/* 상태 컬럼 제거됨 */}
        </div>

        {/* 테이블 바디 */}
        <div className="divide-y divide-gray-50 flex-1">
          {loading && (
            <div className="p-10 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
          )}

          {!loading &&
            suggestions.map((item) => (
              <div
                key={item.sgId}
                onClick={() => navigate(`/mypage/admin/suggestonsmanage/${item.sgId}`)}
                // [수정됨] grid-cols 수정 (상태 컬럼 제거에 맞춰서)
                className="grid grid-cols-[80px_100px_1fr_120px_120px] py-4 px-6 items-center text-sm hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                <div className="text-gray-400">{item.sgId}</div>
                <div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    일반
                  </span>
                </div>
                <div className="text-left px-2 font-medium text-gray-800 truncate">
                  {item.title}
                </div>
                <div className="text-gray-600">{item.mbId}</div>
                <div className="text-gray-500 text-xs">{formatDate(item.createdAt)}</div>
                {/* 상태 Badge 제거됨 */}
              </div>
            ))}

          {!loading && suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                <FileText />
              </div>
              <span className="text-sm font-medium text-gray-500">
                등록된 건의 사항이 없습니다.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 페이지네이션 */}
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

export default SuggestionsManage;

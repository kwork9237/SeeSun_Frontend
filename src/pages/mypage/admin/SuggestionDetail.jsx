import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle, Trash, Edit, Pen } from "lucide-react";
import apiClient from "../../../api/apiClient";

const SuggestionDetail = () => {
  const { sgId } = useParams();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // 답변 작성 모드 및 내용 상태
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerText, setAnswerText] = useState("");

  const dataFetchedRef = useRef(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const fetchDetail = async () => {
    try {
      const response = await apiClient.get(`/admin/suggestions/${sgId}`);
      console.log("받아온 데이터:", response.data);
      setSuggestion(response.data);
    } catch (error) {
      console.error("건의사항 상세 조회 실패:", error);
      alert("존재하지 않거나 삭제된 게시글입니다.");
      navigate("/mypage/admin/suggestonsmanage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchDetail();
  }, [sgId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("정말로 이 건의사항을 삭제하시겠습니까?")) {
      try {
        await apiClient.delete(`/admin/suggestions/${sgId}`);
        alert("삭제되었습니다.");
        navigate("/mypage/admin/suggestonsmanage");
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleRegisterAnswer = async () => {
    if (!answerText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    if (window.confirm("답변을 등록(수정)하시겠습니까?")) {
      try {
        await apiClient.post("/admin/suggestions/answers", {
          sgId: sgId,
          content: answerText,
          mbId: 1,
        });

        alert("답변이 저장되었습니다.");
        setIsAnswering(false);
        setAnswerText("");

        // 데이터 다시 불러오기
        fetchDetail();
      } catch (error) {
        console.error("답변 등록 실패:", error);
        alert("답변 등록 중 오류가 발생했습니다.");
      }
    }
  };

  // [추가] 답변 수정 버튼 클릭 핸들러
  const handleEditClick = () => {
    setAnswerText(suggestion.answerContent); // 기존 내용을 입력창에 채움
    setIsAnswering(true); // 입력 모드로 전환
  };

  // [추가] 취소 버튼 핸들러
  const handleCancelClick = () => {
    setIsAnswering(false);
    setAnswerText("");
  };

  if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
  if (!suggestion) return null;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">건의 사항 상세</h1>
          <p className="text-sm text-gray-500 mt-2">사용자가 보낸 건의 사항 내용을 확인합니다.</p>
        </div>
        <button
          onClick={() => navigate("/mypage/suggestonsmanage")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold"
        >
          <ArrowLeft /> 목록으로
        </button>
      </div>

      {/* --- 1. 건의사항 내용 카드 --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{suggestion.title}</h2>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">작성자</span>
              <span>{suggestion.mbId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">작성일</span>
              <span>{formatDate(suggestion.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">조회수</span>
              <span>{suggestion.viewCount}</span>
            </div>
          </div>
        </div>
        <div className="p-8 min-h-[200px] text-gray-800 leading-relaxed whitespace-pre-wrap">
          {suggestion.content}
        </div>
      </div>

      {/* --- 2. 관리자 답변 영역 --- */}
      {/* 조건부 렌더링 로직 수정: isAnswering이 true면 무조건 폼을 보여줌 */}
      {isAnswering ? (
        // [답변 입력/수정 폼]
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden mb-6 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">답변 작성</h3>
          <textarea
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            placeholder="사용자에게 전달할 답변 내용을 입력하세요."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleRegisterAnswer}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              등록하기
            </button>
          </div>
        </div>
      ) : suggestion.answerContent ? (
        // [답변 완료 상태] -> 여기서 수정 버튼 노출됨
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden mb-6">
          <div className="border-b border-blue-100 p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">
                <CheckCircle />
              </span>
              <h3 className="text-lg font-bold text-blue-900">관리자 답변</h3>
            </div>
            <span className="text-sm text-blue-500">
              {suggestion.answerCreatedAt
                ? formatDate(suggestion.answerCreatedAt)
                : "날짜 정보 없음"}
            </span>
          </div>
          <div className="p-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
            {suggestion.answerContent}
          </div>
        </div>
      ) : (
        // [답변 대기 상태]
        <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-8 mb-6 text-center">
          <p className="text-gray-500 font-medium">아직 등록된 관리자 답변이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">아래 버튼을 눌러 답변을 작성해주세요.</p>
        </div>
      )}

      {/* --- 3. 하단 버튼 그룹 --- */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Trash />
          삭제
        </button>

        {/* [수정] 조건에 따라 '답변 입력' 또는 '답변 수정' 버튼 표시 */}
        {!isAnswering &&
          (suggestion.answerContent ? (
            // 답변이 있으면 [수정] 버튼
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
            >
              <Edit />
              답변 수정
            </button>
          ) : (
            // 답변이 없으면 [입력] 버튼
            <button
              onClick={() => setIsAnswering(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Pen />
              답변 입력
            </button>
          ))}
      </div>
    </>
  );
};

export default SuggestionDetail;

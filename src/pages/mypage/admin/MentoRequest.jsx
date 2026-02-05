import { useState, useEffect } from "react";
import axios from "axios";
import { File, Clipboard, ChevronLeft, ChevronRight } from "lucide-react";

const MentoRequest = () => {
  const [requests, setRequests] = useState([]);

  // 승인된 ID들을 저장할 상태 (LocalStorage 연동)
  const [approvedIds, setApprovedIds] = useState(() => {
    const saved = localStorage.getItem("approvedMentoRequests");
    return saved ? JSON.parse(saved) : [];
  });

  // --- 1. 백엔드에서 데이터 조회 ---
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("/api/admin/pending");
        console.log("멘토 신청 목록:", response.data); // 데이터 확인용 로그
        setRequests(response.data);
      } catch (error) {
        console.error("멘토 요청 목록 조회 실패:", error);
      }
    };
    fetchRequests();
  }, []);

  // --- 2. 승인 버튼 핸들러 ---
  const handleApprove = async (reqId, mbId) => {
    if (approvedIds.includes(reqId)) return;

    if (window.confirm(`회원번호 ${mbId}님의 멘토 신청을 승인하시겠습니까?`)) {
      try {
        const response = await axios.post("/api/admin/approve", { reqId: reqId });

        if (response.data === "SUCCESS") {
          alert(`회원번호 ${mbId}님이 멘토로 승인되었습니다.`);

          const newApprovedIds = [...approvedIds, reqId];
          setApprovedIds(newApprovedIds);
          localStorage.setItem("approvedMentoRequests", JSON.stringify(newApprovedIds));
        } else {
          alert("승인 처리에 실패했습니다.");
        }
      } catch (error) {
        console.error("승인 요청 중 에러 발생:", error);
        alert("서버 오류로 승인하지 못했습니다.");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">멘토 신청 승인/반려</h1>
          <span className="text-sm text-gray-500 mt-2 block">
            신청자의 정보를 확인하고 승인 처리합니다.
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4 w-[25%]">신청자 ID</th>
                <th className="px-6 py-4 w-[35%]">상세 정보</th>
                <th className="px-6 py-4 w-[25%]">첨부 파일</th>
                <th className="px-6 py-4 w-[15%] text-center">처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => {
                const isApproved = approvedIds.includes(req.reqId);

                return (
                  <tr key={req.reqId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold mr-3 shrink-0">
                          M
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            회원번호: {req.mbId}
                          </span>
                          <span className="text-xs text-gray-500">ID: {req.mbId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <span className="bg-orange-100 text-[#FF6B4A] text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 mr-2">
                            요청내용
                          </span>
                          <span className="text-xs font-semibold text-gray-700">
                            전문 멘토 신청
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 leading-snug break-keep">
                          {req.details}
                        </span>
                      </div>
                    </td>

                    {/* [수정됨] 첨부 파일 영역: fileId 확인 */}
                    <td className="px-6 py-4 align-middle">
                      {req.fileId && req.fileId !== 0 && req.fileId !== "0" ? (
                        <a
                          href={`/api/file/download/${req.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer no-underline w-fit"
                        >
                          <File className="text-blue-500 mr-2" />
                          <span className="text-sm text-blue-700 font-medium underline decoration-blue-300 underline-offset-2">
                            첨부파일 보기
                          </span>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 pl-2">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 align-middle text-center">
                      <button
                        onClick={() => !isApproved && handleApprove(req.reqId, req.mbId)}
                        disabled={isApproved}
                        className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-colors whitespace-nowrap
                                ${
                                  isApproved
                                    ? "bg-gray-300 text-red-600 cursor-not-allowed"
                                    : "text-white bg-blue-600 hover:bg-blue-700"
                                }`}
                      >
                        {isApproved ? "승인완료" : "승인"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="h-[500px]">
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                        <Clipboard />
                      </div>
                      <span className="font-medium text-gray-500">등록된 요청이 없습니다.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-auto border-t border-gray-100 p-4 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500">
            대기 중인 신청:{" "}
            <strong className="text-gray-900">
              {requests.filter((r) => !approvedIds.includes(r.reqId)).length}
            </strong>
            건
          </span>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 transition-colors">
              <ChevronLeft />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#FF6B4A] text-white font-bold text-sm shadow-sm">
              1
            </button>
            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 transition-colors">
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentoRequest;

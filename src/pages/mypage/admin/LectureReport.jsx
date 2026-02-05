import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const LectureReport = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/admin/reports");
        setReports(response.data);
      } catch (error) {
        console.error("강의 신고 목록 조회 실패:", error);
      }
    };
    fetchReports();
  }, []);

  return (
    <>
      {/* 헤더 영역 */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">강의 신고 관리</h1>
          <span className="text-sm text-gray-500 mt-2 block">
            접수된 강의 신고 내역을 확인하고 처리합니다.
          </span>
        </div>
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4 w-[10%] text-center">NO</th>
                <th className="px-6 py-4 w-[15%]">구분</th>
                <th className="px-6 py-4 w-[35%]">신고 대상 (강의 제목)</th>
                <th className="px-6 py-4 w-[25%]">신고 사유</th>
                <th className="px-6 py-4 w-[15%] text-right">신고자</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan="5" className="h-[500px]">
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                        <AlertTriangle />
                      </div>
                      <span className="font-medium text-gray-500">
                        접수된 신고 내역이 없습니다.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-auto border-t border-gray-100 p-4 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500">
            총 신고 내역: <strong className="text-gray-900">{reports.length}</strong>건
          </span>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400">
              <ChevronLeft />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#FF6B4A] text-white font-bold text-sm">
              1
            </button>
            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400">
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LectureReport;

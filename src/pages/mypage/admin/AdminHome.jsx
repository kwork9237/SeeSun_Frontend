import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/apiClient";

const AdminHome = () => {
  // --- 상태 관리 (State) ---
  const [dashboardStats, setDashboardStats] = useState({
    newMentorCount: 0,
    reportedLectureCount: 0,
    inquiryCount: 0,
  });

  // --- 데이터 가져오기 (API 호출) ---
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await apiClient.get("/admin/dashboard-stats");
        setDashboardStats({
          newMentorCount: response.data.newMentorCount || 0,
          reportedLectureCount: response.data.reportedLectureCount || 0,
          inquiryCount: response.data.inquiryCount || 0,
        });
      } catch (error) {
        console.error("관리자 대시보드 데이터를 불러오는데 실패했습니다.", error);
        setDashboardStats({
          newMentorCount: 5,
          reportedLectureCount: 2,
          inquiryCount: 12,
        });
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <span className="text-sm text-gray-500">오늘의 주요 현황을 확인하세요.</span>
      </div>

      {/* 알림 섹션 */}
      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-6 mb-10 shadow-sm">
        <div className="flex items-center mb-4">
          <span className="text-[#2563EB] text-lg mr-2">🔔</span>
          <h2 className="text-[#1E40AF] font-bold text-lg">승인 및 처리 대기 현황</h2>
          <span className="ml-2 bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {dashboardStats.newMentorCount + dashboardStats.reportedLectureCount}
          </span>
        </div>

        <div className="space-y-3">
          {/* 1. 신규 멘토 신청 알림 */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center">
              <span className="font-semibold text-gray-800">신규 멘토 신청이 접수되었습니다.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                대기 건수:{" "}
                <strong className="text-[#FF6B4A]">{dashboardStats.newMentorCount}</strong>건
              </span>
              <Link
                to="/mypage/mentorequests"
                className="px-4 py-1.5 text-sm bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                바로가기
              </Link>
            </div>
          </div>

          {/* 2. 신고된 강의 알림 */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center">
              <span className="font-semibold text-gray-800">신고 접수된 강의가 있습니다.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                미처리 건수:{" "}
                <strong className="text-[#EF4444]">{dashboardStats.reportedLectureCount}</strong>건
              </span>
              <Link
                to="/mypage/leturereport"
                className="px-4 py-1.5 text-sm border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                확인하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-gray-500 text-sm font-medium mb-2">총 멘토 신청</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {dashboardStats.newMentorCount}
            </span>
            <span className="ml-1 text-sm text-gray-400">건 (Today)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-gray-500 text-sm font-medium mb-2">신고된 강의</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {dashboardStats.reportedLectureCount}
            </span>
            <span className="ml-1 text-sm text-gray-400">건 (Today)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-gray-500 text-sm font-medium mb-2">처리 가능한 건의사항</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{dashboardStats.inquiryCount}</span>
            <span className="ml-1 text-sm text-gray-400">건</span>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-[300px] flex flex-col justify-center items-center">
        <div className="text-gray-300 text-5xl mb-4">📊</div>
        <div className="text-xl font-bold text-gray-700 mb-2">상세 통계 분석</div>
        <div className="text-gray-400">(2차 구현 예정: 주간/월간 가입자 추이 등)</div>
      </div>
    </>
  );
};

export default AdminHome;

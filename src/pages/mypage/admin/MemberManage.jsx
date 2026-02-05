import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../../api/apiClient";

const MemberManage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getRoleName = (typeId) => {
    switch (typeId) {
      case 0:
        return (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">
            관리자
          </span>
        );
      case 1:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
            일반 회원
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-bold">
            멘토
          </span>
        );
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded text-xs">기타</span>;
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/admin/members", {
        params: { keyword },
      });
      setMembers(response.data);
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchMembers();
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">전체 회원 조회</h1>
            <p className="text-sm text-gray-500 mt-2">
              가입된 모든 회원의 정보를 조회하고 관리합니다.
            </p>
          </div>

          {/* [수정] 검색바 + 파란색 버튼 */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="이름, 아이디, 닉네임 검색"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 shadow-sm w-64"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span
                className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
                onClick={fetchMembers}
              >
                <Search />
              </span>
            </div>
            {/* [추가] 파란색 검색 버튼 */}
            <button
              onClick={fetchMembers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm shadow-sm"
            >
              검색
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider text-center">
                  <th className="px-6 py-4 w-[8%]">NO</th>
                  <th className="px-6 py-4 w-[22%] text-left">아이디 (Username)</th>
                  <th className="px-6 py-4 w-[15%]">이름</th>
                  <th className="px-6 py-4 w-[15%]">닉네임</th>
                  <th className="px-6 py-4 w-[15%]">전화번호</th>
                  <th className="px-6 py-4 w-[10%]">유형</th>
                  <th className="px-6 py-4 w-[15%]">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-center text-sm text-gray-700">
                {loading && (
                  <tr>
                    <td colSpan="7" className="p-10 text-gray-500">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                )}

                {!loading &&
                  members.map((member) => (
                    <tr key={member.mbId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{member.mbId}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-left">
                        {member.username}
                      </td>
                      <td className="px-6 py-4">{member.name}</td>
                      <td className="px-6 py-4">{member.nickname}</td>
                      <td className="px-6 py-4 text-gray-500">{member.phone || "-"}</td>
                      <td className="px-6 py-4">{getRoleName(member.mbTypeId)}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(member.createdAt)}</td>
                    </tr>
                  ))}

                {!loading && members.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-20 text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
      </div>
    </>
  );
};

export default MemberManage;

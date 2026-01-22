import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios 임포트 추가
import { Link } from 'react-router-dom';

// --- 아이콘 컴포넌트 (SVG) ---
const Icons = {
  Home: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  User: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Search: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const MentoRequest = () => {
  // --- 상태 관리 (State) ---
  const [mentorRequests, setMentorRequests] = useState([]); // 초기값 빈 배열
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // --- 데이터 가져오기 (API 호출) ---
  useEffect(() => {
    const fetchMentorRequests = async () => {
      try {
        setLoading(true);
        // [TODO] 실제 백엔드 API 주소로 변경해주세요. (예: /api/admin/mentor-requests)
        const response = await axios.get('/api/admin/mentor-requests');
        
        // 데이터 구조에 맞게 설정 (예: response.data.list)
        if (response.data && Array.isArray(response.data)) {
            setMentorRequests(response.data);
        } else {
            setMentorRequests([]);
        }

      } catch (error) {
        console.error("멘토 신청 목록을 불러오는데 실패했습니다.", error);
        setMentorRequests([]); // 에러 시 빈 배열 유지
      } finally {
        setLoading(false);
      }
    };

    fetchMentorRequests();
  }, [currentPage]); // 페이지 변경 시 재호출 (필요 시)

  // --- 이벤트 핸들러 ---
  const handleNavClick = (menuName) => alert(`'${menuName}' 페이지로 이동합니다.`);
  const handleLogoClick = () => {
    alert("메인 홈페이지로 이동합니다.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDetailClick = (id, name) => alert(`${name} (ID: ${id}) 님의 상세 신청서를 열람합니다.`);

  return (
    <div className="font-sans min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827]">
      {/* --- Header (Admin 페이지와 동일) --- */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center font-bold text-xl cursor-pointer select-none" onClick={handleLogoClick}>
          <span className="text-[#FF6B4A] mr-2 text-2xl">☁️</span>
          <span className="tracking-tight">LinguaConnect</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
          {['How it Works', 'Languages', 'Mentors', 'Pricing'].map((item) => (
            <span key={item} className="cursor-pointer hover:text-[#FF6B4A] transition-colors" onClick={() => handleNavClick(item)}>
              {item}
            </span>
          ))}
        </nav>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-semibold text-[#FF6B4A] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">Sign In</button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-[#FF6B4A] rounded-lg hover:bg-[#ff5530] shadow-sm transition-colors">Get Started</button>
        </div>
      </header>

      {/* --- Body Area --- */}
      <div className="flex flex-1 max-w-[1400px] w-full mx-auto">
        
        {/* --- Sidebar (Admin 페이지와 동일) --- */}
        <aside className="w-[260px] py-8 px-4 bg-white border-r border-gray-100 hidden lg:flex flex-col shrink-0">
          <div className="flex items-center mb-10 px-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-400 text-xl">👤</div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-gray-800">Administrator</span>
              <span className="text-xs text-[#FF6B4A] font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-1">MASTER</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Dashboard</div>
              <ul className="space-y-1">
                <li>
                   <Link to="/admin" className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg transition-colors group">
                    <span className="mr-3 text-lg group-hover:text-[#FF6B4A]">🏠</span> 홈
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Management</div>
              <ul className="space-y-1">
                <li>
                  <div className="flex items-center px-3 py-2.5 bg-orange-50 text-[#FF6B4A] rounded-lg cursor-pointer font-medium">
                    <span className="mr-3">👥</span> 멘토 승인 관리
                  </div>
                </li>
                <li>
                  <div className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg cursor-pointer transition-colors group">
                    <span className="mr-3 group-hover:text-[#FF6B4A]">📋</span> 전체 회원 조회
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Contents</div>
              <ul className="space-y-1">
                <li>
                  <div className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg transition-colors group">
                    <span className="mr-3 group-hover:text-[#FF6B4A]">🚨</span> 강의 신고 관리
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">Support</div>
              <ul className="space-y-1">
                <li>
                  <div className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg transition-colors group">
                    <span className="mr-3 group-hover:text-[#FF6B4A]">💬</span> 건의 사항 관리
                  </div>
                </li>
                <li>
                  <div className="flex items-center px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#FF6B4A] rounded-lg cursor-pointer transition-colors group">
                    <span className="mr-3 group-hover:text-[#FF6B4A]">📢</span> 공지 사항 작성
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main className="flex-1 p-8 lg:p-12">
          
          {/* 타이틀 및 액션 바 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
             <div>
                <h1 className="text-2xl font-bold text-gray-900">멘토 신청 관리</h1>
                <span className="text-sm text-gray-500 mt-1 block">새로 들어온 멘토 신청 내역을 검토하고 승인합니다.</span>
             </div>
             <div className="flex gap-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="이름 또는 언어 검색" 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent w-64"
                  />
                  <Icons.Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  필터 적용
                </button>
             </div>
          </div>

          {/* 리스트 테이블 카드 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            
            {/* 테이블 헤더 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">신청자 정보</th>
                    <th className="px-6 py-4">전문 언어</th>
                    <th className="px-6 py-4">주요 경력</th>
                    <th className="px-6 py-4">신청일</th>
                    <th className="px-6 py-4 text-center">상태</th>
                    <th className="px-6 py-4 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* 로딩 중일 때 */}
                  {loading && (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-gray-500">
                        데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  )}

                  {/* 데이터가 없고 로딩이 끝났을 때 */}
                  {!loading && mentorRequests.length === 0 && (
                     <tr>
                      <td colSpan="6" className="py-20 text-center text-gray-500">
                        신규 멘토 신청 내역이 없습니다.
                      </td>
                    </tr>
                  )}

                  {/* 데이터가 있을 때 렌더링 */}
                  {!loading && mentorRequests.map((req) => (
                    <tr key={req.id || Math.random()} className="hover:bg-[#FFFBF9] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold mr-3">
                            {req.name ? req.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{req.name || '이름 없음'}</div>
                            <div className="text-xs text-gray-500">{req.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {req.language || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {req.career || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                        {req.date || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* 상태값에 따른 뱃지 표시 (DB 값에 따라 조건 수정 필요) */}
                        {req.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            승인 대기
                          </span>
                        ) : req.status === 'reviewed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            검토 중
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {req.status || '대기'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDetailClick(req.id, req.name)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:text-[#FF6B4A] hover:border-[#FF6B4A] transition-all"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* 빈 공간 채우기 용도 (데이터가 적어도 테이블 형태 유지) */}
                  {!loading && mentorRequests.length > 0 && mentorRequests.length < 5 && (
                      [...Array(5 - mentorRequests.length)].map((_, i) => (
                        <tr key={`empty-${i}`} className="h-[73px]">
                          <td colSpan="6"></td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이징 (Footer) - 실제 기능 구현 시 totalCount 연동 필요 */}
            <div className="mt-auto border-t border-gray-200 p-4 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500">
                총 <strong className="text-gray-900">{mentorRequests.length}</strong>건의 신청
              </span>
              <div className="flex items-center gap-1">
                <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-500 disabled:opacity-50" disabled>
                  <Icons.ChevronLeft />
                </button>
                <button className="px-3 py-1.5 text-sm font-bold bg-[#FF6B4A] text-white rounded shadow-sm border border-[#FF6B4A]">1</button>
                {/* <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded border border-transparent">2</button> */}
                <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                  <Icons.ChevronRight />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default MentoRequest;
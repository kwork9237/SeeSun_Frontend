import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 아이콘 컴포넌트 ---
const Icons = {
  Home: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  // ... (나머지 아이콘 동일) ...
  Users: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Clipboard: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>),
  Siren: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C4 2 5 5 5 5C5 5 2 7 2 7C2 7 5 5 5 5C5 5 4 2 4 2Z"/><path d="M20 2C20 2 19 5 19 5C19 5 22 7 22 7C22 7 19 5 19 5C19 5 20 2 20 2Z"/></svg>),
  MessageSquare: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  Megaphone: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>),
  ArrowLeft: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>),
  Trash: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
  Pen: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>),
  CheckCircle: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  Edit: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>), // 수정 아이콘 추가
};

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
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fetchDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/suggestions/${sgId}`);
      console.log("받아온 데이터:", response.data);
      setSuggestion(response.data);
    } catch (error) {
      console.error('건의사항 상세 조회 실패:', error);
      alert('존재하지 않거나 삭제된 게시글입니다.');
      navigate('/mypage/suggestonsmanage');
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
    if (window.confirm('정말로 이 건의사항을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/suggestions/${sgId}`);
        alert('삭제되었습니다.');
        navigate('/mypage/suggestonsmanage');
      } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
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
        await axios.post('http://localhost:8080/api/admin/suggestions/answers', {
          sgId: sgId,
          content: answerText,
          mbId: 1
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-800 font-sans">
      {/* 헤더 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full top-0 z-20">
        <Link to="/" className="flex items-center gap-2 cursor-pointer text-inherit no-underline">
          <span className="text-orange-500 text-2xl leading-none">●</span> 
          <span className="font-bold text-xl tracking-tight text-gray-900">LinguaConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600"><span className="font-semibold text-gray-800">관리자</span>님, 환영합니다.</div>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded hover:bg-gray-100 transition-colors">로그아웃</button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* 사이드바 */}
        <aside className="w-64 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto z-10 flex flex-col pt-8 px-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-base">Administrator</span>
              <span className="text-[10px] font-bold text-[#FF6B4A] bg-[#FFF0EB] px-2 py-0.5 rounded-sm w-fit mt-1">MASTER</span>
            </div>
          </div>

          <nav className="flex-1 space-y-8">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dashboard</div>
              <Link to="/mypage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <span className="text-orange-500"><Icons.Home /></span>
                <span className="text-sm font-medium">홈</span>
              </Link>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Management</div>
              <div className="space-y-1">
                <Link to="/mypage/mentorequests" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-purple-500"><Icons.Users /></span>
                  <span className="text-sm font-medium">멘토 승인 관리</span>
                </Link>
               <Link to="/mypage/membermanage" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-orange-400"><Icons.Clipboard /></span>
                  <span className="text-sm font-medium">전체 회원 조회</span>
               </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contents</div>
              <div className="space-y-1">
                <Link to="/mypage/leturereport" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-pink-500"><Icons.Siren /></span>
                  <span className="text-sm font-medium">강의 신고 관리</span>
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Support</div>
              <div className="space-y-1">
                <Link to="/mypage/suggestonsmanage" className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF7ED] text-[#FF6B4A] rounded-lg transition-colors">
                  <span className="text-[#A78BFA]"><Icons.MessageSquare /></span>
                  <span className="text-sm font-bold">건의 사항 상세</span>
                </Link>
                <Link to="/mypage/notification" className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                   <span className="text-rose-500"><Icons.Megaphone /></span>
                  <span className="text-sm font-medium">공지 사항 작성</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 ml-64 p-10 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">건의 사항 상세</h1>
                <p className="text-sm text-gray-500 mt-2">사용자가 보낸 건의 사항 내용을 확인합니다.</p>
              </div>
              <button onClick={() => navigate('/mypage/suggestonsmanage')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
                <Icons.ArrowLeft /> 목록으로
              </button>
            </div>

            {/* --- 1. 건의사항 내용 카드 --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{suggestion.title}</h2>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">작성자</span><span>{suggestion.mbId}</span></div>
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">작성일</span><span>{formatDate(suggestion.createdAt)}</span></div>
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">조회수</span><span>{suggestion.viewCount}</span></div>
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
                      <span className="text-blue-500"><Icons.CheckCircle /></span>
                      <h3 className="text-lg font-bold text-blue-900">관리자 답변</h3>
                   </div>
                   <span className="text-sm text-blue-500">
                      {suggestion.answerCreatedAt ? formatDate(suggestion.answerCreatedAt) : '날짜 정보 없음'}
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
                <Icons.Trash />
                삭제
              </button>

              {/* [수정] 조건에 따라 '답변 입력' 또는 '답변 수정' 버튼 표시 */}
              {!isAnswering && (
                suggestion.answerContent ? (
                  // 답변이 있으면 [수정] 버튼
                  <button 
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                  >
                    <Icons.Edit />
                    답변 수정
                  </button>
                ) : (
                  // 답변이 없으면 [입력] 버튼
                  <button 
                    onClick={() => setIsAnswering(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                  >
                    <Icons.Pen />
                    답변 입력
                  </button>
                )
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default SuggestionDetail;
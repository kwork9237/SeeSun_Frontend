import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, FileText, PlayCircle, Monitor, CheckCircle, ChevronLeft, Heart } from 'lucide-react';
import axios from 'axios';

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 요일 데이터 정의 (시안 순서: 일~토)
  const weekDays = [
    { label: '일', value: 0 }, { label: '월', value: 1 }, 
    { label: '화', value: 2 }, { label: '수', value: 3 }, 
    { label: '목', value: 4 }, { label: '금', value: 5 }, 
    { label: '토', value: 6 }
  ];

  // ✅ 날짜 포맷 변환 함수 추가
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // "2026-01-20" → "2026.01.20"
    return dateString.replace(/-/g, '.');
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/lectures/${id}`);
        setLecture(response.data);
      } catch (err) {
        console.error("❌ 데이터 로드 실패:", err);
        alert("강의 정보를 불러올 수 없습니다.");
        navigate('/lecture');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">LOADING...</div>;
  if (!lecture) return <div className="min-h-screen flex items-center justify-center">강의를 찾을 수 없습니다.</div>;

  // 데이터 가공 (쉼표로 구분된 문자열을 배열로 변환)
  const activeDays = lecture.availableDays 
    ? lecture.availableDays.split(',').map(Number) 
    : [];
  
  const activeTimes = lecture.availableTime 
    ? lecture.availableTime.split(',') 
    : [];


  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 상단 네비게이션 */}
      <nav className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-black transition-colors">
            <ChevronLeft size={20} /> <span className="ml-1 font-bold">강의 목록으로 돌아가기</span>
          </button>
          <div className="font-black text-orange-500 text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            LinguaConnect
          </div>
          <div className="w-20"></div> {/* 밸런스용 빈 공간 */}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* [좌측 컨텐츠 영역] */}
          <div className="flex-1">
            {/* 카테고리 & 타이틀 */}
            <div className="mb-8">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {lecture.categoryName || 'Business English'}
              </span>
              <h1 className="text-4xl font-black text-gray-900 mt-6 mb-4 leading-tight">
                {lecture.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.floor(lecture.avgScore || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                <span className="font-bold text-gray-900 ml-1">{lecture.avgScore?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-400 text-sm">({lecture.reviewCount || 0} reviews)</span>
              </div>
            </div>

            {/* 멘토 프로필 섹션 */}
            <div className="flex items-center gap-5 mb-12 p-6 bg-gray-50 rounded-[24px] w-fit border border-gray-100">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img 
                  src={lecture.profileIcon ? `http://localhost:8080/uploads/${lecture.profileIcon}` : '/default-profile.png'} 
                  alt="instructor" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                />
              </div>
              <div>
                <p className="font-black text-xl text-gray-900 leading-none mb-1">{lecture.instructorName}</p>
                <p className="text-sm text-gray-400 font-bold">Professional Mentor</p>
                <button className="mt-2 text-xs font-black text-orange-500 border border-orange-200 px-3 py-1 rounded-lg hover:bg-orange-50 transition-colors">
                  Follow
                </button>
              </div>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex border-b mb-10 sticky top-[73px] bg-white z-40">
              {['overview', 'curriculum', 'reviews', 'Q&A'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-sm font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'text-orange-500 border-b-4 border-orange-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 탭별 상세 내용 */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">강의 상세내용</h2>
                  <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                    {lecture.content}
                  </p>
                </div>
              )}
              {/* 다른 탭은 추후 구현 */}
            </div>
          </div>

          {/* [우측 예약 카드 - 피그마 시안 반영] */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-28 bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-gray-200/60 overflow-hidden">
              <div className="p-8">
                
                {/* ✅ 강의 기간 - 날짜 포맷 변환 적용 */}
                <div className="bg-gray-50 rounded-2xl py-3.5 px-4 mb-8 text-center border border-gray-100/50">
                  <span className="text-[15px] font-black text-gray-800">
                    {formatDate(lecture.startDate) || '2026.01.01'} — {formatDate(lecture.endDate) || '2026.12.31'}
                  </span>
                </div>

                {/* 요일 선택 UI */}
                <div className="flex justify-between mb-8 gap-1.5">
                  {weekDays.map((day) => (
                    <div 
                      key={day.label}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all
                        ${activeDays.includes(day.value) 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-gray-50 text-gray-300 border border-gray-100'}`}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>

                {/* 시간표 버튼 */}
                <div className="grid grid-cols-2 gap-2.5 mb-10">
                  {activeTimes.length > 0 ? (
                    activeTimes.map((time, idx) => (
                      <div 
                        key={idx} 
                        className="py-3.5 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl text-center text-xs font-black shadow-sm"
                      >
                        {time}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-4 bg-gray-50 text-gray-400 rounded-xl text-center text-xs font-bold">
                      선택 가능한 시간대가 없습니다.
                    </div>
                  )}
                </div>

                {/* 가격 표시 */}
                <div className="text-center mb-10">
                  <span className="text-4xl font-black text-gray-900">₩{(lecture.cost || 0).toLocaleString()}</span>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-3">
                  <button className="w-full bg-[#FF6B4E] text-white py-5 rounded-[20px] font-black text-xl hover:bg-[#FF5A36] active:scale-[0.98] transition-all shadow-xl shadow-orange-100">
                    강의 신청하기
                  </button>
                  <button className="w-full bg-white text-gray-500 py-4 rounded-[20px] font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <Heart size={16} /> 찜하기
                  </button>
                </div>

                {/* 포함 내역 리스트 */}
                <div className="mt-10 pt-10 border-t border-gray-100 space-y-5">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">This course includes:</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-black">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Clock size={16} className="text-[#FF6B4E]" />
                      </div>
                      <span>{lecture.totalHours || 0} hours on-demand video</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-black">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <FileText size={16} className="text-[#FF6B4E]" />
                      </div>
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-black">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Monitor size={16} className="text-[#FF6B4E]" />
                      </div>
                      <span>Access on mobile and TV</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureDetail;
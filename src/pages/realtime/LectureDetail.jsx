import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Star, Share2, Heart } from 'lucide-react'; 

// ✅ 공통 헤더 임포트
import MainHeader from '../../components/layout/MainHeader';

// ✅ 상세 탭 및 예약 카드 컴포넌트
import Overview from '../lecture/detail/Overview';
import Curriculum from '../lecture/detail/Curriculum';
import Reviews from '../lecture/detail/Reviews';
import QnA from '../lecture/detail/QnA';
import EnrollCard from '../lecture/detail/EnrollCard';

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const weekDays = [
    { label: '일', value: 0 }, { label: '월', value: 1 }, 
    { label: '화', value: 2 }, { label: '수', value: 3 }, 
    { label: '목', value: 4 }, { label: '금', value: 5 }, 
    { label: '토', value: 6 }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.replace(/-/g, '.');
  };

  /**
   * [이미지 처리 함수]
   * 1. 이미지가 없으면(null) -> UI Avatars로 이니셜 이미지 생성
   * 2. 'http'로 시작하면 -> 외부 링크이므로 그대로 사용
   * 3. 파일명만 있으면 -> 백엔드 업로드 경로(/uploads/) 붙여서 사용
   */
  const getProfileImage = (img) => {
    if (!img) return `https://ui-avatars.com/api/?name=${lecture?.instructorName || 'Unknown'}&background=random`;
    if (img.startsWith('http')) return img;
    return `/uploads/${img}`; 
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/lectures/${id}`);
        setLecture(response.data);
      } catch (err) {
        console.error("❌ 데이터 로드 실패:", err);
        alert("강의 정보를 불러올 수 없습니다.");
        navigate('/LectureList');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  if (loading) return (
    // 로딩 시에도 헤더와 배경색 유지
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      <div className="flex-1 flex items-center justify-center font-bold text-gray-400">LOADING...</div>
    </div>
  );

  if (!lecture) return null;

  // DB 데이터 파싱 (요일, 시간)
  const activeDays = lecture.availableDays ? lecture.availableDays.split(',').map(Number) : [];
  const activeTimes = lecture.availableTime ? lecture.availableTime.split(',') : [];

  // ✅ 탭 클릭 시 렌더링될 컴포넌트 결정 로직
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview lecture={lecture} />;
      case 'curriculum': return <Curriculum lecture={lecture} />;
      case 'reviews': return <Reviews lecture={lecture} />;
      case 'Q&A': return <QnA lecture={lecture} />;
      default: return <Overview lecture={lecture} />;
    }
  };

  // ✅ 탭 메뉴 구성 데이터
  const tabMenus = [
    { label: '강의 개요', value: 'overview' },
    { label: '커리큘럼', value: 'curriculum' },
    { label: '리뷰', value: 'reviews' },
    { label: 'Q&A', value: 'Q&A' }
  ];

  return (
    // font-sans 제거됨
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. 공통 헤더 적용 */}
      <MainHeader />

      {/* 2. 본문 컨텐츠 (헤더 높이만큼 pt-32 적용하여 가림 방지) */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* 뒤로가기 버튼 */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center text-gray-400 hover:text-gray-900 transition-colors mb-6 font-medium"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 group-hover:border-gray-900 transition-colors">
            <ChevronLeft size={16} /> 
          </div>
          Back to List
        </button>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* ================= 좌측 메인 컨텐츠 ================= */}
          <div className="flex-1 w-full min-w-0">
            
            {/* 3. 강의 헤더 섹션 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start justify-between">
                <div>
                   {/* 뱃지 색상 통일 (Orange Theme) */}
                  <span className="inline-block bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-4 border border-orange-100">
                    {lecture.categoryName || 'Language'}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                    {lecture.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < Math.floor(lecture.avgScore || 0) ? "fill-yellow-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900 ml-1">{Number(lecture.avgScore || 0).toFixed(1)}</span>
                      <span className="text-gray-400 underline decoration-gray-300 decoration-1 underline-offset-2 cursor-pointer">
                        ({lecture.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 font-medium">Native Speaker</span>
                  </div>
                </div>

                {/* 우측 상단 아이콘 버튼 */}
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                    <Heart size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <hr className="my-6 border-gray-100" />

              {/* 4. 멘토 프로필 섹션 */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={getProfileImage(lecture.profileIcon)}
                    alt={lecture.instructorName} 
                    className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                    // 이미지 로드 에러 시 2차 방어 (무한루프 방지 포함)
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = `https://ui-avatars.com/api/?name=${lecture.instructorName}&background=random`;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {lecture.instructorName}
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase">Mentor</span>
                  </p>
                  <p className="text-sm text-gray-500">Professional Language Instructor</p>
                </div>
                <button className="ml-auto text-xs font-bold text-orange-500 border border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
                  + Follow
                </button>
              </div>
            </div>

            {/* 5. 탭 메뉴 (Sticky: 스크롤 시 상단 고정) */}
            <div className="flex border-b border-gray-200 mb-8 sticky top-[80px] bg-gray-50 z-30 pt-4">
              {['overview', 'curriculum', 'reviews', 'Q&A'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all relative
                    ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
                  `}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 rounded-t-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* 6. 탭 컨텐츠 구역 */}
            <div className="min-h-[400px] bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              {renderTabContent()}
            </div>
          </div>

          {/* ================= 우측 예약 카드 (Sticky) ================= */}
          <div className="w-full lg:w-[380px] flex-shrink-0 sticky top-32">
            <EnrollCard 
              lecture={lecture} 
              activeDays={activeDays} 
              activeTimes={activeTimes} 
              weekDays={weekDays} 
              formatDate={formatDate}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default LectureDetail;
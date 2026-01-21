import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Star } from 'lucide-react';

// ✅ 상세 탭 컴포넌트 임포트 (파일 트리 기준 경로)
import Overview from './detail/Overview';
import Curriculum from './detail/Curriculum';
import Reviews from './detail/Reviews';
import QnA from './detail/QnA';
import EnrollCard from './detail/EnrollCard'; 

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ 시안의 영문 요일과 맞추기 위해 Su~Sa로 설정
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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/lectures/${id}`);
        setLecture(response.data);
      } catch (err) {
        console.error("❌ 데이터 로드 실패:", err);
        navigate('/lecture');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">LOADING...</div>;
  if (!lecture) return <div className="min-h-screen flex items-center justify-center">강의를 찾을 수 없습니다.</div>;

  const activeDays = lecture.availableDays ? lecture.availableDays.split(',').map(Number) : [];
  const activeTimes = lecture.availableTime ? lecture.availableTime.split(',') : [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview lecture={lecture} />;
      case 'curriculum': return <Curriculum lecture={lecture} />;
      case 'reviews': return <Reviews lecture={lecture} />;
      case 'Q&A': return <QnA lecture={lecture} />;
      default: return <Overview lecture={lecture} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 상단 네비게이션 */}
      <nav className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-black transition-colors">
            <ChevronLeft size={20} /> <span className="ml-1 font-bold">Back to List</span>
          </button>
          <div className="font-black text-orange-500 text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            LinguaConnect
          </div>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="flex-1">
            {/* 1. 카테고리 & 강의 제목 섹션 */}
            <div className="mb-8">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {lecture.categoryName || 'Language'}
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

            {/* 2. 멘토 프로필 섹션 */}
            <div className="flex items-center gap-5 mb-12 p-6 bg-gray-50 rounded-[24px] w-fit border border-gray-100">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img 
                  src={lecture.profileIcon ? `/uploads/${lecture.profileIcon}` : '/default-profile.png'} 
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

            {/* 3. 탭 메뉴 */}
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

            {/* 4. 동적 탭 컨텐츠 구역 */}
            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>
          </div>

          {/* 5. 우측 예약 카드 (팀원이 작업할 부분) */}
          <div className="w-full lg:w-[400px]">
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
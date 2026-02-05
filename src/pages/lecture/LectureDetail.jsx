import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Star, Share2, Heart, Shield, Globe, Award } from 'lucide-react'; 

// ✅ 컴포넌트 경로 확인 필요
import MainHeader from '../../components/layout/MainHeader';

// ✅ 상세 탭 및 예약 카드 컴포넌트
import Overview from '../lecture/detail/Overview';
import Curriculum from '../lecture/detail/Curriculum';
import Reviews from '../lecture/detail/Reviews';
import QnA from '../lecture/detail/QnA';
import EnrollCard from '../lecture/detail/EnrollCard';
import apiClient from '../../api/apiClient';

const LectureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 상수 데이터
  const weekDays = [
    { label: '일', value: 0 }, { label: '월', value: 1 }, 
    { label: '화', value: 2 }, { label: '수', value: 3 }, 
    { label: '목', value: 4 }, { label: '금', value: 5 }, 
    { label: '토', value: 6 }
  ];

  // 유틸리티 함수
  const formatDate = (dateString) => dateString ? dateString.replace(/-/g, '.') : '';
  
  const getProfileImage = (img) => {
    if (!img) return `https://ui-avatars.com/api/?name=${lecture?.instructorName || 'Mentor'}&background=random`;
    if (img.startsWith('http')) return img;
    return `/uploads/${img}`; 
  };

  // ✅ [수정 포인트] API 호출 로직 강화
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get(`/lectures/${id}`);

        if (response.data) {
          setLecture(response.data);
        } else {
          throw new Error("Empty Data");
        }
      } catch (err) {
        console.error("❌ 상세 데이터 로드 실패:", err);
        alert("강의 정보를 불러올 수 없습니다. 목록으로 돌아갑니다.");
        navigate('/lecture'); 
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  // 로딩 화면 (디자인 유지)
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-400 animate-pulse">강의 정보를 불러오는 중입니다...</p>
      </div>
    </div>
  );

  if (!lecture) return null;

  // ✅ [수정 포인트] 데이터 파싱 안정성 확보
  const activeDays = lecture.availableDays ? String(lecture.availableDays).split(',').map(Number) : [];
  const activeTimes = lecture.availableTime ? String(lecture.availableTime).split(',') : [];

  // LectureDetail.js 내부의 함수 수정
    const renderTabContent = () => {
        switch (activeTab) {
            case '강의 상세정보': return <Overview lecture={lecture} />;
            case '커리큘럼': return <Curriculum lecture={lecture} />;
            case '후기': return <Reviews leId={lecture.leId} />;
            case 'Q&A': 
      return (
        <QnA 
          leId={lecture.leId} // 👈 'lecture' 객체 통째가 아니라 'leId'를 직접 넘겨줌
          currentMemberId={lecture.mbId} // 👈 작성자 ID도 함께 넘겨줌
        />
      );
    default: return <Overview lecture={lecture} />;
    }

  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* 뒤로가기 */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center text-gray-400 hover:text-gray-900 transition-colors mb-8 font-medium"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gray-900 transition-all shadow-sm">
            <ChevronLeft size={20} /> 
          </div>
          강의 목록으로 돌아가기
        </button>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* 좌측 컨텐츠 구역 */}
          <div className="flex-1 w-full min-w-0">
            
            {/* 상단 헤더 카드 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                      {lecture.categoryName || 'Language'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                      <Globe size={14} /> 온라인 강의
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-[1.15]">
                    {lecture.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg">
                      <Star size={18} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-black text-gray-900">{Number(lecture.avgScore || 0).toFixed(1)}</span>
                      <span className="text-gray-400 font-medium">({lecture.reviewCount || 0} 리뷰)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-semibold">
                      <Award size={18} className="text-blue-500" />
                      베스트 멘토
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-semibold">
                      <Shield size={18} className="text-green-500" />
                      인증된 커리큘럼
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-gray-100">
                    <Heart size={22} />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all border border-gray-100">
                    <Share2 size={22} />
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-10" />

              {/* 강사 프로필 */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <img 
                    src={getProfileImage(lecture.profileIcon)}
                    alt={lecture.instructorName} 
                    className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-white shadow-md transition-transform group-hover:scale-105"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-black text-gray-900 text-xl flex items-center gap-2">
                    {lecture.instructorName}
                    <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">Pro Mentor</span>
                  </p>
                  <p className="text-sm text-gray-400 font-medium mt-1">전문 언어 교육 강사 및 비즈니스 회화 전문가</p>
                </div>
                <button className="ml-auto px-6 py-3 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl text-sm font-black hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm">
                  멘토 프로필 보기
                </button>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex gap-2 border-b border-gray-200 mb-10 sticky top-[80px] bg-gray-50/90 backdrop-blur-md z-30 pt-4">
              {['강의 상세정보', '커리큘럼', '후기', 'Q&A'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-sm font-black uppercase tracking-widest transition-all relative
                    ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
                  `}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]"></div>
                  )}
                </button>
              ))}
            </div>

            {/* 탭 내용 */}
            <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm min-h-[500px]">
              {renderTabContent()}
            </div>
          </div>

          {/* 우측 예약 카드 */}
          <aside className="w-full lg:w-[400px] flex-shrink-0 sticky top-32">
            <EnrollCard 
              lecture={lecture} 
              activeDays={activeDays} 
              activeTimes={activeTimes} 
              weekDays={weekDays} 
              formatDate={formatDate}
            />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default LectureDetail;
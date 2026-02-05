import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainHeader from '../../components/layout/MainHeader';
import LectureCard from '../../components/common/LectureCard';
import apiClient from '../../api/apiClient';

const LectureList = () => {
  // =================================================================
  // [1] State 관리
  // =================================================================
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTime, setSelectedTime] = useState([]); 
  const [sortBy, setSortBy] = useState('rating');
  const [appliedTime, setAppliedTime] = useState([]); 

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =================================================================
  // [2] 상수 데이터
  // =================================================================
  const languages = ['전체', '영어', '일본어', '중국어'];
  const tags = ['자유회화/시험', '여행/업무', '비즈니스/취업', '취미/여가'];
  
  const timeOptions = [
    { label: '6AM - 12PM', value: 'morning' }, 
    { label: '12PM - 6PM', value: 'afternoon' },
    { label: '6PM - 12AM', value: 'evening' },
    { label: '주말', value: 'weekend' }
  ];

  // =================================================================
  // [3] API 호출 함수
  // =================================================================
  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (selectedLanguage && selectedLanguage !== '전체') params.language = selectedLanguage;
      if (selectedLevel) params.difficulty = selectedLevel;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      params.sortBy = sortBy;
      
      const response = await apiClient.get("/lectures", {
        params,
      });
      
      // 데이터가 없을 경우 빈 배열 처리
      setLectures(response.data || []);

    } catch (err) {
      console.error('API 호출 실패:', err);
      if (err.response?.status === 403) {
        setError('접근 권한이 없습니다. 로그인이 필요합니다.');
      } else {
        setError('강의 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // [4] useEffect
  // =================================================================
  // 초기 로드
  useEffect(() => {
    fetchLectures();
  }, []);

  // 정렬 변경 시 자동 재조회
  useEffect(() => {
    fetchLectures();
  }, [sortBy]);

  // =================================================================
  // [5] 이벤트 핸들러
  // =================================================================
  const handleApplyFilters = () => {
    fetchLectures();
    setAppliedTime(selectedTime);
  };

  const handleReset = () => {
    // ✅ 잘못된 경로인 /LectureList 대신 정확한 소문자 경로인 /lecture 사용
    window.location.href = '/lecture'; 
  };

  // =================================================================
  // [6] 필터링 로직 (프론트엔드 시간/요일 필터)
  // =================================================================
  const getFilteredLectures = () => {
    if (appliedTime.length === 0) return lectures;

    return lectures.filter((lecture) => {
      const timeStr = lecture.availableTime || ""; 
      const daysStr = String(lecture.availableDays || "");
      
      let startHour = -1;
      if (timeStr.includes(':')) {
        startHour = parseInt(timeStr.split(':')[0], 10);
      }

      // 0: 일요일, 6: 토요일
      const isWeekend = daysStr.includes('0') || daysStr.includes('6');

      return appliedTime.some((filter) => {
        if (filter === 'morning') return startHour >= 6 && startHour < 12;
        if (filter === 'afternoon') return startHour >= 12 && startHour < 18;
        if (filter === 'evening') return startHour >= 18;
        if (filter === 'weekend') return isWeekend;
        return false;
      });
    });
  };

  const filteredList = getFilteredLectures();

  const getDifficultyLabel = (level) => {
    const labels = { 1: '쉬움', 2: '보통', 3: '어려움' };
    return labels[level] || '보통';
  };

  // =================================================================
  // [7] JSX
  // =================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      <div className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">전체 강의 목록</h1>
            <p className="text-gray-500 mt-2">원하는 조건에 맞춰 최적의 멘토를 찾아보세요.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* 사이드바 필터 */}
          <aside className="w-full md:w-72 flex-shrink-0 sticky top-32 hidden md:block">
            <div className="pr-4"> 
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-800">필터</h2>
                <button onClick={handleReset} className="text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors">초기화 ⟳</button>
              </div>
              
              <hr className="border-gray-200 mb-6" />

              {/* 언어 선택 */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Language</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all
                        ${selectedLanguage === lang ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 태그 */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => selectedTags.includes(tag) 
                        ? setSelectedTags(selectedTags.filter(t => t !== tag))
                        : setSelectedTags([...selectedTags, tag])
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                        ${selectedTags.includes(tag) ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 난이도 */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Level</h3>
                <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                  {[{ label: '쉬움', value: 1 }, { label: '보통', value: 2 }, { label: '어려움', value: 3 }].map((level) => (
                    <button 
                      key={level.value} 
                      onClick={() => setSelectedLevel(selectedLevel === level.value ? '' : level.value)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedLevel === level.value ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시간대 필터 */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Time</h3>
                <div className="space-y-1">
                  {timeOptions.map((option) => (
                    <div 
                      key={option.value} 
                      onClick={() => selectedTime.includes(option.value)
                        ? setSelectedTime(selectedTime.filter(t => t !== option.value))
                        : setSelectedTime([...selectedTime, option.value])
                      }
                      className="flex items-center cursor-pointer py-2 group"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all
                        ${selectedTime.includes(option.value) ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-gray-300 bg-white group-hover:border-blue-400'}`}>
                        {selectedTime.includes(option.value) && <span className="text-white text-[10px]">✔</span>}
                      </div>
                      <span className={`text-sm transition-colors ${selectedTime.includes(option.value) ? 'text-blue-900 font-bold' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleApplyFilters} 
                disabled={loading} 
                className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-black font-bold disabled:opacity-50 shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? '검색 중...' : '필터 적용하기'}
              </button>
            </div>
          </aside>

          {/* 메인 결과 목록 */}
          <main className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">검색 결과 <span className="text-blue-600 ml-1">{filteredList.length}</span></h2>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="text-sm font-bold text-gray-700 bg-transparent outline-none border-none cursor-pointer focus:ring-0"
              >
                <option value="rating">평점 높은순</option>
                <option value="price">가격 낮은순</option>
              </select>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-pulse">
                ⚠️ {error}
              </div>
            )}

            {/* 로딩 표시 */}
            {loading && filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 font-medium">강의를 찾고 있습니다...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">조건에 맞는 강의가 없습니다.</p>
                <button onClick={handleReset} className="mt-4 text-blue-600 font-bold hover:underline">필터 초기화하기</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((lecture) => (
                  <LectureCard 
                    key={lecture.leId} 
                    data={{
                      id: lecture.leId,
                      img: lecture.profileIcon, 
                      lectureTitle: lecture.title, 
                      name: lecture.instructorName || 'Unknown', 
                      rate: Number(lecture.avgScore) || 0,
                      tags: [lecture.categoryName, getDifficultyLabel(lecture.difficulty)], 
                      catchPhrase: `${lecture.categoryName || 'Language'} 멘토`,
                      desc: lecture.content,
                      totalHours: lecture.totalHours || 0,
                      mainTime: lecture.availableTime || '협',
                      price: (lecture.cost || 0).toLocaleString()
                    }} 
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LectureList;
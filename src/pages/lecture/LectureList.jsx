import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';

const LectureList = () => {
  // 필터 상태
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTime, setSelectedTime] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  
  // 데이터 상태
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = ['전체', '영어', '일본어', '중국어'];
  const tags = ['자유회화/시험', '여행/업무', '비즈니스/취업', '취미/여가'];
  const timeSlots = ['6AM - 12PM', '12PM - 6PM', '6PM - 12AM', '주말'];

  // API 호출 함수
  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      
      // 필터 파라미터 추가
      if (selectedLanguage && selectedLanguage !== '전체') {
        params.language = selectedLanguage;
      }
      
      if (selectedLevel) {
        params.difficulty = selectedLevel;
      }
      
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }
      
      if (selectedTime.length > 0) {
        params.timeSlot = selectedTime.join(',');
      }
      
      params.sortBy = sortBy;
      
      const response = await axios.get('http://localhost:8080/api/lectures', { params });
      setLectures(response.data);
    } catch (err) {
      console.error('API 호출 실패:', err);
      setError('강의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchLectures();
  }, []);

  // Apply Filters 버튼 클릭 시
  const handleApplyFilters = () => {
    fetchLectures();
  };

  // 정렬 변경 시 자동 적용
  useEffect(() => {
    if (lectures.length > 0) {
      fetchLectures();
    }
  }, [sortBy]);

  const getDifficultyLabel = (level) => {
    const labels = { 1: '쉬움', 2: '보통', 3: '어려움' };
    return labels[level] || '보통';
  };

  const getDifficultyColor = (level) => {
    const colors = { 
      1: 'bg-green-100 text-green-700', 
      2: 'bg-orange-100 text-orange-700', 
      3: 'bg-red-100 text-red-700' 
    };
    return colors[level] || 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">L</div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">LinguaConnect</span>
            </div>
            <nav className="flex items-center space-x-8 font-semibold text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">How it Works</a>
              <a href="#" className="hover:text-gray-900">Languages</a>
              <a href="#" className="hover:text-gray-900">Mentors</a>
              <a href="#" className="hover:text-gray-900">Pricing</a>
              <button className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg">Sign In</button>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-lg">Get Started</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          
          {/* Left Sidebar - Filters */}
          <aside className="w-80 flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-900">강의 검색 설정</h2>
              
              {/* 언어 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900">언어</h3>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <label key={lang} className="flex items-center cursor-pointer group">
                      <input 
                        type="radio" 
                        name="language" 
                        checked={selectedLanguage === lang} 
                        onChange={() => setSelectedLanguage(lang)} 
                        className="w-4 h-4 accent-orange-500" 
                      />
                      <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 태그 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900">태그</h3>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <label key={tag} className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedTags.includes(tag)} 
                        onChange={(e) => e.target.checked 
                          ? setSelectedTags([...selectedTags, tag]) 
                          : setSelectedTags(selectedTags.filter(t => t !== tag))
                        } 
                        className="w-4 h-4 accent-orange-500 rounded" 
                      />
                      <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 난이도 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900">난이도</h3>
                <div className="flex gap-2">
                  {[
                    { label: '쉬움', value: 1 },
                    { label: '보통', value: 2 },
                    { label: '어려움', value: 3 }
                  ].map((level) => (
                    <button 
                      key={level.value}
                      onClick={() => setSelectedLevel(selectedLevel === level.value ? '' : level.value)}
                      className={`flex-1 py-1.5 text-sm border rounded transition-colors ${
                        selectedLevel === level.value 
                          ? 'bg-orange-500 text-white border-orange-500' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시간 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900">시간</h3>
                <div className="space-y-2">
                  {timeSlots.map((time) => (
                    <label key={time} className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedTime.includes(time)} 
                        onChange={(e) => e.target.checked 
                          ? setSelectedTime([...selectedTime, time]) 
                          : setSelectedTime(selectedTime.filter(t => t !== time))
                        } 
                        className="w-4 h-4 accent-orange-500 rounded" 
                      />
                      <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Filters 버튼 */}
              <button 
                onClick={handleApplyFilters}
                disabled={loading}
                className="w-full py-3.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로딩 중...' : 'Apply Filters'}
              </button>
            </div>
          </aside>

          {/* Main Content - Mentor Grid */}
          <main className="flex-1">
            <div className="mb-8 flex items-end justify-between">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Available Mentors</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-300">
                  {lectures.length} mentors found
                </span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="text-sm font-bold text-gray-700 border-none bg-transparent focus:ring-0 cursor-pointer"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price">Sort by Price</option>
                  <option value="hours">Sort by Experience</option>
                </select>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">강의 목록을 불러오는 중...</p>
              </div>
            )}

            {/* 강의 카드 그리드 */}
            {!loading && lectures.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lecture) => (
                <div 
                  key={lecture.leId} 
                  className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
                >
                  
                  {/* 상단 텍스트 영역 */}
                  <div className="p-6 flex-grow">
                    <div className="flex items-start mb-4">
                      <div className="w-16 h-16 bg-[#D9D9D9] rounded-full mr-4 flex-shrink-0 overflow-hidden">
                        {lecture.profileIcon && (
                          <img 
                            src={lecture.profileIcon} 
                            alt={lecture.instructorName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2 font-medium">
                          {lecture.instructorName || 'Unknown Mentor'}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={`mr-0.5 ${
                                i < Math.floor(lecture.avgScore || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-gray-300 ml-1">
                            ({lecture.avgScore?.toFixed(1) || '0.0'})
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-blue-500 font-bold mb-3 uppercase tracking-tighter">
                      Native {lecture.categoryName || 'Language'} Speaker
                    </p>
                    
                    {/* 태그는 임시로 빈 배열 처리 (추후 구현) */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded font-bold">
                        #{lecture.categoryName}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getDifficultyColor(lecture.difficulty)}`}>
                        {getDifficultyLabel(lecture.difficulty)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {lecture.content || '강의에 대한 상세한 설명이 들어가는 자리입니다.'}
                    </p>
                  </div>

                  {/* 하단 정보 영역 */}
                  <div className="px-6 pb-6 mt-auto">
                    <div className="pt-4 border-t border-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-gray-400 tracking-tight">
                          총 시간 : {lecture.viewCount || 0}시간
                        </span>
                        <span className="text-orange-500 text-[11px] font-black uppercase">
                          Credit N/hour
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-gray-400 tracking-tight">
                          주요시간 : 17~20시
                        </span>
                        <button className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform">
                          Book Session
                        </button>
                      </div>
                      
                      <div className="mt-2 text-right">
                        <span className="text-2xl font-black text-orange-500">
                          ₩{(lecture.cost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Load More 버튼 */}
            {lectures.length > 0 && (
              <div className="mt-12 text-center pb-10">
                <button className="px-12 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors">
                  Load More Mentors
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LectureList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainHeader from '../../components/layout/MainHeader';
import LectureCard from '../../components/common/LectureCard';

const LectureList = () => {
  // =================================================================
  // [1] State 관리: 필터 및 데이터 상태
  // =================================================================
  
  // 1-1. 사용자 선택 필터 (UI 상태)
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTime, setSelectedTime] = useState([]); // 체크박스 선택값
  const [sortBy, setSortBy] = useState('rating');
  
  // 1-2. 실제 적용된 필터 (시간 필터링용)
  // '적용하기' 버튼을 누를 때만 이 값이 업데이트되어 필터링이 수행됨
  const [appliedTime, setAppliedTime] = useState([]); 

  // 1-3. 서버 데이터 및 로딩/에러 상태
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =================================================================
  // [2] 상수 데이터: 필터 옵션 목록
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
  // [3] API 호출 함수: 서버 사이드 필터링
  // =================================================================
  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 쿼리 파라미터 구성
      const params = {};
      
      // 언어, 레벨, 태그, 정렬 기준은 서버로 전송하여 DB에서 필터링
      if (selectedLanguage && selectedLanguage !== '전체') params.language = selectedLanguage;
      if (selectedLevel) params.difficulty = selectedLevel;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      params.sortBy = sortBy;
      
      // 참고: 시간(time)은 서버로 보내지 않고 프론트엔드에서 필터링함

      const response = await axios.get('http://localhost:16500/api/lectures', { params });
      setLectures(response.data);

    } catch (err) {
      console.error('API 호출 실패:', err);
      setError('강의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // [4] useEffect: 데이터 로드 시점 제어
  // =================================================================

  // 4-1. 초기 렌더링 시 1회 실행
  useEffect(() => {
    fetchLectures();
    // 의존성 배열을 비워두어 컴포넌트 마운트 시 한 번만 실행되도록 함 (경고 무시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4-2. 정렬 기준(sortBy) 변경 시 재호출
  // 사용자가 드롭다운으로 정렬을 바꾸면 즉시 데이터를 다시 가져옴
  useEffect(() => {
    if (lectures.length > 0) fetchLectures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  // =================================================================
  // [5] 이벤트 핸들러
  // =================================================================

  // 5-1. 필터 적용 버튼 클릭 시
  const handleApplyFilters = () => {
    // 1. 서버 필터(언어, 태그 등) 데이터 새로고침
    fetchLectures();
    // 2. 클라이언트 필터(시간) 상태 확정 -> 리스트 필터링 트리거
    setAppliedTime(selectedTime);
  };

  // 5-2. 초기화 버튼 클릭 시
  const handleReset = () => {
    window.location.reload(); // 페이지 새로고침으로 깔끔하게 초기화
  };

  // =================================================================
  // [6] 프론트엔드 로직: 시간대 필터링 및 데이터 가공
  // =================================================================
  
  // 시간대 필터링 로직 (DB 데이터의 시간 문자열 파싱)
  const getFilteredLectures = () => {
    // 시간 필터가 없으면 전체 목록 반환
    if (appliedTime.length === 0) return lectures;

    return lectures.filter((lecture) => {
      const timeStr = lecture.availableTime || ""; 
      const daysStr = lecture.availableDays || "";
      
      // 시작 시간 추출 (예: "14:00 ~ 16:00" -> 14)
      let startHour = -1;
      if (timeStr.includes(':')) {
        startHour = parseInt(timeStr.split(':')[0], 10);
      }

      // 주말 여부 확인 (0: 일요일, 6: 토요일)
      const isWeekend = daysStr.includes('0') || daysStr.includes('6');

      // 선택된 시간 옵션 중 하나라도 만족하면 통과 (OR 조건)
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

  // 난이도 숫자 -> 문자 변환 헬퍼
  const getDifficultyLabel = (level) => {
    const labels = { 1: '쉬움', 2: '보통', 3: '어려움' };
    return labels[level] || '보통';
  };

  // =================================================================
  // [7] 렌더링 (JSX)
  // =================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />

      <div className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">전체 강의 목록</h1>
            <p className="text-gray-500 mt-2">원하는 조건에 맞춰 최적의 멘토를 찾아보세요.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* ================= 좌측 사이드바: 필터 영역 ================= */}
          <aside className="w-full md:w-72 flex-shrink-0 sticky top-32 hidden md:block">
            <div className="pr-4"> 
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-800">필터</h2>
                <button 
                  onClick={handleReset}
                  className="text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
                >
                  초기화 ⟳
                </button>
              </div>
              
              <hr className="border-gray-200 mb-6" />

              {/* 필터 1: 언어 (단일 선택) */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Language</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border
                        ${selectedLanguage === lang 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* 필터 2: 카테고리/태그 (다중 선택) */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => isSelected 
                          ? setSelectedTags(selectedTags.filter(t => t !== tag))
                          : setSelectedTags([...selectedTags, tag])
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                          ${isSelected
                            ? 'bg-orange-100 text-orange-600 border-orange-200' 
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-white hover:border-gray-400'
                          }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 필터 3: 난이도 (단일 선택) */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Level</h3>
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                  {[{ label: '쉬움', value: 1 }, { label: '보통', value: 2 }, { label: '어려움', value: 3 }].map((level) => (
                    <button 
                      key={level.value} 
                      onClick={() => setSelectedLevel(selectedLevel === level.value ? '' : level.value)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedLevel === level.value ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 필터 4: 시간대 (다중 선택 UI) */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Time</h3>
                <div className="space-y-1">
                  {timeOptions.map((option) => {
                    const isSelected = selectedTime.includes(option.value);
                    return (
                      <div 
                        key={option.value} 
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTime(selectedTime.filter(t => t !== option.value));
                          } else {
                            setSelectedTime([...selectedTime, option.value]);
                          }
                        }}
                        className="flex items-center cursor-pointer group py-2 hover:translate-x-1 transition-transform"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors 
                          ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-blue-900 font-bold' : 'text-gray-500'}`}>
                          {option.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 실행 버튼: API 호출 및 필터 적용 */}
              <button 
                onClick={handleApplyFilters} 
                disabled={loading} 
                className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-black font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95 text-sm"
              >
                {loading ? '검색 중...' : '필터 적용하기'}
              </button>
            </div>
          </aside>

          {/* ================= 우측 메인: 검색 결과 목록 ================= */}
          <main className="flex-1 min-w-0">
            {/* 결과 헤더 & 정렬 옵션 */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                검색 결과 <span className="text-blue-600 ml-1">{filteredList.length}</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="text-sm font-bold text-gray-700 border-none bg-transparent cursor-pointer focus:ring-0 outline-none hover:text-blue-600 transition-colors"
                >
                  <option value="rating">평점 높은순</option>
                  <option value="price">가격 낮은순</option>
                </select>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>}

            {/* 결과 없음 (Empty State) */}
            {!loading && !error && filteredList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">😢</div>
                <p className="text-gray-900 font-bold text-lg mb-1">조건에 맞는 멘토가 없습니다.</p>
                <p className="text-gray-500 text-sm">필터 조건을 변경하거나 초기화해보세요.</p>
              </div>
            )}

            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((lecture) => {
                // LectureCard 컴포넌트에 맞는 데이터 포맷팅
                const cardData = {
                  id: lecture.leId,
                  img: lecture.profileIcon || lecture.le_thumb, 
                  lectureTitle: lecture.title, 
                  name: lecture.instructorName || 'Unknown', 
                  rate: Number(lecture.avgScore) || 0,
                  tags: [lecture.categoryName, getDifficultyLabel(lecture.difficulty)], 
                  catchPhrase: `${lecture.categoryName || 'Language'} 멘토`,
                  desc: lecture.content,
                  totalHours: lecture.totalHours || 0,
                  mainTime: lecture.availableTime || '협의',
                  price: (lecture.cost || 0).toLocaleString()
                };

                return (
                  <LectureCard 
                    key={lecture.leId} 
                    data={cardData} 
                  />
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LectureList;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';

const MenteeClasses = () => {
  const navigate = useNavigate();
  
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let response; 

        // 3. 헤더에 토큰 실어서 보내기 
        response = await apiClient.get('/mentee/home');

        setLectures(response.data.myLectures || []);
        
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        // 토큰 만료 시 처리(401 에러) 등도 나중에 여기에 추가하면 됩니다.
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  // 3. 탭 필터링 로직
  const filteredLectures = lectures.filter(lecture => {
    if (activeTab === 'ING') {
      // [진행 중]: '수강 완료'가 아닌 것들 (수강 중, 일정 미정 등)
      return lecture.progressStatus !== '수강 완료';
    } else {
      // [완료됨]: 오직 '수강 완료' 상태인 것만
      return lecture.progressStatus === '수강 완료';
    }
  });

  // 난이도 라벨 변환
  const getDifficultyLabel = (level) => {
    const safeLevel = level || 1; 
    if (safeLevel === 1) return "🌱 초급";
    if (safeLevel === 2) return "🌿 중급";
    return "🌲 고급";
  };

  if (loading) return <div className="p-12 text-center text-gray-500">로딩 중... ⏳</div>;

  return (
    <div className="w-full animate-fade-in p-2">
      
      {/* === [상단 헤더 & 탭 버튼] === */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📚 내 강의실</span>
        </h2>

        {/* 탭 컨트롤러 */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('ING')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'ING' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            진행 중
          </button>
          <button 
            onClick={() => setActiveTab('DONE')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'DONE' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            완료됨
          </button>
        </div>
      </div>

      {/* === [강의 목록 그리드] === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
        {filteredLectures.length > 0 ? (
          filteredLectures.map((lecture) => (
            <div 
              key={lecture.leId} 
              className="bg-white border border-gray-200 rounded-[20px] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-full"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                   {/* ★ 상태 뱃지 (3가지 색상 자동 적용) */}
                   <p className={`font-bold text-xs px-2 py-1 rounded 
                     ${lecture.progressStatus === '수강 완료' 
                        ? 'bg-gray-100 text-gray-500'       // 완료 (회색)
                        : lecture.progressStatus === '일정 미정'
                            ? 'bg-green-100 text-green-600' // 미정 (초록)
                            : 'bg-blue-50 text-blue-500'    // 진행 (파랑)
                     }`}
                   >
                     {lecture.progressStatus || "수강 중"}
                   </p>
                   
                   {/* 날짜 (String으로 오니까 그대로 출력) */}
                   <span className="text-xs text-gray-400 font-medium">
                     신청일: {lecture.modifiedAt || "-"}
                   </span>
                </div>
                
                {/* 강의 제목 */}
                <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">
                  {lecture.title}
                </h3>
                
                {/* 강의 설명 */}
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                    {lecture.content || "강의 설명이 없습니다."}
                </p>

                {/* 하단 정보 태그 */}
                <div className="flex gap-2 mb-6">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                      {getDifficultyLabel(lecture.difficultyLevel)}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                      ₩ {lecture.cost ? lecture.cost.toLocaleString() : "0"}
                    </span>
                 </div>
              </div>

              {/* 상세보기 버튼 */}
              <button 
                onClick={() => navigate(`/lecture/detail/${lecture.leId}`)}
                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all shadow-md"
              >
                강의 상세보기
              </button>
            </div>
          ))
        ) : (
          /* === [데이터 없을 때 (탭별 메시지 분기)] === */
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-[20px] border border-dashed border-gray-300">
             <p className="text-xl text-gray-400 font-bold mb-4">
               {activeTab === 'ING' 
                 ? "현재 진행 중인 강의가 없습니다. ☕" 
                 : "아직 완료된 강의가 없네요! 힘내세요 💪"}
             </p>
             
             {/* '진행 중' 탭일 때만 '강의 찾기' 버튼 노출 */}
             {activeTab === 'ING' && (
                <button 
                  onClick={() => navigate('/lecture')} 
                  className="bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all shadow-md"
                >
                  새로운 강의 찾으러 가기 🔍
                </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeClasses;
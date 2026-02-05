import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import LectureCard from "../common/LectureCard"; 
import { fetchPopularLectures } from "../../api/lectureMainApi";

/**
 * [상수] 언어 이름(English)을 DB의 ID(1)로 변환하는 매핑 객체
 */
const LANG_ID_MAP = {
  english: 1,
  japanese: 2,
  chinese: 3
};

/**
 * [컴포넌트] MentorList
 * - 메인 페이지 하단에 위치하며, 선택된 언어(selectedLang)에 맞는 인기 강의 TOP 3를 보여줍니다.
 */
const MentorList = ({ selectedLang }) => {
  
  // [State] 강의 목록 데이터 저장
  const [lectures, setLectures] = useState([]);
  
  // [State] 데이터 로딩 상태
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPopularLectures = async () => {
      if (!selectedLang) return; 

      setLoading(true);
      try {
        const langId = LANG_ID_MAP[selectedLang];
        
        // API 호출
        const response = await fetchPopularLectures(langId);
        
        // [데이터 매핑] 백엔드 DTO -> 프론트엔드 LectureCard 포맷 변환
        const mappedData = response.data.map(item => ({
             id: item.le_id,
             
             // LectureCard props: title -> lectureTitle로 변경됨
             lectureTitle: item.le_title,       
             
             name: item.mb_nickname, 
             rate: item.mentor_rate,
             price: item.le_price.toLocaleString(),
             
             /* 시간 관련 데이터 매핑
                - 백엔드에서 totalHours(DTO) 또는 total_hours(Map)로 올 수 있어 둘 다 대응
                - 값이 없으면(null) 기본값(0 또는 '협의') 처리
             */
             // 기존: 데이터가 없어서 하드코딩했던 부분
             // totalHours: 0,
             // mainTime: '협의',

             // 수정: 실제 데이터 연결
             totalHours: item.totalHours || item.total_hours || 0,
             mainTime: item.availableTime || item.available_time || '협의',

             /* [수정] 이미지 키 값 변경 (image -> img)
                - LectureCard 컴포넌트 내부에서 'data.img'를 사용하므로 키 이름을 맞춰야 함
             */
             img: item.le_thumb && item.le_thumb.startsWith('http') 
                 ? item.le_thumb 
                 : `https://ui-avatars.com/api/?name=${item.mb_nickname}&background=random`, 
             
             tags: ["#인기강의", "#검증된멘토"], 
             desc: "수강생들이 증명하는 최고의 강의입니다." 
        }));

        setLectures(mappedData);
      } catch (error) {
        console.error("인기 강의 조회 실패:", error);
        setLectures([]); 
      } finally {
        setLoading(false);
      }
    };

    loadPopularLectures();
  }, [selectedLang]); 

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* [섹션 헤더] */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2 capitalize flex items-center gap-2">
              {selectedLang} Popular Lectures <span className="text-2xl animate-bounce">🔥</span>
            </h2>
            <p className="text-gray-600">수강생 평점이 가장 높은 인기 강의를 확인해보세요.</p>
          </div>
          {/* 강의 목록 페이지로 이동 */}
          <Link to="/lecture">
            <Button variant="ghost" size="medium">전체 보기 <i className="fa-solid fa-arrow-right ml-2"></i></Button>
          </Link>
        </div>

        {/* [강의 목록 그리드] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center text-gray-400">Loading...</div>
          ) : lectures.length > 0 ? (
            lectures.map((data) => (
              <LectureCard key={data.id} data={data} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500 font-medium">강의 준비 중입니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MentorList;
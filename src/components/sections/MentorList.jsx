import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; 
import Button from "../common/Button";
import LectureCard from "../common/LectureCard"; 

/**
 * [상수] 언어 이름(English)을 DB의 ID(1)로 변환하는 매핑 객체
 * - useEffect의 의존성 경고를 피하기 위해 컴포넌트 외부에 선언함
 */
const LANG_ID_MAP = {
  english: 1,
  japanese: 2,
  chinese: 3
};

/**
 * [컴포넌트] MentorList
 * - 메인 페이지 하단에 위치하며, 선택된 언어(selectedLang)에 맞는 인기 강의 TOP 3를 보여줍니다.
 * @param {string} selectedLang - 사용자가 상단에서 선택한 언어 (예: 'english')
 */
const MentorList = ({ selectedLang }) => {
  
  // [State] 강의 목록 데이터 저장
  const [lectures, setLectures] = useState([]);
  
  // [State] 데이터 로딩 상태 (true일 때 Loading... 표시)
  const [loading, setLoading] = useState(false);

  /**
   * [Effect] 언어 선택이 변경될 때마다 실행
   * - 백엔드 API를 호출하여 인기 강의 목록을 가져옵니다.
   */
  useEffect(() => {
    const fetchPopularLectures = async () => {
      // 선택된 언어가 없으면 아무것도 하지 않음 (방어 코드)
      if (!selectedLang) return; 

      setLoading(true); // 로딩 시작
      try {
        // 1. 프론트엔드 언어 이름 -> 백엔드 ID로 변환
        const langId = LANG_ID_MAP[selectedLang];
        
        // 2. API 호출 (GET /api/lectures/popular)
        const response = await axios.get(`/api/lectures/popular`, {
            params: { lgType: langId }
        });
        
        // 3. [데이터 매핑] 백엔드 DTO -> 프론트엔드 컴포넌트(LectureCard) 포맷으로 변환
        // - 백엔드에서 null로 올 수 있는 값(이미지 등)을 여기서 기본값으로 처리함
        const mappedData = response.data.map(item => ({
             id: item.le_id,
             title: item.le_title,       // LectureCard에서 사용하는 props 이름으로 매칭
             name: item.mb_nickname, 
             rate: item.mentor_rate,     // 평점
             price: item.le_price.toLocaleString(), // 가격에 3자리 콤마 추가
             
             // 이미지 처리: http로 시작하면 원본 사용, 없으면 랜덤 아바타 생성
             image: item.le_thumb && item.le_thumb.startsWith('http') 
                  ? item.le_thumb 
                  : `https://ui-avatars.com/api/?name=${item.mb_nickname}&background=random`, 
             
             // 태그 및 설명 (DB에 없으면 하드코딩된 기본값 사용)
             tags: ["#인기강의", "#검증된멘토"], 
             desc: "수강생들이 증명하는 최고의 강의입니다." 
        }));

        setLectures(mappedData); // State 업데이트
      } catch (error) {
        console.error("인기 강의 조회 실패:", error);
        setLectures([]); // 에러 발생 시 빈 배열로 초기화
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchPopularLectures();
  }, [selectedLang]); // selectedLang이 바뀔 때만 재실행

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* [섹션 헤더] 제목 및 전체보기 버튼 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2 capitalize flex items-center gap-2">
              {selectedLang} Popular Lectures <span className="text-2xl animate-bounce">🔥</span>
            </h2>
            <p className="text-gray-600">수강생 평점이 가장 높은 인기 강의를 확인해보세요.</p>
          </div>
          <Link to="/LectureList">
            <Button variant="ghost" size="medium">전체 보기 <i className="fa-solid fa-arrow-right ml-2"></i></Button>
          </Link>
        </div>

        {/* [강의 목록 그리드] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 조건부 렌더링: 로딩 중 -> 데이터 있음 -> 데이터 없음 순서 */}
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
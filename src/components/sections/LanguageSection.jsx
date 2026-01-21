import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../common/Card";

/**
 * [컴포넌트] LanguageSection
 * - 메인 페이지의 언어 선택 섹션입니다.
 * - 백엔드에서 각 언어별 강의 개수를 조회하여 표시합니다.
 * @param {string} selectedLang - 현재 선택된 언어 ID
 * @param {function} setSelectedLang - 언어 변경 핸들러
 */
const LanguageSection = ({ selectedLang, setSelectedLang }) => {
  
  // [State] 언어별 강의 개수 저장 (초기값 0)
  // 예: { 1: 5, 2: 3, 3: 0 }
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0 });

  /**
   * [Effect] 컴포넌트 마운트 시 1회 실행
   * - API를 호출하여 실시간 강의 개수를 가져옵니다.
   */
  useEffect(() => {
    axios
      .get("/api/lectures/count")
      .then((response) => setCounts(response.data))
      .catch((error) => console.error("강의 개수 조회 실패:", error));
  }, []);

  // [상수] 프론트엔드 언어 ID -> 백엔드 DB ID 매핑
  const LANG_ID_MAP = {
    english: 1,
    japanese: 2,
    chinese: 3,
  };

  // [데이터] 언어별 디자인 테마 및 정보
  const languages = [
    {
      id: "english",
      flagImg: "https://flagcdn.com/w160/us.png",
      name: "English",
      desc: "글로벌 커리어의 시작",
      theme: {
        main: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        hoverBorder: "hover:border-blue-300",
        ring: "ring-blue-100",
        badge: "bg-blue-100 text-blue-700",
      },
    },
    {
      id: "japanese",
      flagImg: "https://flagcdn.com/w160/jp.png",
      name: "Japanese",
      desc: "가깝고도 매력적인 문화",
      theme: {
        main: "text-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-100",
        hoverBorder: "hover:border-rose-300",
        ring: "ring-rose-100",
        badge: "bg-rose-100 text-rose-700",
      },
    },
    {
      id: "chinese",
      flagImg: "https://flagcdn.com/w160/cn.png",
      name: "Chinese",
      desc: "가장 많은 사용자와의 대화",
      theme: {
        main: "text-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-100",
        hoverBorder: "hover:border-amber-300",
        ring: "ring-amber-100",
        badge: "bg-amber-100 text-amber-700",
      },
    },
  ];

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            어떤 언어를 배우고 싶으신가요?
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            원하는 언어를 선택해보세요. 검증된 멘토들의 강의가 준비되어 있습니다.
          </p>
        </div>

        {/* 카드 리스트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
          {languages.map((lang) => {
            // 1. DB에서 현재 언어의 개수 찾기
            const dbId = LANG_ID_MAP[lang.id];
            const currentCount = counts[dbId] || 0;

            const isSelected = selectedLang === lang.id;
            const theme = lang.theme;

            // [참고] isActive 로직 삭제됨: 개수가 0개여도 항상 활성화된 디자인 유지

            return (
              <Card
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`
                  {/* [디자인 수정] p-5: 카드 내부 여백을 줄여서 회색 박스가 더 넓어지게 만듦 */}
                  group relative flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 cursor-pointer border-2
                  bg-white 
                  ${
                    isSelected
                      ? `border-transparent ring-4 ${theme.ring} shadow-xl transform -translate-y-2`
                      : `border-transparent hover:border-transparent hover:ring-2 ${theme.ring} hover:shadow-lg hover:-translate-y-1 hover:bg-white`
                  }
                `}
              >
                {/* 배경 호버 효과 */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.bg}`}
                ></div>

                {/* 국기 아이콘 */}
                <div
                  className={`
                  relative z-10 w-20 h-20 bg-white rounded-full shadow-md border border-gray-100 mb-6 shrink-0 
                  group-hover:scale-110 transition-transform duration-300 mx-auto
                  flex items-center justify-center
                `}
                >
                  <img
                    src={lang.flagImg}
                    alt={lang.name}
                    className="w-10 h-auto object-contain shadow-sm"
                  />
                </div>

                {/* 제목 및 설명 */}
                <div className="relative z-10 space-y-2">
                  <h3
                    className={`text-2xl font-bold text-gray-900 group-hover:${theme.main} transition-colors`}
                  >
                    {lang.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">{lang.desc}</p>
                </div>

                <div className="relative z-10 w-full border-t border-dashed border-gray-200 my-6"></div>

                {/* 하단 정보 (회색 박스) */}
                <div className="relative z-10 w-full flex flex-col gap-3">
                    {/* [디자인 수정]
                       1. w-full: 박스를 가로 끝까지 채움
                       2. justify-between: 내용을 양쪽 끝으로 배치
                       3. px-3: 박스 내부 여백을 조절하여 글자가 너무 중앙에 몰리지 않게 함
                    */}
                    <div className="w-full flex justify-between items-center h-12 bg-gray-50 rounded-xl px-3 group-hover:bg-white/80 transition-colors">
                      
                      {/* 왼쪽: 아이콘 + 텍스트 */}
                      <div className="flex items-center gap-2">
                        {/* 초록색 점 애니메이션 */}
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500`}></span>
                        </span>
                        
                        {/* 텍스트 (+ 공백 문자 추가) */}
                        <span className="text-sm font-semibold text-gray-600 tracking-tight">
                          수강 신청 가능 &emsp; {/* &emsp;: 탭 크기의 공백 강제 추가 */}
                        </span>
                      </div>

                      {/* 오른쪽: 숫자 + 단위 */}
                      <div className="flex items-baseline gap-1 text-gray-900">
                        <span className={`${theme.main} font-bold text-lg font-mono`}>
                          {currentCount}
                        </span>
                        <span className="text-sm font-semibold">
                          개 강의
                        </span>
                      </div>
                    </div>
                </div>
                
                {/* 선택됨 체크 아이콘 (우상단) */}
                {isSelected && (
                  <div
                    className={`absolute top-4 right-4 text-2xl animate-bounce ${theme.main} z-20`}
                  >
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LanguageSection;
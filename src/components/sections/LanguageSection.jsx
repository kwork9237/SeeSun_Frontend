import React from 'react';
import Card from '../common/Card';

/**
 * [Section] 메인 페이지 언어 선택 섹션
 * - 사용자가 학습할 언어(영어, 일어, 중국어)를 선택하는 영역입니다.
 * - 선택된 언어 ID를 상위 컴포넌트로 전달하여 상태를 관리합니다.
 * * @param {string} selectedLang - 현재 선택된 언어 ID
 * @param {function} setSelectedLang - 언어 변경 핸들러 함수
 */
const LanguageSection = ({ selectedLang, setSelectedLang }) => {
  
  // 언어별 데이터 및 디자인 테마 설정
  const languages = [
    { 
      id: 'english', 
      flagImg: 'https://flagcdn.com/w160/us.png', 
      name: 'English', 
      desc: '글로벌 커리어의 시작',
      count: 142,
      theme: {
        main: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        hoverBorder: 'hover:border-blue-300',
        ring: 'ring-blue-100',
        badge: 'bg-blue-100 text-blue-700'
      }
    },
    { 
      id: 'japanese', 
      flagImg: 'https://flagcdn.com/w160/jp.png', 
      name: 'Japanese', 
      desc: '가깝고도 매력적인 문화',
      count: 89,
      theme: {
        main: 'text-rose-500',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        hoverBorder: 'hover:border-rose-300',
        ring: 'ring-rose-100',
        badge: 'bg-rose-100 text-rose-700'
      }
    },
    { 
      id: 'chinese', 
      flagImg: 'https://flagcdn.com/w160/cn.png', 
      name: 'Chinese', 
      desc: '가장 많은 사용자와의 대화',
      count: 56, 
      theme: {
        main: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        hoverBorder: 'hover:border-amber-300',
        ring: 'ring-amber-100',
        badge: 'bg-amber-100 text-amber-700'
      }
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

        {/* 언어 선택 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
          {languages.map((lang) => {
            const isSelected = selectedLang === lang.id;
            const isActive = lang.count > 0; // 강의가 있을 때만 활성화
            const theme = lang.theme;
            
            return (
              <Card 
                key={lang.id}
                onClick={() => isActive && setSelectedLang(lang.id)}
                // 상태(Active, Selected)에 따른 조건부 스타일링 적용
                className={`
                  group relative flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 cursor-pointer border-2
                  ${!isActive ? 'opacity-60 grayscale cursor-not-allowed bg-gray-50 border-gray-100' : 'bg-white'}
                  ${isSelected 
                    ? `border-transparent ring-4 ${theme.ring} shadow-xl transform -translate-y-2` 
                    : isActive 
                      ? `border-transparent hover:border-transparent hover:ring-2 ${theme.ring} hover:shadow-lg hover:-translate-y-1 hover:bg-white` 
                      : ''
                  }
                `}
              >
                {/* 배경 호버 효과 */}
                {isActive && (
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.bg}`}></div>
                )}

                {/* 국기 아이콘 (Absolute Centering) */}
                <div className={`
                  relative z-10 w-20 h-20 bg-white rounded-full shadow-md border border-gray-100 mb-6 shrink-0 
                  group-hover:scale-110 transition-transform duration-300 mx-auto
                  flex items-center justify-center
                `}>
                  <img 
                    src={lang.flagImg} 
                    alt={lang.name} 
                    className="w-10 h-auto object-contain shadow-sm"
                  />
                </div>

                {/* 언어 이름 및 설명 */}
                <div className="relative z-10 space-y-2">
                  <h3 className={`text-2xl font-bold text-gray-900 group-hover:${theme.main} transition-colors`}>
                    {lang.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    {lang.desc}
                  </p>
                </div>

                <div className="relative z-10 w-full border-t border-dashed border-gray-200 my-6"></div>

                {/* 하단 정보 (강의 수 / 준비중 상태) */}
                <div className="relative z-10 w-full flex flex-col gap-3">
                  {isActive ? (
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 group-hover:bg-white/80 transition-colors">
                      <div className="flex items-center gap-2">
                        {/* Active 상태 표시 애니메이션 */}
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500`}></span>
                        </span>
                        <span className="text-xs font-bold text-gray-600">수강 신청 가능</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        <span className={`${theme.main} font-bold text-lg mr-1`}>{lang.count}</span>
                        개 강의
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 rounded-xl py-3 text-sm text-gray-400 font-medium">
                      오픈 준비 중입니다
                    </div>
                  )}
                </div>

                {/* 선택됨 표시 아이콘 */}
                {isSelected && (
                  <div className={`absolute top-4 right-4 text-2xl animate-bounce ${theme.main} z-20`}>
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
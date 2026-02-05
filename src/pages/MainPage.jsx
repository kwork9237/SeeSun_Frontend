// 메인페이지 (루트)

import React, { useState } from 'react';
import MainBanner from '../components/sections/MainBanner';
import LanguageSection from '../components/sections/LanguageSection';
import MentorList from '../components/sections/MentorList';

const MainPage = () => {
  // 언어 선택 상태 관리 (기본값: english)
  const [selectedLang, setSelectedLang] = useState('english');

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* 1. 메인 배너 */}
      <MainBanner />

      {/* 2. 언어 선택 섹션 (상태 변경 함수 전달) */}
      <LanguageSection 
        selectedLang={selectedLang} 
        setSelectedLang={setSelectedLang} 
      />

      {/* 3. 멘토 리스트 섹션 (선택된 언어 전달) */}
      <MentorList 
        selectedLang={selectedLang} 
      />
    </div>
  );
};

export default MainPage;
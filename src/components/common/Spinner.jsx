import React from 'react';

/**
 * [공통 컴포넌트: Spinner]
 */
const Spinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = "" 
}) => {

  // 1. 크기별 스타일 (border 두께를 Tailwind 기본값으로 고정)
  const sizeStyles = {
    small: "h-5 w-5 border-2",
    medium: "h-10 w-10 border-4", // border-3 대신 border-4 사용
    large: "h-16 w-16 border-4"
  };

  // 2. 색상별 스타일
  // 투명도(opacity) 대신 border-t(상단)만 색상을 주어 회전 효과를 극대화합니다.
  const colorStyles = {
    primary: "border-gray-200 border-t-primary", // 전체는 연한 회색, 윗부분만 메인색
    white: "border-white/20 border-t-white"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4 w-full">
      {/* 스피너 본체 */}
      <div className={`
        animate-spin rounded-full 
        ${sizeStyles[size]} 
        ${colorStyles[color]}
      `}></div>

      {text && (
        <p className="text-gray-500 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Spinner;
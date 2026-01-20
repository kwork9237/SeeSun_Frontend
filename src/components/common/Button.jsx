import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, outline, ghost
  size = 'medium',     // small, medium, large
  disabled = false,    // true면 클릭 불가
  className = ''
}) => {

  // 1. 기본 뼈대 (Base)
  const baseStyle = "rounded-xl font-bold transition duration-200 flex justify-center items-center";

  // 2. 종류별 스타일 (Variants)
  const variants = {
    // [Primary: 메인 버튼 - 남색] 
    primary: "bg-primary text-white hover:bg-primary-hover shadow-lg hover:shadow-xl",

    // [Secondary: 서브 버튼 - 주황색/보조색]
    // 이전 코드의 shadow-orange-200과 어울리도록 설정 (색상은 프로젝트 테마에 맞춰 변경하세요)
    secondary: "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 shadow-sm",

    // [Danger: 위험 버튼 - 빨강] 
    danger: "bg-danger text-white hover:opacity-90 shadow-md",

    // [Outline: 테두리 버튼 - 흰색] 
    outline: "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900",

    // [Ghost: 투명 버튼] 
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-gray-100",
  };

  // 3. 크기별 스타일 (Sizes)
  const sizes = {
    small: "px-3 py-1.5 text-sm",   
    medium: "px-6 py-3 text-base",  // 기본
    large: "px-8 py-4 text-lg w-full", 
  };

  // 4. 비활성화 스타일 (Disabled)
  const disabledStyle = "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:bg-gray-300 hover:shadow-none";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      // className 마지막에 {className}을 넣어야 외부에서 넓이를 조절(override)할 수 있습니다.
      className={`
        ${baseStyle} 
        ${sizes[size]} 
        ${disabled ? disabledStyle : variants[variant] || variants.primary} 
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
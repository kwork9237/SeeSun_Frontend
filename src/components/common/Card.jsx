import React from 'react';

/**
 * [Common UI] 카드 컨테이너
 * - 컨텐츠를 감싸는 기본 박스 디자인 (Shadow, Border, Rounded)
 * - onClick 전달 시 인터랙션(Hover, Cursor) 자동 적용됨
 */
const Card = ({
    children,
    title,
    subtitle,
    onClick,
    className = "",
    hover = true,      // false 설정 시 클릭 가능하더라도 hover 애니메이션 제거
    padding = "medium" // 패딩 프리셋: none | small | medium | large
}) => {
    
    // 사이즈별 padding 값 매핑
    const paddingStyles = {
        none: "",
        small: "p-4",
        medium: "p-6",
        large: "p-8"
    };

    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-2xl border border-gray-100 flex flex-col
                shadow-sm transition-all duration-200 overflow-hidden
                ${paddingStyles[padding]}
                
                /* 인터랙션: onClick 핸들러가 있고 hover 옵션이 켜져있을 때만 동작 */
                ${onClick && hover ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' : ''}
                ${className}
            `}
        >
            {/* 헤더 영역: title이나 subtitle이 존재할 때만 렌더링 */}
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            )}
            
            {/* 본문 영역: flex-1로 남은 높이 모두 차지 */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default Card;
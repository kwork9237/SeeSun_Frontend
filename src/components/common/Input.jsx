import React from 'react';

/**
 * [Common UI] 기본 입력 필드 (Input)
 * - Label + Input + Error Message를 하나의 세트로 관리하는 컴포넌트
 * @param {string} label - 필드 상단 라벨 (Optional)
 * @param {string} error - 유효성 검사 실패 메시지 (존재 시 붉은 테두리 적용)
 * @param {boolean} disabled - 비활성화 여부
 */
const Input = ({ 
  label,              
  type = 'text',      
  id,                 
  placeholder,        
  value,              
  onChange,           
  error,              
  disabled = false,   
  className = '',     
  ...props            
}) => {
  return (
    <div className="w-full mb-4">
      
      {/* 1. 라벨 영역 (값이 있을 때만 렌더링) */}
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      {/* 2. Input 본체 */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 border rounded-lg outline-none transition-colors duration-200
          
          /* 상태별 스타일 분기: Error vs Default */
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' // Error: Red Theme
            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' // Normal: Blue Theme
          }
          
          /* 비활성화 상태: 배경색 변경 및 커서 제한 */
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
          
          ${className}
        `}
        {...props}
      />
      
      {/* 3. 에러 메시지 (Error Props 존재 시 노출) */}
      {error && (
        <p className="mt-1 text-xs text-red-500"> 
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
import React from "react";
import ReactDOM from "react-dom"; // 1. ReactDOM 임포트
import Button from "./Button";

/**
 * [Common UI] 모달(팝업) 컴포넌트
 * - React Portal을 사용하여 부모 컴포넌트의 제약 없이 document.body에 직접 렌더링
 * @param {string} size - 모달 너비 설정 (small | medium | large | xlarge)
 */
const Modal = ({
  isOpen, // 모달 표시 여부
  title, // 상단 제목
  children, // 본문 내용
  onClose, // 닫기/취소 이벤트
  onConfirm, // 확인/실행 이벤트
  confirmText = "확인",
  cancelText = "취소",
  isConfirmDisabled = false, // 확인 버튼 비활성화 트리거
  size = "medium",
}) => {
  // 닫힌 상태면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 사이즈별 최대 너비 설정
  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-3xl",
    xlarge: "max-w-5xl",
  };

  // 2. createPortal을 사용하여 document.body에 렌더링
  return ReactDOM.createPortal(
    /* 1. Overlay: 화면 전체를 덮는 반투명 배경 + 최상위 z-index */
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
      {/* 2. Modal Container */}
      {/* stopPropagation: 오버레이 클릭 시 닫기 기능이 있다면, 모달 내부 클릭 시 이벤트 전파 방지 */}
      <div
        className={`
                    bg-white rounded-2xl shadow-2xl w-full 
                    flex flex-col max-h-[90vh]
                    animate-fade-in-up
                    ${sizeClasses[size] || sizeClasses.medium}
                `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
            <i className="fa-solid fa-xmark"></i> {/* 아이콘이 없다면 ✕ 문자 사용 */}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">{children}</div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isConfirmDisabled}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body // 3. 렌더링될 실제 DOM 위치 (body 태그 바로 아래)
  );
};

export default Modal;

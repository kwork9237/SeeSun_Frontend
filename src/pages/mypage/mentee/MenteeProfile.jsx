import React, { useState } from 'react';
import { User, Shield, Edit, Lock } from 'lucide-react';

const MenteeProfile = () => {
  // 1. 가짜 데이터 (나중에 백엔드에서 가져올 내용)
  const [userInfo] = useState({
    name: '사용자 이름',
    role: '멘티/멘토', // 혹은 DB의 mb_type_id를 변환한 값
    id: 'user1234', // mail or username
    joinDate: '2024. 01. 01',
    nickname: '코딩왕초보',
    phone: '010-1234-5678'
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. 페이지 제목 */}
      <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>

      {/* 2. 메인 카드 영역 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm min-h-[600px]">
        
        {/* --- [상단] 프로필 사진 & 이름 & 버튼들 --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          
          {/* 왼쪽: 사진 + 이름 */}
          <div className="flex items-center gap-6">
            {/* 프로필 사진 (회색 원) */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
              <User size={40} />
            </div>
            
            {/* 이름 및 배지 */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-extrabold text-gray-900">{userInfo.name}</h3>
                {/* 멘토 신청 버튼 */}
                <button className="px-3 py-1 rounded-full border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 bg-white transition">
                   멘토 신청
                </button>
              </div>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
                {userInfo.role}
              </span>
            </div>
          </div>

          {/* 오른쪽: 수정 버튼들 */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition bg-white">
              <Edit size={16} /> 내 정보 수정
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition bg-white">
              <Lock size={16} /> 비밀번호 변경
            </button>
          </div>
        </div>

        {/* --- [하단] 정보 표시 리스트 (디자인 시안 스타일) --- */}
        <div className="space-y-4 max-w-3xl">
          {/* 각 항목을 컴포넌트로 분리해서 깔끔하게 */}
          <InfoItem label="아이디" value={userInfo.id} />
          <InfoItem label="가입일" value={userInfo.joinDate} />
          <InfoItem label="닉네임" value={userInfo.nickname} />
          <InfoItem label="전화번호" value={userInfo.phone} />
        </div>

      </div>
    </div>
  );
};

// 반복되는 정보 박스를 위한 작은 부품(컴포넌트)
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-6 py-4 h-16">
      <span className="w-32 font-bold text-gray-900">{label}</span>
      <span className="flex-1 text-gray-600 font-medium">{value}</span>
    </div>
  );
};

export default MenteeProfile;
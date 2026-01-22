import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Edit, Lock } from 'lucide-react';

const MenteeProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  
  // ★ 개발용 ID (나중에 토큰 쓸 때는 필요 없음)
  const memberId = 2; 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ============================================================
        // [1] 현재 개발용 (ID 직접 입력)
        // ============================================================
        const res = await axios.get(`/api/member/profile/${memberId}`);
        setUserInfo(res.data);


        /* ============================================================
        // [2] 미래용: 토큰 적용 시 사용 
        // ============================================================
        const token = localStorage.getItem("accessToken"); 

        const res = await axios.get("/api/mypage/profile", {
          headers: {
            Authorization: `Bearer ${token}` // 헤더에 토큰 탑승
          }
        });
        setUserInfo(res.data);
        */

      } catch (err) {
        console.error("프로필 로딩 실패", err);
      }
    };
    fetchProfile();
  }, [memberId]);

  // [Helper] 날짜 변환 (2026-01-22T... -> 2026. 01. 22)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  // [Helper] 역할 ID(숫자) -> 한글 변환
  const getRoleName = (typeId) => {
    if (typeId === 1) return '멘티';
    if (typeId === 2) return '멘토';
    if (typeId === 99) return '관리자';
    return '회원';
  };

  if (!userInfo) return <div className="p-10 text-center text-gray-500">정보를 불러오는 중...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>

      <div className="bg-white border border-gray-200 rounded-[20px] p-12 shadow-sm min-h-[600px]">
        
        {/* 상단 프로필 영역 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          
          <div className="flex items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
               {userInfo.profile_icon ? (
                 <img src={userInfo.profile_icon} alt="profile" className="w-full h-full object-cover" />
               ) : (
                 <User size={40} />
               )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* 이름 (MyPageDTO.name) */}
                <h3 className="text-3xl font-extrabold text-gray-900">{userInfo.name}</h3>
                
                {/* 멘티(1)일 때만 신청 버튼 */}
                {userInfo.mb_type_id === 1 && (
                  <button className="px-3 py-1 rounded-full border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 bg-white transition">
                     멘토 신청
                  </button>
                )}
              </div>
              {/* 역할 (MyPageDTO.mb_type_id) */}
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                {getRoleName(userInfo.mb_type_id)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm">
              <Edit size={16} /> 내 정보 수정
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm">
              <Lock size={16} /> 비밀번호 변경
            </button>
          </div>
        </div>

        {/* 하단 정보 리스트 (DTO 필드 매핑) */}
        <div className="space-y-4 max-w-3xl">
          <InfoItem label="아이디" value={userInfo.username} />
          <InfoItem label="가입일" value={formatDate(userInfo.created_at)} />
          <InfoItem label="닉네임" value={userInfo.nickname} />
          <InfoItem label="전화번호" value={userInfo.phone} />
        </div>

      </div>
    </div>
  );
};

// 재사용 UI 컴포넌트
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-8 py-5">
      <span className="w-32 font-bold text-gray-900 text-lg">{label}</span>
      <span className="flex-1 text-gray-600 font-medium text-lg">{value}</span>
    </div>
  );
};

export default MenteeProfile;
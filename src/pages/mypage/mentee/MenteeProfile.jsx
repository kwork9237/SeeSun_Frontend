import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Edit, Lock, X } from 'lucide-react';

const MenteeProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const memberId = 201; // 개발용 ID

  // --- 모달 상태 ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);

  // --- 폼 데이터 ---
  const [editForm, setEditForm] = useState({ name: '', nickname: '', phone: '', password: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // [API] 조회
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/member/profile/${memberId}`);
      setUserInfo(res.data);
      setEditForm(prev => ({
        ...prev,
        name: res.data.name,
        nickname: res.data.nickname,
        phone: res.data.phone,
        password: ''
      }));
    } catch (err) {
      console.error("프로필 로딩 실패", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [memberId]);

  // [기능 1] 정보 수정
  const handleUpdateInfo = async () => {
    if (!editForm.password) return alert("비밀번호를 입력해주세요.");
    try {
      await axios.post(`/api/member/update/${memberId}`, {
        password: editForm.password,
        myPageData: {
             name: editForm.name,
             nickname: editForm.nickname,
             phone: editForm.phone
        }
      });
      alert("수정되었습니다!");
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  // [기능 2] 비번 변경
  const handleUpdatePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return alert("새 비밀번호 불일치");
    try {
      await axios.post(`/api/member/updatePassword/${memberId}`, {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      });
      alert("비밀번호 변경 완료");
      setIsPwModalOpen(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert("현재 비밀번호가 틀렸습니다.");
    }
  };
  
  // [기능 3] 멘토 신청
  const handleMentorApply = () => {
    alert("멘토 신청 기능 준비 중입니다.");
  };

  // [헬퍼 함수]
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'}) : '-';
  const getRoleName = (t) => t === 1 ? '멘티' : t === 2 ? '멘토' : '회원';

  if (!userInfo) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>

      <div className="bg-white border border-gray-200 rounded-[20px] p-12 shadow-sm min-h-[600px]">
        
        {/* ================= [1] 상단 영역 ================= */}
        {/* max-w-4xl 제거 -> w-full로 전체 사용 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 w-full">
          
          {/* [왼쪽] 프로필 사진 + 정보 */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden shrink-0">
               {userInfo.profile_icon ? <img src={userInfo.profile_icon} alt="pf" className="w-full h-full object-cover"/> : <User size={40}/>}
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-extrabold text-gray-900 leading-none">{userInfo.name}</h3>
                  {userInfo.mb_type_id === 1 && (
                    <button onClick={handleMentorApply} className="px-3 py-1 rounded-full border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 bg-white transition">
                       멘토 신청
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                    {getRoleName(userInfo.mb_type_id)}
                  </span>
                </div>
            </div>
          </div>

          {/* [오른쪽] 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button 
              onClick={() => setIsEditModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm whitespace-nowrap"
            >
              <Edit size={16} /> 내 정보 수정
            </button>
            <button 
              onClick={() => setIsPwModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm whitespace-nowrap"
            >
              <Lock size={16} /> 비밀번호 변경
            </button>
          </div>

        </div>

        {/* ================= [2] 하단 정보 리스트 ================= */}
        {/* max-w-4xl 제거 -> 전체 너비 사용 */}
        <div className="space-y-4 w-full">
          <InfoItem label="아이디" value={userInfo.username} />
          <InfoItem label="가입일" value={formatDate(userInfo.created_at)} />
          <InfoItem label="닉네임" value={userInfo.nickname} />
          <InfoItem label="전화번호" value={userInfo.phone} />
        </div>
        
      </div>

      {/* 모달 1: 정보수정 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
             <div className="flex justify-between mb-6"><h3 className="text-xl font-bold">정보 수정</h3><button onClick={()=>setIsEditModalOpen(false)}><X className="text-gray-400"/></button></div>
             <div className="space-y-4">
               <div><label className="text-sm font-bold text-gray-600 block mb-1">이름</label><input className="w-full border border-gray-300 rounded-lg p-3" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name:e.target.value})} /></div>
               <div><label className="text-sm font-bold text-gray-600 block mb-1">닉네임</label><input className="w-full border border-gray-300 rounded-lg p-3" value={editForm.nickname} onChange={(e)=>setEditForm({...editForm, nickname:e.target.value})} /></div>
               <div><label className="text-sm font-bold text-gray-600 block mb-1">전화번호</label><input className="w-full border border-gray-300 rounded-lg p-3" value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone:e.target.value})} /></div>
               <div className="pt-4 border-t"><label className="text-sm font-bold text-blue-600 block mb-2">비밀번호 확인 (필수)</label><input className="w-full border border-blue-200 bg-blue-50 rounded-lg p-3" type="password" value={editForm.password} onChange={(e)=>setEditForm({...editForm, password:e.target.value})} placeholder="현재 비밀번호"/></div>
               <button onClick={handleUpdateInfo} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition">수정 완료</button>
             </div>
          </div>
        </div>
      )}

      {/* 모달 2: 비번변경 */}
      {isPwModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
             <div className="flex justify-between mb-6"><h3 className="text-xl font-bold">비밀번호 변경</h3><button onClick={()=>setIsPwModalOpen(false)}><X className="text-gray-400"/></button></div>
             <div className="space-y-4">
               <input className="w-full border border-gray-300 rounded-lg p-3" type="password" value={pwForm.oldPassword} onChange={(e)=>setPwForm({...pwForm, oldPassword:e.target.value})} placeholder="현재 비밀번호"/>
               <input className="w-full border border-gray-300 rounded-lg p-3" type="password" value={pwForm.newPassword} onChange={(e)=>setPwForm({...pwForm, newPassword:e.target.value})} placeholder="새 비밀번호"/>
               <input className="w-full border border-gray-300 rounded-lg p-3" type="password" value={pwForm.confirmPassword} onChange={(e)=>setPwForm({...pwForm, confirmPassword:e.target.value})} placeholder="새 비밀번호 확인"/>
               <button onClick={handleUpdatePassword} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition">변경하기</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({label, value}) => (
  <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-8 py-5">
    <span className="w-32 font-bold text-gray-900 text-lg">{label}</span>
    <span className="flex-1 text-gray-600 font-medium text-lg">{value}</span>
  </div>
);

export default MenteeProfile;
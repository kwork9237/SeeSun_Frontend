import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { User, Edit, Lock, X } from 'lucide-react';

const MenteeProfile = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 모달 상태 ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);

  // --- 폼 데이터 ---
  const [editForm, setEditForm] = useState({ name: '', nickname: '', phone: '', password: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // [API] 내 정보 조회
  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    try {
      // 조회는 기존에 성공했던 주소 그대로 유지 (/api/members/profile)
      const res = await axios.get('/api/members/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("프로필 데이터:", res.data);

      setUserInfo({
        mbId: res.data.mbId,
        username: res.data.email, 
        name: res.data.name,
        nickname: res.data.nickname,
        phone: res.data.phone,
        createdAt: res.data.createdAt
      });

      setEditForm(prev => ({
        ...prev,
        name: res.data.name,
        nickname: res.data.nickname,
        phone: res.data.phone,
        password: '' 
      }));

    } catch (err) {
      console.error("프로필 로딩 실패", err);
      if (err.response && err.response.status === 401) {
         navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  // 정보 수정 (기존 백엔드 코드 대응)

  const handleUpdateInfo = async () => {
    if (!editForm.password) return alert("본인 확인을 위해 현재 비밀번호를 입력해주세요.");
    
    const token = localStorage.getItem('accessToken');

    try {
      // 
      await axios.patch('/api/mypage/profile', 
        {
          password: editForm.password, // 검증용 비번 데이터 
          myPageData: {                // 수정할 데이터 
             name: editForm.name,
             nickname: editForm.nickname,
             phone: editForm.phone
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("회원 정보가 수정되었습니다! 🎉");
      setIsEditModalOpen(false);
      fetchProfile(); // 수정된 정보 다시 불러오기
    } catch (err) {
      console.error(err);
      alert("수정 실패: 비밀번호가 일치하지 않거나 서버 오류입니다.");
    }
  };

  // 비밀번호 변경 (PasswordUpdateDTO 대응)
  const handleUpdatePassword = async () => {
    // 유효성 검사 (새 비번 확인)
    if (pwForm.newPassword !== pwForm.confirmPassword) {
        return alert("새 비밀번호가 서로 일치하지 않습니다.");
    }
    if (pwForm.newPassword.length < 8) { // 예시: 길이 체크
        return alert("비밀번호는 최소 8자 이상이어야 합니다.");
    }
    
    const token = localStorage.getItem('accessToken');

    try {
      // ★ 백엔드 PasswordUpdateDTO 구조에 맞춰 전송
      await axios.patch('/api/mypage/password', 
        {
          oldPassword: pwForm.oldPassword, // 현재 비번
          newPassword: pwForm.newPassword  // 바꿀 비번
        }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("비밀번호가 성공적으로 변경되었습니다.\n보안을 위해 다시 로그인해주세요.");
      setIsPwModalOpen(false);
      
      // 2. 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      navigate('/login');

    } catch (err) {
      console.error(err);
      // 백엔드 에러 메시지에 따라 분기 가능
      alert("변경 실패: 현재 비밀번호가 틀렸습니다.");
    }
  };
  
  // 날짜 포맷 함수
  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('ko-KR', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  if (loading) return <div className="p-10 text-center">정보를 불러오는 중...</div>;
  if (!userInfo) return <div className="p-10 text-center">사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>

      <div className="bg-white border border-gray-200 rounded-[20px] p-12 shadow-sm min-h-[600px]">
        
        {/* 상단 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 w-full">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden shrink-0">
               <User size={40}/>
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-extrabold text-gray-900 leading-none">{userInfo.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                    멘티
                  </span>
                </div>
            </div>
          </div>

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

        {/* 하단 정보 리스트 */}
        <div className="space-y-4 w-full">
          <InfoItem label="아이디" value={userInfo.username} />
          <InfoItem label="가입일" value={formatDate(userInfo.createdAt)} />
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
               
               <div className="pt-4 border-t">
                 <label className="text-sm font-bold text-blue-600 block mb-2">비밀번호 확인 (필수)</label>
                 <input className="w-full border border-blue-200 bg-blue-50 rounded-lg p-3" type="password" value={editForm.password} onChange={(e)=>setEditForm({...editForm, password:e.target.value})} placeholder="현재 비밀번호를 입력해야 수정됩니다."/>
               </div>
               
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
               {/* oldPassword 매핑 */}
               <input className="w-full border border-gray-300 rounded-lg p-3" type="password" value={pwForm.oldPassword} onChange={(e)=>setPwForm({...pwForm, oldPassword:e.target.value})} placeholder="현재 비밀번호"/>
               
               {/* newPassword 매핑 */}
               <input className="w-full border border-gray-300 rounded-lg p-3" type="password" value={pwForm.newPassword} onChange={(e)=>setPwForm({...pwForm, newPassword:e.target.value})} placeholder="새 비밀번호(8~20자)"/>
               
               {/* confirmPassword (프론트 확인용) */}
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
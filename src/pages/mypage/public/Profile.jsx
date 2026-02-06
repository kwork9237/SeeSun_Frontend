import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// [수정] 아이콘 추가 (Award, Upload, CheckCircle)
import { User, Edit, Lock, X, AlertCircle, Award, Upload, CheckCircle } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import apiClient from "../../../api/apiClient";
import axios from 'axios'; // axios import 필수!

const Profile = () => {
  const navigate = useNavigate();
  
  const { role, logout } = useAuth(); // logout 함수도 필요 시 사용
  const roleLabel = role === "ROLE_MENTOR" ? "멘토" : "멘티";

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 모달 상태 ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [isMentoModalOpen, setIsMentoModalOpen] = useState(false); // [추가] 멘토 모달

  // --- 폼 데이터 ---
  const [editForm, setEditForm] = useState({ name: "", nickname: "", phone: "", password: "" });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  // --- [추가] 멘토 신청용 데이터 ---
  const [mentoDetails, setMentoDetails] = useState("");
  const [mentoFile, setMentoFile] = useState(null);
  const [mentoLoading, setMentoLoading] = useState(false);

  // --- 유효성 검사 에러 메시지 상태 ---
  const [nicknameError, setNicknameError] = useState("");

  // [API] 내 정보 조회
  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/members/profile");

      setUserInfo({
        mbId: res.data.mbId,
        username: res.data.email,
        name: res.data.name,
        nickname: res.data.nickname,
        phone: res.data.phone,
        createdAt: res.data.createdAt,
      });

      setEditForm((prev) => ({
        ...prev,
        name: res.data.name,
        nickname: res.data.nickname,
        phone: res.data.phone,
        password: "",
      }));
    } catch (err) {
      console.error("프로필 로딩 실패", err);
      if (err.response && err.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  // --- [수정] 닉네임 변경 핸들러 (실시간 검사: 16글자) ---
  const handleNicknameChange = (e) => {
    const newNickname = e.target.value;
    setEditForm({ ...editForm, nickname: newNickname });

    if (newNickname.length > 16) {
      setNicknameError("최대 16글자까지 입력 가능합니다.");
      return;
    }

    const hasEnglish = /[a-zA-Z]/.test(newNickname);
    if (!hasEnglish) {
      setNicknameError("영어가 최소 1글자는 포함되어야 합니다.");
    } else {
      setNicknameError("");
    }
  };

  // --- [최종 수정] 멘토 신청 핸들러 (순수 axios 사용) ---
  const handleMentoSubmit = async () => {
    if (!mentoDetails || !mentoFile) return alert("신청 사유와 증빙 서류를 모두 입력해주세요.");

    try {
      setMentoLoading(true);
      
      const token = localStorage.getItem("accessToken");
      
      // 토큰 확인용 로그
      console.log("현재 전송하려는 토큰:", token); 

      if (!token) {
        alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("details", mentoDetails);
      formData.append("file", mentoFile);

      // [핵심 변경] apiClient 대신 그냥 'axios' 사용 (JSON 강제 설정 회피)
      await axios.post("/api/mento/apply", formData, {
        headers: {
          "Authorization": `Bearer ${token}`, // 토큰 직접 부착
          "Content-Type": "multipart/form-data", // 파일 전송 명시
        }
      });

      alert("멘토 신청이 완료되었습니다! 🎉\n관리자 승인을 기다려주세요.");
      
      setMentoDetails("");
      setMentoFile(null);
      setIsMentoModalOpen(false);
      
    } catch (err) {
      console.error("멘토 신청 에러:", err);
      
      // 에러 메시지 상세 확인
      if (err.response) {
         console.log("서버 에러 응답:", err.response.data);
         console.log("에러 상태 코드:", err.response.status);
      }

      if (err.response && err.response.status === 401) {
         alert("인증에 실패했습니다. (401)\n로그인 토큰 문제일 수 있으니, 완전히 로그아웃 후 다시 시도해주세요.");
      } else if (err.response && err.response.status === 400) {
         alert("잘못된 요청입니다. 파일 용량이 너무 크거나 형식이 맞지 않을 수 있습니다.");
      } else {
         alert("신청 중 오류가 발생했습니다.");
      }
    } finally {
      setMentoLoading(false);
    }
  };

  // 비밀번호 변경
  const handleUpdatePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return alert("새 비밀번호가 서로 일치하지 않습니다.");
    if (pwForm.newPassword.length < 8) return alert("비밀번호는 최소 8자 이상이어야 합니다.");

    try {
      await apiClient.patch("/mypage/password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });

      alert("비밀번호가 성공적으로 변경되었습니다.\n보안을 위해 다시 로그인해주세요.");
      setIsPwModalOpen(false);

      if (logout) logout();
      else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert("변경 실패: 현재 비밀번호가 틀렸습니다.");
    }
  };

  // 정보 수정 요청 (누락된 부분 복구)
  const handleUpdateInfo = async () => {
    if (!editForm.password) return alert("본인 확인을 위해 현재 비밀번호를 입력해주세요.");
    if (nicknameError) return alert(nicknameError);
    if (editForm.nickname.length > 16) return alert("닉네임은 최대 16글자까지만 가능합니다.");
    if (!/[a-zA-Z]/.test(editForm.nickname)) return alert("닉네임에 영어가 최소 1글자는 포함되어야 합니다.");

    try {
      await apiClient.patch("/mypage/profile", {
        password: editForm.password,
        myPageData: {
          name: editForm.name,
          nickname: editForm.nickname,
          phone: editForm.phone,
        },
      });

      alert("회원 정보가 수정되었습니다! 🎉");
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("수정 실패: 비밀번호가 일치하지 않거나 서버 오류입니다.");
    }
  };


  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) return <div className="p-10 text-center">정보를 불러오는 중...</div>;
  if (!userInfo) return <div className="p-10 text-center">사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>

      <div className="bg-white border border-gray-200 rounded-[20px] p-12 shadow-sm min-h-[600px]">
        {/* 상단 프로필 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 w-full">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden shrink-0">
              <User size={40} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-extrabold text-gray-900 leading-none">
                  {userInfo.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${role === "ROLE_MENTOR" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            {/* [핵심] role이 MENTEE일 때만 '멘토 신청' 버튼 표시 -> 모달 열기 */}
            {role === "ROLE_MENTEE" && (
              <button
                onClick={() => setIsMentoModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-blue-200 bg-blue-50 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm whitespace-nowrap"
              >
                <Award size={16} /> 멘토 신청
              </button>
            )}

            <button
              onClick={() => {
                setIsEditModalOpen(true);
                setNicknameError(""); // 모달 열 때 에러 초기화
              }}
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
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold">정보 수정</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">이름</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">
                  닉네임(영어포함 최대 16글자)
                </label>
                <input
                  className={`w-full border rounded-lg p-3 ${nicknameError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                  value={editForm.nickname}
                  onChange={handleNicknameChange}
                  maxLength={16}
                />
                {nicknameError && (
                  <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {nicknameError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">전화번호</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-bold text-blue-600 block mb-2">
                  비밀번호 확인 (필수)
                </label>
                <input
                  className="w-full border border-blue-200 bg-blue-50 rounded-lg p-3"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="현재 비밀번호를 입력해야 수정됩니다."
                />
              </div>

              <button
                onClick={handleUpdateInfo}
                disabled={!!nicknameError}
                className={`w-full font-bold py-4 rounded-xl transition ${nicknameError ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모달 2: 비번변경 */}
      {isPwModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold">비밀번호 변경</h3>
              <button onClick={() => setIsPwModalOpen(false)}>
                <X className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full border border-gray-300 rounded-lg p-3"
                type="password"
                value={pwForm.oldPassword}
                onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                placeholder="현재 비밀번호"
              />
              <input
                className="w-full border border-gray-300 rounded-lg p-3"
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="새 비밀번호(8~20자)"
              />
              <input
                className="w-full border border-gray-300 rounded-lg p-3"
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="새 비밀번호 확인"
              />
              <button
                onClick={handleUpdatePassword}
                className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition"
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [추가] 모달 3: 멘토 신청 (옛날 코드 스타일 통합 + 기능 수정) */}
      {isMentoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMentoModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[450px] rounded-[32px] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">멘토 신청 🎓</h2>
                <p className="text-xs text-gray-400 mt-1 font-bold">당신의 전문성을 증명해주세요.</p>
              </div>
              <button onClick={() => setIsMentoModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* 입력 폼 */}
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-gray-300 uppercase mb-2 block ml-1">신청 상세 (경력 및 소개)</label>
                <textarea 
                  value={mentoDetails}
                  onChange={(e) => setMentoDetails(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-[20px] p-4 text-sm focus:outline-none focus:border-[#FF6B4E] focus:bg-white transition-all resize-none h-32 placeholder:text-gray-300"
                  placeholder="이곳에 경력을 기입해주세요."
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-300 uppercase mb-2 block ml-1">증빙 서류 (PDF, 이미지)</label>
                <label className={`group block w-full border-2 border-dashed rounded-[20px] p-6 text-center cursor-pointer transition-all ${mentoFile ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-[#FF6B4E] hover:bg-orange-50'}`}>
                    {mentoFile ? (
                      <div className="flex flex-col items-center text-green-600">
                        <CheckCircle size={24} className="mb-2" />
                        <span className="text-xs font-bold truncate max-w-[200px]">{mentoFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-[#FF6B4E] transition-colors">
                        <Upload size={24} className="mb-2" />
                        <span className="text-xs font-bold">클릭하여 파일 업로드</span>
                      </div>
                    )}
                    <input type="file" className="hidden" onChange={(e) => setMentoFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsMentoModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 rounded-[18px] font-bold text-gray-500 hover:bg-gray-200 transition-all">취소</button>
              <button 
                onClick={handleMentoSubmit} 
                disabled={mentoLoading || !mentoDetails || !mentoFile}
                className="flex-1 py-3.5 bg-[#FF6B4E] text-white rounded-[18px] font-bold shadow-lg shadow-orange-100 hover:bg-[#FF5A36] disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {mentoLoading ? "전송 중..." : "신청하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-8 py-5">
    <span className="w-32 font-bold text-gray-900 text-lg">{label}</span>
    <span className="flex-1 text-gray-600 font-medium text-lg">{value}</span>
  </div>
);

export default Profile;
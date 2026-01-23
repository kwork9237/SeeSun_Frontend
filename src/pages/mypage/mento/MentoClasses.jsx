import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MentoClasses= () => {
  const navigate = useNavigate();
  
  // 데이터 초기값 설정
  const [data, setData] = useState({
    title: "로딩 중...",
    mentorName: "",
    cost: 0,
    difficultyLevel: 1,
    nextLectureDate: null, 
    nextLectureTime: null,
    leId: null
  });

  const memberId = 3; // 테스트용 ID (나중에 토큰으로 교체)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ============================================================
        // [1] 현재 개발용 (Test Mode) - ID 직접 입력
        // ============================================================
        const res = await axios.get(`/api/mypage/home/${memberId}`);
        setData(res.data);


        /* ============================================================
        // [2] 나중에 토큰 적용 시 사용할 코드 (Real Mode)
        // ============================================================
        // 저장된 토큰 꺼내기 (이름이 accessToken 인지 꼭 확인!)
        const token = localStorage.getItem("accessToken"); 

        const res = await axios.get("/api/mypage/home", {
          headers: {
            Authorization: `Bearer ${token}` // 헤더에 토큰 탑승!
          }
        });
        setData(res.data);
        */

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setData(prev => ({ ...prev, title: "강의 정보를 불러올 수 없습니다." }));
      }
    };
    fetchData();
  }, [memberId]);

  // 난이도 숫자 -> 텍스트 변환
  const getDifficultyLabel = (level) => {
    if (level === 1) return "🌱 초급";
    if (level === 2) return "🌿 중급";
    return "🌲 고급";
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">홈</h2>

      {/* 메인 강의 카드 */}
      <div className="bg-white border border-gray-200 rounded-[20px] p-12 shadow-sm mb-6 flex justify-between items-center min-h-[250px]">
        <div>
          {/* 타이틀 분기: 일정이 있으면 '곧 수업', 없으면 '최근 강의' */}
          <p className="text-gray-500 font-bold mb-2 text-sm">
            {data.nextLectureDate ? "곧 수업 예정 강의 ⏰" : "최근 수강 신청한 강의"}
          </p>
          
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            {data.title}
          </h3>
          <p className="text-xl text-gray-600 font-medium mb-8">
            {data.mentorName ? `멘토 : ${data.mentorName}` : ''}
          </p>
          
          {/* ★ 핵심 UI 로직: 날짜가 있으면 날짜 표시, 없으면 스펙 뱃지 표시 ★ */}
          {data.nextLectureDate ? (
            <div className="text-lg font-bold text-gray-800">
               📅 {data.nextLectureDate} <span className="mx-2 text-gray-300">|</span> 🕒 {data.nextLectureTime}
            </div>
          ) : (
            // 날짜 없을 때 (Fallback UI)
            data.leId && (
              <div className="flex gap-3">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold">
                  {getDifficultyLabel(data.difficultyLevel)}
                </span>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">
                  ₩ {data.cost.toLocaleString()}
                </span>
              </div>
            )
          )}
        </div>

        {/* 버튼: 일정이 있으면 '입장', 없으면 '보러가기' */}
        {data.leId && (
          <button 
            onClick={() => navigate(`/lecture/detail/${data.leId}`)}
            className="bg-black text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-lg"
          >
            {data.nextLectureDate ? "강의실 입장" : "강의 보러가기"}
          </button>
        )}
      </div>

    </div>
  );
};

export default MentoClasses;
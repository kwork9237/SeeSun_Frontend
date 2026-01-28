import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MenteePayment = () => {
  //결제 기록
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
      }

      try {
        // API 호출
        const res = await axios.get('/api/orders/history', {
          headers: {
            Authorization: `Bearer ${token}` // ★ 백엔드 컨트롤러의 user를 채워줌
          }
        });
        
        setHistory(res.data);
      } catch (err) {
        console.error("결제 내역 로딩 실패", err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) return <div className="p-10 text-center">결제 내역을 불러오는 중...</div>;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">결제 내역</h2>
      <div className="bg-white border border-gray-200 rounded-[20px] p-8 shadow-sm min-h-[500px]">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-400">
            아직 결제한 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row justify-between items-center bg-[#F3F4F6] px-8 py-6 rounded-[20px]">
                <div className="text-center md:text-left mb-4 md:mb-0 w-full md:w-1/4">
                  <div className="text-xl font-bold text-gray-900 tracking-tight">{item.date_part}</div>
                  <div className="text-lg text-gray-500 mt-1 font-medium">{item.time_part}</div>
                </div>
                <div className="text-center mb-4 md:mb-0 w-full md:w-2/4">
                  <div className="text-xl font-bold text-gray-800 mb-1 truncate px-4">{item.lecture_title}</div>
                  <div className="text-gray-500 font-medium">{item.method || '카드 결제'}</div>
                </div>
                <div className="text-center md:text-right w-full md:w-1/4">
                  <div className="text-xl font-bold text-gray-900 mb-1">{Number(item.cost).toLocaleString()} 원</div>
                  <div className="text-gray-500 font-medium">결제완료</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteePayment;
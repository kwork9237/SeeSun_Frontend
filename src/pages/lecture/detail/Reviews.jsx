import React, { useState, useEffect, useCallback } from 'react';
import { Star, Send } from 'lucide-react';
import axios from 'axios';

const Reviews = ({ leId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortType, setSortType] = useState('latest');
  const [rating, setRating] = useState(5); 
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  // 1. 후기 데이터 가져오기
  const fetchReviewData = useCallback(async () => {
    try {
        const response = await axios.get(`http://localhost:8080/api/reviews`, {
            params: { leId: leId, sort: sortType }
        });
        setReviews(response.data.list || []);
        setStats(response.data.stats || null);
    } catch (err) {
        console.error("강의 후기 로드 실패:", err);
    }
}, [leId, sortType]);
  useEffect(() => {
    if (leId) fetchReviewData();
  }, [fetchReviewData, leId]);

  // 2. 후기 등록하기
  const handleSubmitReview = async () => {
    if (!comment.trim()) return alert("강의 후기 내용을 입력해주세요.");
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return alert("로그인이 필요한 서비스입니다.");

    try {
      const payload = { 
        leId: Number(leId),    // DTO 필드명 leId (DB: le_id)
        score: Number(rating), // DTO 필드명 score (DB: score)
        content: comment 
      };

      await axios.post('http://localhost:8080/api/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("강의 후기가 등록되었습니다.");
      setComment('');
      setRating(5);
      fetchReviewData(); 
    } catch (err) {
      console.error("에러:", err.response);
      alert("강의 후기 등록 실패: " + (err.response?.data || "서버 통신 오류"));
    }
  };

  const getPercent = (count) => {
    if (!stats || stats.totalCount === 0) return 0;
    return (count / stats.totalCount) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-center bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
        <div>
          <h2 className="text-xl font-black mb-1">후기 평점</h2>
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-orange-400 fill-orange-400" />
            <span className="text-2xl font-black">{stats?.avgScore || "0.0"}</span>
            <span className="text-gray-400 text-sm">({stats?.totalCount || 0}개)</span>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((num) => (
              <div key={num} className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <span className="w-12">{num} star</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                    style={{ width: `${getPercent(stats?.[`star${num}`])}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 작성 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
          <p className="text-sm font-bold text-gray-700 mb-3">강의가 어떠셨나요?</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star 
                key={n} 
                size={24} 
                className={`cursor-pointer ${(hover || rating) >= n ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
              />
            ))}
          </div>
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] mb-3"
            placeholder="수강 후기를 남겨주세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleSubmitReview} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all">
            수강 후기 등록하기 <Send size={16} />
          </button>
        </div>
      </div>

      {/* 리스트 출력 섹션 */}
      <div className="flex flex-col gap-6">
        {reviews.map((rev) => (
          <div key={rev.leEvalId} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">
                  {rev.nickname?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{rev.nickname}</h4>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= rev.score ? "fill-orange-400 text-orange-400" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{rev.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Send, ThumbsUp } from 'lucide-react';
import axios from 'axios';

const Reviews = ({ lectureId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortType, setSortType] = useState('latest'); // 정렬 상태 추가
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  // 1. 데이터 가져오기 함수 (정렬 포함)
  const fetchReviewData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/reviews`, {
        params: { lectureId: lectureId, sort: sortType }
      });
      setReviews(response.data.list); // 백엔드 Service에서 넘겨준 "list"
      setStats(response.data.stats);   // 백엔드 Service에서 넘겨준 "stats"
    } catch (err) {
      console.error("리뷰 데이터를 불러오는데 실패했습니다.", err);
    }
  }, [lectureId, sortType]);

  useEffect(() => {
    if (lectureId) fetchReviewData();
  }, [fetchReviewData]);

  // 2. 리뷰 등록 함수
  const handleSubmitReview = async () => {
    if (!comment.trim()) return alert("리뷰 내용을 입력해주세요.");
    const token = localStorage.getItem('token');

    try {
      const payload = { lectureId, rating, content: comment };
      await axios.post('/api/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("리뷰가 등록되었습니다.");
      setComment('');
      fetchReviewData(); // ✅ 새로고침 없이 목록 갱신
    } catch (err) {
      alert("리뷰 등록 실패: " + (err.response?.data || "권한이 없습니다."));
    }
  };

  // 3. 통계 계산 헬퍼 함수 (그래프 비율 계산용)
  const getPercent = (count) => {
    if (!stats || stats.totalCount === 0) return 0;
    return (count / stats.totalCount) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* --- 상단 통계 섹션 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-center bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
        <div>
          <h2 className="text-xl font-black mb-1">Course Reviews</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-orange-400"><Star size={20} fill="currentColor" /></div>
            <span className="text-2xl font-black">{stats?.avgRating || 0.0}</span>
            <span className="text-gray-400 text-sm">({stats?.totalCount || 0} reviews)</span>
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

        {/* --- 리뷰 작성 섹션 --- */}
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
          <button 
            onClick={handleSubmitReview}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all"
          >
            리뷰 등록하기 <Send size={16} />
          </button>
        </div>
      </div>

      {/* --- 리뷰 리스트 필터 --- */}
      <div className="flex gap-4 mb-8">
        {[
          { label: '최신순', value: 'latest' },
          { label: '평점 높은 순', value: 'high' },
          { label: '평점 낮은 순', value: 'low' }
        ].map((f) => (
          <button 
            key={f.value} 
            onClick={() => setSortType(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              sortType === f.value ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* --- 실제 리뷰들 --- */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-6 bg-white border-b border-gray-100 transition-all hover:bg-gray-50/50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <div className="flex text-orange-400 mb-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={12} fill={n <= review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {review.nickname} 
                      <span className="text-[10px] text-gray-400 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-orange-500 transition-colors"><ThumbsUp size={16} /></button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-10">아직 작성된 리뷰가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Reviews;
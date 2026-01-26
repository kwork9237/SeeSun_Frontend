import React from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card"; 

const LectureCard = ({ data }) => {
  
  // ✅ [수정] 이미지 경로 처리 함수 (네트워크 에러 방지)
  const getImageSrc = (img) => {
    // 1. 이미지가 없으면 -> 이름 이니셜로 아바타 생성 (via.placeholder 에러 해결)
    if (!img) {
      // data.name을 이용해 이니셜 이미지 생성 (예: Hong Gil Dong -> HG)
      return `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=random`;
    }

    // 2. http로 시작하면 -> 그대로 사용 (외부 링크 or 백엔드 전체 경로)
    if (img.startsWith("http")) return img;

    // 3. 파일명만 있으면 -> 기존 로직 유지 (랜덤 유저 API)
    // 만약 백엔드 업로드 이미지를 쓰려면 아래 주석을 풀고 사용하세요.
    // return `http://localhost:16500/uploads/${img}`;
    return `https://randomuser.me/api/portraits/${img}`; 
  };

  return (
    <Card
      hover={true}
      padding="medium"
      className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 transition-all duration-300 group hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50"
    >
      {/* 1. [Header] */}
      <div className="flex gap-4 mb-3">
        <div className="relative shrink-0">
          <img
            src={getImageSrc(data.img)}
            alt={data.name}
            className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm"
            // 혹시라도 이미지가 깨질 경우를 대비한 2차 방어선
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=random`;
            }}
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* ✅ [수정] 제목이 잘리지 않도록 truncate 제거 -> line-clamp-2 적용 */}
          <h3 
            className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 mb-1"
            title={data.lectureTitle} // 마우스 올리면 전체 제목 표시
          >
            {data.lectureTitle}
          </h3>
          
          <p className="text-sm text-gray-600 font-medium mt-0.5">
            {data.name}
          </p>
          <div className="flex items-center mt-1">
            <div className="flex text-yellow-400 text-xs mr-1">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`fa-solid fa-star ${i < Math.floor(data.rate) ? "" : "text-gray-200"}`}></i>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">({Number(data.rate).toFixed(1)})</span>
          </div>
        </div>
      </div>

      {/* 2. [Body] */}
      <div className="mb-4 flex-grow">
        <p className="text-xs text-blue-500 font-bold mb-2 uppercase tracking-tighter">
            {data.catchPhrase}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.tags && data.tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
              {tag}
            </span>
          ))}
        </div>
        {/* 설명글도 2줄 제한 */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-[2.5rem]">
          {data.desc}
        </p>
      </div>

      <div className="border-t border-dashed border-gray-100 my-auto mb-4"></div>

      {/* 3. [Footer] */}
      <div className="flex items-end justify-between mt-auto">
        <div className="text-xs text-gray-500 space-y-1.5">
          <p className="flex items-center gap-1.5">
            <i className="fa-regular fa-clock text-orange-400"></i>
            <span>총 <span className="font-semibold text-gray-700">{data.totalHours}시간</span></span>
          </p>
          <p className="flex items-center gap-1.5">
            <i className="fa-regular fa-calendar-check text-orange-400"></i>
            <span className="truncate max-w-[100px]"> <span className="font-semibold text-gray-700">{data.mainTime}</span></span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
              <span className="font-bold text-gray-900 text-lg">{data.price}</span>
              <span className="text-xs text-gray-400 ml-0.5">/시간</span>
          </div>
          
          <Link to={`/lecture/detail/${data.id}`}>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
              수강 신청
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LectureCard;
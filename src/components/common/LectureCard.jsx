import React from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card"; // common 폴더에 있는 Card

const LectureCard = ({ data }) => {
  return (
    <Card
      hover={true}
      padding="medium"
      className="flex flex-col h-full border-gray-200 transition-all duration-300 group hover:border-orange-200 hover:shadow-orange-100/50"
    >
      {/* 1. [Header] 프로필 이미지 + 강의 정보 */}
      <div className="flex gap-4 mb-3">
        <div className="relative shrink-0">
          <img
            src={`https://randomuser.me/api/portraits/${data.img}`}
            alt={data.name}
            className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">
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
            <span className="text-xs text-gray-500 font-medium">({data.rate})</span>
          </div>
        </div>
      </div>

      {/* 2. [Body] 설명 및 태그 */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 font-medium mb-2 truncate">
          {data.catchPhrase}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {data.desc}
        </p>
      </div>

      <div className="border-t border-dashed border-gray-200 my-auto mb-4"></div>

      {/* 3. [Footer] 정보 및 버튼 */}
      <div className="flex items-end justify-between">
        <div className="text-xs text-gray-500 space-y-1.5">
          <p className="flex items-center gap-1.5">
            <i className="fa-regular fa-clock text-orange-400"></i>
            <span>총 <span className="font-semibold text-gray-700">{data.totalHours}시간</span> 과정</span>
          </p>
          <p className="flex items-center gap-1.5">
            <i className="fa-regular fa-calendar-check text-orange-400"></i>
            <span>수업 가능 : <span className="font-semibold text-gray-700">{data.mainTime}</span></span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
             <span className="font-bold text-gray-900 text-lg">{data.price}원</span>
             <span className="text-xs text-gray-400 ml-0.5">/시간</span>
          </div>
          
          <Link to={`/LectureDetail/${data.id}`}>
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
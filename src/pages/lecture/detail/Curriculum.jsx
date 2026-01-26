import React from 'react';

const Curriculum = ({ lecture }) => {
  // ✅ 1. 데이터 디버깅 (콘솔에서 sections가 제대로 들어오는지 확인)
  console.log("Curriculum으로 넘어온 데이터:", lecture);

  // ✅ 2. 방어 코드: lecture 자체가 없거나 sections가 로드되지 않았을 때
  if (!lecture || !lecture.sections) {
    return (
      <div className="py-20 text-center text-gray-400 font-bold">
        커리큘럼 데이터를 불러오는 중입니다...
      </div>
    );
  }

  // ✅ 3. 데이터는 왔는데 리스트가 비어있을 때
  if (lecture.sections.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 font-bold">
        등록된 강의 목차가 없습니다.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="space-y-12">
        {lecture.sections.map((section, sIdx) => (
          <div key={section.sectionId || sIdx} className="space-y-6">
            {/* 섹션 제목 */}
            <h3 className="text-[22px] font-black text-gray-900 border-b border-gray-50 pb-4">
              {section.title}
            </h3>

            {/* 레슨 리스트 */}
            <div className="space-y-5 ml-1">
              {section.lessons && section.lessons.map((lesson, lIdx) => (
                <div 
                  key={lesson.lessonId || lIdx} 
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 text-[12px] group-hover:text-orange-500 transition-colors">▶</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[16px] font-bold text-gray-800">
                        Lesson {String(lIdx + 1).padStart(2, '0')}:
                      </span>
                      <span className="text-[16px] font-medium text-gray-600 group-hover:text-gray-900">
                        {lesson.title}
                      </span>
                    </div>
                  </div>
                  {/* DTO의 duration 필드 사용 */}
                  <span className="text-[13px] text-gray-400 font-bold">
                    {lesson.duration || 0} 분
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;
// src/pages/realtime/components/ParticipantsPanel.jsx
import React from "react";

export default function ParticipantsPanel({ participants = [], selfId = null }) {
  // 이름 추출 함수 ([MENTOR] / [MENTEE] 제거)
  const extractName = (display = "") =>
    display.replace("[MENTOR]", "").replace("[MENTEE]", "").trim();

  // 정렬 규칙
  // 1) 멘토 > 멘티
  // 2) 멘티는 이름 기준 오름차순
  const sorted = [...participants].sort((a, b) => {
    const ad = a.display || "";
    const bd = b.display || "";

    const aIsMentor = ad.includes("[MENTOR]");
    const bIsMentor = bd.includes("[MENTOR]");

    // 1. 멘토 우선
    if (aIsMentor && !bIsMentor) return -1;
    if (!aIsMentor && bIsMentor) return 1;

    // 2. 둘 다 멘토이거나 멘티이면 이름순 오름차순
    return extractName(ad).localeCompare(extractName(bd), "ko");
  });

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 text-sm">참여자 목록</h2>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
          {participants.length} 명
        </span>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {sorted.map((p) => {
          const display = p.display || "이름 없음";
          const isMentor = display.includes("[MENTOR]");
          const isSelf = selfId && Number(selfId) === Number(p.id);

          return (
            <div
              key={p.id}
              className={`
                                flex items-center gap-3 p-3 rounded-lg border shadow-sm transition
                                ${isMentor ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}
                            `}
            >
              {/* 프로필 아이콘 */}
              <div
                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                                    ${isMentor ? "bg-blue-500" : "bg-gray-400"}
                                `}
              >
                {extractName(display)?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-800 text-sm truncate">
                  {display}
                  {isSelf && <span className="ml-2 text-[10px] text-blue-500 font-bold">(나)</span>}
                </span>

                <span className="text-xs text-gray-500">{isMentor ? "멘토" : "멘티"}</span>
              </div>
            </div>
          );
        })}

        {participants.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">아직 참여자가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

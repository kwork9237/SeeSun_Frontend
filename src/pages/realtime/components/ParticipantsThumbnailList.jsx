// src/pages/realtime/components/ParticipantsThumbnailList.jsx
import React from "react";

export default function ParticipantsThumbnailList({ participants = [], videoRefs = {} }) {
  return (
    <div className="w-full py-3 px-4 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <div className="flex gap-4">
        {participants.length === 0 && (
          <div className="text-gray-400 text-sm px-2">아직 참여자가 없습니다.</div>
        )}

        {participants.map((p) => (
          <div
            key={p.id}
            className="
              relative
              w-[140px] h-[100px]
              rounded-xl
              bg-black
              overflow-hidden
              shadow-md
              border border-white/10
              backdrop-blur-sm
            "
          >
            {/* 비디오 */}
            <video
              ref={videoRefs[p.id]}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />

            {/* 이름 오버레이 */}
            <div
              className="
              absolute bottom-0 w-full
              bg-gradient-to-t from-black/70 to-black/0
              text-white text-xs px-2 py-1
              font-medium
            "
            >
              {p.display || `참여자 ${p.id}`}
            </div>

            {/* 음성 감지 시 강조 (준비만 해둠) */}
            {p.isSpeaking && (
              <div className="absolute inset-0 border-2 border-blue-400 rounded-xl shadow-[0_0_12px_rgba(0,123,255,0.6)]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

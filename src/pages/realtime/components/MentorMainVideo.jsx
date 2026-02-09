// src/pages/realtime/components/MentorMainVideo.jsx
import React from "react";

export default function MentorMainVideo({
  videoRef,
  mentorName = "멘토",
  isLive = true,
  isCamOn = true,
}) {
  return (
    <div className="w-full h-full p-2 box-border">
      {" "}
      {/* ← padding 추가됨 */}
      <div
        className="
                    relative
                    w-full h-full
                    rounded-2xl
                    overflow-hidden
                    bg-black
                    shadow-[0_8px_20px_rgba(0,0,0,0.25)]
                    border border-white/10
                "
      >
        {/* 비디오 출력 */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-contain bg-black rounded-lg ${!isCamOn ? "hidden" : "block"}`}
        />

        {/* 카메라가 꺼졌을 때만 보여줄 대체 UI */}
        {!isCamOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-300 text-xl font-semibold">
            {mentorName}
          </div>
        )}

        {/* 상단 그라데이션 overlay */}
        <div
          className="
                    absolute top-0 left-0 w-full h-24
                    bg-gradient-to-b from-black/60 to-transparent
                    pointer-events-none
                "
        />

        {/* LIVE + 이름 표시 */}
        <div className="absolute top-3 left-4 flex items-center gap-3">
          {isLive && (
            <div
              className="
                                px-3 py-1
                                bg-red-600
                                text-white text-xs font-bold
                                rounded-lg shadow
                            "
            >
              LIVE
            </div>
          )}

          <div
            className="
                            px-3 py-1
                            bg-white/20 backdrop-blur-md
                            border border-white/30
                            text-white text-sm
                            font-semibold
                            rounded-lg
                        "
          >
            {mentorName}
          </div>
        </div>

        {/* 하단 overlay */}
        <div
          className="
                        absolute bottom-0 left-0 w-full h-20
                        bg-gradient-to-t from-black/60 to-transparent
                        pointer-events-none
                    "
        ></div>
      </div>
    </div>
  );
}

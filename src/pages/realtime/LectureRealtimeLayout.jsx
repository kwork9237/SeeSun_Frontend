// src/pages/realtime/LectureRealtimeLayout.jsx
import React from "react";

export default function LectureRealtimeLayout({
                                                  thumbnailList,
                                                  mentorVideo,
                                                  participantsPanel,
                                                  chatPanel,
                                                  controlsBar,
                                              }) {
    return (
        <div className="w-screen h-screen overflow-hidden bg-gray-50 relative flex">

            {/* 좌측(멘토영상) + 우측패널 전체 */}
            <div className="flex flex-row w-full h-full">

                {/* =============================
            좌측 Mentor 전체 영역
        ============================== */}
                <div className="flex flex-col flex-[1.6] overflow-hidden">

                    {/* (옵션) 썸네일 영역: 필요시 활성화 */}
                    {/*
          <div className="h-[120px] border-b border-gray-200 bg-white/70 backdrop-blur-md shadow-sm">
            {thumbnailList}
          </div>
          */}

                    {/* Mentor 영상 컨테이너 */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full">
                            {mentorVideo}
                        </div>
                    </div>
                </div>

                {/* =============================
            우측 패널 (참여자 + 채팅)
        ============================== */}
                <div
                    className="
            w-[480px]
            bg-white
            border-l border-gray-200
            flex flex-col
            overflow-hidden
          "
                >
                    {/* 참여자: 상단 30% */}
                    <div className="h-[30%] border-b border-gray-200 overflow-y-auto">
                        {participantsPanel}
                    </div>

                    {/* 채팅: 하단 70% */}
                    <div className="h-[70%] overflow-y-auto">
                        {chatPanel}
                    </div>
                </div>

            </div>

            {/* =============================
          하단 컨트롤바
      ============================== */}
            {controlsBar}
        </div>
    );
}

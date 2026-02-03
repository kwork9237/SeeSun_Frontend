// src/pages/realtime/components/ControlsBar.jsx
import React from "react";

export default function ControlsBar({
  camOn,
  micOn,
  screenSharing,
  onToggleCam,
  onToggleMic,
  onStartShare,
  onStopShare,
  sessionStarted,
  onStartSession,
  onEndSession,
}) {
  return (
    <div
      className="
      fixed bottom-6 left-1/2 -translate-x-1/2
      bg-white/90 backdrop-blur-md
      flex items-center gap-4
      px-6 py-3 rounded-2xl shadow-lg border border-gray-200
    "
    >
      {/* 카메라 */}
      <button
        onClick={onToggleCam}
        className={`px-4 py-2 rounded-xl font-semibold ${
          camOn ? "bg-gray-100" : "bg-red-500 text-white"
        }`}
      >
        {camOn ? "카메라 ON" : "카메라 OFF"}
      </button>

      {/* 마이크 */}
      <button
        onClick={onToggleMic}
        className={`px-4 py-2 rounded-xl font-semibold ${
          micOn ? "bg-gray-100" : "bg-red-500 text-white"
        }`}
      >
        {micOn ? "마이크 ON" : "마이크 OFF"}
      </button>

      {/* 화면공유 (항상 표시) */}
      {!screenSharing ? (
        <button
          onClick={onStartShare}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
        >
          화면공유 시작
        </button>
      ) : (
        <button
          onClick={onStopShare}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
        >
          화면공유 종료
        </button>
      )}

      {/* 강의 시작 버튼 */}
      {!sessionStarted && (
        <button
          onClick={onStartSession}
          className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold"
        >
          강의 시작
        </button>
      )}

      {/* 강의 종료 */}
      {sessionStarted && (
        <button
          onClick={onEndSession}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
        >
          강의 종료
        </button>
      )}
    </div>
  );
}

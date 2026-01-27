import React, { useRef, useState, useMemo, useEffect } from "react";

/**
 * ============================================================
 * LectureRealtimeMentor.jsx (STABLE VERSION - replaceVideo renegotiation)
 * ------------------------------------------------------------
 * 핵심 변경:
 *  - 화면공유/복귀를 "replaceTrack"이 아니라
 *    Janus createOffer renegotiation + media.replaceVideo=true 로 처리
 *  - (구/레거시 janus.js에서도 가장 안정적인 방식)
 * ============================================================
 */

/**
 * ============================================================
 * LectureRealtimeMentor.jsx (STABLE VERSION with UI upgrade)
 * ------------------------------------------------------------
 * 🔥 변경 사항
 *  - 멘티 화면과 동일한 참여자 목록 UI 적용
 *  - "입장했습니다" justJoined 표시 기능 추가
 *  - 기존 화면공유/카메라/마이크/Janus 구조는 그대로 유지
 * ============================================================
 */

export default function LectureRealtimeMentor({ lectureId }) {
    // -------------------------------
    // UI 상태
    // -------------------------------
    const [isStarted, setIsStarted] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);

    const [participants, setParticipants] = useState([]);

    // 🟣 새 입장자 표시용
    const [justJoined, setJustJoined] = useState(null);

    // -------------------------------
    // WebRTC/JANUS refs
    // -------------------------------
    const janus = useRef(null);
    const pubHandle = useRef(null);
    const localStream = useRef(null);
    const mentorVideoRef = useRef(null);
    const pollingInterval = useRef(null);

    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);

    // -------------------------------
    // 새 참가자 알림 자동 제거
    // -------------------------------
    useEffect(() => {
        if (!justJoined) return;
        const timer = setTimeout(() => setJustJoined(null), 2500);
        return () => clearTimeout(timer);
    }, [justJoined]);

    // ============================================================
    // Backend bootstrap API
    // ============================================================
    const apiBootstrap = async () => {
        const res = await fetch("/api/seesun/session/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });
        return await res.json();
    };

    // ============================================================
    // 영상 붙이기 (검은 화면 고정 방지 포함)
    // ============================================================
    const attachStream = (videoEl, stream) => {
        if (!videoEl) return;
        try {
            videoEl.pause?.();
            videoEl.srcObject = null;
        } catch {}
        videoEl.srcObject = stream;
        videoEl.play?.().catch(() => {});
    };

    // ============================================================
    // configure helper
    // ============================================================
    const sendConfigure = (jsep) => {
        pubHandle.current.send({
            message: {
                request: "configure",
                audio: micOn,
                video: cameraOn,
            },
            jsep,
        });
    };

    // ============================================================
    // 초기 카메라 Publish
    // ============================================================
    const publishCamera = () => {
        pubHandle.current.createOffer({
            media: {
                audioSend: true,
                videoSend: true,
                video: true,
            },
            success: (jsep) => sendConfigure(jsep),
            error: (err) => console.error("publishCamera error:", err),
        });
    };

    // ============================================================
    // 화면공유 시작
    // ============================================================
    const startScreenShare = () => {
        pubHandle.current.createOffer({
            media: {
                video: "screen",
                replaceVideo: true,
                audioSend: true,
                videoSend: true,
            },
            success: (jsep) => {
                sendConfigure(jsep);
                setScreenSharing(true);
            },
            error: (err) => console.error("startScreenShare error:", err),
        });
    };

    // ============================================================
    // 화면공유 종료 → 카메라 복귀
    // ============================================================
    const stopScreenShare = () => {
        pubHandle.current.createOffer({
            media: {
                video: true,
                replaceVideo: true,
                audioSend: true,
                videoSend: true,
            },
            success: (jsep) => {
                sendConfigure(jsep);
                setScreenSharing(false);
            },
            error: (err) => console.error("stopScreenShare error:", err),
        });
    };

    // ============================================================
    // 카메라 ON/OFF
    // ============================================================
    const toggleCamera = () => {
        const state = !cameraOn;
        setCameraOn(state);
        localStream.current?.getVideoTracks?.().forEach((t) => (t.enabled = state));
        pubHandle.current.send({ message: { request: "configure", video: state } });
    };

    // ============================================================
    // 마이크 ON/OFF
    // ============================================================
    const toggleMic = () => {
        const state = !micOn;
        setMicOn(state);
        localStream.current?.getAudioTracks?.().forEach((t) => (t.enabled = state));
        pubHandle.current.send({ message: { request: "configure", audio: state } });
    };

    // ============================================================
    // 참가자 추가
    // ============================================================
    const addParticipant = (p) => {
        setParticipants((prev) => {
            if (prev.some((x) => x.id === p.id)) return prev;
            setJustJoined(p.display);
            return [...prev, p];
        });
    };

    // ============================================================
    // Janus Publisher Attach
    // ============================================================
    const attachPublisher = (info) => {
        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                pubHandle.current = handle;
                handle.send({
                    message: {
                        request: "join",
                        room: parseInt(info.roomId),
                        ptype: "publisher",
                        display: info.displayName ?? "mentor-user",
                    },
                });
                setIsStarted(true);
            },

            onmessage: (msg, jsep) => {
                console.log("[MENTOR] publisher message:", msg);

                const event = msg.videoroom;

                if (event === "joined") publishCamera();
                if (jsep) pubHandle.current.handleRemoteJsep({ jsep });

                // 🔥 참가자 나가기 처리 추가
                if (msg.leaving) {
                    console.log("참여자 떠남:", msg.leaving);
                    setParticipants(prev => prev.filter(p => p.id !== msg.leaving));
                }

                // 🔥 unpublish 처리 (멘티가 화면 송출 중지하는 경우 포함)
                if (msg.unpublished && msg.unpublished !== "ok") {
                    console.log("참여자 unpublish:", msg.unpublished);
                    setParticipants(prev => prev.filter(p => p.id !== msg.unpublished));
                }
            },

            onlocalstream: (stream) => {
                localStream.current = stream;
                attachStream(mentorVideoRef.current, stream);
            },
        });
    };

    // ============================================================
    // Janus Init
    // ============================================================
    const initJanus = (info) => {
        window.Janus.init({
            debug: "all",
            callback: () => {
                janus.current = new window.Janus({
                    server: info.janusUrl,
                    success: () => attachPublisher(info),
                    error: (err) => console.error("Janus init error:", err),
                });
            },
        });
    };

    // ============================================================
    // 참여자 Polling
    // ============================================================
    const startPolling = (info) => {
        pollingInterval.current = setInterval(() => {
            pubHandle.current?.send({
                message: { request: "listparticipants", room: parseInt(info.roomId) },
                success: (res) => {
                    if (!res.participants) return;

                    res.participants.forEach((p) => addParticipant(p));
                },
            });
        }, 2000);
    };

    // ============================================================
    // Start 버튼
    // ============================================================
    const handleStart = async () => {
        const info = await apiBootstrap();
        initJanus(info);
        startPolling(info);
    };

    // ============================================================
    // Cleanup
    // ============================================================
    useEffect(() => {
        return () => {
            try {
                if (pollingInterval.current) clearInterval(pollingInterval.current);
            } catch {}
            try {
                pubHandle.current?.hangup?.();
            } catch {}
            try {
                janus.current?.destroy?.();
            } catch {}
        };
    }, []);

    // ============================================================
    // UI Styles
    // ============================================================
    const btnPrimary = {
        background: "#1565C0",
        color: "white",
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        cursor: "pointer",
        marginRight: "8px",
    };

    const btnToggle = {
        background: "#1E88E5",
        color: "white",
        padding: "8px 14px",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        cursor: "pointer",
        marginRight: "8px",
    };

    const btnExit = {
        background: "#757575",
        color: "white",
        padding: "10px 18px",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        cursor: "pointer",
    };

    // ============================================================
    // UI 렌더링
    // ============================================================
    return (
        <div style={{ padding: 20 }}>
            <h1>멘토 화면</h1>

            {!isStarted && (
                <button onClick={handleStart} style={btnPrimary}>
                    세션 시작
                </button>
            )}

            {isStarted && (
                <button onClick={() => window.location.reload()} style={btnExit}>
                    나가기
                </button>
            )}

            {/* 멘토 송출 화면 */}
            <div
                style={{
                    width: "100%",
                    height: 500,
                    background: "#000",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 10,
                }}
            >
                <video
                    ref={mentorVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </div>

            {/* 제어 버튼 */}
            {isStarted && (
                <div style={{ marginTop: 20 }}>
                    <button onClick={toggleCamera} style={btnToggle}>
                        {cameraOn ? "카메라 끄기" : "카메라 켜기"}
                    </button>

                    <button onClick={toggleMic} style={btnToggle}>
                        {micOn ? "마이크 끄기" : "마이크 켜기"}
                    </button>

                    {!screenSharing ? (
                        <button onClick={startScreenShare} style={btnPrimary}>
                            화면 공유 시작
                        </button>
                    ) : (
                        <button
                            onClick={stopScreenShare}
                            style={{ ...btnPrimary, background: "#FB8C00" }}
                        >
                            화면 공유 종료
                        </button>
                    )}
                </div>
            )}

            {/* 참여자 목록 — 멘티 UI와 동일하게 개편 */}
            <div
                style={{
                    marginTop: 25,
                    border: "1px solid #ddd",
                    padding: 15,
                    borderRadius: 10,
                }}
            >
                <h3>참여자 목록 ({participants.length})</h3>

                {justJoined && (
                    <div
                        style={{
                            color: "#1976d2",
                            marginBottom: 8,
                            fontWeight: "bold",
                        }}
                    >
                        ➕ {justJoined} 님이 입장했습니다.
                    </div>
                )}

                <ul style={{ listStyle: "none", padding: 0 }}>
                    {participants.map((p) => (
                        <li
                            key={p.id}
                            style={{
                                padding: 12,
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >
                            <span style={{ color: "#6a1b9a" }}>👤</span>
                            <span>{p.display}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}


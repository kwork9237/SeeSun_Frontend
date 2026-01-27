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

export default function LectureRealtimeMentor({ lectureId }) {
    // -------------------------------
    // UI 상태
    // -------------------------------
    const [isStarted, setIsStarted] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [participants, setParticipants] = useState([]);

    // -------------------------------
    // WebRTC/JANUS refs
    // -------------------------------
    const janus = useRef(null);
    const pubHandle = useRef(null);
    const localStream = useRef(null);
    const mentorVideoRef = useRef(null);
    const pollingInterval = useRef(null);

    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);

    // ============================================================
    // Backend bootstrap API → sessionId, roomId, janusUrl 받음
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
    // 영상 UI에 Stream 표시
    // ============================================================
    const attachStream = (videoEl, stream) => {
        if (!videoEl || !stream) return;
        // video element이 이전 ended stream에 묶여 있으면 검은 화면이 고정될 수 있어 리셋
        try {
            videoEl.pause?.();
            videoEl.srcObject = null;
        } catch {}
        videoEl.srcObject = stream;
        videoEl.play?.().catch(() => {});
    };

    // ============================================================
    // Janus configure helper
    // ============================================================
    const sendConfigure = (jsep) => {
        // videoroom plugin은 configure로 audio/video on/off를 반영
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
    // 초기 publish (카메라+마이크)
    // ============================================================
    const publishCamera = () => {
        if (!pubHandle.current) return;

        pubHandle.current.createOffer({
            media: {
                audioSend: true,
                videoSend: true,
                // 카메라 기본
                video: true,
            },
            success: (jsep) => {
                sendConfigure(jsep);
            },
            error: (err) => console.error("publishCamera createOffer error:", err),
        });
    };

    // ============================================================
    // 화면공유 시작: replaceVideo 기반 renegotiation
    // - Janus가 screen capture를 처리 (video:"screen")
    // ============================================================
    const startScreenShare = () => {
        if (!pubHandle.current) return;

        pubHandle.current.createOffer({
            media: {
                // ⚠️ legacy 문서 기준: video:"screen"은 화면공유 사용
                // 화면공유로 비디오를 바꾸면서 기존 비디오 m-line을 재사용
                video: "screen",
                replaceVideo: true,
                // 오디오 유지 시도 (환경/브라우저마다 다를 수 있음)
                // 어떤 janus.js는 screen일 때 audio를 꺼버리기도 해서,
                // audio는 configure로 다시 켜지도록 해둠
                audioSend: true,
                videoSend: true,
            },
            success: (jsep) => {
                sendConfigure(jsep);
                setScreenSharing(true);
            },
            error: (err) => console.error("startScreenShare createOffer error:", err),
        });
    };

    // ============================================================
    // 화면공유 종료 → 카메라 복귀: replaceVideo 기반 renegotiation
    // ============================================================
    const stopScreenShare = () => {
        if (!pubHandle.current) return;

        pubHandle.current.createOffer({
            media: {
                video: true,          // 다시 카메라
                replaceVideo: true,   // 기존 video m-line 재사용
                audioSend: true,
                videoSend: true,
            },
            success: (jsep) => {
                sendConfigure(jsep);
                setScreenSharing(false);
            },
            error: (err) => console.error("stopScreenShare createOffer error:", err),
        });
    };

    // ============================================================
    // 카메라 ON/OFF (configure + local track enabled)
    // ============================================================
    const toggleCamera = () => {
        const state = !cameraOn;
        setCameraOn(state);

        // 로컬 트랙이 있으면 enabled도 같이 반영
        localStream.current?.getVideoTracks?.().forEach((t) => (t.enabled = state));

        pubHandle.current?.send({
            message: { request: "configure", video: state },
        });
    };

    // ============================================================
    // 마이크 ON/OFF (configure + local track enabled)
    // ============================================================
    const toggleMic = () => {
        const state = !micOn;
        setMicOn(state);

        localStream.current?.getAudioTracks?.().forEach((t) => (t.enabled = state));

        pubHandle.current?.send({
            message: { request: "configure", audio: state },
        });
    };

    // ============================================================
    // Janus Publisher attach
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
                        display: info.displayName,
                    },
                });

                setIsStarted(true);
            },

            onmessage: (msg, jsep) => {
                // joined 후 publish
                if (msg.videoroom === "joined") {
                    publishCamera();
                }

                // Janus가 Answer 주면 적용
                if (jsep) {
                    pubHandle.current.handleRemoteJsep({ jsep });
                }
            },

            // ✅ legacy janus.js 콜백: onlocalstream에서 로컬 스트림을 받아 UI에 붙임
            onlocalstream: (stream) => {
                localStream.current = stream;
                attachStream(mentorVideoRef.current, stream);
            },

            // (옵션) 상태 로그가 필요하면 켜두면 디버깅에 도움
            webrtcState: (on) => {
                // console.log("webrtcState:", on);
            },
            mediaState: (type, on) => {
                // console.log("mediaState:", type, on);
            },
            iceState: (state) => {
                // console.log("iceState:", state);
            },
            oncleanup: () => {
                // console.log("oncleanup");
            },
        });
    };

    // ============================================================
    // Janus 초기화
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
                    if (res.participants) setParticipants(res.participants);
                },
            });
        }, 3000);
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
    // 버튼 스타일 (SeeSun Blue UI)
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
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
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

    const btnWarning = {
        background: "#FB8C00",
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
                        <button onClick={stopScreenShare} style={btnWarning}>
                            화면 공유 종료
                        </button>
                    )}
                </div>
            )}

            {/* 참여자 목록 */}
            <div style={{ marginTop: 20 }}>
                <h3>참여자 목록</h3>
                <ul>
                    {participants.map((p) => (
                        <li key={p.id}>{p.display}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

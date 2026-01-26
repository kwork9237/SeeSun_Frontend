import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LectureRealtimeMentor.jsx (녹화 기능 완전 적용 버전)
 * -----------------------------------------------------------
 * - 멘토는 publish 시 Janus videoroom record 기능 사용
 * - 화면공유 전환 시에도 record 유지
 * - 강의 종료 시 자동 종료 → SSE에서 파일 조회
 */

const LectureRealtimeMentor = ({ lectureId }) => {

    // =========================================================================
    // STATE / REF
    // =========================================================================

    const [isStarted, setIsStarted] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        role: "MENTOR",
        displayName: "MentorUser",
    });

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [recording, setRecording] = useState({ status: null, url: null });

    const janus = useRef(null);
    const pubHandle = useRef(null);
    const subHandle = useRef(null);

    const camStreamRef = useRef(null);
    const currentStreamRef = useRef(null);
    const screenStreamRef = useRef(null);

    const mentorVideoRef = useRef(null);
    const pollingInterval = useRef(null);
    const sseRef = useRef(null);

    const myName = sessionInfo.displayName;
    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);

    // =========================================================================
    // UTILITY
    // =========================================================================

    const attachStream = (videoEl, stream) => {
        if (!videoEl) return;
        videoEl.srcObject = stream || null;
        videoEl.play?.().catch(() => {});
    };

    const stopStream = (stream) => {
        if (!stream) return;
        stream.getTracks().forEach((t) => t.stop());
    };

    const resetAll = () => {
        setIsStarted(false);
        setIsJoined(false);
        setMicOn(true);
        setCamOn(true);
        setSharing(false);
        setParticipants([]);
        setRecording({ status: null, url: null });
    };

    // =========================================================================
    // API
    // =========================================================================

    const apiBootstrap = async () => {
        const res = await fetch("/api/seesun/session/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });

        if (!res.ok) throw new Error("세션 생성 실패");
        return await res.json();
    };

    const apiEnd = async (sessionId) => {
        const r = await fetch("/api/seesun/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
        });

        if (!r.ok) throw new Error("강의 종료 실패");
    };

    const apiRecording = async (sessionId) => {
        const r = await fetch(
            `/api/seesun/session/recording?sessionId=${sessionId}`,
            { credentials: "include" }
        );
        if (!r.ok) throw new Error("녹화 조회 실패");
        return await r.json();
    };

    // =========================================================================
    // STEP 1: 카메라 준비
    // =========================================================================

    const prepareCamera = async () => {
        try {
            const cam = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            camStreamRef.current = cam;
            currentStreamRef.current = cam;

            attachStream(mentorVideoRef.current, cam);

            return true;
        } catch (e) {
            console.error("카메라/마이크 권한 오류:", e);
            alert("카메라/마이크 권한을 허용해주세요.");
            return false;
        }
    };

    // =========================================================================
    // JANUS INIT
    // =========================================================================

    const initJanus = (info) => {
        const Janus = window.Janus;
        if (!Janus) {
            alert("Janus 라이브러리가 로드되지 않았습니다.");
            return;
        }

        Janus.init({
            debug: "all",
            callback: () => {
                janus.current = new Janus({
                    server: info.janusUrl,

                    success: () => attachPublisher(info),

                    error: (err) => {
                        console.error("Janus Init Error:", err);
                        alert("Janus 서버 연결 실패");
                    }
                });
            }
        });
    };

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
                        display: myName,
                    }
                });

                setIsStarted(true);
                startPolling(info.roomId);
            },

            error: (err) => console.error("Plugin Attach Error:", err),

            onmessage: (msg, jsep) =>
                handleJanusMessageMentor(msg, jsep, info),

            onlocalstream: (stream) =>
                attachStream(mentorVideoRef.current, stream),
        });
    };

    // =========================================================================
    // HANDLE MESSAGE
    // =========================================================================

    const handleJanusMessageMentor = (msg, jsep, info) => {
        const event = msg?.videoroom;

        if (event === "joined") {
            setIsJoined(true);
            startPublish(); // 🔥 여기서 송출 & 녹화 시작
        }

        const publishers = msg?.publishers;
        if (Array.isArray(publishers)) {
            publishers.forEach((p) =>
                setParticipants((prev) => [...prev, p])
            );
        }

        if (event === "event") {
            const leavingId = msg?.leaving || msg?.unpublished;
            if (leavingId && leavingId !== "ok") {
                setParticipants((prev) =>
                    prev.filter((p) => p.id !== leavingId)
                );
            }
        }

        if (jsep) {
            pubHandle.current?.handleRemoteJsep({ jsep });
        }
    };

    // =========================================================================
    // START PUBLISH (녹화 시작 포함)
    // =========================================================================

    const startPublish = () => {
        if (!pubHandle.current) return;

        const cam = camStreamRef.current;
        if (!cam) return alert("카메라 준비 실패");

        pubHandle.current.createOffer({
            stream: cam,
            media: {
                audioRecv: false,
                videoRecv: false,
                audioSend: true,
                videoSend: true,
            },

            success: (jsep) => {
                pubHandle.current.send({
                    message: {
                        request: "configure",
                        audio: micOn,
                        video: camOn,
                        record: true,                                 // 🔥 녹화 ON
                        filename: `lecture-${sessionInfo.sessionId}`, // 🔥 파일명 지정
                    },
                    jsep,
                });
            },
        });
    };

    // =========================================================================
    // MIC / CAM TOGGLE
    // =========================================================================

    const toggleMic = () => {
        const s = currentStreamRef.current;
        if (!s) return;
        const track = s.getAudioTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;
        setMicOn(track.enabled);

        pubHandle.current?.send({
            message: {
                request: "configure",
                audio: track.enabled,
                video: camOn,
                record: true,
                filename: `lecture-${sessionInfo.sessionId}`
            }
        });
    };

    const toggleCam = () => {
        const s = currentStreamRef.current;
        if (!s) return;
        const track = s.getVideoTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;
        setCamOn(track.enabled);

        pubHandle.current?.send({
            message: {
                request: "configure",
                audio: micOn,
                video: track.enabled,
                record: true,
                filename: `lecture-${sessionInfo.sessionId}`
            }
        });
    };

    // =========================================================================
    // SCREEN SHARE
    // =========================================================================

    const startScreenShare = async () => {
        if (sharing) return;

        try {
            const scr = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });

            screenStreamRef.current = scr;
            setSharing(true);

            const screenTrack = scr.getVideoTracks()[0];
            screenTrack.onended = stopScreenShare;

            if (camStreamRef.current) {
                const videoTrack = camStreamRef.current.getVideoTracks()[0];
                if (videoTrack) videoTrack.enabled = false;
            }
            setCamOn(false);

            const audioTracks = camStreamRef.current?.getAudioTracks?.() || [];
            const mixed = new MediaStream([screenTrack, ...audioTracks]);

            attachStream(mentorVideoRef.current, mixed);

            currentStreamRef.current = mixed;

            pubHandle.current.createOffer({
                stream: mixed,
                media: {
                    audioRecv: false,
                    videoRecv: false,
                    audioSend: true,
                    videoSend: true,
                },

                success: (jsep) => {
                    pubHandle.current.send({
                        message: {
                            request: "configure",
                            audio: micOn,
                            video: true,
                            record: true,
                            filename: `lecture-${sessionInfo.sessionId}`,
                        },
                        jsep,
                    });
                }
            });

        } catch (e) {
            console.error("화면공유 오류:", e);
            alert("화면공유 권한을 허용해주세요.");
        }
    };

    const stopScreenShare = async () => {
        if (!sharing) return;

        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;

        setSharing(false);

        const cam = camStreamRef.current;
        if (!cam) {
            alert("카메라 없음");
            return;
        }

        const videoTrack = cam.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = true;
        setCamOn(true);

        attachStream(mentorVideoRef.current, cam);

        currentStreamRef.current = cam;

        pubHandle.current.createOffer({
            stream: cam,
            media: {
                audioRecv: false,
                videoRecv: false,
                audioSend: true,
                videoSend: true,
            },

            success: (jsep) => {
                pubHandle.current.send({
                    message: {
                        request: "configure",
                        audio: micOn,
                        video: true,
                        record: true,  // 🔥 녹화 유지
                        filename: `lecture-${sessionInfo.sessionId}`,
                    },
                    jsep,
                });
            }
        });
    };

    // =========================================================================
    // POLLING 참여자 목록
    // =========================================================================

    const startPolling = (roomId) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(() => {
            pubHandle.current?.send({
                message: {
                    request: "listparticipants",
                    room: parseInt(roomId)
                },
                success: (res) => {
                    if (res?.participants) {
                        setParticipants(res.participants);
                    }
                }
            });
        }, 3000);
    };

    // =========================================================================
    // SSE
    // =========================================================================

    const startSSE = (sessionId) => {
        const es = new EventSource(
            `/api/seesun/session/events?sessionId=${sessionId}`,
            { withCredentials: true }
        );

        sseRef.current = es;

        es.onmessage = async (ev) => {
            try {
                const data = JSON.parse(ev.data);

                if (data?.type === "SESSION_ENDED") {
                    try {
                        const rec = await apiRecording(sessionId);
                        setRecording({
                            status: rec.status,
                            url: rec.url || null,
                        });
                    } catch {}

                    stopSessionLocal();
                }
            } catch {}
        };
    };

    // =========================================================================
    // STOP SESSION LOCAL
    // =========================================================================

    const stopSessionLocal = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        try { pubHandle.current?.detach(); } catch {}
        try { subHandle.current?.detach(); } catch {}
        try { janus.current?.destroy(); } catch {}
        try { sseRef.current?.close(); } catch {}

        stopStream(currentStreamRef.current);
        stopStream(camStreamRef.current);
        stopStream(screenStreamRef.current);

        resetAll();
    };

    const endSession = async () => {
        if (!sessionInfo?.sessionId) return;

        try {
            await apiEnd(sessionInfo.sessionId);
        } catch (e) {
            console.error(e);
            alert("강의 종료 실패");
        }
    };

    // =========================================================================
    // START BUTTON
    // =========================================================================

    const handleStart = async () => {
        if (!window.Janus) {
            alert("Janus가 로드되지 않음");
            return;
        }

        const ok = await prepareCamera();
        if (!ok) return;

        try {
            const info = await apiBootstrap();

            setSessionInfo(info);
            if (info.sessionId) startSSE(info.sessionId);

            initJanus(info);

        } catch (e) {
            console.error(e);
            alert("세션 시작 실패");
        }
    };

    // =========================================================================
    // CLEANUP
    // =========================================================================

    useEffect(() => {
        return () => stopSessionLocal();
    }, []);

    // =========================================================================
    // RENDER
    // =========================================================================

    const btn = {
        padding: "10px 18px",
        fontSize: 15,
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        color: "white"
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>멘토 실시간 강의</h1>

            <div style={{ marginBottom: 10 }}>
                역할: <b>MENTOR</b> / 닉네임: <b>{myName}</b>
            </div>

            {/* 버튼 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

                {!isStarted ? (
                    <button style={{ ...btn, background: "#4CAF50" }} onClick={handleStart}>
                        세션 시작 (멘토)
                    </button>
                ) : (
                    <>
                        <button style={{ ...btn, background: "#e53935" }} onClick={endSession}>
                            강의 종료
                        </button>

                        <button
                            style={{ ...btn, background: micOn ? "#4CAF50" : "#757575" }}
                            onClick={toggleMic}
                        >
                            {micOn ? "마이크 OFF" : "마이크 ON"}
                        </button>

                        <button
                            style={{ ...btn, background: camOn ? "#4CAF50" : "#757575" }}
                            onClick={toggleCam}
                        >
                            {camOn ? "카메라 OFF" : "카메라 ON"}
                        </button>

                        <button
                            style={{ ...btn, background: sharing ? "#fb8c00" : "#1e88e5" }}
                            onClick={sharing ? stopScreenShare : startScreenShare}
                        >
                            {sharing ? "화면공유 종료" : "화면공유 시작"}
                        </button>
                    </>
                )}

            </div>

            {/* 멘토 영상 */}
            <div style={{
                background: "#000",
                height: 500,
                borderRadius: 10,
                overflow: "hidden"
            }}>
                <video
                    ref={mentorVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </div>

            {/* 참가자 목록 */}
            <div style={{
                marginTop: 20,
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12
            }}>
                <h3>참여자 목록 ({participants.length})</h3>

                <ul style={{ listStyle: "none", padding: 0 }}>
                    {participants.map((p) => (
                        <li key={p.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                            👤 {p.display}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LectureRealtimeMentor;

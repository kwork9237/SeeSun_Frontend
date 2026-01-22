import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LectureRealtimeMentor.jsx
 * -----------------------------------------------------------
 * 멘토(MENTOR) 전용 실시간 강의 화면
 *
 * 방식 A: URL로 역할 강제
 * - /mentor/lecture/:id → MENTOR 강제
 *
 * 멘토 특징:
 *  - 세션 시작 버튼 클릭 시 → 카메라 자동 켜짐
 *  - 화면공유 가능
 *  - 마이크/카메라 토글 가능
 *  - 강의 종료 가능
 *  - 멘티 영상 X (멘티는 시청만 하고 송출 불가)
 *
 * 멘토에서 송출되는 스트림을 Janus Videoroom에 publish
 */

const LectureRealtimeMentor = ({ lectureId }) => {

    // =========================================================================
    // STATE / REF
    // =========================================================================

    const [isStarted, setIsStarted] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        role: "MENTOR",            // ★ 강제 역할 설정
        displayName: "MentorUser", // ★ 필요시 UI에서 변경 가능
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

    const stopStream = (s) => {
        if (!s) return;
        s.getTracks().forEach((t) => t.stop());
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
    // API (멘토는 bootstrap 이 아니라 create 고정일 수도 있지만
    //      지금은 기존 백엔드와 동일 구조 유지)
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
    // STEP 1: 카메라 먼저 켜기 (강의 시작 버튼 누르면 즉시 실행)
    // =========================================================================

    const prepareCamera = async () => {
        try {
            const cam = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            camStreamRef.current = cam;
            currentStreamRef.current = cam;

            // 멘토 용 미리보기
            if (mentorVideoRef.current) {
                attachStream(mentorVideoRef.current, cam);
            }

            return true;
        } catch (e) {
            console.error("카메라/마이크 권한 오류:", e);
            alert("카메라/마이크 권한을 허용해주세요.");
            return false;
        }
    };


    // =========================================================================
    // STEP 2: Janus 초기화
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

                // 방 join 요청
                handle.send({
                    message: {
                        request: "join",
                        room: parseInt(info.roomId),
                        ptype: "publisher",
                        display: myName
                    }
                });

                setIsStarted(true);

                startPolling(info.roomId);
            },

            error: (err) => {
                console.error("Plugin Attach Error:", err);
            },

            onmessage: (msg, jsep) => handleJanusMessageMentor(msg, jsep, info),

            onlocalstream: (stream) => {
                attachStream(mentorVideoRef.current, stream);
            }
        });
    };
    // =========================================================================
    // STEP 3: Janus 메시지 핸들러 (MENTOR)
    // =========================================================================

    const handleJanusMessageMentor = (msg, jsep, info) => {
        const event = msg?.videoroom;

        // join 완료 → publish 시작
        if (event === "joined") {
            setIsJoined(true);
            startPublish(); // 멘토 송출 시작
        }

        // 신규 publisher (멘티는 들어와도 송출 안함)
        const publishers = msg?.publishers;
        if (Array.isArray(publishers)) {
            publishers.forEach((p) => addParticipant(p.id, p.display));
        }

        // 누군가 나감
        if (event === "event") {
            const leavingId = msg?.leaving || msg?.unpublished;
            if (leavingId && leavingId !== "ok") {
                removeParticipant(leavingId);
            }
        }

        // SDP 처리
        if (jsep) {
            pubHandle.current?.handleRemoteJsep({ jsep });
        }
    };


    // =========================================================================
    // PARTICIPANTS 관리
    // =========================================================================

    const addParticipant = (id, display) => {
        const sid = String(id);
        setParticipants((prev) => {
            if (prev.some((p) => p.id === sid)) return prev;
            return [...prev, { id: sid, display }];
        });
    };

    const removeParticipant = (id) => {
        const sid = String(id);
        setParticipants((prev) => prev.filter((p) => p.id !== sid));
    };


    // =========================================================================
    // STEP 4: 멘토 송출 시작
    // =========================================================================

    const startPublish = () => {
        if (!pubHandle.current) return;

        const cam = camStreamRef.current;
        if (!cam) {
            alert("카메라 준비 실패");
            return;
        }

        pubHandle.current.createOffer({
            stream: cam,
            media: {
                audioRecv: false,
                videoRecv: false,
                audioSend: true,
                videoSend: true
            },

            success: (jsep) => {
                pubHandle.current.send({
                    message: {
                        request: "configure",
                        audio: micOn,
                        video: camOn
                    },
                    jsep
                });
            },

            error: (err) => {
                console.error("createOffer 실패:", err);
                alert("카메라 송출 실패");
            }
        });
    };


    // =========================================================================
    // MIC / CAM / SCREEN SHARE
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
                video: camOn
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
                video: track.enabled
            }
        });
    };


    /**
     * 화면공유 시작: 카메라 OFF → 화면공유 ON
     */
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

            // 기존 카메라 OFF 처리
            if (camStreamRef.current) {
                const videoTrack = camStreamRef.current.getVideoTracks()[0];
                if (videoTrack) videoTrack.enabled = false;
            }
            setCamOn(false);

            // 화면공유 + 카메라 오디오 결합
            const audioTracks = camStreamRef.current?.getAudioTracks?.() || [];
            const mixed = new MediaStream([screenTrack, ...audioTracks]);

            currentStreamRef.current = mixed;

            pubHandle.current.createOffer({
                stream: mixed,
                media: {
                    audioRecv: false,
                    videoRecv: false,
                    audioSend: true,
                    videoSend: true
                },

                success: (jsep) => {
                    pubHandle.current.send({
                        message: {
                            request: "configure",
                            audio: micOn,
                            video: true
                        },
                        jsep
                    });
                }
            });

        } catch (e) {
            console.error("화면공유 오류:", e);
            alert("화면공유 권한을 허용해주세요.");
        }
    };


    /**
     * 화면공유 종료: 화면공유 OFF → 카메라 복귀
     */
    const stopScreenShare = async () => {
        if (!sharing) return;

        setSharing(false);
        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;

        const cam = camStreamRef.current;
        if (!cam) {
            alert("카메라 스트림 없음");
            return;
        }

        // 카메라 다시 켜기
        const videoTrack = cam.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = true;
        setCamOn(true);

        // UI 비디오 태그에 카메라 복구
        attachStream(mentorVideoRef.current, cam);

        currentStreamRef.current = cam;

        pubHandle.current.createOffer({
            stream: cam,
            media: {
                audioRecv: false,
                videoRecv: false,
                audioSend: true,
                videoSend: true
            },

            success: (jsep) => {
                pubHandle.current.send({
                    message: {
                        request: "configure",
                        audio: micOn,
                        video: true
                    },
                    jsep
                });
            }
        });
    };


    // =========================================================================
    // 참가자 목록 POLLING
    // =========================================================================

    const startPolling = (roomId) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(() => {
            pubHandle.current?.send({
                message: {
                    request: "listparticipants",
                    room: parseInt(roomId),
                },
                success: (res) => {
                    if (res?.participants) {
                        res.participants.forEach((p) => addParticipant(p.id, p.display));
                    }
                }
            });
        }, 3000);
    };


    // =========================================================================
    // SSE (강의 종료 감지)
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
                            url: rec.url || null
                        });
                    } catch {}

                    stopSessionLocal();
                }
            } catch {}
        };
    };


    // =========================================================================
    // LOCAL SESSION 종료
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
    // 강의 시작 버튼
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
            setSessionInfo({
                ...sessionInfo,
                roomId: info.roomId,
                sessionId: info.sessionId,
                janusUrl: info.janusUrl
            });

            if (info.sessionId) startSSE(info.sessionId);

            initJanus(info);

        } catch (e) {
            console.error(e);
            alert("세션 시작 실패");
        }
    };


    // =========================================================================
    // CLEANUP ON UNMOUNT
    // =========================================================================
    useEffect(() => {
        return () => stopSessionLocal();
    }, []);


    // =========================================================================
    // RENDER (UI)
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
                        <li
                            key={p.id}
                            style={{ padding: 8, borderBottom: "1px solid #eee" }}
                        >
                            👤 {p.display}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LectureRealtimeMentor;

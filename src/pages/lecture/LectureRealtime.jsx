import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LectureRealtime.jsx
 * ------------------------------------------------------------------
 * 실시간 멘토링/강의 WebRTC 화면 (Janus 기반)
 * - 멘토만 publish(송출)
 * - 멘티는 자동으로 멘토 화면 subscribe
 * - 세션 생성/참가, 강제 종료, 녹화 처리, 화면 공유 등 포함
 *
 * 주석 스타일: 실무 개발자가 유지보수하기 쉽게 "역할 중심" 설명 위주
 * 변경된 부분은 [FIXED], [IMPROVED] 로 명시
 */

const LectureRealtime = ({ lectureId }) => {

    // ========================================================================
    //  STATE / REF
    // ========================================================================

    const [isStarted, setIsStarted] = useState(false);           // Janus 연결 여부
    const [isJoined, setIsJoined] = useState(false);             // 방 join 여부
    const [sessionInfo, setSessionInfo] = useState(null);        // 서버 제공 세션 정보

    const [participants, setParticipants] = useState([]);        // 현재 publisher/subscriber 목록
    const [micOn, setMicOn] = useState(true);                    // 마이크 토글 상태
    const [camOn, setCamOn] = useState(true);                    // 카메라 토글 상태
    const [sharing, setSharing] = useState(false);               // 화면 공유 여부
    const [recording, setRecording] = useState({ status: null, url: null }); // 녹화 상태

    // Janus 관련
    const janus = useRef(null);              // Janus 인스턴스
    const pubHandle = useRef(null);          // 멘토 publish handle
    const mentorSubHandle = useRef(null);    // 멘티가 멘토를 subscribe 하는 handle

    // 스트림 관련
    const mentorVideoRef = useRef(null);     // 멘토(또는 멘티가 보는 멘토) 비디오 element
    const camStreamRef = useRef(null);       // 기본 카메라 stream
    const currentStreamRef = useRef(null);   // publish 중인 실제 stream (카메라 or 화면공유)
    const screenStreamRef = useRef(null);    // 화면 공유 stream

    // 기타 관리용 ref
    const pollingInterval = useRef(null);    // 참가자 목록 polling interval
    const sseRef = useRef(null);             // SSE 이벤트
    const mentorFeedIdRef = useRef(null);    // 멘토 feed ID 저장

    const myDisplayName = sessionInfo?.displayName || "";
    const isMentor = sessionInfo?.role === "MENTOR";

    // lectureId fallback
    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);

    // ========================================================================
    //  UTILITY
    // ========================================================================

    /** 비디오 요소에 stream을 안전하게 attach */
    const attachMedia = (videoEl, stream) => {
        if (!videoEl) return;

        if (!stream) {
            videoEl.srcObject = null;
            return;
        }

        if (window.Janus?.attachMediaStream) {
            window.Janus.attachMediaStream(videoEl, stream);
        } else {
            videoEl.srcObject = stream;
        }

        videoEl.play?.().catch(() => {});
    };

    /** stream 내 모든 track 종료 */
    const stopStream = (s) => {
        if (!s) return;
        s.getTracks().forEach((t) => t.stop());
    };

    /** 모든 local state / ref 초기화 */
        // [FIXED] 불필요한 파라미터 제거
    const resetState = () => {
            setIsStarted(false);
            setIsJoined(false);
            setParticipants([]);
            setMicOn(true);
            setCamOn(true);
            setSharing(false);
            setRecording({ status: null, url: null });
            mentorFeedIdRef.current = null;
        };

    // ========================================================================
    //  SERVER API
    // ========================================================================

    /**
     * 세션 시작/참가 API
     * 서버가 멘토/멘티 여부를 판단하여 create 또는 join을 자동 결정함.
     */
    const apiBootstrap = async () => {
        const res = await fetch("/api/realtime/session/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });

        if (res.ok) return await res.json();

        // fallback join
        const fallback = await fetch("/api/realtime/session/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });
        if (!fallback.ok) throw new Error("Session join denied");
        return await fallback.json();
    };

    /** 멘토가 강의 종료(전체 강제 퇴장) */
    const apiEndSession = async (sessionId) => {
        const res = await fetch("/api/realtime/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) throw new Error("End session failed");
    };

    /** 녹화 결과 조회 */
    const apiGetRecording = async (sessionId) => {
        const res = await fetch(`/api/realtime/session/recording?sessionId=${encodeURIComponent(sessionId)}`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) throw new Error("Recording fetch failed");
        return await res.json();
    };

    // ========================================================================
    //  JANUS INITIALIZATION
    // ========================================================================

    /** 멘토인지 체크 */
    const isMentorRole = (role) => role === "MENTOR";

    /**
     * Janus 초기화 및 publish handle attach
     * - 멘토는 publish
     * - 멘티는 subscribe 전용
     */
    const initJanus = (info) => {
        const Janus = window.Janus;
        if (!Janus) {
            // [FIXED] 오타 수정
            alert("Janus 라이브러리가 아직 로드되지 않았습니다.");
            return;
        }

        Janus.init({
            debug: "all",
            callback: () => {
                janus.current = new Janus({
                    server: info.janusUrl,

                    success: () => {
                        /** Publish handle attach */
                        janus.current.attach({
                            plugin: "janus.plugin.videoroom",

                            success: (handle) => {
                                pubHandle.current = handle;

                                // join 요청
                                const register = {
                                    request: "join",
                                    room: parseInt(info.roomId, 10),
                                    ptype: "publisher",
                                    display: info.displayName,
                                };

                                handle.send({ message: register });
                                setIsStarted(true);

                                // 참여자 목록 polling (Janus 기본 기능에 listparticipants 필요)
                                if (pollingInterval.current) clearInterval(pollingInterval.current);

                                pollingInterval.current = setInterval(() => {
                                    handle.send({
                                        message: { request: "listparticipants", room: parseInt(info.roomId, 10) },
                                        success: (res) => {
                                            if (!res?.participants) return;

                                            res.participants.forEach((p) => addParticipant(p.id, p.display));

                                            // 멘티 → 멘토 feed 자동 선택 후 subscribe
                                            if (!isMentor) pickAndSubscribeMentor(res.participants, info);
                                        },
                                    });
                                }, 3000);
                            },

                            error: (error) => {
                                console.error("Plugin Error:", error);
                                alert("Janus Plugin 연결 실패");
                            },

                            onmessage: (msg, jsep) => handleMessage(msg, jsep, info),

                            /**
                             * onlocalstream: 멘토는 publish할 때 자신의 세션 화면이 여기로 들어옴.
                             * - 멘토 화면을 mentorVideoRef에 그대로 붙이면 로컬 미리보기 역할을 함.
                             */
                            onlocalstream: (stream) => {
                                if (isMentorRole(info.role) && mentorVideoRef.current) {
                                    attachMedia(mentorVideoRef.current, stream);
                                }
                            },
                        });
                    },

                    error: (err) => {
                        console.error("Janus Error:", err);
                        alert("Janus 서버 연결 실패");
                    },

                    destroyed: () => {},
                });
            },
        });
    };

    // ========================================================================
    //  JANUS MESSAGE HANDLER
    // ========================================================================

    /** Janus 메시지(event/jsep) 처리 */
    const handleMessage = (msg, jsep, info) => {
        const event = msg?.videoroom;

        // 참가자 목록(신규 publisher)
        const list = msg?.publishers || msg?.participants;
        if (Array.isArray(list)) {
            list.forEach((p) => addParticipant(p.id, p.display));
            if (!isMentor) pickAndSubscribeMentor(list, info);
        }

        // join 성공
        if (event === "joined") {
            setIsJoined(true);

            if (isMentor) publishOwnFeed();
        }

        // 참여자 변경
        if (event === "event") {
            const leavingId = msg?.leaving || msg?.unpublished;

            // 누군가 떠난 경우
            if (leavingId && leavingId !== "ok") {
                removeParticipant(leavingId);

                // 멘토 feed가 나갔으면 멘티는 다시 구독해야 함
                if (!isMentor && leavingId === mentorFeedIdRef.current) {
                    mentorFeedIdRef.current = null;
                    detachMentorSubscription();
                    attachMedia(mentorVideoRef.current, null);
                }
            }

            // 신규 참가자
            if (msg?.id && msg?.display) {
                addParticipant(msg.id, msg.display);
                if (!isMentor) pickAndSubscribeMentor([{ id: msg.id, display: msg.display }], info);
            }
        }

        // SDP(JSEP) 처리
        if (jsep) {
            pubHandle.current?.handleRemoteJsep({ jsep });
        }
    };

    // ========================================================================
    //  PARTICIPANT LIST MANAGEMENT
    // ========================================================================

    /** 참가자 목록에 추가 */
    const addParticipant = (id, display) => {
        if (!id || !display) return;

        // [FIXED] Janus가 sometimes 숫자/문자 혼합을 주기 때문에 문자열 통일
        const safeId = String(id);

        setParticipants((prev) => {
            if (prev.some((p) => String(p.id) === safeId)) return prev;
            return [...prev, { id: safeId, display }];
        });
    };

    /** 참가자 목록에서 제거 */
    const removeParticipant = (id) => {
        const safeId = String(id);
        setParticipants((prev) => prev.filter((p) => String(p.id) !== safeId));
    };

    const otherParticipants = participants.filter((p) => p.display !== myDisplayName);

    // ========================================================================
    //  SUBSCRIBING MENTOR STREAM (멘티)
    // ========================================================================

    /**
     * 멘티 전용 - 멘토 feed 자동 선택
     * 1) 서버가 mentorDisplayName 제공 → 최우선
     * 2) fallback: 자기 자신이 아닌 displayName 가진 feed
     */
    const pickAndSubscribeMentor = (list, info) => {
        if (mentorFeedIdRef.current) return;

        let mentor = null;

        // (1) 서버 제공 멘토 display 우선
        if (info.mentorDisplayName) {
            mentor = list.find((p) => p.display === info.mentorDisplayName);
        }

        // (2) fallback
        if (!mentor) {
            mentor = list.find((p) => p.display !== info.displayName);
        }

        if (mentor?.id) {
            mentorFeedIdRef.current = mentor.id;
            subscribeToMentor(mentor.id, info.roomId);
        }
    };

    /** 멘토 feed 구독 detach */
    const detachMentorSubscription = () => {
        try {
            mentorSubHandle.current?.detach?.();
        } catch {}
        mentorSubHandle.current = null;
    };

    /** 멘토 feed subscribe */
    const subscribeToMentor = (feedId, roomId) => {
        if (!janus.current) return;
        if (mentorSubHandle.current) return;

        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                mentorSubHandle.current = handle;

                handle.send({
                    message: {
                        request: "join",
                        room: parseInt(roomId, 10),
                        ptype: "subscriber",
                        feed: feedId,
                    },
                });
            },

            error: (e) => console.error("Subscribe attach error:", e),

            onmessage: (msg, jsep) => {
                if (!jsep || !mentorSubHandle.current) return;

                mentorSubHandle.current.createAnswer({
                    jsep,
                    media: { audioSend: false, videoSend: false }, // subscriber는 send 필요 없음
                    success: (ans) => {
                        mentorSubHandle.current.send({
                            message: { request: "start", room: parseInt(roomId, 10) },
                            jsep: ans,
                        });
                    },
                });
            },

            onremotestream: (stream) => {
                // 멘티가 멘토 화면을 보는 영역
                attachMedia(mentorVideoRef.current, stream);
            },

            oncleanup: () => {
                attachMedia(mentorVideoRef.current, null);
            },
        });
    };

    // ========================================================================
    //  PUBLISH (멘토)
    // ========================================================================

    /**
     * 멘토: 로컬 카메라 stream publish
     * - createOffer → configure → 송출
     */
    const publishOwnFeed = async () => {
        if (!pubHandle.current) return;

        const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        camStreamRef.current = cam;
        currentStreamRef.current = cam;

        cam.getAudioTracks().forEach((t) => (t.enabled = true));
        cam.getVideoTracks().forEach((t) => (t.enabled = true));

        setMicOn(true);
        setCamOn(true);

        pubHandle.current.createOffer({
            stream: cam,
            media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },

            success: (jsep) => {
                pubHandle.current.send({ message: { request: "configure", audio: true, video: true }, jsep });
            },

            error: (err) => {
                console.error("createOffer error:", err);
                alert("카메라/마이크 송출 실패");
            },
        });
    };

    // ========================================================================
    //  MIC / CAM TOGGLE
    // ========================================================================

    const toggleMic = () => {
        const s = currentStreamRef.current;
        if (!s) return;

        const t = s.getAudioTracks()[0];
        if (!t) return;

        t.enabled = !t.enabled;
        setMicOn(t.enabled);

        // publish 중인 멘토만 configure 필요
        if (pubHandle.current && isMentor) {
            pubHandle.current.send({
                message: { request: "configure", audio: t.enabled, video: camOn },
            });
        }
    };

    const toggleCam = () => {
        const s = currentStreamRef.current;
        if (!s) return;

        const t = s.getVideoTracks()[0];
        if (!t) return;

        t.enabled = !t.enabled;
        setCamOn(t.enabled);

        if (pubHandle.current && isMentor) {
            pubHandle.current.send({
                message: { request: "configure", audio: micOn, video: t.enabled },
            });
        }
    };

    // ========================================================================
    //  SCREEN SHARE (멘토)
    // ========================================================================

    const startScreenShare = async () => {
        if (!isMentor || !pubHandle.current || sharing) return;

        let screen;
        try {
            // [NOTE] audio:false → 화면 공유 오디오 필요 시 true로 변경 가능
            screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        } catch (e) {
            console.error("getDisplayMedia failed:", e);
            return;
        }

        screenStreamRef.current = screen;
        setSharing(true);

        const screenTrack = screen.getVideoTracks()[0];
        screenTrack.onended = () => stopScreenShare(); // 화면 공유 종료 시 자동 처리

        // 화면 + 마이크 혼합
        const audioTracks = camStreamRef.current?.getAudioTracks?.() || [];
        const mixed = new MediaStream([...(screen.getVideoTracks() || []), ...audioTracks]);

        mixed.getAudioTracks().forEach((t) => (t.enabled = micOn));
        mixed.getVideoTracks().forEach((t) => (t.enabled = true));

        currentStreamRef.current = mixed;

        // 재협상
        pubHandle.current.createOffer({
            stream: mixed,
            media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },

            success: (jsep) => {
                pubHandle.current.send({ message: { request: "configure", audio: micOn, video: true }, jsep });
            },

            error: (err) => {
                console.error("screen share renegotiation failed:", err);
                alert("화면공유 실패");
            },
        });
    };

    const stopScreenShare = async () => {
        if (!isMentor || !pubHandle.current || !sharing) return;
        setSharing(false);

        // [FIXED] 화면 공유 스트림 종료 (오타 정정)
        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;

        const cam = camStreamRef.current;
        if (!cam) return;

        cam.getAudioTracks().forEach((t) => (t.enabled = micOn));
        cam.getVideoTracks().forEach((t) => (t.enabled = camOn));

        currentStreamRef.current = cam;

        pubHandle.current.createOffer({
            stream: cam,
            media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },

            success: (jsep) => {
                pubHandle.current.send({ message: { request: "configure", audio: micOn, video: camOn }, jsep });
            },

            error: (err) => {
                console.error("stop screen share renegotiation failed:", err);
                alert("화면공유 종료 실패");
            },
        });
    };

    // ========================================================================
    //  SESSION END / CLEANUP
    // ========================================================================

    /** 전체 세션 정리 (멘토/멘티 공통) */
    const stopSessionLocal = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;

        try { mentorSubHandle.current?.detach?.(); } catch {}
        mentorSubHandle.current = null;

        try { pubHandle.current?.detach?.(); } catch {}
        pubHandle.current = null;

        try { janus.current?.destroy?.(); } catch {}
        janus.current = null;

        if (sseRef.current) {
            try { sseRef.current.close(); } catch {}
            sseRef.current = null;
        }

        stopStream(currentStreamRef.current);
        stopStream(camStreamRef.current);
        stopStream(screenStreamRef.current);

        currentStreamRef.current = null;
        camStreamRef.current = null;
        screenStreamRef.current = null;

        attachMedia(mentorVideoRef.current, null);

        resetState();
    };

    /** 멘토 전용: 강의 종료(전체 강제 퇴장) */
    const endSession = async () => {
        if (!sessionInfo?.sessionId || !isMentor) return;

        try {
            await apiEndSession(sessionInfo.sessionId);
            // 실제 종료 처리는 SSE가 받아서 수행
        } catch (e) {
            console.error(e);
            alert("강의 종료 실패");
        }
    };

    // ========================================================================
    //  SSE: SESSION_ENDED 수신 (멘토 종료 시 전체 퇴장)
    // ========================================================================

    // [FIXED] sessionId 파라미터 추가
    const startSSE = (sessionId) => {
        const es = new EventSource(
            `/api/realtime/session/events?sessionId=${encodeURIComponent(sessionId)}`,
            { withCredentials: true }
        );

        sseRef.current = es;

        es.onmessage = async (ev) => {
            try {
                const data = JSON.parse(ev.data);

                if (data?.type === "SESSION_ENDED") {
                    // 강제 퇴장 → 녹화 정보 조회
                    try {
                        const rec = await apiGetRecording(sessionId);
                        setRecording({ status: rec.status, url: rec.url || null });
                    } catch {}

                    stopSessionLocal();
                }
            } catch {}
        };

        es.onerror = () => {};
    };

    // ========================================================================
    //  START BUTTON
    // ========================================================================

    /** 세션 시작(멘토) / 참가(멘티) */
    const handleStart = async () => {
        if (!window.Janus) {
            alert("Janus 라이브러리가 아직 로드되지 않았습니다."); // [FIXED]
            return;
        }

        try {
            const info = await apiBootstrap();
            setSessionInfo(info);

            if (info.sessionId) startSSE(info.sessionId);

            initJanus(info);
        } catch (e) {
            console.error("Session API Error:", e);
            alert("세션 정보를 가져오는데 실패했습니다.");
        }
    };

    // ========================================================================
    //  CLEANUP ON UNMOUNT
    // ========================================================================

    useEffect(() => {
        return () => stopSessionLocal();
    }, []);

    // ========================================================================
    //  RENDER UI
    // ========================================================================

    const btnStyle = {
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>
                실시간 강의{" "}
                {sessionInfo?.roomId && (
                    <> (#<b>{sessionInfo.roomId}</b>) </>
                )}
            </h1>

            <div style={{ marginBottom: "12px", color: "#444" }}>
                {sessionInfo?.role ? (
                    <>
                        역할: <b>{sessionInfo.role}</b> / 닉네임: <b>{sessionInfo.displayName}</b>
                    </>
                ) : (
                    <>세션을 시작해주세요.</>
                )}
            </div>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {!isStarted ? (
                    <button onClick={handleStart} style={btnStyle}>세션 시작 / 참가</button>
                ) : (
                    <>
                        {isMentor ? (
                            <button onClick={endSession} style={{ ...btnStyle, backgroundColor: "#ff4d4d" }}>
                                강의 종료 (전원 퇴장)
                            </button>
                        ) : (
                            <button onClick={stopSessionLocal} style={{ ...btnStyle, backgroundColor: "#999" }}>
                                나가기
                            </button>
                        )}

                        {isMentor && (
                            <>
                                <button onClick={toggleMic} style={{ ...btnStyle, backgroundColor: micOn ? "#4CAF50" : "#555" }}>
                                    {micOn ? "마이크 OFF" : "마이크 ON"}
                                </button>

                                <button onClick={toggleCam} style={{ ...btnStyle, backgroundColor: camOn ? "#4CAF50" : "#555" }}>
                                    {camOn ? "카메라 OFF" : "카메라 ON"}
                                </button>

                                <button
                                    onClick={sharing ? stopScreenShare : startScreenShare}
                                    style={{ ...btnStyle, backgroundColor: sharing ? "#ff9800" : "#2196f3" }}
                                >
                                    {sharing ? "화면공유 종료" : "화면공유 시작"}
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* 녹화 링크 */}
            {recording.status && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        background: "#fafafa",
                    }}
                >
                    <b>녹화</b>:{" "}
                    {recording.status === "READY" && recording.url ? (
                        <>
                            완료됨 ·{" "}
                            <a href={recording.url} target="_blank" rel="noreferrer">
                                임시 링크 열기
                            </a>
                        </>
                    ) : (
                        <>처리 중...</>
                    )}
                </div>
            )}

            {/* 좌측: 멘토 화면 / 우측: 참여자 목록 */}
            <div style={{ display: "flex", gap: "20px" }}>
                {/* 멘토 영상 영역 */}
                <div
                    style={{
                        flex: 3,
                        background: "#1a1a1a",
                        borderRadius: "10px",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <video
                        ref={mentorVideoRef}
                        autoPlay
                        playsInline
                        style={{ width: "100%", height: "500px", objectFit: "contain" }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            color: "#fff",
                            background: "rgba(0,0,0,0.5)",
                            padding: "5px 10px",
                            borderRadius: 8,
                        }}
                    >
                        {isMentor
                            ? `멘토(나): ${sessionInfo?.displayName || ""}`
                            : "멘토 영상 실시간 스트리밍"}
                    </div>
                </div>

                {/* 참여자 목록 */}
                <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "10px", padding: "15px" }}>
                    <h3>
                        참여자 목록 ({otherParticipants.length + (sessionInfo?.displayName ? 1 : 0)})
                    </h3>

                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {sessionInfo?.displayName && (
                            <li
                                style={{
                                    padding: "10px 0",
                                    borderBottom: "2px solid #4CAF50",
                                    fontWeight: "bold",
                                    color: "#4CAF50",
                                }}
                            >
                                👤 {sessionInfo.displayName} (나)
                            </li>
                        )}

                        {otherParticipants.map((p) => (
                            <li
                                key={p.id}
                                style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}
                            >
                                👤 {p.display}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LectureRealtime;

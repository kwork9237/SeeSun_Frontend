import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LectureRealtime.jsx (재작성 버전)
 * ------------------------------------------------------------------
 * 실시간 멘토링 WebRTC (Janus 기반)
 *
 * ✔ 강의 시작 버튼 클릭 즉시 카메라 자동 활성화 (중요)
 * ✔ 멘토 = publish / 멘티 = subscribe
 * ✔ 화면공유 + 마이크/카메라 토글
 * ✔ SSE 기반 강의 종료 감지
 * ✔ 참가자 목록 관리
 *
 * 구조는 아래 순서를 가집니다:
 * 1) State & Ref
 * 2) Utility
 * 3) Server API
 * 4) Camera 준비 (강의 시작 시 가장 먼저 실행)
 * 5) Janus 초기화 및 핸들러
 * 6) 멘티 구독
 * 7) 멘토 송출
 * 8) UI 버튼 기능들
 * 9) Cleanup
 * 10) Render
 */

const LectureRealtime = ({ lectureId }) => {

    // =========================================================================
    // 1. STATE / REF
    // =========================================================================

    const [isStarted, setIsStarted] = useState(false); // Janus 초기화 여부
    const [isJoined, setIsJoined] = useState(false);   // Videoroom join 여부
    const [sessionInfo, setSessionInfo] = useState(null);

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
    const mentorFeedIdRef = useRef(null);

    const isMentor = sessionInfo?.role === "MENTOR";
    const myName = sessionInfo?.displayName;
    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);


    // =========================================================================
    // 2. UTILITY
    // =========================================================================

    /** 비디오 태그에 stream을 안전하게 연결 */
    const attachStream = (videoEl, stream) => {
        if (!videoEl) return;

        videoEl.srcObject = stream || null;

        videoEl?.play?.().catch(() => {});
    };

    /** 스트림 내부 track 모두 stop */
    const stopStream = (s) => {
        if (!s) return;
        s.getTracks().forEach((t) => t.stop());
    };

    /** 전체 상태 초기화 */
    const resetAll = () => {
        setIsStarted(false);
        setIsJoined(false);
        setMicOn(true);
        setCamOn(true);
        setSharing(false);
        setParticipants([]);
        setRecording({ status: null, url: null });

        mentorFeedIdRef.current = null;
    };


    // =========================================================================
    // 3. SERVER API
    // =========================================================================

    /** 강의 세션 시작/참가 */
    const apiBootstrap = async () => {
        const res = await fetch("/api/seesun/session/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });

        if (res.ok) return await res.json();

        // fallback join
        const fb = await fetch("/api/seesun/session/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });

        if (!fb.ok) throw new Error("세션 참가 실패");
        return await fb.json();
    };

    /** 강의 종료(멘토 전용) */
    const apiEnd = async (sessionId) => {
        const r = await fetch("/api/seesun/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
        });

        if (!r.ok) throw new Error("강의 종료 실패");
    };

    /** 녹화 파일 정보 조회 */
    const apiRecording = async (sessionId) => {
        const r = await fetch(
            `/api/seesun/session/recording?sessionId=${sessionId}`,
            { credentials: "include" }
        );
        if (!r.ok) throw new Error("녹화 조회 실패");
        return await r.json();
    };


    // =========================================================================
    // 4. 카메라 준비 (강의 시작 시 가장 먼저 실행됨)
    // =========================================================================

    const prepareCamera = async () => {
        try {
            const cam = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            camStreamRef.current = cam;
            currentStreamRef.current = cam;

            // 미리보기(멘토)
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
    // 5. JANUS INITIALIZE
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
                // Janus Server 연결
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

    /** Publish handle attach */
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
                        display: info.displayName
                    }
                });

                setIsStarted(true);

                // 참가자 목록 polling
                startPollingParticipants(info.roomId);
            },

            error: (err) => {
                console.error("Plugin Attach Error:", err);
            },

            onmessage: (msg, jsep) => handleJanusMessage(msg, jsep, info),

            // 로컬 스트림 (멘토)
            onlocalstream: (stream) => {
                attachStream(mentorVideoRef.current, stream);
            }
        });
    };


    // =========================================================================
    // 6. JANUS MESSAGE 핸들러
    // =========================================================================

    const handleJanusMessage = (msg, jsep, info) => {
        const event = msg?.videoroom;

        // join 성공 → 멘토만 송출 시작
        if (event === "joined") {
            setIsJoined(true);
            if (isMentor) startPublish(); // 송출 시작
        }

        // 신규 publisher 목록
        const publishers = msg?.publishers || msg?.participants;
        if (Array.isArray(publishers)) {
            publishers.forEach((p) => addParticipant(p.id, p.display));

            // 멘티라면 멘토 자동 구독
            if (!isMentor) pickMentorAndSubscribe(publishers, info.roomId);
        }

        // 누군가 나감
        if (event === "event") {
            const leavingId = msg?.leaving || msg?.unpublished;

            if (leavingId && leavingId !== "ok") {
                removeParticipant(leavingId);

                // 멘토 feed 나감 → 멘티는 구독 해제
                if (!isMentor && leavingId === mentorFeedIdRef.current) {
                    detachSubscriber();
                    attachStream(mentorVideoRef.current, null);
                    mentorFeedIdRef.current = null;
                }
            }
        }

        // SDP 처리
        if (jsep) {
            pubHandle.current?.handleRemoteJsep({ jsep });
        }
    };


    // =========================================================================
    // 7. PARTICIPANT 목록 관리
    // =========================================================================

    const addParticipant = (id, display) => {
        if (!id || !display) return;

        const sid = String(id);

        setParticipants((prev) => {
            if (prev.some((p) => String(p.id) === sid)) return prev;
            return [...prev, { id: sid, display }];
        });
    };

    const removeParticipant = (id) => {
        const sid = String(id);
        setParticipants((prev) => prev.filter((p) => String(p.id) !== sid));
    };

    const others = participants.filter((p) => p.display !== myName);


    // =========================================================================
    // 8. 멘티 전용: 멘토 feed 자동 subscribe
    // =========================================================================

    const pickMentorAndSubscribe = (list, roomId) => {
        if (mentorFeedIdRef.current) return;

        let mentor = null;

        // 서버가 mentor 이름을 줄 경우 우선 사용
        if (sessionInfo?.mentorDisplayName) {
            mentor = list.find((p) => p.display === sessionInfo.mentorDisplayName);
        }

        // fallback: 자기 자신 제외
        if (!mentor) {
            mentor = list.find((p) => p.display !== myName);
        }

        if (mentor?.id) {
            mentorFeedIdRef.current = mentor.id;
            subscribeToFeed(mentor.id, roomId);
        }
    };

    const subscribeToFeed = (feedId, roomId) => {
        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                subHandle.current = handle;

                handle.send({
                    message: {
                        request: "join",
                        room: parseInt(roomId),
                        ptype: "subscriber",
                        feed: feedId
                    }
                });
            },

            onmessage: (msg, jsep) => {
                if (!jsep) return;

                subHandle.current.createAnswer({
                    jsep,
                    media: { audioSend: false, videoSend: false },
                    success: (ans) => {
                        subHandle.current.send({
                            message: { request: "start", room: parseInt(roomId) },
                            jsep: ans
                        });
                    }
                });
            },

            onremotestream: (stream) => {
                attachStream(mentorVideoRef.current, stream); // 멘티 화면
            }
        });
    };

    const detachSubscriber = () => {
        try { subHandle.current?.detach(); } catch {}
        subHandle.current = null;
    };


    // =========================================================================
    // 9. 멘토 전용: Publish 시작
    // =========================================================================

    const startPublish = () => {
        if (!pubHandle.current) return;

        const cam = camStreamRef.current;
        if (!cam) {
            alert("카메라가 준비되지 않았습니다.");
            return;
        }

        pubHandle.current.createOffer({
            stream: cam,
            media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },

            success: (jsep) => {
                pubHandle.current.send({
                    message: { request: "configure", audio: micOn, video: camOn },
                    jsep
                });
            },

            error: (err) => {
                console.error("createOffer error:", err);
                alert("송출 실패 (카메라 문제)");
            }
        });
    };


    // =========================================================================
    // 10. 화면공유 / Mic / Cam 토글
    // =========================================================================

    const toggleMic = () => {
        const s = currentStreamRef.current;
        if (!s) return;

        const t = s.getAudioTracks()[0];
        if (!t) return;

        t.enabled = !t.enabled;
        setMicOn(t.enabled);

        if (isMentor) {
            pubHandle.current?.send({
                message: { request: "configure", audio: t.enabled, video: camOn }
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

        if (isMentor) {
            pubHandle.current?.send({
                message: { request: "configure", audio: micOn, video: t.enabled }
            });
        }
    };

    /**
     * 화면공유 시작 (멘토 전용)
     * ---------------------------------------------------------
     * ✔ 화면공유 시작 시 자동으로 카메라 OFF 처리
     *   - 기존 카메라 트랙 enabled = false
     *   - 상태 camOn = false (UI 동기화)
     * ✔ 화면공유 + 오디오 트랙 혼합 후 Janus publish
     */
    const startScreenShare = async () => {
        if (!isMentor || sharing) return;

        try {
            // 1) 화면 공유 스트림 요청
            const scr = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            });

            screenStreamRef.current = scr;
            setSharing(true);

            const screenTrack = scr.getVideoTracks()[0];

            // 2) 화면 공유 종료 감지 → stopScreenShare 자동 호출
            screenTrack.onended = stopScreenShare;

            // 3) 기존 카메라 OFF 처리 (트랙 disable)
            if (camStreamRef.current) {
                const videoTrack = camStreamRef.current.getVideoTracks()[0];
                if (videoTrack) videoTrack.enabled = false;
            }

            // 4) UI 상태도 카메라 OFF로 업데이트
            setCamOn(false);

            // 5) 화면 공유 스트림 + 오디오 트랙 결합
            const audioTracks = camStreamRef.current?.getAudioTracks?.() || [];
            const mixed = new MediaStream([screenTrack, ...audioTracks]);

            currentStreamRef.current = mixed;

            // 6) Janus로 화면공유 송출
            pubHandle.current.createOffer({
                stream: mixed,
                media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
                success: (jsep) => {
                    pubHandle.current.send({
                        message: {
                            request: "configure",
                            audio: micOn,
                            video: true    // 화면공유 비디오는 항상 true
                        },
                        jsep
                    });
                },
                error: (err) => {
                    console.error("screen share createOffer 실패:", err);
                    alert("화면공유 시작 실패");
                }
            });

        } catch (e) {
            console.error("화면공유 오류:", e);
            alert("화면공유 권한을 허용해주세요.");
        }
    };


    /**
     * 화면공유 종료 → 카메라 복귀
     * ---------------------------------------------------------
     * 문제 원인:
     * - Janus에는 카메라 스트림이 정상적으로 재전송되지만
     * - <video> 태그(mentorVideoRef)에 스트림을 다시 attach하지 않아
     *   화면이 검게 나오던 문제 해결
     */
    const stopScreenShare = async () => {
        if (!isMentor || !sharing) return;

        console.log("[STOP SCREEN SHARE] 화면공유 종료 시도");

        // 1) 상태 업데이트
        setSharing(false);

        // 2) 화면공유 스트림 종료
        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;

        // 3) 카메라 스트림 존재 확인
        const cam = camStreamRef.current;
        if (!cam) {
            console.error("카메라 스트림이 존재하지 않습니다.");
            alert("카메라 복구 실패: 카메라 스트림이 존재하지 않습니다.");
            return;
        }

        // 4) 카메라 트랙 다시 ON
        const videoTrack = cam.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = true;
        }
        setCamOn(true);

        // 5) **UI에 카메라 다시 출력**
        //    ← 이게 없어서 화면이 안 나왔던 것입니다!
        attachStream(mentorVideoRef.current, cam);

        // 6) 현재 송출 스트림을 카메라로 변경
        currentStreamRef.current = cam;

        console.log("[STOP SCREEN SHARE] 카메라 복귀 및 attach 완료, Janus 재송출 시작");

        // 7) Janus로 카메라 송출 재협상(createOffer)
        try {
            pubHandle.current.createOffer({
                stream: cam,
                media: {
                    audioRecv: false,
                    videoRecv: false,
                    audioSend: true,
                    videoSend: true
                },

                success: (jsep) => {
                    console.log("[STOP SCREEN SHARE] createOffer 성공 → configure 전송");
                    pubHandle.current.send({
                        message: { request: "configure", audio: micOn, video: true },
                        jsep
                    });
                },

                error: (err) => {
                    console.error("화면공유 종료 후 createOffer 실패:", err);
                    alert("화면공유 종료 후 카메라 송출 복구 실패");
                }
            });
        } catch (err) {
            console.error("[STOP SCREEN SHARE] Janus 재협상 중 오류:", err);
        }
    };




    // =========================================================================
    // 11. PARTICIPANT POLLING
    // =========================================================================

    const startPollingParticipants = (roomId) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(() => {
            pubHandle.current?.send({
                message: { request: "listparticipants", room: parseInt(roomId) },
                success: (res) => {
                    if (res?.participants) {
                        res.participants.forEach((p) => addParticipant(p.id, p.display));
                        if (!isMentor) pickMentorAndSubscribe(res.participants, roomId);
                    }
                }
            });
        }, 3000);
    };


    // =========================================================================
    // 12. SSE 기반 SESSION 종료 감지
    // =========================================================================

    const startSSE = (sessionId) => {
        const es = new EventSource(`/api/seesun/session/events?sessionId=${sessionId}`, {
            withCredentials: true
        });

        sseRef.current = es;

        es.onmessage = async (ev) => {
            try {
                const data = JSON.parse(ev.data);

                if (data?.type === "SESSION_ENDED") {
                    try {
                        const rec = await apiRecording(sessionId);
                        setRecording({ status: rec.status, url: rec.url || null });
                    } catch {}

                    stopSessionLocal();
                }
            } catch {}
        };
    };


    // =========================================================================
    // 13. STOP LOCAL SESSION
    // =========================================================================

    const stopSessionLocal = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;

        try { subHandle.current?.detach(); } catch {}
        try { pubHandle.current?.detach(); } catch {}
        try { janus.current?.destroy(); } catch {}
        try { sseRef.current?.close(); } catch {}

        subHandle.current = null;
        pubHandle.current = null;
        janus.current = null;
        sseRef.current = null;

        stopStream(currentStreamRef.current);
        stopStream(camStreamRef.current);
        stopStream(screenStreamRef.current);

        currentStreamRef.current = null;
        camStreamRef.current = null;
        screenStreamRef.current = null;

        attachStream(mentorVideoRef.current, null);

        resetAll();
    };

    const endSession = async () => {
        if (!sessionInfo?.sessionId || !isMentor) return;

        try {
            await apiEnd(sessionInfo.sessionId);
            // SSE가 와서 자동 정리됨
        } catch (e) {
            console.error(e);
            alert("강의 종료 실패");
        }
    };


    // =========================================================================
    // 14. 강의 시작 버튼
    // =========================================================================

    const handleStart = async () => {
        if (!window.Janus) {
            alert("Janus 라이브러리가 로드되지 않았습니다.");
            return;
        }

        // 1) 카메라 먼저 확보 (중요)
        const ok = await prepareCamera();
        if (!ok) return;

        try {
            // 2) 서버에서 세션 정보 요청
            const info = await apiBootstrap();
            setSessionInfo(info);

            // 3) SSE 시작
            if (info.sessionId) startSSE(info.sessionId);

            // 4) Janus 초기화 → publish는 joined 이벤트에서 실행
            initJanus(info);

        } catch (e) {
            console.error("세션 시작 실패:", e);
            alert("세션 시작 실패");
        }
    };


    // =========================================================================
    // 15. 언마운트 시 정리
    // =========================================================================

    useEffect(() => {
        return () => stopSessionLocal();
    }, []);


    // =========================================================================
    // 16. RENDER UI
    // =========================================================================

    const btn = {
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        border: "none",
        borderRadius: "6px",
        color: "white"
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>실시간 강의</h1>

            <div style={{ marginBottom: 10 }}>
                {sessionInfo ? (
                    <>
                        역할: <b>{sessionInfo.role}</b> / 닉네임: <b>{sessionInfo.displayName}</b>
                    </>
                ) : (
                    <>세션을 시작해주세요</>
                )}
            </div>

            {/* 버튼 영역 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {!isStarted ? (
                    <button style={{ ...btn, background: "#4CAF50" }} onClick={handleStart}>
                        세션 시작 / 참가
                    </button>
                ) : (
                    <>
                        {isMentor ? (
                            <button style={{ ...btn, background: "#e53935" }} onClick={endSession}>
                                강의 종료
                            </button>
                        ) : (
                            <button style={{ ...btn, background: "#757575" }} onClick={stopSessionLocal}>
                                나가기
                            </button>
                        )}

                        {/* 멘토 전용 기능 */}
                        {isMentor && (
                            <>
                                <button
                                    style={{ ...btn, background: micOn ? "#4CAF50" : "#616161" }}
                                    onClick={toggleMic}
                                >
                                    {micOn ? "마이크 OFF" : "마이크 ON"}
                                </button>

                                <button
                                    style={{ ...btn, background: camOn ? "#4CAF50" : "#616161" }}
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
                    </>
                )}
            </div>

            {/* 녹화 정보 */}
            {recording.status && (
                <div style={{ marginBottom: 20, padding: 12, background: "#f5f5f5", borderRadius: 6 }}>
                    <b>녹화:</b>{" "}
                    {recording.status === "READY" ? (
                        <a href={recording.url} target="_blank" rel="noreferrer">
                            녹화 파일 열기
                        </a>
                    ) : (
                        <>처리중...</>
                    )}
                </div>
            )}

            <div style={{ display: "flex", gap: 20 }}>
                {/* 영상 영역 */}
                <div style={{ flex: 3, background: "#000", borderRadius: 10, overflow: "hidden" }}>
                    <video
                        ref={mentorVideoRef}
                        autoPlay
                        playsInline
                        style={{ width: "100%", height: 500, objectFit: "contain" }}
                    />
                </div>

                {/* 참여자 목록 */}
                <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
                    <h3>참여자 목록 ({others.length + (myName ? 1 : 0)})</h3>

                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {myName && (
                            <li style={{ padding: "8px 0", borderBottom: "2px solid #4CAF50", fontWeight: "bold" }}>
                                👤 {myName} (나)
                            </li>
                        )}

                        {others.map((p) => (
                            <li key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
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

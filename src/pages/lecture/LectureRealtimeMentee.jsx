import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LectureRealtimeMentee.jsx
 * -----------------------------------------------------------
 * 멘티(MENTEE) 전용 실시간 강의 화면
 *
 * 방식 A: URL로 역할 강제
 * - /mentee/lecture/:id → MENTEE 강제
 *
 * 멘티 특징:
 *  - 카메라/마이크 없음
 *  - 화면공유 없음
 *  - 단순히 멘토 영상 구독만 함 (subscriber)
 *  - 강의 종료되면 자동으로 화면 종료
 */

const LectureRealtimeMentee = ({ lectureId }) => {

    // =========================================================================
    // STATE / REF
    // =========================================================================

    const [isStarted, setIsStarted] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        role: "MENTEE",            // ★ 강제 멘티 역할
        displayName: "MenteeUser", // ★ 필요시 변경
    });

    const [participants, setParticipants] = useState([]);

    const mentorVideoRef = useRef(null);
    const janus = useRef(null);
    const subHandle = useRef(null);
    const pollingInterval = useRef(null);
    const sseRef = useRef(null);

    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);

    // 멘토 feed ID 저장
    const mentorFeedIdRef = useRef(null);

    const myName = sessionInfo.displayName;


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
        setParticipants([]);
    };


    // =========================================================================
    // 서버 API
    // =========================================================================

    const apiBootstrap = async () => {
        const res = await fetch("/api/seesun/session/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId: effectiveLectureId }),
        });

        if (!res.ok) throw new Error("멘티 join 실패");
        return await res.json();
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
    // Janus 초기화 (Subscriber 전용)
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

                    success: () => {
                        attachSubscriber();
                    },

                    error: (err) => {
                        console.error("Janus Init Error:", err);
                        alert("Janus 서버 연결 실패");
                    }
                });
            },
        });
    };


    // =========================================================================
    // Subscriber (멘티는 송출하지 않고 수신만 함)
    // =========================================================================

    const attachSubscriber = () => {
        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                subHandle.current = handle;

                // 방 join (subscriber)
                handle.send({
                    message: {
                        request: "join",
                        room: parseInt(sessionInfo.roomId),
                        ptype: "subscribe",   // ✔ 올바른 값
                        display: myName
                    }
                });

                setIsStarted(true);
            },

            error: (err) => {
                console.error("Subscribe attach error:", err);
            },

            onmessage: (msg, jsep) => handleMessage(msg, jsep),

            onremotestream: (stream) => {
                // 멘토 영상 구독됨
                attachStream(mentorVideoRef.current, stream);
            },

            oncleanup: () => {
                attachStream(mentorVideoRef.current, null);
            }
        });
    };


    // =========================================================================
    // 메시지 핸들링
    // =========================================================================

    const handleMessage = (msg, jsep) => {
        const event = msg?.videoroom;

        if (event === "joined") {
            setIsJoined(true);
        }

        // publisher 목록 → 멘토 찾기
        const publishers = msg?.publishers || msg?.participants;
        if (Array.isArray(publishers)) {
            publishers.forEach((p) => addParticipant(p.id, p.display));
            pickMentorAndSubscribe(publishers);
        }

        // 누군가 나감
        if (event === "event") {
            const leavingId = msg?.leaving || msg?.unpublished;

            if (leavingId && leavingId !== "ok") {
                removeParticipant(leavingId);

                // 멘토 feed 나가면 비우기
                if (mentorFeedIdRef.current === leavingId) {
                    mentorFeedIdRef.current = null;
                    attachStream(mentorVideoRef.current, null);
                }
            }
        }

        // SDP(JSEP) 처리
        if (jsep) {
            subHandle.current?.createAnswer({
                jsep,
                media: { audioSend: false, videoSend: false },
                success: (ans) => {
                    subHandle.current.send({
                        message: {
                            request: "start",
                            room: parseInt(sessionInfo.roomId)
                        },
                        jsep: ans
                    });
                }
            });
        }
    };


    // =========================================================================
    // 멘토 feed 자동 구독
    // =========================================================================

    const addParticipant = (id, display) => {
        setParticipants((prev) => {
            if (prev.some((p) => p.id === id)) return prev;
            return [...prev, { id, display }];
        });
    };

    const removeParticipant = (id) => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
    };

    const pickMentorAndSubscribe = (list) => {
        if (mentorFeedIdRef.current) return;

        let mentor = null;

        // 서버가 mentor 이름을 주면 우선
        if (sessionInfo.mentorDisplayName) {
            mentor = list.find((p) => p.display === sessionInfo.mentorDisplayName);
        }

        // fallback: 자기 아닌 사람
        if (!mentor) {
            mentor = list.find((p) => p.display !== myName);
        }

        if (mentor?.id) {
            mentorFeedIdRef.current = mentor.id;
            subscribeToMentor(mentor.id);
        }
    };

    const subscribeToMentor = (feedId) => {
        subHandle.current.send({
            message: {
                request: "join",
                room: parseInt(sessionInfo.roomId),
                ptype: "subscriber",
                feed: feedId
            }
        });
    };


    // =========================================================================
    // 참가자 목록 polling
    // =========================================================================

    const startPolling = (roomId) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(() => {
            subHandle.current?.send({
                message: { request: "listparticipants", room: parseInt(roomId) },
                success: (res) => {
                    if (res?.participants) {
                        res.participants.forEach((p) => addParticipant(p.id, p.display));
                        pickMentorAndSubscribe(res.participants);
                    }
                }
            });
        }, 3000);
    };


    // =========================================================================
    // SSE (멘토가 강의 종료하면 → 멘티 자동 종료)
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
                        console.log("녹화 상태:", rec);
                    } catch {}

                    stopSessionLocal();
                }

            } catch {}
        };
    };


    // =========================================================================
    // 로컬 세션 종료
    // =========================================================================

    const stopSessionLocal = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        try { subHandle.current?.detach(); } catch {}
        try { janus.current?.destroy(); } catch {}
        try { sseRef.current?.close(); } catch {}

        resetAll();
        attachStream(mentorVideoRef.current, null);
    };


    // =========================================================================
    // 세션 시작
    // =========================================================================

    const handleStart = async () => {
        if (!window.Janus) {
            alert("Janus 라이브러리가 로드되지 않음");
            return;
        }

        try {
            const info = await apiBootstrap();

            setSessionInfo({
                ...sessionInfo,
                janusUrl: info.janusUrl,
                roomId: info.roomId,
                sessionId: info.sessionId,
                mentorDisplayName: info.mentorDisplayName
            });

            if (info.sessionId) startSSE(info.sessionId);

            initJanus(info);

            setIsStarted(true);

        } catch (e) {
            console.error("멘티 세션 시작 실패:", e);
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
            <h1>멘티 실시간 강의</h1>

            <div style={{ marginBottom: 10 }}>
                역할: <b>MENTEE</b> / 닉네임: <b>{myName}</b>
            </div>

            {/* 버튼 */}
            <div style={{ marginBottom: 20 }}>
                {!isStarted ? (
                    <button style={{ ...btn, background: "#1e88e5" }} onClick={handleStart}>
                        세션 접속 (멘티)
                    </button>
                ) : (
                    <button style={{ ...btn, background: "#757575" }} onClick={stopSessionLocal}>
                        나가기
                    </button>
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

export default LectureRealtimeMentee;

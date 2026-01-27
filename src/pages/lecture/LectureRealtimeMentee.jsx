import React, { useEffect, useRef, useState, useMemo } from "react";

const LectureRealtimeMentee = ({ lectureId }) => {
    // START / END
    const [isStarted, setIsStarted] = useState(false);

    // 참가자 목록
    const [participants, setParticipants] = useState([]);

    // video ref
    const mentorVideoRef = useRef(null);

    // Janus refs
    const janus = useRef(null);
    const subscriberHandle = useRef(null);

    // feed ID (멘토)
    const mentorFeedIdRef = useRef(null);

    // polling
    const pollingInterval = useRef(null);

    // SSE
    const sseRef = useRef(null);

    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);

    // J A N U S  F U N C T I O N S
    // -----------------------------------------------------------------------------------

    const attachStream = (videoEl, stream) => {
        if (!videoEl) return;
        videoEl.srcObject = stream || null;
        videoEl.play?.().catch(() => {});
    };

    const stopAll = () => {
        console.log("[MENTEE] stopAll()");
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        try { subscriberHandle.current?.detach(); } catch {}
        try { janus.current?.destroy(); } catch {}
        try { sseRef.current?.close(); } catch {}

        mentorFeedIdRef.current = null;
        attachStream(mentorVideoRef.current, null);
        setParticipants([]);
        setIsStarted(false);
    };

    // API -------------------------------------------------------------------------------
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

    // Janus Init ------------------------------------------------------------------------
    const initJanusAndAttach = (info) => {
        const Janus = window.Janus;

        Janus.init({
            debug: "all",
            callback: () => {
                janus.current = new Janus({
                    server: info.janusUrl,

                    success: () => {
                        console.log("[MENTEE] Janus 연결 성공");
                        attachSubscriberPlugin(info);
                    },

                    error: (err) => {
                        console.error("[MENTEE] Janus init error", err);
                        alert("Janus 서버 연결 실패");
                    },
                });
            },
        });
    };

    // Subscriber Attach -----------------------------------------------------------------
    const attachSubscriberPlugin = (info) => {
        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                subscriberHandle.current = handle;
                console.log("[MENTEE] Subscriber plugin attached");
                setIsStarted(true);
            },

            error: (err) => {
                console.error("[MENTEE] subscriber attach error:", err);
            },

            onmessage: (msg, jsep) => {
                handleJanusMessage(info, msg, jsep);
            },

            onremotestream: (stream) => {
                console.log("[MENTEE] onremotestream 발생");
                attachStream(mentorVideoRef.current, stream);
            },

            oncleanup: () => {
                console.log("[MENTEE] oncleanup");
                attachStream(mentorVideoRef.current, null);
            },
        });
    };

    // 메시지 처리 -----------------------------------------------------------------------
    const handleJanusMessage = (info, msg, jsep) => {
        const event = msg?.videoroom;
        console.log("[MENTEE] MSG EVENT:", event, msg);

        const publishers = msg?.publishers || msg?.participants;
        if (Array.isArray(publishers)) {
            publishers.forEach((p) => addParticipant(p.id, p.display));
            pickMentorFeedAndSubscribe(info, publishers);
        }

        // 누군가 나감
        if (event === "event") {
            const leaving = msg?.leaving || msg?.unpublished;
            if (leaving && leaving !== "ok") {
                removeParticipant(leaving);

                if (mentorFeedIdRef.current === leaving) {
                    mentorFeedIdRef.current = null;
                    attachStream(mentorVideoRef.current, null);
                }
            }
        }

        // JSEP 처리 (subscribe → answer)
        if (jsep) {
            subscriberHandle.current.createAnswer({
                jsep,
                media: { audioSend: false, videoSend: false },

                success: (answer) => {
                    subscriberHandle.current.send({
                        message: { request: "start" },
                        jsep: answer,
                    });
                },

                error: (error) => {
                    console.error("[MENTEE] createAnswer error:", error);
                },
            });
        }
    };

    const addParticipant = (id, display) => {
        setParticipants((prev) => {
            if (prev.some((p) => p.id === id)) return prev;
            return [...prev, { id, display }];
        });
    };

    const removeParticipant = (id) => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
    };

    // 멘토 Feed 찾기 --------------------------------------------------------------------
    const pickMentorFeedAndSubscribe = (info, list) => {
        if (mentorFeedIdRef.current) return;

        console.log("[MENTEE] pickMentorFeedAndSubscribe list:", list);

        let mentor = null;

        // mentorDisplayName 사용할 경우
        if (info.mentorDisplayName) {
            mentor = list.find((p) => p.display === info.mentorDisplayName);
        }

        // 없으면 자기 아닌 사람 = 멘토
        if (!mentor) {
            mentor = list.find((p) => p.display !== "MenteeUser");
        }

        if (mentor?.id) {
            mentorFeedIdRef.current = mentor.id;
            subscribeToMentor(info, mentor.id);
        }
    };

    // subscriber join 1번만 보냄 --------------------------------------------------------
    const subscribeToMentor = (info, feedId) => {
        console.log("[MENTEE] subscribeToMentor feed:", feedId);

        subscriberHandle.current.send({
            message: {
                request: "join",
                room: parseInt(info.roomId),   // ★ info에서 직접!
                ptype: "subscriber",
                feed: feedId,
            },
        });
    };

    // Polling (publishers 감지) ---------------------------------------------------------
    const startPolling = (info) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(() => {
            subscriberHandle.current.send({
                message: {
                    request: "listparticipants",
                    room: parseInt(info.roomId),
                },

                success: (res) => {
                    if (res?.participants) {
                        res.participants.forEach((p) =>
                            addParticipant(p.id, p.display)
                        );
                        pickMentorFeedAndSubscribe(info, res.participants);
                    }
                },
            });
        }, 3500);
    };

    // SSE - 강의 종료 --------------------------------------------------------------
    const startSSE = (info) => {
        const es = new EventSource(
            `/api/seesun/session/events?sessionId=${info.sessionId}`,
            { withCredentials: true }
        );

        sseRef.current = es;

        es.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);

                if (data?.type === "SESSION_ENDED") {
                    stopAll();
                }
            } catch {}
        };
    };

    // START -----------------------------------------------------------------------------
    const handleStart = async () => {
        if (!window.Janus) {
            alert("Janus 로드 안됨");
            return;
        }

        try {
            const info = await apiBootstrap();

            console.log("[MENTEE] bootstrap info:", info);

            initJanusAndAttach(info);
            startPolling(info);
            if (info.sessionId) startSSE(info);

            setIsStarted(true);

        } catch (err) {
            console.error("멘티 세션 시작 실패:", err);
            alert("세션 시작 실패");
        }
    };

    // CLEANUP ---------------------------------------------------------------------------
    useEffect(() => {
        return () => stopAll();
    }, []);

    // UI --------------------------------------------------------------------------------
    const btn = {
        padding: "12px 20px",
        fontSize: 16,
        borderRadius: 8,
        border: "none",
        color: "white",
        cursor: "pointer",
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>멘티 화면</h1>

            <div style={{ marginBottom: 20 }}>
                {!isStarted ? (
                    <button
                        style={{ ...btn, background: "#1976d2" }}
                        onClick={handleStart}
                    >
                        세션 접속 (멘티)
                    </button>
                ) : (
                    <button
                        style={{ ...btn, background: "#757575" }}
                        onClick={stopAll}
                    >
                        나가기
                    </button>
                )}
            </div>

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

            <div
                style={{
                    marginTop: 20,
                    border: "1px solid #ddd",
                    padding: 12,
                    borderRadius: 10,
                }}
            >
                <h3>참여자 목록 ({participants.length})</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {participants.map((p) => (
                        <li
                            key={p.id}
                            style={{
                                padding: 8,
                                borderBottom: "1px solid #eee",
                            }}
                        >
                            👤 {p.display}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LectureRealtimeMentee;

import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 * LectureRealtimeMentee.jsx (FINAL FIXED)
 * ------------------------------------------------------------
 * ✅ Fixes included:
 * 1) Dummy publish SDP 안정화: audioRecv/videoRecv=true (SDP m-line 유지 → 465 방지)
 * 2) publishers/participants 혼용 시 display 없는 케이스 방어 (p.display?.)
 * 3) 멘토 feed 탐색 fallback 추가 (display 없으면 id 기준으로 선택)
 * 4) subscriber join 순서 안정화: listparticipants 결과 기반으로도 subscribe 시도
 * 5) leaving/unpublished 비교 시 Number normalize (문자열/숫자 혼재 방지)
 * 6) 디버그 로그 추가(원하면 제거 가능)
 */

export default function LectureRealtimeMentee({ lectureId }) {
    const [isStarted, setIsStarted] = useState(false);

    const [participants, setParticipants] = useState([]);
    const [justJoined, setJustJoined] = useState(null);

    const mentorVideoRef = useRef(null);

    const janus = useRef(null);
    const publisherHandle = useRef(null);   // 멘티 더미 퍼블리셔 (참여자 이벤트 받는 주 핸들)
    const subscriberHandle = useRef(null);  // 멘토 영상 구독하는 핸들

    const mentorFeedIdRef = useRef(null);
    const pollingInterval = useRef(null);
    const sseRef = useRef(null);

    const effectiveLectureId = useMemo(() => lectureId ?? 0, [lectureId]);


    // ==================== 새 메시지 자동 제거 ====================
    useEffect(() => {
        if (!justJoined) return;
        const t = setTimeout(() => setJustJoined(null), 2000);
        return () => clearTimeout(t);
    }, [justJoined]);


    // ==================== 공통 ====================
    const attachStream = (videoEl, stream) => {
        if (!videoEl) return;
        try {
            videoEl.pause?.();
        } catch {}
        videoEl.srcObject = stream || null;
        videoEl.play?.().catch(() => {});
    };


    // ==================== 전체 종료 ====================
    const stopAll = () => {
        try { clearInterval(pollingInterval.current); } catch {}
        try { publisherHandle.current?.detach?.(); } catch {}
        try { subscriberHandle.current?.detach?.(); } catch {}
        try { janus.current?.destroy?.(); } catch {}
        try { sseRef.current?.close?.(); } catch {}

        mentorFeedIdRef.current = null;
        attachStream(mentorVideoRef.current, null);

        setParticipants([]);
        setIsStarted(false);
    };


    // ==================== API ====================
    const apiBootstrap = async () => {
        const res = await fetch("/api/seesun/session/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                lectureId: effectiveLectureId
            }),
        });

        if (!res.ok) throw new Error("멘티 join 실패");
        return await res.json();
    };


    // ==================== Janus Init ====================
    const initJanus = (info) => {
        const Janus = window.Janus;

        Janus.init({
            debug: "all",
            callback: () => {
                janus.current = new Janus({
                    server: info.janusUrl,
                    success: () => attachPublisher(info),
                    error: (err) => console.error("Janus init error:", err),
                });
            },
        });
    };


    // ==================== Publisher Attach (멘티 더미, 이벤트 수신 전담) ====================
    const attachPublisher = (info) => {
        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                publisherHandle.current = handle;

                handle.send({
                    message: {
                        request: "join",
                        room: parseInt(info.roomId, 10),
                        ptype: "publisher",
                        display: "mentee-user"
                    }
                });
            },

            onmessage: (msg, jsep) => {
                const event = msg.videoroom;

                // === joined: 더미 publish 후 subscriber attach ===
                if (event === "joined") {
                    publishDummyStream();
                    attachSubscriber(info);
                }

                // ===== 참여자 목록 / 참가자 이벤트 처리 (핵심 로직) =====
                const list = msg.publishers || msg.participants;
                if (Array.isArray(list)) {
                    list.forEach((p) =>
                        addParticipant(Number(p.id), p.display)
                    );

                    pickMentorFeedAndSubscribe(info, list);
                }

                // ===== 퇴장 처리 =====
                if (msg.leaving && msg.leaving !== "ok") {
                    const leavingId = Number(msg.leaving);
                    removeParticipant(leavingId);

                    if (mentorFeedIdRef.current === leavingId) {
                        mentorFeedIdRef.current = null;
                        attachStream(mentorVideoRef.current, null);
                    }
                }

                if (msg.unpublished && msg.unpublished !== "ok") {
                    const unpubId = Number(msg.unpublished);
                    removeParticipant(unpubId);

                    if (mentorFeedIdRef.current === unpubId) {
                        mentorFeedIdRef.current = null;
                        attachStream(mentorVideoRef.current, null);
                    }
                }

                // ===== JSEP 처리 =====
                if (jsep) {
                    publisherHandle.current.handleRemoteJsep({ jsep });
                }
            },
        });
    };


    // ==================== 더미 퍼블리시 (SDP 안정화 포함) ====================
    const publishDummyStream = () => {
        publisherHandle.current.createOffer({
            media: {
                audioSend: false,
                videoSend: false,
                audioRecv: true,  // SDP m-line 강제 유지
                videoRecv: true,
            },

            success: (jsep) => {
                publisherHandle.current.send({
                    message: { request: "publish" },
                    jsep,
                });
            },
        });
    };


    // ==================== Subscriber Attach (멘토 영상 전용) ====================
    const attachSubscriber = (info) => {
        janus.current.attach({
            plugin: "janus.plugin.videoroom",

            success: (handle) => {
                subscriberHandle.current = handle;

                setIsStarted(true);
                startPolling(info);
                startSSE(info);
            },

            onmessage: (msg, jsep) => {
                // ※ subscriber는 멘토 feed 관련 메시지만 처리

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
                    });
                }
            },

            onremotestream: (stream) => {
                attachStream(mentorVideoRef.current, stream);
            },

            oncleanup: () => {
                attachStream(mentorVideoRef.current, null);
            },
        });
    };


    // ==================== 참여자 추가 (중복 메시지 방지 포함) ====================
    const addParticipant = (id, display) => {
        setParticipants((prev) => {
            if (prev.some((p) => p.id === id)) return prev;

            const safeDisplay = display ?? `(feed:${id})`;
            setJustJoined(safeDisplay);

            return [...prev, { id, display: safeDisplay }];
        });
    };


    // ==================== 참여자 제거 ====================
    const removeParticipant = (id) => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
    };


    // ==================== 멘토 Feed 선정 ====================
    const pickMentorFeedAndSubscribe = (info, list) => {
        if (mentorFeedIdRef.current) return;
        if (!subscriberHandle.current) return;

        // (1) display 기반
        let mentor = list.find((p) => p?.display?.startsWith?.("mentor"));

        // (2) display 없는 fallback(publishers 리스트)
        if (!mentor) mentor = list.find((p) => typeof p?.id === "number" && p.id > 0);

        if (!mentor) return;

        mentorFeedIdRef.current = mentor.id;

        subscriberHandle.current.send({
            message: {
                request: "join",
                room: parseInt(info.roomId, 10),
                ptype: "subscriber",
                feed: mentor.id,
            },
        });
    };


    // ==================== Polling ====================
    const startPolling = (info) => {
        pollingInterval.current = setInterval(() => {
            subscriberHandle.current.send({
                message: {
                    request: "listparticipants",
                    room: parseInt(info.roomId, 10),
                },
                success: (res) => {
                    if (!res?.participants) return;

                    res.participants.forEach((p) =>
                        addParticipant(Number(p.id), p.display)
                    );

                    pickMentorFeedAndSubscribe(info, res.participants);
                },
            });
        }, 2000);
    };


    // ==================== SSE 종료 감지 ====================
    const startSSE = (info) => {
        const es = new EventSource(
            `/api/seesun/session/events?sessionId=${info.sessionId}`,
            { withCredentials: true }
        );
        sseRef.current = es;

        es.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                if (data?.type === "SESSION_ENDED") stopAll();
            } catch {}
        };
    };


    // ==================== Start ====================
    const handleStart = async () => {
        const info = await apiBootstrap();
        initJanus(info);
    };


    useEffect(() => () => stopAll(), []);


    // ==================== UI ====================
    return (
        <div style={{ padding: 20 }}>
            <h1>멘티 화면</h1>

            {!isStarted ? (
                <button
                    style={{
                        padding: 12,
                        background: "#1976d2",
                        color: "white",
                        borderRadius: 8,
                    }}
                    onClick={handleStart}
                >
                    접속하기
                </button>
            ) : (
                <button
                    style={{
                        padding: 12,
                        background: "#757575",
                        color: "white",
                        borderRadius: 8,
                    }}
                    onClick={stopAll}
                >
                    나가기
                </button>
            )}

            <div
                style={{
                    marginTop: 20,
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

            {/* 참여자 목록 */}
            <div
                style={{
                    marginTop: 20,
                    border: "1px solid #ddd",
                    padding: 12,
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
                        <li key={p.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                            👤 {p.display}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}



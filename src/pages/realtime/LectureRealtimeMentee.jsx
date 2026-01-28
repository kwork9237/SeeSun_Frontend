// LectureRealtimeMentee.jsx (FIXED FULL)
// -----------------------------------------------------------
// 멘티(MENTEE) 전용 실시간 강의 화면 (Janus VideoRoom)
// - 멘티는 송출 없음(더미 publisher로만 room 유지 + listparticipants 요청)
// - 멘토의 feed를 subscriber로 구독해서 화면에 표시
//
// ✅ Fixes
// 1) ref.current dependency useEffect 제거 (React가 ref 변경 감지 안함)
// 2) subscriber attach 전/후 레이스 컨디션 해결 (pending feed 강제 처리)
// 3) subscriber start 요청에 room 포함 + 흐름 안정화
// 4) onremotetrack 기반에서도 항상 video DOM에 stream 부착
// 5) publishers/participants 갱신마다 mentor feed 재탐색

import React, { useEffect, useRef, useState } from "react";

import LectureRealtimeLayout from "./LectureRealtimeLayout";
import MentorMainVideo from "./components/MentorMainVideo";
import ParticipantsPanel from "./components/ParticipantsPanel";
import ChatPanel from "./components/ChatPanel";
import ControlsBar from "./components/ControlsBar";

export default function LectureRealtimeMentee({ lectureId, menteeName = "멘티" }) {
    const janusRef = useRef(null);

    // videoroom handles
    const publisherDummyRef = useRef(null);
    const subscriberRef = useRef(null);

    // DOM ref
    const mentorVideoRef = useRef(null);

    // Remote stream 저장 (subscriber에서 받는 스트림)
    const remoteStreamRef = useRef(null);

    const [sessionReady, setSessionReady] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    const janusInitedRef = useRef(false);
    const pollingRef = useRef(null);

    const bootRef = useRef(null);
    const startedRef = useRef(false);

    // mentor feed 관리
    const mentorFeedIdRef = useRef(null);
    const pendingMentorFeedIdRef = useRef(null);

    // -------------------------------
    // Chat
    // -------------------------------
    const handleSendMessage = (text) => {
        const newMessage = {
            sender: menteeName,
            text,
            role: "mentee",
            color: "#3498db",
        };
        setChatMessages((prev) => [...prev, newMessage]);
    };

    // -------------------------------
    // Bootstrap
    // -------------------------------
    const fetchBootstrap = async () => {
        if (bootRef.current) return bootRef.current;

        const res = await fetch("/api/seesun/session/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                lectureId,
                role: "MENTEE",
            }),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`bootstrap HTTP ${res.status} ${txt}`);
        }

        const data = await res.json();
        console.log("🔥 [MENTEE] BOOTSTRAP RESPONSE =", data);

        const janusUrl = data?.janusUrl ?? data?.janus_url;
        const roomId = Number(data?.roomId ?? data?.room_id);

        if (!janusUrl || !roomId) throw new Error("bootstrap 응답 누락(janusUrl/roomId)");

        bootRef.current = { janusUrl, roomId, raw: data };
        return bootRef.current;
    };

    // -------------------------------
    // Janus Init
    // -------------------------------
    const ensureJanusInit = (cb) => {
        const Janus = window.Janus;
        if (!Janus) {
            console.error("window.Janus가 없습니다. janus.js 로드 여부 확인");
            return;
        }
        if (janusInitedRef.current) return cb?.();

        Janus.init({
            debug: "all",
            callback: () => {
                janusInitedRef.current = true;
                cb?.();
            },
        });
    };

    // -------------------------------
    // Polling(listparticipants)
    // -------------------------------
    const requestParticipantsOnce = (roomId) => {
        try {
            publisherDummyRef.current?.send({
                message: { request: "listparticipants", room: Number(roomId) },
            });
        } catch {}
    };

    const startPolling = (roomId) => {
        if (pollingRef.current) return;
        pollingRef.current = setInterval(() => requestParticipantsOnce(roomId), 2000);
    };

    const stopPolling = () => {
        if (!pollingRef.current) return;
        clearInterval(pollingRef.current);
        pollingRef.current = null;
    };

    // -------------------------------
    // Video autoplay helper
    // -------------------------------
    const tryPlayVideo = (video) => {
        if (!video) return;

        // 크롬 자동재생 정책 때문에 muted=true가 가장 안전
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        const p = video.play?.();
        if (p && p.catch) {
            p.catch(() => {
                setTimeout(() => tryPlayVideo(video), 300);
            });
        }
    };

    const attachStreamToVideo = (stream) => {
        const v = mentorVideoRef.current;
        if (!v || !stream) return;

        // 같은 stream이면 재할당 불필요
        if (v.srcObject !== stream) {
            v.srcObject = stream;
        }
        tryPlayVideo(v);
    };

    // -------------------------------
    // Feed picker
    // -------------------------------
    const pickMentorFeedId = (list) => {
        const arr = Array.isArray(list) ? list : [];

        // display에 [MENTOR] 포함된 feed 우선
        const mentor = arr.find((p) => String(p?.display ?? "").includes("[MENTOR]"));
        if (mentor?.id) return Number(mentor.id);

        // 그래도 없으면 가장 첫 publisher id
        const any = arr.find((p) => Number(p?.id) > 0);
        if (any?.id) return Number(any.id);

        return null;
    };

    // -------------------------------
    // Subscribe (핵심 안정화)
    // -------------------------------
    const subscribeToMentorFeed = (boot, feedId) => {
        const roomId = Number(boot?.roomId);
        const fid = Number(feedId);
        if (!roomId || !fid) return;

        // subscriber 아직 없으면 pending에 저장만
        if (!subscriberRef.current) {
            pendingMentorFeedIdRef.current = fid;
            console.log("[MENTEE] subscriber not ready, pending feed =", fid);
            return;
        }

        // 이미 같은 feed를 구독 중이면 skip
        if (mentorFeedIdRef.current === fid) return;

        mentorFeedIdRef.current = fid;
        pendingMentorFeedIdRef.current = null;

        console.log("[MENTEE] subscribing to mentor feed =", fid);

        // ✅ videoroom subscriber join
        try {
            subscriberRef.current.send({
                message: {
                    request: "join",
                    room: roomId,
                    ptype: "subscriber",
                    feed: fid,
                },
            });
        } catch (e) {
            console.error("[MENTEE] subscribe send failed:", e);
        }
    };

    const flushPendingSubscribe = (boot) => {
        const fid = Number(pendingMentorFeedIdRef.current);
        if (!fid) return;
        // 약간 지연을 두면 attach 직후 안정적
        setTimeout(() => {
            const still = Number(pendingMentorFeedIdRef.current);
            if (still) subscribeToMentorFeed(boot, still);
        }, 150);
    };

    // -------------------------------
    // Dummy Publisher (listparticipants용)
    // -------------------------------
    const publishDummyStream = () => {
        const handle = publisherDummyRef.current;
        if (!handle) return;

        handle.createOffer({
            media: {
                audioSend: false,
                videoSend: false,
                audioRecv: true,
                videoRecv: true,
            },
            success: (jsep) => {
                try {
                    handle.send({
                        message: { request: "publish" },
                        jsep,
                    });
                } catch (e) {
                    console.error("[MENTEE] dummy publish send failed:", e);
                }
            },
            error: (err) => {
                console.error("[MENTEE] dummy createOffer error:", err);
            },
        });
    };

    const attachDummyPublisher = (boot) => {
        janusRef.current.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: "mentee-dummy-" + Date.now(),

            success: (handle) => {
                publisherDummyRef.current = handle;

                // join as publisher
                handle.send({
                    message: {
                        request: "join",
                        room: Number(boot.roomId),
                        ptype: "publisher",
                        display: `[MENTEE] ${menteeName}`,
                    },
                });
            },

            onmessage: (msg, jsep) => {
                const event = msg?.videoroom;

                if (event === "joined") {
                    console.log("[MENTEE] dummy joined");
                    publishDummyStream();
                    requestParticipantsOnce(boot.roomId);

                    // PATCH1: 멘토 입장 직후 참여자 목록 2회 강제 요청
                    setTimeout(() => requestParticipantsOnce(boot.roomId), 300);
                    setTimeout(() => requestParticipantsOnce(boot.roomId), 1000);

                    startPolling(boot.roomId);
                }

                // listparticipants response
                if (Array.isArray(msg?.participants)) {
                    const list = msg.participants.map((p) => ({ ...p, id: Number(p.id) }));
                    setParticipants(list);

                    // ✅ participants에서 mentor feed 추출 후 subscribe 시도
                    const fid = pickMentorFeedId(list);
                    if (fid) subscribeToMentorFeed(boot, fid);
                }

                // publishers event
                if (Array.isArray(msg?.publishers) && msg.publishers.length > 0) {
                    const fid = pickMentorFeedId(msg.publishers);
                    if (fid) subscribeToMentorFeed(boot, fid);

                    // patch2: publishers 이벤트 발생 시 참여자 목록 갱신
                    requestParticipantsOnce(boot.roomId);
                }

                // leaving / unpublished 처리
                const leavingId = Number(msg?.leaving ?? msg?.unpublished);
                if (leavingId && msg?.unpublished !== "ok") {
                    setParticipants((prev) => prev.filter((p) => Number(p.id) !== leavingId));

                    // patch3 : 나간 사람 반영 후 재 요청해서 sync 맞추기
                    requestParticipantsOnce(boot.roomId);

                    if (mentorFeedIdRef.current === leavingId) {
                        console.log("[MENTEE] mentor feed left. cleanup remote video");
                        mentorFeedIdRef.current = null;
                        pendingMentorFeedIdRef.current = null;

                        remoteStreamRef.current = null;
                        const v = mentorVideoRef.current;
                        if (v) v.srcObject = null;

                        setSessionReady(false);
                    }
                }

                // remote jsep
                if (jsep) {
                    publisherDummyRef.current?.handleRemoteJsep({ jsep });
                }
            },

            error: (err) => {
                console.error("[MENTEE] attachDummyPublisher error:", err);
            },
        });
    };

    // -------------------------------
    // Subscriber
    // -------------------------------
    const attachSubscriber = (boot) => {
        janusRef.current.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: "mentee-sub-" + Date.now(),

            success: (handle) => {
                subscriberRef.current = handle;
                remoteStreamRef.current = null;

                // ✅ pending feed가 이미 잡혀있으면 반드시 구독 시도
                flushPendingSubscribe(boot);
            },

            onmessage: (msg, jsep) => {
                // subscriber join ack 이후 publishers 정보가 오기도 함
                if (Array.isArray(msg?.publishers) && msg.publishers.length > 0) {
                    const fid = pickMentorFeedId(msg.publishers);
                    if (fid) subscribeToMentorFeed(boot, fid);
                }

                if (jsep) {

                    // ✅ jsep 오면 answer 만들고 start (room 포함)
                    subscriberRef.current.createAnswer({
                        jsep,
                        media: { audioSend: false, videoSend: false },
                        success: (jsepAnswer) => {
                            try {
                                subscriberRef.current.send({
                                    message: { request: "start", room: Number(boot.roomId) },
                                    jsep: jsepAnswer,
                                });
                            } catch (e) {
                                console.error("[MENTEE] subscriber start send failed:", e);
                            }
                        },
                        error: (err) => {
                            console.error("[MENTEE] subscriber createAnswer error:", err);
                        },
                    });
                }
            },

            // (Janus 버전에 따라 onremotestream이 안 올 수도 있어서 onremotetrack도 보강)
            onremotestream: (stream) => {
                console.log("[MENTEE] onremotestream", stream);
                remoteStreamRef.current = stream;
                attachStreamToVideo(stream);

                const hasVideo = stream?.getVideoTracks?.().length > 0;
                setSessionReady(!!hasVideo);
            },

            onremotetrack: (track, mid, on) => {
                // ✅ onremotestream이 없어도 트랙만으로 stream 구성
                let ms = remoteStreamRef.current;
                if (!ms) {
                    ms = new MediaStream();
                    remoteStreamRef.current = ms;
                }

                if (on) {
                    const exists = ms.getTracks().some((t) => t.id === track.id);
                    if (!exists) ms.addTrack(track);
                } else {
                    try {
                        ms.removeTrack(track);
                    } catch {}
                }

                // 트랙 구성될 때마다 video에 부착 보장
                attachStreamToVideo(ms);

                const hasVideo = ms.getVideoTracks().length > 0;
                setSessionReady(hasVideo);
            },

            oncleanup: () => {
                console.log("[MENTEE] subscriber cleanup");
                remoteStreamRef.current = null;

                const v = mentorVideoRef.current;
                if (v) v.srcObject = null;

                setSessionReady(false);
            },

            error: (err) => {
                console.error("[MENTEE] attachSubscriber error:", err);
            },
        });
    };

    // -------------------------------
    // Start (mount)
    // -------------------------------
    useEffect(() => {
        let alive = true;

        const start = async () => {
            if (startedRef.current) return;
            startedRef.current = true;

            try {
                const boot = await fetchBootstrap();

                ensureJanusInit(() => {
                    if (!alive) return;
                    if (janusRef.current) return;

                    const Janus = window.Janus;

                    const janus = new Janus({
                        server: boot.janusUrl,

                        success: () => {
                            // ✅ subscriber 먼저 attach (레이스 방지)
                            attachSubscriber(boot);
                            attachDummyPublisher(boot);
                        },

                        error: (err) => {
                            console.error("[MENTEE] Janus create error:", err);
                            console.error("[MENTEE] janusUrl used =", boot?.janusUrl);
                        },

                        destroyed: () => {
                            janusRef.current = null;
                            subscriberRef.current = null;
                            publisherDummyRef.current = null;
                            startedRef.current = false;
                        },
                    });

                    janusRef.current = janus;
                });
            } catch (e) {
                console.error("[MENTEE] start error:", e);
                startedRef.current = false;
            }
        };

        start();

        return () => {
            alive = false;

            try {
                stopPolling();
                publisherDummyRef.current?.send({ message: { request: "leave" } });
                subscriberRef.current?.send({ message: { request: "leave" } });

                publisherDummyRef.current?.detach?.();
                subscriberRef.current?.detach?.();
                janusRef.current?.destroy?.();
            } catch {}

            publisherDummyRef.current = null;
            subscriberRef.current = null;
            janusRef.current = null;

            remoteStreamRef.current = null;
            mentorFeedIdRef.current = null;
            pendingMentorFeedIdRef.current = null;

            setParticipants([]);
            setSessionReady(false);
            startedRef.current = false;
        };
    }, [lectureId, menteeName]);

    // ✅ sessionReady가 true가 되는 순간 DOM video에 다시 한번 확실히 붙여준다.
    // (ref.current dependency를 쓰지 않기 위한 안전장치)
    useEffect(() => {
        if (!sessionReady) return;
        if (remoteStreamRef.current) {
            attachStreamToVideo(remoteStreamRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionReady]);

    // -------------------------------
    // End Session
    // -------------------------------
    const endSession = () => {
        if (!window.confirm("강의실을 나가시겠습니까?")) return;

        try {
            stopPolling();
            publisherDummyRef.current?.send({ message: { request: "leave" } });
            subscriberRef.current?.send({ message: { request: "leave" } });

            publisherDummyRef.current?.detach?.();
            subscriberRef.current?.detach?.();
            janusRef.current?.destroy?.();
        } catch {}

        publisherDummyRef.current = null;
        subscriberRef.current = null;
        janusRef.current = null;

        remoteStreamRef.current = null;
        const v = mentorVideoRef.current;
        if (v) v.srcObject = null;

        mentorFeedIdRef.current = null;
        pendingMentorFeedIdRef.current = null;

        setParticipants([]);
        setSessionReady(false);
        startedRef.current = false;
    };

    return (
        <LectureRealtimeLayout
            thumbnailList={
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    멘티 화면에는 썸네일이 표시되지 않습니다.
                </div>
            }
            mentorVideo={
                <MentorMainVideo
                    videoRef={mentorVideoRef}
                    mentorName="멘토"
                    isLive={sessionReady}
                    isCamOn={sessionReady}
                />
            }
            participantsPanel={<ParticipantsPanel participants={participants} />}
            chatPanel={<ChatPanel messages={chatMessages} onSend={handleSendMessage} />}
            controlsBar={
                <ControlsBar
                    camOn={false}
                    micOn={false}
                    screenSharing={false}
                    onToggleCam={() => {}}
                    onToggleMic={() => {}}
                    onStartShare={() => {}}
                    onStopShare={() => {}}
                    onEndSession={endSession}
                />
            }
        />
    );
}

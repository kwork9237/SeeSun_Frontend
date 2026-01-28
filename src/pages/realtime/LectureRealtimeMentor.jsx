import React, { useEffect, useRef, useState } from "react";
import LectureRealtimeLayout from "./LectureRealtimeLayout";
import MentorMainVideo from "./components/MentorMainVideo";
import ParticipantsPanel from "./components/ParticipantsPanel";
import ChatPanel from "./components/ChatPanel";
import ControlsBar from "./components/ControlsBar";

export default function LectureRealtimeMentor({ lectureId, mentorName = "멘토" }) {
    const janusRef = useRef(null);
    const publisherHandleRef = useRef(null);

    const mentorVideoRef = useRef(null);

    const [sessionStarted, setSessionStarted] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isSharing, setIsSharing] = useState(false);

    const [participants, setParticipants] = useState([]);
    const [myFeedId, setMyFeedId] = useState(null);

    const [chatMessages, setChatMessages] = useState([]);

    const janusInitedRef = useRef(false);
    const pollingRef = useRef(null);

    // ✅ 실제 송출 스트림
    const publishedStreamRef = useRef(null);

    // ✅ publish 한 번이라도 했는지
    const publishedOnceRef = useRef(false);

    // ✅ bootstrap 캐시
    const bootRef = useRef(null);

    // ✅ StrictMode 중복 방지
    const startedRef = useRef(false);

    // ✅ replaceTrack용 sender
    const videoSenderRef = useRef(null);
    const audioSenderRef = useRef(null);

    // ---------------------------------
    // Chat
    // ---------------------------------
    const handleSendMessage = (text) => {
        const newMessage = {
            sender: mentorName,
            text,
            role: "mentor",
            color: "#3498db",
        };
        setChatMessages((prev) => [...prev, newMessage]);
    };

    // ---------------------------------
    // Bootstrap
    // ---------------------------------
    const fetchBootstrap = async () => {
        if (bootRef.current) return bootRef.current;

        const res = await fetch("/api/seesun/session/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lectureId, role: "MENTOR" }),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            console.error("[MENTOR] bootstrap fail:", res.status, txt);
            throw new Error(`bootstrap HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("🔥 [MENTOR] BOOTSTRAP RESPONSE =", data);

        const janusUrl = data?.janusUrl ?? data?.janus_url;
        const roomId = Number(data?.roomId ?? data?.room_id);

        if (!janusUrl) throw new Error("bootstrap 응답에 janusUrl이 없습니다.");
        if (!roomId) throw new Error("bootstrap 응답에 roomId가 없습니다.");

        bootRef.current = { janusUrl, roomId, raw: data };
        return bootRef.current;
    };

    // ---------------------------------
    // Janus init (1회)
    // ---------------------------------
    const ensureJanusInit = (onReady) => {
        const Janus = window.Janus;
        if (!Janus) {
            console.error("window.Janus가 없습니다. janus.js 로드 여부 확인");
            return;
        }
        if (janusInitedRef.current) return onReady?.();

        Janus.init({
            debug: "all",
            callback: () => {
                janusInitedRef.current = true;
                onReady?.();
            },
        });
    };

    // ---------------------------------
    // Participants polling
    // ---------------------------------
    const requestParticipantsOnce = (roomId) => {
        try {
            publisherHandleRef.current?.send({
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

    // ---------------------------------
    // Media helpers
    // ---------------------------------
    const stopStreamTracks = (stream) => {
        try {
            stream?.getTracks?.().forEach((t) => t.stop());
        } catch {}
    };

    const applyTrackEnabled = (stream, camOn, micOn) => {
        if (!stream) return;
        stream.getVideoTracks?.().forEach((t) => (t.enabled = !!camOn));
        stream.getAudioTracks?.().forEach((t) => (t.enabled = !!micOn));
    };

    const attachLocalPreviewNow = (stream) => {
        const v = mentorVideoRef.current;
        if (!v || !stream) return;

        // ✅ 로컬 프리뷰 딜레이 제거 핵심
        if (v.srcObject !== stream) v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;
        v.autoplay = true;
        v.play?.().catch(() => {});
    };

    const getCameraStream = async () => {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    };

    const getScreenStream = async () => {
        const display = await navigator.mediaDevices.getDisplayMedia({
            video: {
                frameRate: { ideal: 30, max: 60 },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            },
            audio: false,
        });

        // 마이크 트랙은 기존 스트림에서 가져오거나 새로 획득
        let micTrack = null;
        const current = publishedStreamRef.current;
        if (current?.getAudioTracks?.().length) {
            micTrack = current.getAudioTracks()[0];
        } else {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micTrack = mic.getAudioTracks()[0];
        }

        const composed = new MediaStream();
        const vTrack = display.getVideoTracks()[0];
        if (vTrack) composed.addTrack(vTrack);
        if (micTrack) composed.addTrack(micTrack);

        // 화면공유 종료 시 카메라 복귀
        if (vTrack) {
            vTrack.onended = () => {
                setIsSharing(false);
                republishWithCamera().catch(console.error);
            };
        }

        return composed;
    };

    // ---------------------------------
    // Publish / Configure
    // ---------------------------------
    const sendPublishOrConfigure = (jsep) => {
        const handle = publisherHandleRef.current;
        if (!handle) return;

        const request = publishedOnceRef.current ? "configure" : "publish";

        handle.send({
            message: {
                request,
                audio: true,
                video: true,
            },
            jsep,
        });

        if (!publishedOnceRef.current) publishedOnceRef.current = true;
    };

    const renegotiateWithStream = async (stream) => {
        const handle = publisherHandleRef.current;
        if (!handle) return;

        applyTrackEnabled(stream, isCamOn, isMicOn);

        handle.createOffer({
            stream,
            media: {
                audioRecv: false,
                videoRecv: false,
                audioSend: true,
                videoSend: true,
            },
            success: (jsep) => {
                sendPublishOrConfigure(jsep);
            },
            error: (err) => console.error("[MENTOR] createOffer error:", err),
        });
    };

    const refreshSendersFromPC = () => {
        try {
            const pc = publisherHandleRef.current?.webrtcStuff?.pc;
            if (!pc?.getSenders) return;

            pc.getSenders().forEach((s) => {
                if (s?.track?.kind === "video") videoSenderRef.current = s;
                if (s?.track?.kind === "audio") audioSenderRef.current = s;
            });
        } catch {}
    };

    const replaceTracks = async (stream) => {
        refreshSendersFromPC();

        const vTrack = stream?.getVideoTracks?.()?.[0] ?? null;
        const aTrack = stream?.getAudioTracks?.()?.[0] ?? null;

        applyTrackEnabled(stream, isCamOn, isMicOn);

        // ✅ 멘토 로컬 프리뷰 즉시 반영(딜레이 제거 1차)
        attachLocalPreviewNow(stream);

        // sender 아직 없으면(초기/예외) → renegotiate로 보정
        if (!videoSenderRef.current || !audioSenderRef.current) {
            console.log("[MENTOR] senders not ready -> renegotiateWithStream()");
            await renegotiateWithStream(stream);
            // renegotiate 후 sender 다시 확보(약간 delay)
            setTimeout(refreshSendersFromPC, 50);
            return;
        }

        try {
            if (videoSenderRef.current && vTrack) {
                await videoSenderRef.current.replaceTrack(vTrack);
            }
            if (audioSenderRef.current && aTrack) {
                await audioSenderRef.current.replaceTrack(aTrack);
            }

            // ✅ 빠른 반영을 위한 configure (bitrate 지정으로 전환 지연 감소)
            try {
                publisherHandleRef.current?.send({
                    message: {
                        request: "configure",
                        audio: true,
                        video: true,
                        bitrate: 4000000,
                        quality: 100,
                    },
                });
            } catch {}

            console.log("[MENTOR] replaceTrack applied (video/audio)");

            // ✅ 멘토 로컬 프리뷰 즉시 반영(딜레이 제거 2차, 확실히)
            attachLocalPreviewNow(stream);
        } catch (e) {
            console.error("[MENTOR] replaceTrack failed -> fallback renegotiate:", e);
            await renegotiateWithStream(stream);
            setTimeout(refreshSendersFromPC, 50);
            attachLocalPreviewNow(stream);
        }
    };

    const republishWithCamera = async () => {
        const cam = await getCameraStream();

        const prev = publishedStreamRef.current;
        publishedStreamRef.current = cam;

        // ✅ 멘토 화면 즉시 카메라로(딜레이 제거)
        attachLocalPreviewNow(cam);

        await replaceTracks(cam);

        if (prev && prev !== cam) stopStreamTracks(prev);
    };

    const republishWithScreen = async () => {
        const screen = await getScreenStream();

        const prev = publishedStreamRef.current;
        publishedStreamRef.current = screen;

        // ✅ 멘토 화면 즉시 화면공유로(딜레이 제거)
        attachLocalPreviewNow(screen);

        await replaceTracks(screen);

        if (prev && prev !== screen) stopStreamTracks(prev);

        setIsSharing(true);
    };

    // ---------------------------------
    // Start session
    // ---------------------------------
    const startSession = async () => {
        try {
            if (startedRef.current) return;
            startedRef.current = true;

            const boot = await fetchBootstrap();

            ensureJanusInit(() => {
                const Janus = window.Janus;

                const janus = new Janus({
                    server: boot.janusUrl,

                    success: () => {
                        janus.attach({
                            plugin: "janus.plugin.videoroom",
                            opaqueId: "mentor-" + Date.now(),

                            success: (handle) => {
                                publisherHandleRef.current = handle;

                                handle.send({
                                    message: {
                                        request: "join",
                                        room: boot.roomId,
                                        ptype: "publisher",
                                        display: `[MENTOR] ${mentorName}`,
                                    },
                                });

                                setSessionStarted(true);
                            },

                            onmessage: (msg, jsep) => {
                                if (Array.isArray(msg?.participants)) {
                                    setParticipants(msg.participants.map((p) => ({ ...p, id: Number(p.id) })));
                                }

                                const event = msg?.videoroom;

                                if (event === "joined") {
                                    setMyFeedId(Number(msg?.id));
                                    requestParticipantsOnce(boot.roomId);
                                    startPolling(boot.roomId);

                                    // ✅ 최초 publish (camera)
                                    republishWithCamera().catch(console.error);
                                }

                                if (msg?.leaving) {
                                    const leavingId = Number(msg.leaving);
                                    setParticipants((prev) => prev.filter((p) => Number(p.id) !== leavingId));
                                }
                                if (msg?.unpublished && msg.unpublished !== "ok") {
                                    const unpubId = Number(msg.unpublished);
                                    setParticipants((prev) => prev.filter((p) => Number(p.id) !== unpubId));
                                }

                                if (jsep) {
                                    publisherHandleRef.current?.handleRemoteJsep?.({ jsep });
                                }
                            },

                            onlocalstream: (stream) => {
                                // ✅ publish/renegotiate 때 들어오는 stream도 로컬 프리뷰에 반영
                                attachLocalPreviewNow(stream);

                                // ✅ sender 확보(초기 publish 직후 잡힘)
                                refreshSendersFromPC();
                                setTimeout(refreshSendersFromPC, 50);
                            },

                            error: (err) => {
                                console.error("[MENTOR] janus.attach error:", err);
                            },
                        });
                    },

                    error: (err) => {
                        console.error("[MENTOR] Janus create error:", err);
                        console.error("[MENTOR] janusUrl used =", boot?.janusUrl);
                    },

                    destroyed: () => {
                        janusRef.current = null;
                        publisherHandleRef.current = null;

                        setSessionStarted(false);
                        setParticipants([]);
                        setMyFeedId(null);
                        setIsSharing(false);

                        startedRef.current = false;

                        videoSenderRef.current = null;
                        audioSenderRef.current = null;
                    },
                });

                janusRef.current = janus;
            });
        } catch (e) {
            console.error("[MENTOR] startSession failed:", e);
            startedRef.current = false;
            alert("강의 시작 실패: 콘솔 로그를 확인하세요.");
        }
    };

    // ---------------------------------
    // Controls
    // ---------------------------------
    const toggleCam = () => {
        setIsCamOn((prev) => {
            const next = !prev;

            const s = publishedStreamRef.current;
            applyTrackEnabled(s, next, isMicOn);

            try {
                publisherHandleRef.current?.send({
                    message: { request: "configure", audio: true, video: true },
                });
            } catch {}

            return next;
        });
    };

    const toggleMic = () => {
        setIsMicOn((prev) => {
            const next = !prev;

            const s = publishedStreamRef.current;
            applyTrackEnabled(s, isCamOn, next);

            try {
                publisherHandleRef.current?.send({
                    message: { request: "configure", audio: true, video: true },
                });
            } catch {}

            return next;
        });
    };

    const startShare = async () => {
        if (!sessionStarted) return alert("강의 시작 후 화면 공유가 가능합니다.");
        try {
            await republishWithScreen();
        } catch (e) {
            console.error("[MENTOR] startShare failed:", e);
        }
    };

    const stopShare = async () => {
        if (!sessionStarted) return;
        setIsSharing(false);
        try {
            await republishWithCamera();
        } catch (e) {
            console.error("[MENTOR] stopShare failed:", e);
        }
    };

    const endSession = () => {
        if (!window.confirm("정말 세션을 종료하시겠습니까?")) return;

        stopPolling();

        try {
            publisherHandleRef.current?.send({ message: { request: "leave" } });
        } catch {}
        try {
            publisherHandleRef.current?.detach?.();
        } catch {}
        try {
            janusRef.current?.destroy?.();
        } catch {}

        publisherHandleRef.current = null;
        janusRef.current = null;

        stopStreamTracks(publishedStreamRef.current);
        publishedStreamRef.current = null;
        publishedOnceRef.current = false;

        videoSenderRef.current = null;
        audioSenderRef.current = null;

        setSessionStarted(false);
        setParticipants([]);
        setMyFeedId(null);
        setIsSharing(false);

        startedRef.current = false;
    };

    // ---------------------------------
    // Cleanup on unmount
    // ---------------------------------
    useEffect(() => {
        return () => {
            try {
                stopPolling();
            } catch {}
            try {
                publisherHandleRef.current?.detach?.();
            } catch {}
            try {
                janusRef.current?.destroy?.();
            } catch {}

            stopStreamTracks(publishedStreamRef.current);
            publishedStreamRef.current = null;
            publishedOnceRef.current = false;

            videoSenderRef.current = null;
            audioSenderRef.current = null;

            startedRef.current = false;
        };
    }, []);

    return (
        <LectureRealtimeLayout
            mentorVideo={
                <MentorMainVideo
                    videoRef={mentorVideoRef}
                    mentorName={mentorName}
                    isLive={sessionStarted}
                    isCamOn={isCamOn}
                />
            }
            participantsPanel={<ParticipantsPanel participants={participants} selfId={myFeedId} />}
            chatPanel={<ChatPanel messages={chatMessages} onSend={handleSendMessage} />}
            controlsBar={
                <ControlsBar
                    camOn={isCamOn}
                    micOn={isMicOn}
                    screenSharing={isSharing}
                    sessionStarted={sessionStarted}
                    onToggleCam={toggleCam}
                    onToggleMic={toggleMic}
                    onStartShare={startShare}
                    onStopShare={stopShare}
                    onStartSession={startSession}
                    onEndSession={endSession}
                />
            }
        />
    );
}

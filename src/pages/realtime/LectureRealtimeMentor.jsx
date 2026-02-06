import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import LectureRealtimeLayout from "./LectureRealtimeLayout";
import MentorMainVideo from "./components/MentorMainVideo";
import ParticipantsPanel from "./components/ParticipantsPanel";
import ChatPanel from "./components/ChatPanel";
import ControlsBar from "./components/ControlsBar";
import SessionGuard from "../../auth/SessionGuard";
import apiClient from "../../api/apiClient";
import { useNavigate } from "react-router-dom";

// mentorName 수정필요
export default function LectureRealtimeMentor() {
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

  const publishedStreamRef = useRef(null);
  const publishedOnceRef = useRef(false);

  const bootRef = useRef(null);
  const startedRef = useRef(false);

  const videoSenderRef = useRef(null);
  const audioSenderRef = useRef(null);

  // ✅ 채팅은 lectureId가 아니라 Janus roomId로 묶어야 함
  const [chatRoomId, setChatRoomId] = useState(null);
  const [mentorName, setMentorName] = useState("");

  // URL UUID
  const { uuid } = useParams();
  const navigate = useNavigate();

  // ---------------------------------
  // Chat
  // ---------------------------------
  const handleSendMessage = async (text) => {
    const rid = chatRoomId; // ✅ roomId 기준
    if (!rid) {
      console.warn("[MENTOR] chatRoomId not ready yet. skip send");
      return;
    }

    const msg = {
      roomId: rid, // ✅ roomId를 lectureId 자리에 넣어서 broadcast key 통일
      sender: mentorName || bootRef.current?.name || "ERROR",
      role: "mentor",
      text,
    };

    // await fetch("/api/seesun/live/chat/send", {
    //   method: "POST",
    //   headers: {"Content-Type" : "application/json"},
    //   body: JSON.stringify(msg),
    // });

    await apiClient.post("/seesun/live/chat/send", msg);

    // setChatMessages((prev) => [...prev, msg]);
  };

  // ---------------------------------
  // Bootstrap
  // ---------------------------------
  const fetchBootstrap = async () => {
    if (bootRef.current) return bootRef.current;

    let res;
    try {
      res = await apiClient.post(`/seesun/live/bootstrap/${uuid}`);
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error("[MENTOR] bootstrap fail:", status, body ?? err.message);
      throw err;
    }

    const data = res.data; // ✅ axios는 여기

    console.log("🔥 [MENTOR] BOOTSTRAP RESPONSE =", data);

    const janusUrl = data.janusUrl;
    const roomId = Number(data.roomId);
    const name = data.displayName;

    if (!janusUrl) throw new Error("bootstrap 응답에 janusUrl이 없습니다.");
    if (!roomId) throw new Error("bootstrap 응답에 roomId가 없습니다.");
    if (!name) throw new Error("bootstrap 응답에 displayName이 없습니다.");

    bootRef.current = { janusUrl, roomId, name, raw: data };
    
    setMentorName(name);
    setChatRoomId(roomId);

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
    const h = publisherHandleRef.current;
    if (!h) return;

    const rid = Number(roomId);
    // console.log("[MENTOR] listparticipants -> room", rid);

    try {
      h.send({
        message: { request: "listparticipants", room: rid },
        success: (res) => {
          const participants =
            res?.plugindata?.data?.participants ??
            res?.plugindata?.data?.participants_list ??
            res?.participants;

          if (Array.isArray(participants)) {
            // console.log("[MENTOR] listparticipants OK:", participants.length);
            const list = participants.map((p) => ({ ...p, id: Number(p.id) }));
            setParticipants(list);
          } else {
            console.log("[MENTOR] listparticipants res(no list):", res);
          }
        },
        error: (err) => console.error("[MENTOR] listparticipants ERROR:", err),
      });
    } catch (e) {
      console.error("[MENTOR] listparticipants send failed:", e);
    }
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
    attachLocalPreviewNow(stream);

    if (!videoSenderRef.current || !audioSenderRef.current) {
      console.log("[MENTOR] senders not ready -> renegotiateWithStream()");
      await renegotiateWithStream(stream);
      setTimeout(refreshSendersFromPC, 50);
      return;
    }

    try {
      if (videoSenderRef.current && vTrack) await videoSenderRef.current.replaceTrack(vTrack);
      if (audioSenderRef.current && aTrack) await audioSenderRef.current.replaceTrack(aTrack);

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
    attachLocalPreviewNow(cam);
    await replaceTracks(cam);
    if (prev && prev !== cam) stopStreamTracks(prev);
  };

  const republishWithScreen = async () => {
    const screen = await getScreenStream();
    const prev = publishedStreamRef.current;
    publishedStreamRef.current = screen;
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
                    display: `[MENTOR] ${boot.name}`,
                  },
                });

                setSessionStarted(true);
              },

              onmessage: (msg, jsep) => {
                if (Array.isArray(msg?.participants)) {
                  setParticipants(msg.participants.map((p) => ({ ...p, id: Number(p.id) })));
                }

                if (Array.isArray(msg?.publishers) && msg.publishers.length > 0) {
                  requestParticipantsOnce(boot.roomId);
                }

                const event = msg?.videoroom;

                if (event === "joined") {
                  setMyFeedId(Number(msg?.id));
                  requestParticipantsOnce(boot.roomId);
                  startPolling(boot.roomId);

                  setTimeout(() => requestParticipantsOnce(boot.roomId), 300);
                  setTimeout(() => requestParticipantsOnce(boot.roomId), 1000);

                  republishWithCamera().catch(console.error);
                }

                if (msg?.leaving) {
                  const leavingId = Number(msg.leaving);
                  setParticipants((prev) => prev.filter((p) => Number(p.id) !== leavingId));
                  requestParticipantsOnce(boot.roomId);
                  setTimeout(() => requestParticipantsOnce(boot.roomId), 300);
                }
                if (msg?.unpublished && msg.unpublished !== "ok") {
                  const unpubId = Number(msg.unpublished);
                  setParticipants((prev) => prev.filter((p) => Number(p.id) !== unpubId));
                  requestParticipantsOnce(boot.roomId);
                  setTimeout(() => requestParticipantsOnce(boot.roomId), 300);
                }

                if (jsep) {
                  publisherHandleRef.current?.handleRemoteJsep?.({ jsep });
                }
              },

              onlocalstream: (stream) => {
                attachLocalPreviewNow(stream);
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

      apiClient.post(`/lectures/sessions/start/${uuid}`);
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

    // 세션 완전 종료 및 이동
    apiClient.post(`/lectures/sessions/close/${uuid}`);
    if (window.history.length > 1) {
    navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
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

  // ---------------------------------------------
  // ✅ SSE Listener (MENTOR) - roomId 기준으로 구독
  // ---------------------------------------------
  useEffect(() => {
    if (!chatRoomId) return;

    const es = new EventSource(`/api/seesun/live/chat/stream?roomId=${chatRoomId}`, {
      withCredentials: true
    });

    // 2. 통합 핸들러
    const handleData = (e) => {
      console.log(`🔔 [SSE 수신 - ${e.type}] raw:`, e.data); // 여기서 e.type이 "chat" 혹은 "ping"일 것임
      if (e.type === 'chat') {
        try {
          const data = JSON.parse(e.data);
          setChatMessages(prev => [...prev, data]);
        } catch (err) {
          console.error("JSON 파싱 에러:", err);
        }
      }
    };

    // 3. ⭐ 핵심: 서버에서 .name()으로 보낸 것들을 각각 리스너로 등록
    es.addEventListener("ping", (e) => console.log("📡 서버 연결 확인 (ping):", e.data));
    es.addEventListener("chat", handleData); // 백엔드의 .name("chat")과 일치해야 함
    
    // 만약 서버에서 이름 없이 보내는 것도 있다면 대비
    es.onmessage = handleData;

    es.onopen = () => console.log("✅ SSE 통로 연결 성공! (readyState: 1)");
    es.onerror = (err) => console.error("❌ SSE 연결 에러 발생:", err);

    return () => {
      console.log("🔌 SSE 연결 종료");
      es.close();
    };
  }, [chatRoomId]);

  return (
    <SessionGuard>
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
    </SessionGuard>
  );
}

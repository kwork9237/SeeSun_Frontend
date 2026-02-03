// LectureRealtimeMentee.jsx (FIXED FULL)
// -----------------------------------------------------------
// 멘티(MENTEE) 전용 실시간 강의 화면 (Janus VideoRoom)

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import LectureRealtimeLayout from "./LectureRealtimeLayout";
import MentorMainVideo from "./components/MentorMainVideo";
import ParticipantsPanel from "./components/ParticipantsPanel";
import ChatPanel from "./components/ChatPanel";
import ControlsBar from "./components/ControlsBar";
import SessionGuard from "../../auth/SessionGuard";

// menteeName 수정필요
export default function LectureRealtimeMentee({ menteeName }) {
  const { lectureId } = useParams();
  const numericLectureId = Number(lectureId);

  const janusRef = useRef(null);

  const publisherDummyRef = useRef(null);
  const subscriberRef = useRef(null);

  const mentorVideoRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const [sessionReady, setSessionReady] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const janusInitedRef = useRef(false);
  const pollingRef = useRef(null);

  const bootRef = useRef(null);
  const startedRef = useRef(false);

  const mentorFeedIdRef = useRef(null);
  const pendingMentorFeedIdRef = useRef(null);

  // ✅ 채팅용 roomId (bootstrap에서 세팅)
  const [chatRoomId, setChatRoomId] = useState(null);

  // ---------------------------------
  // Chat send (MENTEE) - roomId 기준
  // ---------------------------------
  const handleSendMessage = async (text) => {
    const rid = chatRoomId;
    if (!rid) {
      console.warn("[MENTEE] chatRoomId not ready yet. skip send");
      return;
    }

    const msg = {
      roomId: rid, // ✅ roomId를 lectureId 자리에 넣어서 broadcast key 통일
      sender: menteeName,
      role: "mentee",
      text,
    };

    await fetch("/api/seesun/janus/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(msg),
    });

    // setChatMessages((prev) => [...prev, msg]);
  };

  // -------------------------------
  // Bootstrap
  // -------------------------------
  const fetchBootstrap = async () => {
    if (bootRef.current) return bootRef.current;

    const res = await fetch("/api/seesun/janus/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        lectureId, // URL의 lectureId (강의 PK)
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

    // ✅ 채팅은 roomId로 고정
    setChatRoomId(roomId);

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
    const h = publisherDummyRef.current;
    if (!h) return;

    const rid = Number(roomId);
    console.log("[MENTEE] listparticipants -> room", rid);

    try {
      h.send({
        message: { request: "listparticipants", room: rid },

        success: (res) => {
          const participants =
            res?.plugindata?.data?.participants ??
            res?.plugindata?.data?.participants_list ??
            res?.participants;

          if (Array.isArray(participants)) {
            console.log("[MENTEE] listparticipants OK:", participants.length);

            const list = participants.map((p) => ({ ...p, id: Number(p.id) }));
            setParticipants(list);

            const fid = pickMentorFeedId(list);
            if (fid) subscribeToMentorFeed(bootRef.current ?? { roomId: rid }, fid);
          } else {
            console.log("[MENTEE] listparticipants res(no list):", res);
          }
        },

        error: (err) => {
          console.error("[MENTEE] listparticipants ERROR:", err);
        },
      });
    } catch (e) {
      console.error("[MENTEE] listparticipants send failed:", e);
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

  // -------------------------------
  // Video autoplay helper
  // -------------------------------
  const tryPlayVideo = (video) => {
    if (!video) return;
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

    const mentor = arr.find((p) => String(p?.display ?? "").includes("[MENTOR]"));
    if (mentor?.id) return Number(mentor.id);

    const any = arr.find((p) => Number(p?.id) > 0);
    if (any?.id) return Number(any.id);

    return null;
  };

  // -------------------------------
  // Subscribe
  // -------------------------------
  const subscribeToMentorFeed = (boot, feedId) => {
    const roomId = Number(boot?.roomId);
    const fid = Number(feedId);
    if (!roomId || !fid) return;

    if (!subscriberRef.current) {
      pendingMentorFeedIdRef.current = fid;
      console.log("[MENTEE] subscriber not ready, pending feed =", fid);
      return;
    }

    if (mentorFeedIdRef.current === fid) return;

    mentorFeedIdRef.current = fid;
    pendingMentorFeedIdRef.current = null;

    console.log("[MENTEE] subscribing to mentor feed =", fid);

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

          setParticipants((prev) => [...prev]);

          setTimeout(() => requestParticipantsOnce(boot.roomId), 300);
          setTimeout(() => requestParticipantsOnce(boot.roomId), 1000);
          setTimeout(() => requestParticipantsOnce(boot.roomId), 1500);

          startPolling(boot.roomId);
        }

        if (Array.isArray(msg?.participants)) {
          const list = msg.participants.map((p) => ({ ...p, id: Number(p.id) }));
          setParticipants(list);

          const fid = pickMentorFeedId(list);
          if (fid) subscribeToMentorFeed(boot, fid);
        }

        if (Array.isArray(msg?.publishers) && msg.publishers.length > 0) {
          const fid = pickMentorFeedId(msg.publishers);
          if (fid) subscribeToMentorFeed(boot, fid);

          requestParticipantsOnce(boot.roomId);
          setTimeout(() => requestParticipantsOnce(boot.roomId), 200);
        }

        const leavingId = Number(msg?.leaving ?? msg?.unpublished);
        if (leavingId && msg?.unpublished !== "ok") {
          setParticipants((prev) => prev.filter((p) => Number(p.id) !== leavingId));

          requestParticipantsOnce(boot.roomId);
          setTimeout(() => requestParticipantsOnce(boot.roomId), 300);
          setTimeout(() => requestParticipantsOnce(boot.roomId), 1000);

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
        flushPendingSubscribe(boot);
      },

      onmessage: (msg, jsep) => {
        if (Array.isArray(msg?.publishers) && msg.publishers.length > 0) {
          const fid = pickMentorFeedId(msg.publishers);
          if (fid) subscribeToMentorFeed(boot, fid);
        }

        if (jsep) {
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

      onremotestream: (stream) => {
        console.log("[MENTEE] onremotestream", stream);
        remoteStreamRef.current = stream;
        attachStreamToVideo(stream);

        const hasVideo = stream?.getVideoTracks?.().length > 0;
        setSessionReady(!!hasVideo);
      },

      onremotetrack: (track, mid, on) => {
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

  useEffect(() => {
    if (!sessionReady) return;
    if (remoteStreamRef.current) {
      attachStreamToVideo(remoteStreamRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady]);

  // --------------------------------------------------------
  // ✅ SSE Listener(MENTEE) - roomId 기준으로 구독
  // --------------------------------------------------------
  useEffect(() => {
    if (!chatRoomId) return;

    const url = `/api/seesun/janus/chat/stream?roomId=${chatRoomId}`;
    const evtSource = new EventSource(url, { withCredentials: true });

    const onChat = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("[SSE][MENTEE] RECEIVED:", data);
        setChatMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("[SSE][MENTEE] parse error:", err, e.data);
      }
    };

    evtSource.addEventListener("chat", onChat);

    evtSource.onerror = () => {
      console.warn("[SSE][MENTEE] error -> reconnect handled by browser");
    };

    return () => {
      evtSource.removeEventListener("chat", onChat);
      evtSource.close();
    };
  }, [chatRoomId]);

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
    <SessionGuard>
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
    </SessionGuard>
  );
}

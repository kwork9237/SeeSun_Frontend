import React, { useState, useRef, useEffect } from "react";

const MentorRoom = ({ isMentor }) => {
  // 상태 관리
  const [isStarted, setIsStarted] = useState(false);
  const [myInfo, setMyInfo] = useState({ roomId: null, nickname: "" });
  const [participants, setParticipants] = useState([]);

  // Janus 관련 Ref
  const janus = useRef(null);
  const sfutest = useRef(null);
  const remoteMentorFeed = useRef(null);
  const mentorVideoRef = useRef(null);
  const pollingInterval = useRef(null); // 명단 갱신 인터벌 관리

  // 컴포넌트 언마운트 시 자원 해제
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (janus.current) {
        console.log("Destroying Janus instance...");
        janus.current.destroy();
      }
    };
  }, []);

  // 1. Spring 서버 통신 (Session Manager)
  const getRoomSession = async () => {
    try {
      const endpoint = isMentor ? "/api/createRoom" : "/api/joinRoom";
      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) throw new Error("Spring Server Error");
      return await response.json();
    } catch (error) {
      console.error("Session API Error:", error);
      alert("서버 세션 정보를 가져오는데 실패했습니다.");
      return null;
    }
  };

  // 2. 시작 버튼 클릭 핸들러
  const handleStart = async () => {
    if (!window.Janus) {
      alert("Janus 라이브러리가 아직 로드되지 않았습니다.");
      return;
    }

    const data = await getRoomSession();
    if (data) {
      // 멘티의 경우 닉네임 중복 방지를 위해 랜덤값 추가 (테스트용)
      const finalNickname = isMentor
        ? data.nickname
        : `${data.nickname}_${Math.floor(Math.random() * 1000)}`;
      console.log(finalNickname);
      setMyInfo({ roomId: data.roomId, nickname: finalNickname });
      initJanus(data.roomId, finalNickname);
    }
  };

  // 3. Janus 초기화 및 플러그인 연결
  const initJanus = (roomId, nickname) => {
    const Janus = window.Janus;

    Janus.init({
      debug: "all",
      callback: () => {
        janus.current = new Janus({
          server: "https://janus.jsflux.co.kr/janus",
          success: () => {
            janus.current.attach({
              plugin: "janus.plugin.videoroom",
              success: (pluginHandle) => {
                sfutest.current = pluginHandle;

                const register = {
                  request: "join",
                  room: parseInt(roomId),
                  ptype: "publisher",
                  display: nickname,
                };
                sfutest.current.send({ message: register });
                setIsStarted(true);

                // [수정] 멘토인 경우 인터벌 설정 - isStarted 체크 대신 sfutest 존재 여부만 확인
                if (isMentor) {
                  if (pollingInterval.current) clearInterval(pollingInterval.current);
                  pollingInterval.current = setInterval(() => {
                    // 세션이 유효하고 핸들이 있을 때만 요청
                    if (sfutest.current) {
                      sfutest.current.send({
                        message: {
                          request: "listparticipants",
                          room: parseInt(roomId),
                        },
                        success: (res) => {
                          if (res.participants) {
                            res.participants.forEach((p) => addParticipant(p.id, p.display));
                          }
                        },
                      });
                    }
                  }, 3000);
                }
              },
              error: (error) => console.error("Plugin Error:", error),
              onmessage: (msg, jsep) => handleMessage(msg, jsep, roomId),
              onlocalstream: (stream) => {
                if (isMentor && mentorVideoRef.current) {
                  Janus.attachMediaStream(mentorVideoRef.current, stream);
                }
              },
            });
          },
          error: (error) => {
            console.error("Janus Error:", error);
            alert("Janus 서버 연결 실패");
          },
        });
      },
    });
  };

  // 4. 메시지 처리
  const handleMessage = (msg, jsep, roomId) => {
    console.log("--- Janus Raw Message ---", msg);
    const event = msg["videoroom"];

    // 1. 모든 종류의 사용자 목록 추출 (publishers 또는 participants)
    const list = msg["publishers"] || msg["participants"];

    if (list && Array.isArray(list)) {
      list.forEach((pub) => {
        // 본인(id)이 아닐 때만 목록에 추가 (선택 사항)
        addParticipant(pub.id, pub.display);

        // [멘티 전용] 멘토 발견 시 구독
        if (!isMentor && pub.display === "testAccount") {
          subscribeToMentor(pub.id, roomId);
        }
      });
    }

    // 2. 개별 이벤트 처리
    if (event === "joined") {
      console.log("방 입장 성공!");
      if (isMentor) publishOwnFeed();
    } else if (event === "event") {
      // 누군가 나갔을 때
      if (msg["leaving"] || msg["unpublished"]) {
        const leavingId = msg["leaving"] || msg["unpublished"];
        if (leavingId !== "ok") removeParticipant(leavingId);
      }

      // [중요] 멘토가 이미 입장한 상태에서 멘티가 나중에 들어올 때 (id 하나만 올 경우 대비)
      if (msg["id"] && msg["display"]) {
        addParticipant(msg["id"], msg["display"]);
      }
    }

    if (jsep) sfutest.current.handleRemoteJsep({ jsep });
  };

  // 멘토 스트림 송출
  const publishOwnFeed = () => {
    sfutest.current.createOffer({
      media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
      success: (jsep) => {
        sfutest.current.send({
          message: { request: "configure", audio: true, video: true },
          jsep,
        });
      },
    });
  };

  // 멘티가 멘토 영상을 받는 구독 로직
  const subscribeToMentor = (feedId, roomId) => {
    // 이미 구독 중인지 확인 (중복 구독 방지)
    if (remoteMentorFeed.current) return;

    janus.current.attach({
      plugin: "janus.plugin.videoroom",
      success: (pluginHandle) => {
        remoteMentorFeed.current = pluginHandle;
        remoteMentorFeed.current.send({
          message: { request: "join", room: parseInt(roomId), ptype: "subscriber", feed: feedId },
        });
      },
      onmessage: (msg, jsep) => {
        if (jsep) {
          remoteMentorFeed.current.createAnswer({
            jsep,
            media: { audioSend: false, videoSend: false },
            success: (jsepAnswer) => {
              remoteMentorFeed.current.send({
                message: { request: "start", room: parseInt(roomId) },
                jsep: jsepAnswer,
              });
            },
          });
        }
      },
      onremotestream: (stream) => {
        if (mentorVideoRef.current) {
          window.Janus.attachMediaStream(mentorVideoRef.current, stream);
        }
      },
    });
  };

  // 목록 관리 함수 (함수형 업데이트로 클로저 문제 해결)
  const addParticipant = (id, display) => {
    if (!id || !display) return;

    // [수정] 본인의 닉네임과 일치하는 참여자는 목록(participants)에 넣지 않음
    if (display === myInfo.nickname) return;

    setParticipants((prev) => {
      if (prev.some((p) => p.id === id)) return prev;
      console.log(`[${isMentor ? "멘토" : "멘티"}] 참여자 추가:`, display, id);
      return [...prev, { id, display }];
    });
  };

  const otherParticipants = participants.filter((p) => p.display !== myInfo.nickname);

  const removeParticipant = (id) => {
    setParticipants((prev) => {
      if (!prev.some((p) => p.id === id)) return prev;
      console.log(`[${isMentor ? "멘토" : "멘티"}] 참여자 제거:`, id);
      return prev.filter((p) => p.id !== id);
    });
  };

  const stopSession = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    if (janus.current) janus.current.destroy();
    setIsStarted(false);
    setParticipants([]);
    remoteMentorFeed.current = null;
  };

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
      <h1>멘토링 룸 {myInfo.roomId && `(#${myInfo.roomId})`}</h1>
      <div style={{ marginBottom: "20px" }}>
        {!isStarted ? (
          <button onClick={handleStart} style={btnStyle}>
            {isMentor ? "회의 개설 (Mentor)" : "회의 입장 (Student)"}
          </button>
        ) : (
          <button onClick={stopSession} style={{ ...btnStyle, backgroundColor: "#ff4d4d" }}>
            회의 종료
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: "20px" }}>
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
            }}
          >
            {isMentor ? `나 (멘토: ${myInfo.nickname})` : "멘토 영상 실시간 스트리밍"}
          </div>
        </div>
        <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "10px", padding: "15px" }}>
          {/* 나(1) + 나를 제외한 인원수 */}
          <h3>참여자 목록 ({otherParticipants.length + 1})</h3>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {/* 1. 나 자신은 무조건 표시 */}
            <li
              style={{
                padding: "10px 0",
                borderBottom: "2px solid #4CAF50",
                fontWeight: "bold",
                color: "#4CAF50",
              }}
            >
              👤 {myInfo.nickname} (나)
            </li>

            {/* 2. 나를 제외한 실제 '남'들만 출력 */}
            {otherParticipants.map((p) => (
              <li key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                👤 {p.display} {p.display === "testAccount" ? "(Mentor)" : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MentorRoom;

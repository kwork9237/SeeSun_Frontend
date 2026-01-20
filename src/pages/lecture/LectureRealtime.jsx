// 실시간 강의
import {useEffect, useRef, useMemo, useState} from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs"

const LectureRealtime = () => {

    // 영상 DOM
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // STOMP & WebRTC 객체
    const stompClientRef = useRef(null);
    const pcRef = useRef(null);

    const [ready, setReady] = useState(false);  // STOMP + WebRTC 준비 완료 여부
    const pendingIceRef = useRef([]);   // remoteDescription 오기전 ICE 임시 저장

    // 테스트용 방 ID 및 사용자
    const roomId = "test-room-123"; // 테스트용 임시 roomId

    // role로 caller/callee 결정
    const role = useMemo(() => {
        const p = new URLSearchParams(window.location.search);
        return p.get("role") || "caller";
    }, []);

    const senderId = role === "caller" ? "userA" : "userB";       // 현재 사용자
    const receiverId = role === "caller" ? "userB" : "userA";     // 상대 사용자

    // WebSocket 메시지 보내기
    const sendSignal = (type, payload) => {
        const client = stompClientRef.current;
        if (!client || !client.active) {
            console.warn("STOMP not connected. skip:", type);
            return;
        }

        client.publish({
            destination: "/pub/signal",
            body: JSON.stringify({
                type,
                roomId,
                senderId,
                receiverId,
                payload
            })
        });
    };

    const startWebRTC = async () => {
        // 3) WebRTC PeerConnection 생성
        pcRef.current = new RTCPeerConnection({
           iceServers: [{ urls: "stun:stun.l.google.com:19302"}],
        });

        // ICE candidate 수집
        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal("ice", event.candidate);
            }
        };

        // 원격 스트림 수신
        pcRef.current.ontrack = (event) => {
            console.log("Remote stream received");
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        // 4) 로컬 카메라 열기
        const stream = await navigator.mediaDevices.getUserMedia({
           video: true,
           audio: true,
        });

        // WebRTC에 스트림 추가
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

        setReady(true); // 이제 버튼 눌러도 됨

        // 방 참여 신호 전송
        sendSignal("join", null);
    };

    const flushPendingIce = async () => {
        const pc = pcRef.current;
        if (!pc?.remoteDescription) return;

        const list = pendingIceRef.current;
        pendingIceRef.current = [];

        for (const c of list) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
                console.warn("ICE and error: ", e);
            }
        }
    };

    // 서버에서 받은 WebRTC 신호 처리
    const handleSignal = async (data) => {

        // 내 메시지를 다시 받는 상황 방지
        if (data.senderId === senderId) return;
        if (data.roomId !== roomId) return;

        const pc = pcRef.current;
        if (!pc) return;

        switch (data.type) {

            case "offer": {
                // caller만 offer를 처리(Answer 생성)
                if(role !== "callee") return;

                // 상태 가드: offer는 stable 상태에서만 처리
                if(pc.signalingState !== "stable") {
                    console.warn("Ignore offer, signalingState= ", pc.signalingState);
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                await flushPendingIce();

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                sendSignal("answer", answer);
                break;
            }

            case "answer": {
                // callee만 offer를 처리해서 Answer 생성
                if (role !== "caller") return;

                // caller는 have-local-offer 상태일 때만 answer 수용
                if (pc.signalingState !== "have-local-offer") {
                    console.warn("Ignore answer. signalingState=", pc.signalingState);
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                await flushPendingIce();
                break;
            }

            case "ice": {
                if (!data.payload) return;

                // ✅ remoteDescription 없으면 큐에 저장
                if (!pc.remoteDescription) {
                    pendingIceRef.current.push(data.payload);
                    return;
                }

                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.payload));
                } catch (e) {
                    console.warn("ICE error:", e);
                }
                break;
            }

            default:
                break;
        }
    };

    // 초기 실행
    useEffect(() => {

        // 1) WebSocket 연결
        stompClientRef.current = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            reconnectDelay: 0,        // 테스트 중에는 자동 재연결 끔
            debug: () => {},          // 반드시 함수여야 함
        });

        stompClientRef.current.onConnect = () => {
            console.log("STOMP CONNECTED");

            // 2) 방 구독
            stompClientRef.current.subscribe(`/sub/room/${roomId}`, (msg) => {
                const data = JSON.parse(msg.body);
                handleSignal(data);
            });

            startWebRTC();
        };

        stompClientRef.current.activate();

        return () => {
            stompClientRef.current?.deactivate();
            pcRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);





    // 통화 버튼(offer 생성)
    const startCall = async () => {

        // caller만 offer 생성 가능
        if (role !== "caller") return;
        if (!ready) return;

        const pc = pcRef.current;
        if (!pc) return;

        // 이미 offer 만든 상태면 또 만들지 않음
        if (pc.signalingState !== "stable") {
            console.warn("Cannot create offer. signalingState=", pc.signalingState);
            return;
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal("offer", offer);
    };

    // 화면 UI
    return (
        <div style={{ padding: 20 }}>
            <h1>Lecture Realtime WebRTC Test</h1>
            <p>role: <b>{role}</b> / senderId: <b>{senderId}</b></p>

            <div style={{ display: "flex", gap: 20 }}>
                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 300, background: "#000" }} />
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300, background: "#000" }} />
            </div>

            {role === "caller" && (
                <button onClick={startCall} disabled={!ready} style={{ marginTop: 20, padding: "10px 20px" }}>
                    Start Call
                </button>
            )}
        </div>
    );
}

export default LectureRealtime;
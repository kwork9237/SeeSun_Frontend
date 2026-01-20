import { useEffect, useRef } from "react";

export default function WebRTCLoopbackTest() {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        const pc1 = new RTCPeerConnection();
        const pc2 = new RTCPeerConnection();

        pc1.onicecandidate = (e) => {
            if (e.candidate) pc2.addIceCandidate(e.candidate);
        };

        pc2.onicecandidate = (e) => {
            if (e.candidate) pc1.addIceCandidate(e.candidate);
        };

        pc2.ontrack = (e) => {
            remoteVideoRef.current.srcObject = e.streams[0];
        };

        async function start() {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach((t) => pc1.addTrack(t, stream));

            const offer = await pc1.createOffer();
            await pc1.setLocalDescription(offer);
            await pc2.setRemoteDescription(offer);

            const answer = await pc2.createAnswer();
            await pc2.setLocalDescription(answer);
            await pc1.setRemoteDescription(answer);
        }

        start();
    }, []);

    return (
        <div>
            <h2>WebRTC Loopback Test</h2>
            <video ref={localVideoRef} autoPlay muted width="300" />
            <video ref={remoteVideoRef} autoPlay width="300" />
        </div>
    );
}

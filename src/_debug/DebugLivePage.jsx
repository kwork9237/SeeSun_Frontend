import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function DebugLivePage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);

        // GET /api/room/{id}
        const res = await apiClient.get(`/lectures/sessions/room/${id}`);
        setRoom(res.data);
      } catch (e) {
        console.error(e);
        alert("room 조회 실패. id 검증 실패거나 권한 문제");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleClose = async () => {
    try {
      // close가 id를 path로 받는지 body로 받는지 네 백엔드에 맞춰 택1

      // (A) POST /api/close/{id}
      await apiClient.post(`/lectures/sessions/close/${id}`);

      // (B) POST /api/close body
    //   await apiClient.post("/close", { roomId: id });

      alert("close 성공");
    } catch (e) {
      console.error(e);
      alert("close 실패");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>loading...</div>;

  // role 판단 기준: (1) room 응답에 role이 내려오거나
  // (2) 프론트에서 localStorage/userInfo로 판단하거나
  const role = room?.role; // "MENTOR" / "MENTEE" 같은 값 가정
//   const isMentor = role === "MENTOR";
  const isMentor = true;

  return (
    <div style={{ padding: 24 }}>
      <h2>Debug Page 2</h2>
      <div>path id: {id}</div>

      <pre style={{ background: "#111", color: "#0f0", padding: 12 }}>
        {JSON.stringify(room, null, 2)}
      </pre>

      {isMentor && (
        <button onClick={handleClose}>
          /close 호출
        </button>
      )}
    </div>
  );
}

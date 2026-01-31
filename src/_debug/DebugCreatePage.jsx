import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function DebugCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      // POST /api/create
      const res = await apiClient.post("/lectures/sessions/create", null, { params: { leId: 2 } });

      // 백엔드 응답 키에 맞춰서 하나로 통일 (roomId / id / uuid 등)
      const id = res.data?.roomId ?? res.data?.id ?? res.data?.room_uuid ?? res.data?.uuid;

      if (!id) {
        alert("create 응답에 room id가 없음. 응답 JSON 확인 필요");
        console.log("create response:", res.data);
        return;
      }

      navigate(`/debug/live/${id}`);
    } catch (e) {
      console.error(e);
      alert("create 실패. 콘솔 확인");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <button onClick={handleCreate}>/create 호출 → live 이동</button>
    </div>
  );
}

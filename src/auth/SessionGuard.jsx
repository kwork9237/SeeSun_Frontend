import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function SessionGuard({ mode, children }) {
  const { uuid } = useParams(); // 지금은 lectureId가 uuid 역할
  const navigate = useNavigate();
  const [state, setState] = useState("loading"); // loading|waiting|ready|error

  useEffect(() => {
    let timer;

    const validate = async () => {
      try {
        const res = await apiClient.get(`/lectures/sessions/room/${uuid}`);

        // (선택) 서버가 role 내려주면 여기서 체크
        // if (mode === "mentor" && res.data.role !== "MENTOR") throw new Error("forbidden");

        setState("ready");
      } catch (e) {
        const code = e.response?.status;

        if (code === 401) {
          navigate("/login");
          return;
        }

        // started 전
        if (code === 423) {
          setState("waiting");
          timer = setTimeout(validate, 2000);
          return;
        }

        // 방 없음/권한없음/종료 등
        setState("error");
        navigate("/lecture"); // 또는 "/mypage"
      }
    };

    validate();
    return () => clearTimeout(timer);
  }, [uuid, navigate]);

  if (state === "loading") return <div>입장 확인중...</div>;
  if (state === "waiting") return <div>강의 시작 대기중...</div>;
  if (state === "error") return <div>입장 불가</div>;

  return children;
}

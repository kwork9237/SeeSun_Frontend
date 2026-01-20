// 로그인 페이지

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";


const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("/members/login", {
        username,
        password,
      });

      /**
       * 🔴 여기 중요
       * 백엔드 응답 구조에 맞게 수정
       */
      const accessToken =
        res.data.accessToken ||
        res.headers["authorization"]?.replace("Bearer ", "");

      if (!accessToken) {
        throw new Error("토큰이 존재하지 않음");
      }

      localStorage.setItem("accessToken", accessToken);

      navigate("/mypage");
    } catch (e) {
      setError("로그인 실패 (아이디 또는 비밀번호 확인)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>로그인</h2>

        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}

export default Login;


const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  form: {
    width: "320px",
    padding: "32px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  title: {
    textAlign: "center",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "10px",
  },
};
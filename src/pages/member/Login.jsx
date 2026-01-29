import { useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";


import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";

import { useAuth } from "../../auth/AuthContext"; // ✅ 경로는 프로젝트에 맞게 조정
import apiClient from "../../api/apiClient";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // ✅ 전역 로그인 상태 갱신 함수

  const [username, setUsername] = useState(""); // email
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [username, password, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError("아이디(이메일)와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      // ✅ 기존 API 유지
      const res = await apiClient.post("/members/login", {
        username: u,
        password: p,
      });

      // 토큰 반환 케이스 대응
      const accessToken =
        res.data?.accessToken ||
        res.headers?.["authorization"]?.replace("Bearer ", "");

      if (!accessToken) throw new Error("토큰이 존재하지 않음");

      // ✅ 여기서 localStorage 직접 저장하지 말고 AuthContext에 알림
      // (AuthContext 내부에서 localStorage 저장 + 전역 상태 업데이트)
      login(accessToken);

      // ✅ ProtectedRoute가 넘긴 원래 목적지로 복귀 (없으면 MyPage)
      const to = location.state?.from || "/mypage";
      navigate(to, { replace: true });
    } catch (e2) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50/50 px-4 pt-24 pb-12">
      <Card
        padding="large"
        hover={false}
        className="w-full max-w-md border border-gray-200 shadow-sm"
      >
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-8">
          로그인
        </h1>

        <form onSubmit={handleSubmit}>
          {/* ID(이메일) */}
          <Input
            id="login-username"
            type="text"
            placeholder="ID(이메일)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error="" // 필드 단위 에러 분리 안 할거면 비워둠
            className="py-3 rounded-xl"
          />

          {/* 비밀번호 + 눈아이콘 */}
          <div className="w-full mb-4">
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호(영문·숫자·특수문자 8~20자)"
                className={`
                  w-full px-4 py-3 pr-12 border rounded-xl outline-none transition-colors duration-200 bg-white
                  ${
                    error
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }
                `}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <i className={`fa-regular ${showPw ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 text-sm text-red-500 font-medium">{error}</div>
          )}

          {/* 로딩 */}
          {loading && (
            <Spinner size="small" color="primary" text="로그인 중..." />
          )}

          {/* 버튼 */}
          <Button
            variant="secondary"
            size="large"
            disabled={!canSubmit}
            className="rounded-xl !bg-secondary !text-white hover:!bg-orange-600"
          >
            로그인
          </Button>

          {/* 하단 링크 */}
          <div className="mt-6 flex justify-center gap-3 text-sm text-gray-500">
            <span>아직 회원이 아니신가요?</span>
            <Link to="/Join" className="font-bold text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;

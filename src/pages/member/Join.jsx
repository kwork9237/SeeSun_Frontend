// 회원가입

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

// 정규식
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;
const PHONE_REGEX = /^\d{3}-\d{4}-\d{4}$/;
// 닉네임: 영어/숫자만 + 최대 12자 + (숫자만 금지하려면 영문 1자 이상)
const NICK_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9]{1,12}$/;

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const Join = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    name: "",
    nickname: "",
  });

  // 형식 에러
  const [errors, setErrors] = useState({});

  // 중복확인 결과 메시지(성공/실패 모두 여기로)
  // kind: "success" | "error"
  const [feedback, setFeedback] = useState({
    email: { text: "", kind: "" },
    nickname: { text: "", kind: "" },
    phone: { text: "", kind: "" },
  });

  // 중복확인 완료 상태(가입 버튼에서 강제 체크용)
  const [dup, setDup] = useState({
    email: { checked: false, ok: false, lastValue: "" },
    nickname: { checked: false, ok: false, lastValue: "" },
    phone: { checked: false, ok: false, lastValue: "" }, // 숫자-only 저장
  });

  const resetDupState = (key) => {
    if (key === "email") {
      setDup((p) => ({ ...p, email: { checked: false, ok: false, lastValue: "" } }));
      setFeedback((p) => ({ ...p, email: { text: "", kind: "" } }));
    }
    if (key === "nickname") {
      setDup((p) => ({ ...p, nickname: { checked: false, ok: false, lastValue: "" } }));
      setFeedback((p) => ({ ...p, nickname: { text: "", kind: "" } }));
    }
    if (key === "phone") {
      setDup((p) => ({ ...p, phone: { checked: false, ok: false, lastValue: "" } }));
      setFeedback((p) => ({ ...p, phone: { text: "", kind: "" } }));
    }
  };

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // 🔹 비밀번호 확인 실시간 검증
      if (key === "password" || key === "passwordConfirm") {
        const msg = checkPasswordMatch(next.password, next.passwordConfirm);
        setErrors((e) => ({ ...e, passwordConfirm: msg }));
      }

      return next;
    });

    // 기존 에러 초기화 로직
    if (key !== "passwordConfirm") {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }

    // 중복확인 무효화 로직 그대로 유지
    if (key === "email" || key === "nickname" || key === "phone") {
      resetDupState(key);
    }
  };


  const validate = () => {
    const e = {};

    if (!EMAIL_REGEX.test(form.email))
      e.email = "이메일 형식이 올바르지 않습니다.";
    if (!PW_REGEX.test(form.password))
      e.password = "비밀번호는 12자 이상, 대/소문자+특수문자를 포함해야 합니다.";
    if (form.passwordConfirm !== form.password)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (!PHONE_REGEX.test(form.phone))
      e.phone = "핸드폰 번호 형식은 000-0000-0000 입니다.";
    if (!form.name.trim())
      e.name = "이름을 입력해주세요.";
    if (!NICK_REGEX.test(form.nickname))
      e.nickname = "닉네임은 영어/숫자만, 최대 12자까지 가능합니다.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // exists API (true면 중복)
  const exists = async (field, value) => {
    const res = await axiosInstance.get("/members/exists", { params: { field, value } });
    return res.data;
  };

  const onCheckEmail = async () => {
    const email = form.email.trim();

    if (!EMAIL_REGEX.test(email)) {
      setErrors((p) => ({ ...p, email: "이메일 형식을 확인하세요." }));
      return;
    }

    try {
      const isDup = await exists("username", email);

      setDup((p) => ({
        ...p,
        email: { checked: true, ok: !isDup, lastValue: email },
      }));

      setFeedback((p) => ({
        ...p,
        email: isDup
          ? { text: "이미 사용 중인 이메일입니다.", kind: "error" }
          : { text: "사용 가능한 이메일입니다.", kind: "success" },
      }));
    } catch {
      alert("이메일 중복확인에 실패했습니다.");
    }
  };

  const onCheckNickname = async () => {
    const nickname = form.nickname.trim();

    if (!NICK_REGEX.test(nickname)) {
      setErrors((p) => ({ ...p, nickname: "닉네임 형식을 확인하세요." }));
      return;
    }

    try {
      const isDup = await exists("nickname", nickname);

      setDup((p) => ({
        ...p,
        nickname: { checked: true, ok: !isDup, lastValue: nickname },
      }));

      setFeedback((p) => ({
        ...p,
        nickname: isDup
          ? { text: "이미 사용 중인 닉네임입니다.", kind: "error" }
          : { text: "사용 가능한 닉네임입니다.", kind: "success" },
      }));
    } catch {
      alert("닉네임 중복확인에 실패했습니다.");
    }
  };

  const onCheckPhone = async () => {
    if (!PHONE_REGEX.test(form.phone)) {
      setErrors((p) => ({ ...p, phone: "핸드폰 번호 형식을 확인하세요." }));
      return;
    }

    const phoneDigits = form.phone.replaceAll("-", "");

    try {
      const isDup = await exists("phone", phoneDigits);

      setDup((p) => ({
        ...p,
        phone: { checked: true, ok: !isDup, lastValue: phoneDigits },
      }));

      setFeedback((p) => ({
        ...p,
        phone: isDup
          ? { text: "이미 사용 중인 전화번호입니다.", kind: "error" }
          : { text: "사용 가능한 전화번호입니다.", kind: "success" },
      }));
    } catch {
      alert("전화번호 중복확인에 실패했습니다.");
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const email = form.email.trim();
    const nickname = form.nickname.trim();
    const phoneDigits = form.phone.replaceAll("-", "");

    // 중복확인 강제(버튼 눌렀고, ok이며, 값이 바뀌지 않았을 것)
    if (!(dup.email.checked && dup.email.ok && dup.email.lastValue === email)) {
      alert("이메일 중복확인을 해주세요.");
      return;
    }
    if (!(dup.nickname.checked && dup.nickname.ok && dup.nickname.lastValue === nickname)) {
      alert("닉네임 중복확인을 해주세요.");
      return;
    }
    if (!(dup.phone.checked && dup.phone.ok && dup.phone.lastValue === phoneDigits)) {
      alert("전화번호 중복확인을 해주세요.");
      return;
    }

    const payload = {
      ...form,
      phone: phoneDigits, // 숫자-only로 전송/저장
    };

    try {
      await axiosInstance.post("/members/join", payload);
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message;
      alert(msg ?? "회원가입 실패");
    }
  };

  const checkPasswordMatch = (pwd, confirm) => {
    if (!confirm) return "";          // 아직 입력 중
    if (pwd !== confirm) return "비밀번호가 일치하지 않습니다.";
    return "";                        // 일치
  };


  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>이메일</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="xxxx@xxxx.com"
          />
          <button type="button" onClick={onCheckEmail}>
            중복확인
          </button>
        </div>
        {errors.email && <p>{errors.email}</p>}
        {feedback.email.text && <p className={feedback.email.kind}>{feedback.email.text}</p>}
      </div>

      <div>
        <label>비밀번호</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="12자 이상 / 대소문자+특수문자"
        />
        {errors.password && <p>{errors.password}</p>}
      </div>

      <div>
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={form.passwordConfirm}
          onChange={(e) => setField("passwordConfirm", e.target.value)}
        />
        {errors.passwordConfirm && <p>{errors.passwordConfirm}</p>}
      </div>

      <div>
        <label>핸드폰</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", formatPhone(e.target.value))}
            inputMode="numeric"
            placeholder="000-0000-0000"
          />
          <button type="button" onClick={onCheckPhone}>
            중복확인
          </button>
        </div>
        {errors.phone && <p>{errors.phone}</p>}
        {feedback.phone.text && <p className={feedback.phone.kind}>{feedback.phone.text}</p>}
      </div>

      <div>
        <label>실명</label>
        <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="이름" />
        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <label>닉네임</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={form.nickname}
            onChange={(e) => setField("nickname", e.target.value)}
            placeholder="영어/숫자, 최대 12자"
          />
          <button type="button" onClick={onCheckNickname}>
            중복확인
          </button>
        </div>
        {errors.nickname && <p>{errors.nickname}</p>}
        {feedback.nickname.text && <p className={feedback.nickname.kind}>{feedback.nickname.text}</p>}
      </div>

      <button type="submit">회원가입</button>
    </form>
  );
};

export default Join;

// 회원가입

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

// 제약 정규표현식
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;
const PHONE_REGEX = /^\d{3}-\d{4}-\d{4}$/;
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

  const [errors, setErrors] = useState({});

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // 입력 중엔 에러를 즉시 지우거나(UX) / 즉시 검증해도 됨
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};

    if (!EMAIL_REGEX.test(form.email)) e.email = "이메일 형식이 올바르지 않습니다.";
    if (!PW_REGEX.test(form.password))
      e.password = "비밀번호는 12자 이상, 대/소문자+특수문자를 포함해야 합니다.";
    if (form.passwordConfirm !== form.password)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";

    if (!PHONE_REGEX.test(form.phone))
      e.phone = "핸드폰 번호 형식은 000-0000-0000 입니다.";

    // 실명 제한 없다고 했으니, 빈 값 허용할지 말지만 선택
    // if (!form.name.trim()) e.name = "이름을 입력해주세요.";

    if (!NICK_REGEX.test(form.nickname))
      e.nickname = "닉네임은 영어/숫자만, 최대 12자까지 가능합니다.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      phone: form.phone.replaceAll("-", ""), // DB 숫자 저장 기준
    };

    try {
      const res = await axiosInstance.post("/members/join", payload);

      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message ?? "회원가입 실패");
      } else {
        alert("서버 연결에 실패했습니다.");
      }
    }
  };


  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>이메일</label>
        <input
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="xxxx@xxxx.com"
        />
        {errors.email && <p>{errors.email}</p>}
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
        <input
          value={form.phone}
          onChange={(e) => setField("phone", formatPhone(e.target.value))}
          inputMode="numeric"
          placeholder="000-0000-0000"
        />
        {errors.phone && <p>{errors.phone}</p>}
      </div>

      <div>
        <label>실명</label>
        <input
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="이름"
        />
        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <label>닉네임</label>
        <input
          value={form.nickname}
          onChange={(e) => setField("nickname", e.target.value)}
          placeholder="영어/숫자, 최대 12자"
        />
        {errors.nickname && <p>{errors.nickname}</p>}
      </div>

      <button type="submit">회원가입</button>
    </form>
  );
}

export default Join;
import { useEffect, useState } from "react";
import { isValidEmail } from "../validators/joinValidators";
import { checkEmailDuplicate, sendEmailCode, verifyEmailCode } from "../api/joinApi";

export const useEmailVerify = () => {
  const [email, setEmail] = useState("");
  const [dupChecked, setDupChecked] = useState(false);
  const [dupOk, setDupOk] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const [remainSec, setRemainSec] = useState(0);
  const [error, setError] = useState({
    email: "",
    code: "",
  });

  // 타이머
  useEffect(() => {
    if (remainSec <= 0) return;
    const t = setInterval(() => setRemainSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [remainSec]);

  const reset = () => {
    setDupChecked(false);
    setDupOk(false);
    setIsSending(false);
    setCodeSent(false);
    setCode("");
    setIsVerifying(false);
    setVerified(false);
    setRemainSec(0);
    setError({ email: "", code: "" });
  };

  const onChangeEmail = (v) => {
    setEmail(v);
    // 이메일 바뀌면 인증 흐름 초기화
    setDupChecked(false);
    setDupOk(false);
    setCodeSent(false);
    setVerified(false);
    setCode("");
    setRemainSec(0);

    if (!v) return setError((p) => ({ ...p, email: "" }));
    if (!isValidEmail(v)) setError((p) => ({ ...p, email: "이메일 형식이 올바르지 않습니다." }));
    else setError((p) => ({ ...p, email: "" }));
  };

  const checkDup = async () => {
    if (!isValidEmail(email)) {
      setError((p) => ({ ...p, email: "이메일 형식이 올바르지 않습니다." }));
      return false;
    }
    try {
      const res = await checkEmailDuplicate(email);

      setDupChecked(true);

      if (res) {
        setDupOk(false);
        setError((p) => ({ ...p, email: "이미 사용 중인 이메일입니다." }));
        return false;
      }
      setDupOk(true);
      setError((p) => ({ ...p, email: "" }));
      return true;
    } catch (e) {
      setDupOk(false);
      setDupChecked(false);
      setError((p) => ({ ...p, email: "중복 확인 중 오류가 발생했습니다." }));
      return false;
    }
  };

  const sendCode = async () => {
    if (!dupOk) {
      setError((p) => ({ ...p, email: "이메일 중복검사를 먼저 완료하세요." }));
      return false;
    }
    // 260121 DEV TEST
    setCodeSent(true);
    setRemainSec(5 * 60);
    setError((p) => ({ ...p, email: "" }));
    return true;
    // 260121 DEV TEST

    try {
      setIsSending(true);
      await sendEmailCode(email);
      setIsSending(false);

      setCodeSent(true);
      setRemainSec(5 * 60);
      return true;
    } catch (e) {
      setIsSending(false);
      setError((p) => ({ ...p, email: "인증번호 발송에 실패했습니다." }));
      return false;
    }
  };

  const verify = async () => {
    if (!codeSent) return false;
    if (!code.trim()) {
      setError((p) => ({ ...p, code: "인증번호를 입력하세요." }));
      return false;
    }
    if (remainSec <= 0) {
      setError((p) => ({ ...p, code: "인증 시간이 만료되었습니다. 다시 발송하세요." }));
      return false;
    }
    try {
      setIsVerifying(true);
      const res = await verifyEmailCode(email, code.trim());
      const ok = res?.data?.verified ?? true; // 백엔드 맞추면 여기 수정
      setIsVerifying(false);

      if (!ok) {
        setVerified(false);
        setError((p) => ({ ...p, code: "인증번호가 올바르지 않습니다." }));
        return false;
      }
      setVerified(true);
      setError((p) => ({ ...p, code: "" }));
      return true;
    } catch (e) {
      setIsVerifying(false);
      setVerified(false);
      setError((p) => ({ ...p, code: "인증 확인에 실패했습니다." }));
      return false;
    }
  };

  return {
    email,
    onChangeEmail,
    dupChecked,
    dupOk,
    checkDup,
    isSending,
    codeSent,
    remainSec,
    code,
    setCode,
    isVerifying,
    verified,
    sendCode,
    verify,
    error,
    reset,
  };
};

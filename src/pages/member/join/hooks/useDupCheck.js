// src/pages/member/join/hooks/useDupCheck.js
import { useState } from "react";

/**
 * 공용 중복확인 훅
 * - validate(value) => "" | "에러메시지"
 * - checkApi(value) => boolean (true = 중복)
 */
export const useDupCheck = ({ fieldKey, label, validate, checkApi, setErrors }) => {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setChecked(false);
    setOk(false);
  };

  const check = async (rawValue) => {
    const value = (rawValue ?? "").trim();

    // 1) 프론트 형식 검증
    const msg = validate?.(value) || "";
    if (msg) {
      setErrors?.((p) => ({ ...p, [fieldKey]: msg }));
      reset();
      return false;
    }

    // 2) 중복 검사 API
    try {
      setLoading(true);

      const isDup = await checkApi(value); // true = 중복

      setChecked(true);
      setOk(!isDup);

      if (isDup) {
        setErrors?.((p) => ({ ...p, [fieldKey]: `이미 사용 중인 ${label}입니다.` }));
        return false;
      }

      // 성공이면 errors[fieldKey] 제거
      setErrors?.((p) => {
        const next = { ...p };
        delete next[fieldKey];
        return next;
      });

      return true;
    } catch (e) {
      reset();
      setErrors?.((p) => ({
        ...p,
        [fieldKey]: `${label} 중복확인에 실패했습니다. 잠시 후 다시 시도하세요.`,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { checked, ok, loading, check, reset };
};

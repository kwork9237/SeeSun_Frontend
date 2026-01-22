// src/pages/member/join/hooks/useJoinStepValidate.js
import {
  validatePassword,
  validatePasswordConfirm,
  validateName,
  validateNickname,
  validatePhone,
  validateMentorIntro,
  validateMentorCategory,
  validateMentorFile,
} from "../validators/joinValidators";

export const useJoinStepValidate = ({
  role,
  terms,
  emailV,
  form,
  nickDup,
  phoneDup,
  isMentor,
  mentorForm,
  setErrors,
}) => {
  const step0 = () => {
    if (!role) {
      setErrors({ role: "회원 유형을 선택하세요." });
      return false;
    }
    setErrors({});
    return true;
  };

  const step1 = () => {
    if (!terms.t1 || !terms.t2) {
      setErrors({ terms: "필수 약관(이용약관/개인정보)에 동의해야 합니다." });
      return false;
    }
    setErrors({});
    return true;
  };

  const step2 = () => {
    if (!emailV.email) {
      setErrors({ email: "이메일을 입력하세요." });
      return false;
    }
    if (!emailV.dupOk) {
      setErrors({ email: "이메일 중복확인을 완료하세요." });
      return false;
    }
    if (!emailV.verified) {
      setErrors({ email: "이메일 인증을 완료하세요." });
      return false;
    }
    setErrors({});
    return true;
  };

  const step3 = () => {
    const e = {};

    const pwMsg = validatePassword(form.password);
    if (pwMsg) e.password = pwMsg;

    const pw2Msg = validatePasswordConfirm(form.password, form.password2);
    if (pw2Msg) e.password2 = pw2Msg;

    const nameMsg = validateName(form.name);
    if (nameMsg) e.name = nameMsg;

    const nickMsg = validateNickname(form.nickname);
    if (nickMsg) e.nickname = nickMsg;

    const phoneMsg = validatePhone(form.phone);
    if (phoneMsg) e.phone = phoneMsg;

    // ✅ 중복확인 강제 (형식 검증 통과한 경우에만)
    if (!nickMsg) {
      if (!nickDup.checked) e.nickname = "닉네임 중복확인을 해주세요.";
      else if (!nickDup.ok) e.nickname = "이미 사용 중인 닉네임입니다.";
    }

    if (!phoneMsg) {
      if (!phoneDup.checked) e.phone = "전화번호 중복확인을 해주세요.";
      else if (!phoneDup.ok) e.phone = "이미 사용 중인 전화번호입니다.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const step4 = () => {
    const e = {};

    const introMsg = validateMentorIntro(mentorForm.intro);
    if (introMsg) e.intro = introMsg;

    const catMsg = validateMentorCategory(mentorForm.category);
    if (catMsg) e.category = catMsg;

    const fileMsg = validateMentorFile(mentorForm.portfolioFile);
    if (fileMsg) e.portfolioFile = fileMsg;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate = (step) => {
    if (step === 0) return step0();
    if (step === 1) return step1();
    if (step === 2) return step2();
    if (step === 3) return step3();
    if (step === 4) return step4();
    return true;
  };

  const isLastStep = (step) => (!isMentor && step === 3) || (isMentor && step === 4);

  return { validate, isLastStep };
};

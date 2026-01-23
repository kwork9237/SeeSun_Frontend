// src/pages/member/join/JoinMain.jsx
import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Modal from "../../../components/common/Modal";

import StepRole from "./step/StepRole";
import StepTerms from "./step/StepTerms";
import StepEmailVerify from "./step/StepEmailVerify";
import StepDetail from "./step/StepDetail";
import StepMentorExtra from "./step/StepMentorExtra";

import {
  normalizePhoneDigits,
  validateNickname,
  validatePhone,
} from "./validators/joinValidators";

import { useEmailVerify } from "./hooks/useEmailVerify";
import { useDupCheck } from "./hooks/useDupCheck";
import { useJoinStepValidate } from "./hooks/useJoinStepValidate";
import { useJoinSubmit } from "./hooks/useJoinSubmit";

import { checkNicknameDuplicate, checkPhoneDuplicate } from "./api/joinApi";
import { formatPhoneHyphen } from "./utils/phoneFormatter";

const fmtRemain = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const JoinMain = () => {
  const navigate = useNavigate();
  const phoneInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [role, setRole] = useState(""); // "MENTEE" | "MENTOR"

  const [terms, setTerms] = useState({
    all: false,
    t1: false,
    t2: false,
    t3: false,
    sms: false,
    email: false,
  });

  const emailV = useEmailVerify();

  const [data, setForm] = useState({
    password: "",
    password2: "",
    name: "",
    nickname: "",
    phone: "",
  });
  const form = data;

  const [mentorForm, setMentorForm] = useState({
    intro: "",
    category: "",
    portfolioFile: null,
    portfolioUrl: "",
  });

  // Step 컴포넌트가 보여줄 에러들(이메일 인증 hook 에러는 hook이 따로 갖고 있음)
  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const isMentor = role === "MENTOR";

  // ✅ 공용 중복확인 훅 (닉네임/폰)
  const nickDup = useDupCheck({
    fieldKey: "nickname",
    label: "닉네임",
    validate: validateNickname,
    checkApi: checkNicknameDuplicate, // true=중복
    setErrors,
  });

  const phoneDup = useDupCheck({
    fieldKey: "phone",
    label: "전화번호",
    validate: validatePhone,
    checkApi: checkPhoneDuplicate, // true=중복
    setErrors,
  });

  const progress = useMemo(() => {
    const total = isMentor ? 5 : 4;
    return { current: step + 1, total };
  }, [step, isMentor]);

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  // ----- Terms handlers
  const onAllTerms = (checked) => {
    setTerms((p) => ({
      ...p,
      all: checked,
      t1: checked,
      t2: checked,
      t3: checked,
      sms: checked,
      email: checked,
    }));
  };

  const onItemTerm = (key, checked) => {
    setTerms((p) => {
      const next = { ...p, [key]: checked };
      const allChecked = next.t1 && next.t2 && next.t3 && next.sms && next.email;
      return { ...next, all: allChecked };
    });
  };

  // ----- Detail handlers
  const onPhoneChange = (value) => {
    const digits = normalizePhoneDigits(value);
    setForm((p) => ({ ...p, phone: digits }));

    // 값 바뀌면 중복확인 무효화
    phoneDup.reset();

    const msg = validatePhone(digits);
    setErrors((p) => ({ ...p, phone: msg }));
  };

  // 닉네임 변경: 값이 바뀌면 중복확인 상태 무효화
  const onNicknameChange = (value) => {
    setForm((p) => ({ ...p, nickname: value }));
    nickDup.reset();
  };

  // ----- step validate (외부 훅)
  const { validate, isLastStep } = useJoinStepValidate({
    role,
    terms,
    emailV,
    form,
    nickDup,
    phoneDup,
    isMentor,
    mentorForm,
    setErrors,
  });

  const goNext = async () => {
    if (!validate(step)) return;

    if (isLastStep(step)) return setSuccessModalOpen(true);

    setStep((s) => s + 1);
  };

  // ----- submit (외부 훅)
  const { submitJoin } = useJoinSubmit({
    navigate,
    role,
    emailV,
    form,
    terms,
    isMentor,
    mentorForm,
  });

  const onConfirmSubmit = async () => {
    try {
      await submitJoin();
      setSuccessModalOpen(false);
    } catch (e) {
      setSuccessModalOpen(false);
      alert("회원가입에 실패했습니다. 잠시 후 다시 시도하세요.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50">
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                회원가입
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="warning">
                  {progress.current}/{progress.total}
                </Badge>
                {role && (
                  <Badge variant={isMentor ? "danger" : "success"}>
                    {isMentor ? "MENTOR" : "MENTEE"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-orange-500 transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>

          <Card padding="large" className="border-gray-100">
            {step === 0 && (
              <StepRole role={role} onSelectRole={setRole} error={errors.role} />
            )}

            {step === 1 && (
              <StepTerms terms={terms} onAll={onAllTerms} onItem={onItemTerm} error={errors.terms} />
            )}

            {step === 2 && (
              <StepEmailVerify
                email={emailV.email}
                onEmailChange={emailV.onChangeEmail}
                emailError={emailV.error.email || errors.email}
                dupChecked={emailV.dupChecked}
                dupOk={emailV.dupOk}
                onCheckDup={emailV.checkDup}
                isSendingCode={emailV.isSending}
                codeSent={emailV.codeSent}
                remainSec={emailV.remainSec}
                fmtRemain={fmtRemain}
                onSendCode={emailV.sendCode}
                verifyCode={emailV.code}
                onVerifyCodeChange={emailV.setCode}
                verifyError={emailV.error.code}
                isVerifying={emailV.isVerifying}
                onConfirmCode={emailV.verify}
                emailVerified={emailV.verified}
                globalError={""}
              />
            )}

            {step === 3 && (
              <StepDetail
                email={emailV.email}
                form={form}
                setForm={setForm}
                onPhoneChange={onPhoneChange}
                phoneDisplay={formatPhoneHyphen(form.phone)}
                phoneInputRef={phoneInputRef}
                errors={errors}
                setErrors={setErrors}
                // 닉네임 dup
                onNicknameChange={onNicknameChange}
                nickDupChecked={nickDup.checked}
                nickDupOk={nickDup.ok}
                nickDupLoading={nickDup.loading}
                onCheckNicknameDup={() => nickDup.check(form.nickname)}
                // phone dup
                phoneDupChecked={phoneDup.checked}
                phoneDupOk={phoneDup.ok}
                phoneDupLoading={phoneDup.loading}
                onCheckPhoneDup={() => phoneDup.check(form.phone)}
              />
            )}

            {step === 4 && (
              <StepMentorExtra mentorForm={mentorForm} setMentorForm={setMentorForm} errors={errors} />
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="outline" size="medium" onClick={step === 0 ? () => navigate(-1) : goPrev}>
                {step === 0 ? "뒤로가기" : "이전"}
              </Button>

              <Button
                variant="primary"
                size="medium"
                onClick={goNext}
                className="min-w-[160px] bg-orange-500 hover:bg-orange-600"
              >
                {!isMentor && step === 3 ? "가입" : isMentor && step === 4 ? "가입" : "다음"}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              이미 계정이 있나요?{" "}
              <Link to="/Login" className="text-orange-600 font-bold hover:underline">
                로그인
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={successModalOpen}
        title="가입 완료"
        onClose={() => setSuccessModalOpen(false)}
        onConfirm={onConfirmSubmit}
        confirmText="로그인하러 가기"
        cancelText="취소"
      >
        회원가입이 완료되었습니다.{"\n"}로그인 후 서비스를 이용해주세요.
      </Modal>
    </div>
  );
};

export default JoinMain;

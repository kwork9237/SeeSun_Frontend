// 예시: 너가 axiosInstance를 어디에 두었는지에 맞춰 경로 조절
import axiosInstance from "../../../../api/axiosInstance";

// 전체 중복 검사
const checkDuplicate = async (field, value) => {
  const res = await axiosInstance.get("/members/exists", {
    params: { field, value },
  });

  return Boolean(res?.data);
};

// 이메일 중복 검사
export const checkEmailDuplicate = (email) =>
  checkDuplicate("email", email);

// 닉네임 중복 검사
export const checkNicknameDuplicate = (nickname) =>
  checkDuplicate("nickname", nickname);

// 핸드폰 중복 검사
export const checkPhoneDuplicate = (phone) =>
  checkDuplicate("phone", phone);

// 인증번호 발송
export const sendEmailCode = async (email) => {
  return axiosInstance.post("/members/email/send-code", { email });
};

// 인증번호 검증
export const verifyEmailCode = async (email, code) => {
  return axiosInstance.post("/members/email/verify-code", { email, code });
};

// 회원가입 (멘티)
export const joinMember = async (payload) => {
  return axiosInstance.post("/members/join", payload);
};

// 멘토 회원가입 (파일 포함)
// 백엔드가 multipart 받는다면 이렇게
export const joinMentorMultipart = async (payload, portfolioFile) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));

  if (portfolioFile) {
    formData.append("file", portfolioFile);
  }

  return axiosInstance.post("/members/join-mentor", formData);
};
export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const normalizePhoneDigits = (v) => (v || "").replace(/\D/g, "").slice(0, 11);

// 비밀번호 검증
export const validatePassword = (pw) => {
  if (!pw) return "비밀번호를 입력하세요.";
  if (pw.length < 8 || pw.length > 20) return "비밀번호는 8~20자여야 합니다.";
  return "";
};

// 비밀번호 재확인
export const validatePasswordConfirm = (pw, pw2) => {
  if (!pw2) return "비밀번호 확인을 입력하세요.";
  if (pw !== pw2) return "비밀번호가 일치하지 않습니다.";
  return "";
};

// 이름 검증
export const validateName = (name) => {
  if (!name?.trim()) return "이름을 입력하세요.";
  if (name.trim().length < 2) return "이름을 2자 이상 입력하세요.";
  return "";
};

// 닉네임 검증
export const validateNickname = (nickname) => {
  const v = (nickname || "").trim();
  if (!v) return "닉네임을 입력하세요.";
  if (v.length > 12) return "닉네임은 최대 12자까지 가능합니다.";
  if (!/^[A-Za-z0-9]+$/.test(v)) return "닉네임은 영문/숫자만 사용할 수 있습니다.";
  if (!/[A-Za-z]/.test(v)) return "닉네임에는 영문이 최소 1자 포함되어야 합니다.";
  return "";
};

// 핸드폰 검증
export const validatePhone = (phone) => {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return "전화번호를 입력하세요.";
  if (digits.length !== 11) return "전화번호 11자리를 입력하세요.";
  return "";
};

// 소개 검증
export const validateMentorIntro = (intro) => {
  if (!intro?.trim()) return "소개를 입력하세요.";
  if (intro.trim().length < 10) return "소개를 10자 이상 입력하세요.";
  return "";
};

// 전문 분야 선택
export const validateMentorCategory = (category) => {
  if (!category?.trim()) return "전문 분야를 선택하세요.";
  return "";
};

export const validateMentorFile = (file) => {
  if (!file) return "포트폴리오 파일을 첨부하세요.";
  return "";
};

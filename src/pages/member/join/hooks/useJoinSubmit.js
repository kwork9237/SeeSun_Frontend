// src/pages/member/join/hooks/useJoinSubmit.js
import { joinMember, joinMentorMultipart } from "../api/joinApi";

export const useJoinSubmit = ({ navigate, role, emailV, form, terms, isMentor, mentorForm }) => {
  const submitJoin = async () => {
    const joinData = {
      email: emailV.email,
      password: form.password,
      name: form.name,
      nickname: form.nickname,
      phone: form.phone,
      // terms: {
      //   t1: terms.t1,
      //   t2: terms.t2,
      //   t3: terms.t3,
      //   sms: terms.sms,
      //   email: terms.email,
      // },
    };

    if (isMentor) {
      const intro = mentorForm?.intro ?? "";
      const file = mentorForm?.portfolioFile ?? null;

      // required=true니까 file 없으면 프론트에서 막는 게 좋음
      if (!file) {
        // 너희 UI 방식대로 toast/alert 처리
        alert("포트폴리오 파일은 필수입니다.");
        return;
      }

      await joinMentorMultipart(joinData, intro, file);
    } else {
      await joinMember(joinData);
    }

    navigate("/Login");
  };

  return { submitJoin };
};

// src/pages/member/join/hooks/useJoinSubmit.js
import { joinMember } from "../api/joinApi";

export const useJoinSubmit = ({ navigate, role, emailV, form, terms, isMentor, mentorForm }) => {
  const submitJoin = async () => {
    const payload = {
      role, // "MENTEE" | "MENTOR"
      email: emailV.email,
      password: form.password,
      name: form.name,
      nickname: form.nickname,
      phone: form.phone,
      terms: {
        t1: terms.t1,
        t2: terms.t2,
        t3: terms.t3,
        sms: terms.sms,
        email: terms.email,
      },
      mentorRequest: isMentor
        ? {
            intro: mentorForm.intro,
            category: mentorForm.category,
            portfolioUrl: mentorForm.portfolioUrl,
          }
        : null,
    };

    await joinMember(payload);
    navigate("/Login");
  };

  return { submitJoin };
};

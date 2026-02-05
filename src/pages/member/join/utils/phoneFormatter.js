import { normalizePhoneDigits } from "../validators/joinValidators";

export const formatPhoneHyphen = (value) => {
  const d = normalizePhoneDigits(value);

  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

import Input from "../../../../components/common/Input";
import Badge from "../../../../components/common/Badge";
import Button from "../../../../components/common/Button";
import {
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
} from "../validators/joinValidators";

const StepDetail = ({
  email,
  form,
  setForm,
  onPhoneChange,
  phoneDisplay,
  phoneInputRef,
  errors,
  setErrors,

  // ✅ 닉네임 중복확인 관련 props (JoinMain에서 관리)
  onNicknameChange,
  nickDupChecked,
  nickDupOk,
  nickDupLoading,
  onCheckNicknameDup,
  phoneDupChecked,
  phoneDupOk,
  phoneDupLoading,
  onCheckPhoneDup,
}) => {
  const handlePwChange = (key, value) => {
    setForm((p) => {
      const next = { ...p, [key]: value };

      // 여기서 next로 검증하면 항상 최신
      if (key === "password") {
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(next.password),
          password2: validatePasswordConfirm(next.password, next.password2),
        }));
      } else if (key === "password2") {
        setErrors((prev) => ({
          ...prev,
          password2: validatePasswordConfirm(next.password, next.password2),
        }));
      }

      return next;
    });
  };

  const handleNicknameChangeLocal = (value) => {
    // ✅ 상위로 올려서 중복확인 상태 무효화까지 함께 처리
    onNicknameChange(value);

    // 실시간 형식 검증만 StepDetail에서 유지
    const msg = validateNickname(value);
    setErrors((prev) => ({ ...prev, nickname: msg }));
  };

  const canClickNickDup =
    !nickDupLoading && 
    !validateNickname(form.nickname || "") && 
    (form.nickname || "").trim().length > 0 &&
    !nickDupChecked;

  const canClickPhoneDup =
    !phoneDupLoading &&
    !errors.phone &&
    (form.phone || "").length > 0 &&
    !phoneDupChecked;

  return (
    <div>
      <h2 className="text-lg font-extrabold text-orange-600 mb-4">상세정보 입력</h2>

      {/* 이메일은 인증된 값 고정 */}
      <div className="mb-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-600 font-medium">ID(이메일)</p>
        <div className="flex items-center justify-between mt-1">
          <p className="font-extrabold text-gray-900">{email}</p>
          <Badge variant="success">인증완료</Badge>
        </div>
      </div>

      <Input
        label="비밀번호"
        id="password"
        type="password"
        placeholder="비밀번호(8~20자, 영문/숫자 조합 권장)"
        value={form.password}
        onChange={(e) => handlePwChange("password", e.target.value)}
        error={errors.password}
      />

      <Input
        label="비밀번호 확인"
        id="password2"
        type="password"
        placeholder="비밀번호 확인"
        value={form.password2}
        onChange={(e) => handlePwChange("password2", e.target.value)}
        error={errors.password2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="이름"
          id="name"
          placeholder="이름"
          value={form.name}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
          }}
          error={errors.name}
        />

        {/* ✅ 닉네임 + 중복확인 버튼 */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <Input
              label="닉네임"
              id="nickname"
              placeholder="닉네임"
              value={form.nickname}
              onChange={(e) => handleNicknameChangeLocal(e.target.value)}
              error={errors.nickname}
            />

            {/* ✅ 상태 메시지 라인: 높이 고정해서 아래 요소 단차 방지 */}
            <div className="min-h-[20px] -mt-2 mb-2 flex items-center gap-2">
              {nickDupChecked && nickDupOk && <Badge variant="success">사용 가능</Badge>}
              {nickDupChecked && !nickDupOk && <Badge variant="danger">중복</Badge>}
              {!nickDupChecked && !errors.nickname && (
                <span className="text-xs text-gray-400">중복확인을 완료해야 가입할 수 있습니다.</span>
              )}
            </div>
          </div>

          <div className="pt-7">
            <Button
              variant="outline"
              size="small"
              onClick={onCheckNicknameDup}
              disabled={!canClickNickDup}
              className="whitespace-nowrap"
            >
              {nickDupLoading ? "확인중..." : nickDupChecked ? "확인완료" : "중복확인"}
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ 전화번호 + 중복확인 버튼 */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Input
            label="전화번호"
            id="phone"
            placeholder="010-1234-5678"
            value={phoneDisplay}
            onChange={(e) => onPhoneChange(e.target.value)}
            error={errors.phone}
            ref={phoneInputRef}
          />

          <div className="min-h-[20px] -mt-2 mb-2 flex items-center gap-2">
            {phoneDupChecked && phoneDupOk && <Badge variant="success">사용 가능</Badge>}
            {phoneDupChecked && !phoneDupOk && <Badge variant="danger">중복</Badge>}
            {!phoneDupChecked && !errors.phone && (
              <span className="text-xs text-gray-400">중복확인을 완료해야 가입할 수 있습니다.</span>
            )}
          </div>
        </div>

        <div className="pt-7">
          <Button
            variant="outline"
            size="small"
            onClick={onCheckPhoneDup}
            disabled={!canClickPhoneDup}
            className="whitespace-nowrap"
          >
            {phoneDupLoading ? "확인중..." : phoneDupChecked ? "확인완료" : "중복확인"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepDetail;

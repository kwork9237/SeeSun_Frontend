import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import Badge from "../../../../components/common/Badge";
import Spinner from "../../../../components/common/Spinner";

const StepEmailVerify = ({
  email,
  onEmailChange,
  emailError,
  dupChecked,
  dupOk,
  onCheckDup,
  isSendingCode,
  codeSent,
  remainSec,
  fmtRemain,
  onSendCode,
  verifyCode,
  onVerifyCodeChange,
  verifyError,
  isVerifying,
  onConfirmCode,
  emailVerified,
  globalError,
}) => {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-orange-600 mb-4">이메일 인증</h2>

      {/* 이메일 입력 + 중복확인 */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Input
            label="이메일"
            id="email"
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            error={emailError}
          />

          {dupChecked && dupOk && (
            <p className="text-xs text-green-600 font-bold -mt-2 mb-3">
              인증 가능한 이메일입니다.
            </p>
          )}
        </div>

        <div className="pt-7">
          <Button
            variant="outline"
            size="small"
            onClick={onCheckDup}
            disabled={!email || !!emailError}
            className="whitespace-nowrap"
          >
            중복확인
          </Button>
        </div>
      </div>

      {/* 인증번호 발송 */}
      <div className="flex items-center gap-3 -mt-1">
        <Button
          variant="primary"
          size="small"
          onClick={onSendCode}
          disabled={!dupOk || isSendingCode}
          className="bg-orange-500 hover:bg-orange-600"
        >
          인증번호 받기
        </Button>

        {isSendingCode && (
          <div className="flex-1">
            <Spinner size="small" text="메일 발송 중..." />
          </div>
        )}

        {codeSent && !emailVerified && (
          <div className="text-sm text-gray-500 font-bold">
            남은 시간 <span className="text-red-500">{fmtRemain(remainSec)}</span>
          </div>
        )}

        {emailVerified && (
          <Badge variant="success">인증완료</Badge>
        )}
      </div>

      {/* 인증번호 입력 */}
      <div className="mt-4 flex items-start gap-3">
        <div className="flex-1">
          <Input
            label="인증번호"
            id="verifyCode"
            placeholder="6자리 숫자"
            value={verifyCode}
            onChange={(e) => onVerifyCodeChange(e.target.value)}
            error={verifyError}
            disabled={!codeSent || emailVerified}
          />
          {!emailVerified && codeSent && (
            <p className="text-xs text-gray-400 font-medium -mt-2">
              데모: <span className="font-bold">123456</span> 입력 시 인증 성공
            </p>
          )}
        </div>
        <div className="pt-7">
          <Button
            variant="outline"
            size="small"
            onClick={onConfirmCode}
            disabled={!codeSent || emailVerified || isVerifying}
            className="whitespace-nowrap"
          >
            {isVerifying ? "확인 중..." : "확인"}
          </Button>
        </div>
      </div>

      {globalError && <p className="mt-2 text-xs text-red-500 font-medium">{globalError}</p>}
    </div>
  );
};

export default StepEmailVerify;
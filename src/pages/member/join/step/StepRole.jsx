import Badge from "../../../../components/common/Badge";

const StepRole = ({ role, onSelectRole, error }) => {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-orange-600 mb-4">회원 유형 선택</h2>

      <div className="space-y-3">
        <RoleButton
          active={role === "MENTEE"}
          icon="fa-user"
          title="멘티"
          desc="강의를 수강하고 멘토와 1:1 화상 수업을 진행합니다."
          onClick={() => onSelectRole("MENTEE")}
        />
        <RoleButton
          active={role === "MENTOR"}
          icon="fa-user-tie"
          title="멘토"
          desc="강의를 개설하고 수강생과 1:1 화상 수업을 진행합니다."
          onClick={() => onSelectRole("MENTOR")}
        />
      </div>

      {error && <p className="mt-3 text-xs text-red-500 font-medium">{error}</p>}

      <div className="mt-6 text-xs text-gray-400">
        * 멘토는 가입 과정에서 추가 정보 및 파일 첨부가 필요합니다.
      </div>
    </div>
  );
};

export default StepRole;


// Sub Component

const RoleButton = ({ active, icon, title, desc, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-4 rounded-2xl border transition
        ${active ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:bg-gray-50"}
      `}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}
      `}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="font-extrabold text-gray-900">{title}</p>
          {title === "멘토" && <Badge variant="warning">HOT</Badge>}
        </div>
        <p className="text-sm text-gray-500 font-medium mt-0.5">{desc}</p>
      </div>
      <div className="text-gray-300">
        <i className="fa-solid fa-chevron-right"></i>
      </div>
    </button>
  );
};
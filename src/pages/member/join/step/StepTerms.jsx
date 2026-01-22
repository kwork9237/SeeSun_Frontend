const StepTerms = ({ terms, onAll, onItem, error }) => {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-orange-600 mb-4">약관 동의</h2>

      <div className="border rounded-2xl border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={terms.all}
              onChange={(e) => onAll(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-bold text-gray-900">모두 동의</span>
          </label>
          <span className="text-xs text-gray-400 font-bold">필수/선택 포함</span>
        </div>

        <div className="p-4 space-y-3">
          <TermItem
            checked={terms.t1}
            onChange={(v) => onItem("t1", v)}
            label="[필수] 이용약관 동의"
          />
          <TermItem
            checked={terms.t2}
            onChange={(v) => onItem("t2", v)}
            label="[필수] 개인정보 수집 및 이용 동의"
          />
          <TermItem
            checked={terms.t3}
            onChange={(v) => onItem("t3", v)}
            label="[선택] 마케팅 정보 수신 동의"
          />

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold mb-2">수신 동의</p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={terms.sms}
                  onChange={(e) => onItem("sms", e.target.checked)}
                  className="w-4 h-4"
                />
                SMS
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={terms.email}
                  onChange={(e) => onItem("email", e.target.checked)}
                  className="w-4 h-4"
                />
                이메일
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default StepTerms;

// Sub Component

const TermItem = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
        <span className="text-sm text-gray-700 font-medium">{label}</span>
      </label>
      <button className="text-xs text-gray-400 hover:text-gray-600 font-bold">
        보기
      </button>
    </div>
  );
};
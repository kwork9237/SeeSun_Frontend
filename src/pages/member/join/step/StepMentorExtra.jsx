const StepMentorExtra = ({ mentorForm, setMentorForm, errors }) => {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-orange-600 mb-4">멘토 추가정보</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전문 분야</label>
          <select
            value={mentorForm.category}
            onChange={(e) => setMentorForm((p) => ({ ...p, category: e.target.value }))}
            className={`
              w-full px-4 py-2 border rounded-lg outline-none transition-colors duration-200
              ${errors.category ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:ring-1 focus:ring-blue-500"}
            `}
          >
            <option value="">선택하세요</option>
            <option value="ENGLISH">영어</option>
            <option value="CODING">코딩</option>
            <option value="DESIGN">디자인</option>
            <option value="ETC">기타</option>
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">포트폴리오 첨부</label>
          <div className={`border rounded-lg px-4 py-2 flex items-center justify-between ${errors.portfolioFile ? "border-red-500" : "border-gray-300"}`}>
            <p className="text-sm text-gray-600 truncate">
              {mentorForm.portfolioFile ? mentorForm.portfolioFile.name : "파일을 선택하세요"}
            </p>
            <label className="text-xs font-bold text-orange-600 hover:underline cursor-pointer">
              첨부하기
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setMentorForm((p) => ({ ...p, portfolioFile: f }));
                }}
              />
            </label>
          </div>
          {errors.portfolioFile && <p className="mt-1 text-xs text-red-500">{errors.portfolioFile}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
        <textarea
          value={mentorForm.intro}
          onChange={(e) => setMentorForm((p) => ({ ...p, intro: e.target.value }))}
          placeholder="수업 경력/전문 분야/강의 스타일 등을 10자 이상 작성해주세요."
          rows={5}
          className={`
            w-full px-4 py-3 border rounded-2xl outline-none transition-colors duration-200
            ${errors.intro ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:ring-1 focus:ring-blue-500"}
          `}
        />
        {errors.intro && <p className="mt-1 text-xs text-red-500">{errors.intro}</p>}
      </div>

      <div className="mt-3 p-4 rounded-2xl bg-orange-50 border border-orange-100 text-sm text-orange-700 font-medium">
        멘토는 검수 후 강의 개설이 가능합니다. (파일 첨부 필수)
      </div>
    </div>
  );
};

export default StepMentorExtra;
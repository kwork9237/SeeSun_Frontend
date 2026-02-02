import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Calendar, Clock, Users, AlertCircle } from "lucide-react";
import apiClient from '../../../api/apiClient';

const Create = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    language: 'en',
    level: '1',
    description: '',
    sections: [{ id: crypto.randomUUID(), title: 'Section 1', lessons: [{ id: crypto.randomUUID(), title: 'Lesson 1', duration: '50' }] }],
    startDate: '',
    endDate: '',
    selectedDays: [],
    startTime: '09:00',
    endTime: '10:00',
    maxStudents: '1',
    generatedSlots: [],
    price: ''
  });

  const updateData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "강의 제목을 입력해주세요.";
      if (!formData.description.trim() || formData.description.length < 10) 
        newErrors.description = "상세 내용을 10자 이상 입력해주세요.";
    }

    if (step === 2) {
      formData.sections.forEach((section) => {
        if (!section.title.trim()) newErrors[`section_${section.id}`] = "섹션 제목을 입력해주세요.";
        section.lessons.forEach((lesson) => {
          if (!lesson.title.trim()) newErrors[`lesson_${lesson.id}`] = "레슨 제목을 입력해주세요.";
        });
      });
    }

    if (step === 3) {
      if (!formData.startDate) newErrors.startDate = "시작 날짜를 선택해주세요.";
      if (!formData.endDate) newErrors.endDate = "종료 날짜를 선택해주세요.";
      if (formData.selectedDays.length === 0) newErrors.selectedDays = "최소 하나의 요일을 선택해주세요.";
      if (formData.generatedSlots.length === 0) newErrors.generatedSlots = "날짜 생성 버튼을 눌러 슬롯을 생성해주세요.";
      if (!formData.price || formData.price <= 0) newErrors.price = "올바른 가격을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setErrors({});
    setStep(prev => prev - 1);
  };

  // ✅ 수정된 결제 요청 함수
  const handleCreateLecture = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        language: formData.language,
        level: parseInt(formData.level),
        description: formData.description,
        sections: formData.sections,
        startDate: formData.startDate,
        endDate: formData.endDate,
        selectedDays: formData.selectedDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxStudents: parseInt(formData.maxStudents),
        generatedSlots: formData.generatedSlots,
        price: parseInt(formData.price)
      };

      // 전역 처리에 따른 axios post 변경
      const response = await apiClient.post('/lectures', payload);

      alert(`강의가 생성되었습니다!`);
      window.location.reload();
    } catch (error) {
      console.error('강의 생성 실패:', error);
      alert(error.response?.status === 403 ? '권한이 없습니다 (멘토 계정 확인)' : '강의 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* 스테퍼 */}
      <div className="flex justify-center items-center mb-10">
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors
              ${step >= num ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
              {num}
            </div>
            {num < 4 && <div className={`w-16 h-0.5 ${step > num ? 'bg-orange-500' : 'bg-gray-300'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* 컨텐츠 박스 */}
      <div className="bg-white rounded-3xl shadow-xl p-10 min-h-[500px] border border-gray-100">
        {step === 1 && <BasicInfo data={formData} setData={updateData} errors={errors} />}
        {step === 2 && <Curriculum data={formData} updateData={updateData} errors={errors} />}
        {step === 3 && <Schedule data={formData} updateData={updateData} errors={errors} />}
        {step === 4 && <Review data={formData} />}
      </div>

      {/* 버튼 컨트롤 */}
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} disabled={step === 1} className="px-8 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 disabled:opacity-30 transition-all">뒤로가기</button>
        {step < 4 ? (
          <button onClick={nextStep} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all">다음</button>
        ) : (
          <button onClick={handleCreateLecture} disabled={loading} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50">
            {loading ? '생성 중...' : '강의 만들기'}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Step 1: 강의 정보 ---
const BasicInfo = ({ data, setData, errors }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-black text-gray-900 mb-8">Step 1. 강의 정보입력</h2>
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">강의제목</label>
      <input 
        type="text" 
        placeholder="강의제목 입력" 
        className={`w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ${errors.title ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-orange-500'}`} 
        value={data.title} 
        onChange={(e) => setData({title: e.target.value})} 
      />
      {errors.title && <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1 ml-2"><AlertCircle size={14}/> {errors.title}</p>}
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">언어</label>
        <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={data.language} onChange={(e) => setData({language: e.target.value})}>
          <option value="en">영어</option>
          <option value="jp">일본어</option>
          <option value="cn">중국어</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">난이도</label>
        <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={data.level} onChange={(e) => setData({level: e.target.value})}>
          <option value="1">쉬움</option>
          <option value="2">보통</option>
          <option value="3">어려움</option>
        </select>
      </div>
    </div>
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">강의 상세내용</label>
      <textarea 
        rows="5" 
        placeholder="강의 상세내용 입력" 
        className={`w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ${errors.description ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-orange-500'}`} 
        value={data.description} 
        onChange={(e) => setData({description: e.target.value})} 
      />
      {errors.description && <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1 ml-2"><AlertCircle size={14}/> {errors.description}</p>}
    </div>
  </div>
);

// --- Step 2: 커리큘럼 ---
const Curriculum = ({ data, updateData, errors }) => {
  const addSection = () => updateData({ sections: [...data.sections, { id: crypto.randomUUID(), title: `Section ${data.sections.length + 1}`, lessons: [{ id: crypto.randomUUID(), title: '', duration: '50' }] }] });
  const removeSection = (id) => updateData({ sections: data.sections.filter(s => s.id !== id) });
  const addLesson = (sId) => updateData({ sections: data.sections.map(s => s.id === sId ? {...s, lessons: [...s.lessons, {id: crypto.randomUUID(), title: '', duration: '50'}]} : s)});
  const removeLesson = (sId, lId) => updateData({ sections: data.sections.map(s => s.id === sId ? {...s, lessons: s.lessons.filter(l => l.id !== lId)} : s)});
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900 mb-8">Step 2. 강의 커리큘럼</h2>
      {data.sections.map((section) => (
        <div key={section.id} className={`border rounded-3xl overflow-hidden mb-6 shadow-sm ${errors[`section_${section.id}`] ? 'border-red-500' : 'border-gray-100'}`}>
          <div className="bg-gray-50/50 p-5 flex items-center gap-3 border-b border-gray-100">
            <GripVertical className="text-gray-300" size={20} />
            <input className="flex-1 bg-transparent font-bold text-lg outline-none" value={section.title} onChange={(e) => updateData({ sections: data.sections.map(s => s.id === section.id ? {...s, title: e.target.value} : s) })} />
            <button onClick={() => removeSection(section.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={20}/></button>
          </div>
          <div className="p-5 space-y-3">
            {section.lessons.map((lesson) => (
              <div key={lesson.id}>
                <div className={`flex items-center gap-3 p-4 bg-white border rounded-2xl group transition-all shadow-sm ${errors[`lesson_${lesson.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-orange-200'}`}>
                  <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Lesson title" value={lesson.title} onChange={(e) => updateData({ sections: data.sections.map(s => s.id === section.id ? {...s, lessons: s.lessons.map(l => l.id === lesson.id ? {...l, title: e.target.value} : l)} : s) })} />
                  <div className="flex items-center bg-gray-100 px-3 py-1 rounded-xl">
                    <input type="number" className="w-12 bg-transparent text-right text-xs font-bold outline-none" value={lesson.duration} onChange={(e) => updateData({ sections: data.sections.map(s => s.id === section.id ? {...s, lessons: s.lessons.map(l => l.id === lesson.id ? {...l, duration: e.target.value} : l)} : s) })} />
                    <span className="text-[10px] ml-1 text-gray-500 font-bold">min</span>
                  </div>
                  <button onClick={() => removeLesson(section.id, lesson.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                </div>
                {errors[`lesson_${lesson.id}`] && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{errors[`lesson_${lesson.id}`]}</p>}
              </div>
            ))}
            <button onClick={() => addLesson(section.id)} className="w-full py-4 border-2 border-dashed border-orange-100 text-orange-500 rounded-2xl text-sm font-bold hover:bg-orange-50 transition-all">+ Add Live Lesson</button>
          </div>
        </div>
      ))}
      <button onClick={addSection} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl font-bold text-gray-400 hover:bg-gray-50">+ Add Section</button>
    </div>
  );
};

// --- Step 3: 강의 스케쥴 & 가격 설정 ---
const Schedule = ({ data, updateData, errors }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const generateSlots = () => {
    if(!data.startDate || !data.endDate || data.selectedDays.length === 0) return alert("날짜와 요일을 선택해주세요!");
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const slots = [];
    const dayIndices = data.selectedDays.map(d => (days.indexOf(d) + 1) % 7);
    
    let current = new Date(start);
    while(current <= end) { 
      if(dayIndices.includes(current.getDay())) { 
        slots.push(`${current.toLocaleDateString('en-US', {month:'short', day:'numeric'})} ${data.startTime}`); 
      }
      current.setDate(current.getDate() + 1); 
    }
    updateData({ generatedSlots: slots });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-gray-900 mb-8">Step 3. 강의 스케쥴 & 강의 가격</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">강의 시작날짜</label>
          <div className="relative">
            <Calendar className={`absolute left-4 top-4 ${errors.startDate ? 'text-red-400' : 'text-gray-400'}`} size={18} />
            <input type="date" className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 ${errors.startDate ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'}`} value={data.startDate} onChange={(e) => updateData({startDate: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">강의 종료날짜</label>
          <div className="relative">
            <Calendar className={`absolute left-4 top-4 ${errors.endDate ? 'text-red-400' : 'text-gray-400'}`} size={18} />
            <input type="date" className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 ${errors.endDate ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'}`} value={data.endDate} onChange={(e) => updateData({endDate: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-700">요일 선택</label>
        <div className="flex gap-2">
          {days.map(d => (
            <button key={d} onClick={() => updateData({selectedDays: data.selectedDays.includes(d) ? data.selectedDays.filter(day => day !== d) : [...data.selectedDays, d]})} 
            className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${data.selectedDays.includes(d) ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}>{d}</button>
          ))}
        </div>
        {errors.selectedDays && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.selectedDays}</p>}
      </div>

      <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-orange-600">강의 시간대 설정</h3><button onClick={generateSlots} className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-600">날짜 생성</button></div>
        <div className="flex items-center gap-4">
          <input type="time" className="flex-1 p-3 rounded-xl border-none outline-none" value={data.startTime} onChange={(e) => updateData({startTime: e.target.value})} />
          <span className="text-gray-300">—</span>
          <input type="time" className="flex-1 p-3 rounded-xl border-none outline-none" value={data.endTime} onChange={(e) => updateData({endTime: e.target.value})} />
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-orange-100"><span className="text-xs text-gray-400">학생수:</span><input type="number" className="w-8 outline-none font-bold text-sm text-orange-600" value={data.maxStudents} onChange={(e) => updateData({maxStudents: e.target.value})} /></div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-700">강의 시간 저장목록</label>
        <div className={`flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl min-h-[60px] border ${errors.generatedSlots ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
          {data.generatedSlots.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium">위의 날짜 생성 버튼을 클릭하세요.</p>
          ) : (
            data.generatedSlots.map((s, i) => (
              <div key={i} className="bg-white px-4 py-2 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-2 shadow-sm transition-all hover:border-orange-300">
                {s} <button onClick={() => updateData({generatedSlots: data.generatedSlots.filter((_, idx) => idx !== i)})} className="text-gray-300 hover:text-red-500">×</button>
              </div>
            ))
          )}
        </div>
        {errors.generatedSlots && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.generatedSlots}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">강의 가격</label>
        <div className="relative">
          <span className={`absolute left-5 top-4 font-black text-lg ${errors.price ? 'text-red-400' : 'text-gray-400'}`}>$</span>
          <input type="number" placeholder="0" className={`w-full p-4 pl-10 bg-gray-50 rounded-2xl font-black text-xl outline-none focus:ring-2 ${errors.price ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-orange-500'}`} value={data.price} onChange={(e) => updateData({price: e.target.value})} />
        </div>
        {errors.price && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.price}</p>}
      </div>
    </div>
  );
};

// --- Step 4: Review ---
const Review = ({ data }) => {
  const totalWeeks = data.sections.length;
  const totalLessons = data.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-black text-gray-900 mb-2">강의 정보 확인</h2>
      <p className="text-sm text-gray-500 mb-8">마지막으로 입력하신 정보를 확인해주세요.</p>

      {/* 1. Course Details */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-orange-600">
          <Calendar size={18} />
          <span className="font-bold text-sm">강의 정보</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-gray-800">{data.title || "강의 제목이 없습니다"}</h3>
          <p className="text-sm text-gray-500">{data.language === 'en' ? '영어' : data.language} · 난이도 {data.level}</p>
        </div>
      </div>

      {/* 2. Curriculum Summary */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-orange-600">
          <GripVertical size={18} />
          <span className="font-bold text-sm">강의 커리큘럼</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-orange-600">{totalWeeks}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase">주차별</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-orange-600">{totalLessons}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase">실시간 강의</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.sections.map((section, idx) => (
            <div key={section.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-none">
              <span className="text-sm font-bold text-gray-700">{section.title || `Week ${idx + 1}`}</span>
              <span className="text-xs text-gray-400">{section.lessons.length} 강의</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Schedule */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-orange-600">
          <Clock size={18} />
          <span className="font-bold text-sm">강의 스케쥴</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-4 rounded-2xl">
          <Users size={16} className="text-gray-400" />
          <span className="text-sm font-medium">멘티 {data.maxStudents}명 · {data.generatedSlots.length}개 슬롯</span>
        </div>
      </div>

      {/* 4. Total Price */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2 text-orange-600">
          <span className="text-lg font-bold">$</span>
          <span className="font-bold text-sm">총 강의 가격</span>
        </div>
        <span className="text-3xl font-black text-orange-600">${Number(data.price || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default Create;
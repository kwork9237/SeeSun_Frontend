import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const MentorDashboard = ({ memberInfo }) => {
  
  // 1. [가상 데이터] 주간 날짜 (이미지의 2월 1주차 반영)
  const weekDays = [
    { day: '월', date: '2', active: false },
    { day: '화', date: '3', active: false },
    { day: '수', date: '4', active: true }, // 선택됨
    { day: '목', date: '5', active: false },
    { day: '금', date: '6', active: false, hasEvent: true }, // 일정 있음 표시
    { day: '토', date: '7', active: false },
    { day: '일', date: '8', active: false },
  ];

  // 2. [가상 데이터] 오늘의 수업 리스트
  const todayClasses = [
    {
      id: 1,
      time: "14:00 - 15:00",
      status: "LIVE", // 수업 진행 중
      title: "비즈니스 영어 회화",
      room: "화상 강의실 A",
      mentee: "김철수",
      menteeImg: "https://randomuser.me/api/portraits/men/11.jpg"
    },
    {
      id: 2,
      time: "16:00 - 17:00",
      status: "WAITING", // 입장 대기
      title: "일본어 프리토킹",
      room: null,
      mentee: "박민수",
      menteeImg: "https://randomuser.me/api/portraits/men/44.jpg"
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* ------------------------------------------------------------
          1. 헤더 영역 (강의 및 일정 관리 + 새 강의 개설 버튼)
      ------------------------------------------------------------ */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">강의 및 일정 관리</h1>
        <Button variant="secondary" size="medium" className="shadow-md shadow-orange-100 font-bold">
          <i className="fa-solid fa-plus mr-2"></i> 새 강의 개설하기
        </Button>
      </div>


      {/* ------------------------------------------------------------
          2. 승인 대기 중인 신청 (파란색 알림 박스)
      ------------------------------------------------------------ */}
      <section className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <i className="fa-regular fa-bell text-blue-600 text-lg"></i>
          <h3 className="font-bold text-blue-900 text-lg">
            승인 대기 중인 신청 
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">2</span>
          </h3>
        </div>

        <div className="space-y-3">
          {/* 요청 1 */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm md:text-base">
                <span className="text-blue-600">김철수</span>님이 [비즈니스 영어 회화] 수업을 신청했습니다.
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <i className="fa-regular fa-calendar"></i> 희망 시간: 2026.02.05 (목) 14:00
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
                <i className="fa-solid fa-xmark mr-1"></i> 거절
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-blue-200 shadow-md">
                <i className="fa-solid fa-check mr-1"></i> 수락하기
              </button>
            </div>
          </div>

          {/* 요청 2 */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm md:text-base">
                <span className="text-blue-600">이영희</span>님이 [리액트 기초] 수업을 신청했습니다.
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <i className="fa-regular fa-calendar"></i> 희망 시간: 2026.02.06 (금) 10:00
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
                <i className="fa-solid fa-xmark mr-1"></i> 거절
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-blue-200 shadow-md">
                <i className="fa-solid fa-check mr-1"></i> 수락하기
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ------------------------------------------------------------
          3. 수업 일정 관리 (달력 + 리스트)
      ------------------------------------------------------------ */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🗓️</span> 수업 일정 관리
        </h3>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* (1) 주간 달력 스트립 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="font-bold text-gray-800">2026년 2월 1주차</span>
              <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <div className="flex justify-between px-2 md:px-10">
              {weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 cursor-pointer group">
                  <span className="text-xs font-medium text-gray-400">{day.day}</span>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all relative
                    ${day.active 
                      ? 'bg-orange-50 text-secondary border-2 border-orange-200 shadow-sm transform -translate-y-1' 
                      : 'text-gray-700 hover:bg-gray-50'}`}>
                    {day.date}
                    {/* 일정 있음 표시 점 */}
                    {day.hasEvent && !day.active && (
                       <span className="absolute bottom-1.5 w-1 h-1 bg-red-500 rounded-full"></span>
                    )}
                    {day.active && (
                       <span className="absolute bottom-1.5 w-1 h-1 bg-secondary rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* (2) 수업 리스트 테이블 */}
          <div>
             {/* 테이블 헤더 (PC에서만 보임) */}
             <div className="hidden md:grid grid-cols-12 bg-gray-50 px-6 py-3 text-xs font-bold text-gray-500 border-b border-gray-100">
                <div className="col-span-3">시간</div>
                <div className="col-span-5">강의명</div>
                <div className="col-span-2">멘티</div>
                <div className="col-span-2 text-right">입장 / 상태</div>
             </div>

             {/* 리스트 아이템 */}
             {todayClasses.map((item) => (
               <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-5 items-center border-b border-gray-50 hover:bg-slate-50 transition gap-4 md:gap-0">
                  
                  {/* 시간 */}
                  <div className="col-span-3">
                     <div className="font-bold text-gray-900 text-lg md:text-base">{item.time}</div>
                     {item.status === 'LIVE' && (
                       <span className="text-xs font-bold text-secondary mt-1 inline-block animate-pulse">
                         수업 진행 중
                       </span>
                     )}
                  </div>

                  {/* 강의명 */}
                  <div className="col-span-5">
                     <div className="font-bold text-gray-800 text-base">{item.title}</div>
                     {item.room && <div className="text-xs text-gray-400 mt-0.5">{item.room}</div>}
                  </div>

                  {/* 멘티 정보 */}
                  <div className="col-span-2 flex items-center gap-2">
                     <img src={item.menteeImg} alt="" className="w-6 h-6 rounded-full bg-gray-200" />
                     <span className="text-sm font-medium text-gray-600">{item.mentee}</span>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="col-span-2 text-right">
                     {item.status === 'LIVE' ? (
                       <Button variant="secondary" size="medium" className="w-full md:w-auto shadow-orange-200 shadow-md">
                         <i className="fa-solid fa-video mr-2"></i> 강의실 입장
                       </Button>
                     ) : (
                       <button disabled className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed">
                         입장 대기
                       </button>
                     )}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>


      {/* ------------------------------------------------------------
          4. 개설한 강의 관리 (카드 리스트)
      ------------------------------------------------------------ */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
           <span className="text-2xl">📚</span> 개설한 강의 관리
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
           {/* 강의 카드 1 */}
           <MentorCourseCard 
              status="active" 
              title="비즈니스 영어 회화 - 초급반" 
              rate="4.8" 
              count="12" 
              img="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
           />

           {/* 강의 카드 2 */}
           <MentorCourseCard 
              status="paused" 
              title="실전 리액트 프로그래밍" 
              rate="5.0" 
              count="8" 
              img="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80"
           />

           {/* 새 강의 만들기 카드 */}
           <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center h-full min-h-[320px] cursor-pointer hover:border-secondary hover:bg-orange-50/30 transition group bg-gray-50/50">
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition">
                 <i className="fa-solid fa-plus text-2xl text-gray-400 group-hover:text-secondary"></i>
              </div>
              <span className="font-bold text-gray-500 group-hover:text-secondary">새 강의 만들기</span>
           </div>

        </div>
      </section>

    </div>
  );
};

// [내부 컴포넌트] 멘토 강의 카드
const MentorCourseCard = ({ status, title, rate, count, img }) => (
  <Card padding="none" className="flex flex-col h-full border border-gray-200 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition duration-300">
     {/* 썸네일 */}
     <div className="h-48 bg-gray-200 relative overflow-hidden">
        <img src={img} alt="강의" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        {/* 상태 배지 */}
        <div className="absolute top-4 left-4">
            {status === 'active' 
              ? <Badge variant="primary" className="shadow-sm">모집 중</Badge>
              : <Badge variant="gray" className="shadow-sm">일시 중지</Badge>
            }
        </div>
     </div>

     {/* 내용 */}
     <div className="p-5 flex-1 flex flex-col">
        <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight line-clamp-2">{title}</h4>
        
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-3">
           <span className="flex items-center gap-1 font-bold text-gray-800">
             <i className="fa-solid fa-star text-yellow-400"></i> {rate}
           </span>
           <span className="w-px h-3 bg-gray-300"></span>
           <span className="flex items-center gap-1">
             <i className="fa-solid fa-user-group text-gray-400"></i> 수강생 {count}명
           </span>
        </div>
        
        {/* 하단 버튼 */}
        <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100">
           <button className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center gap-2">
              <i className="fa-regular fa-pen-to-square"></i> 강의 수정
           </button>
           <button className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center gap-2">
              <i className="fa-solid fa-share-nodes"></i> 공유
           </button>
        </div>
     </div>
  </Card>
);

export default MentorDashboard;
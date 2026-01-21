import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const MainBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // 1. 학생용 (Blue 배경 -> 흰색 버튼 + 파란 글씨)
    {
      id: 1,
      target: "For Mentee",
      title: <>지금 가입하면,<br />첫 멘토링 수업 <span className="text-yellow-300">1회 무료!</span></>,
      desc: <>망설임은 실력 향상을 늦출 뿐입니다. <br/> 검증된 멘토와 1:1로 시작하세요.</>,
      btnText: "무료 체험 시작하기",
      bgClass: "bg-primary", 
      badgeClass: "bg-white text-primary",
      // [수정] !text-primary로 글자색 강제 적용 (흰색 배경 위 파란 글씨)
      btnStyle: "bg-white !text-primary hover:bg-blue-50 border-transparent"
    },
    // 2. 멘토용 (Dark 배경 -> 오렌지 버튼 + 흰색 글씨)
    {
      id: 2,
      target: "For Mentors",
      title: <>당신의 언어 능력을<br />글로벌 <span className="text-secondary">수익</span>으로 바꾸세요</>,
      desc: <>누구나 멘토가 되어 전 세계 학생들을 가르칠 수 있습니다. <br/> 자유로운 스케줄과 안전한 정산 시스템</>,
      btnText: "멘토 등록하기",
      bgClass: "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900", 
      badgeClass: "bg-secondary text-white",
      // [수정] 오렌지 배경 + 흰색 글씨
      btnStyle: "bg-secondary !text-white hover:bg-orange-600 border-transparent shadow-orange-900/20"
    },
    // 3. 탐색용 (Purple 배경 -> 흰색 버튼 + 보라 글씨)
    {
      id: 3,
      target: "Discover",
      title: <>나에게 딱 맞는<br />인생 멘토를 <span className="text-pink-300">찾아보세요</span></>,
      desc: <>자격증, 비즈니스, 여행, 취미까지. <br/> 다양한 배경 지식을 가진 멘토들이 기다리고 있습니다.</>,
      btnText: "강의 찾으러 가기",
      bgClass: "bg-gradient-to-br from-indigo-600 to-violet-600",
      badgeClass: "bg-white/20 text-white backdrop-blur-md",
      // [수정] 흰색 배경 + 인디고 글씨
      btnStyle: "bg-white !text-indigo-600 hover:bg-indigo-50 border-transparent"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[540px] overflow-hidden group mt-20">
      <div 
        className="w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={`w-full h-full flex-shrink-0 flex flex-col justify-center items-center text-center px-4 relative ${slide.bgClass}`}>
            
            {/* 배경 데코레이션 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {slide.id === 1 && <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>}
                {slide.id === 2 && <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>}
                {slide.id === 3 && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-400 rounded-full opacity-20 blur-[100px]"></div>}
            </div>

            <div className="relative z-10 max-w-4xl space-y-8 animate-fade-in-up">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wide mb-2 shadow-sm ${slide.badgeClass}`}>
                {slide.target}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-sm">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
                {slide.desc}
              </p>
              
              <div className="flex justify-center">
                {/* !important가 적용된 btnStyle을 className으로 전달 */}
                <Button size="large" className={`shadow-xl border-none ${slide.btnStyle}`}>
                  {slide.btnText} <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 shadow-sm 
              ${currentSlide === index ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
          />
        ))}
      </div>
      
      {/* 화살표 컨트롤 */}
      <button onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))} 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/40 backdrop-blur-sm z-30">
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))} 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/40 backdrop-blur-sm z-30">
        <i className="fa-solid fa-chevron-right"></i>
      </button>

    </section>
  );
};

export default MainBanner;
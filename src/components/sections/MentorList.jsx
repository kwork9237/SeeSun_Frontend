import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import LectureCard from "../common/LectureCard"; // 분리한 카드 import

const MentorList = ({ selectedLang }) => {
  
  // [Data] 일본어, 중국어 데이터가 포함된 전체 리스트
  const mentorsData = {
    english: [
      { 
        id: 1, 
        lectureTitle: "비즈니스 영어 마스터",
        name: "James Wilson", 
        img: "men/32.jpg", 
        catchPhrase: "Native English Speaker",
        desc: "실리콘밸리 출신 개발자가 알려주는 실전 IT 비즈니스 영어입니다.",
        tags: ["#비즈니스", "#중급"], 
        rate: 4.9, 
        price: "25,000",
        totalHours: 20,
        mainTime: "19:00 ~ 23:00"
      },
      { 
        id: 2, 
        lectureTitle: "여행 회화 A to Z",
        name: "Emily Clark", 
        img: "women/65.jpg", 
        catchPhrase: "Travel English Expert",
        desc: "여행지에서 바로 써먹는 생존 영어! 공항, 호텔, 식당 필수 표현.",
        tags: ["#여행", "#초급"], 
        rate: 4.8, 
        price: "22,000",
        totalHours: 12,
        mainTime: "10:00 ~ 14:00"
      },
      { 
        id: 3, 
        lectureTitle: "오픽(OPIc) AL 보장반",
        name: "Michael Brown", 
        img: "men/11.jpg", 
        catchPhrase: "OPIc Grader 출신",
        desc: "채점 기준을 완벽하게 분석하여 최단기간 등급 달성을 도와드립니다.",
        tags: ["#자격증", "#시험"], 
        rate: 5.0, 
        price: "30,000",
        totalHours: 30,
        mainTime: "06:00 ~ 09:00"
      },
    ],
    japanese: [
      { 
        id: 4, 
        lectureTitle: "JLPT N1/N2 합격반",
        name: "Sato Kenji", 
        img: "men/45.jpg", 
        catchPhrase: "JLPT 만점 강사의 비법",
        desc: "시험에 꼭 나오는 문법과 청해 팁을 족집게처럼 알려드립니다.",
        tags: ["#자격증", "#JLPT"], 
        rate: 4.9, 
        price: "25,000",
        totalHours: 24,
        mainTime: "20:00 ~ 22:00"
      },
      { 
        id: 5, 
        lectureTitle: "애니메이션으로 배우는 회화",
        name: "Tanaka Yui", 
        img: "women/22.jpg", 
        catchPhrase: "덕질하며 배우는 일본어",
        desc: "최신 애니메이션 대사로 지루하지 않게 귀가 트이는 실전 회화.",
        tags: ["#취미", "#회화"], 
        rate: 4.7, 
        price: "18,000",
        totalHours: 10,
        mainTime: "14:00 ~ 16:00"
      },
      { 
        id: 6, 
        lectureTitle: "일본 취업 완벽 대비",
        name: "Yamada Hiroshi", 
        img: "men/85.jpg", 
        catchPhrase: "도쿄 대기업 인사담당자 출신",
        desc: "이력서 첨삭부터 면접 매너까지, 일본 취업의 모든 것을 코칭합니다.",
        tags: ["#취업", "#비즈니스"], 
        rate: 5.0, 
        price: "35,000",
        totalHours: 15,
        mainTime: "18:00 ~ 20:00"
      },
    ],
    chinese: [
      { 
        id: 7, 
        lectureTitle: "HSK 5급/6급 단기 완성",
        name: "Wang Wei", 
        img: "men/66.jpg", 
        catchPhrase: "HSK 시험 출제 경향 분석",
        desc: "어렵게만 느껴지는 한자, 어원 풀이로 쉽고 빠르게 암기시켜 드립니다.",
        tags: ["#자격증", "#HSK"], 
        rate: 4.9, 
        price: "28,000",
        totalHours: 32,
        mainTime: "19:00 ~ 21:00"
      },
      { 
        id: 8, 
        lectureTitle: "실전 비즈니스 중국어",
        name: "Li Mei", 
        img: "women/33.jpg", 
        catchPhrase: "무역 회사 10년 경력",
        desc: "비즈니스 이메일 작성법부터 바이어 미팅 회화까지 실무 중심 강의.",
        tags: ["#비즈니스", "#무역"], 
        rate: 4.8, 
        price: "32,000",
        totalHours: 20,
        mainTime: "07:00 ~ 09:00"
      },
      { 
        id: 9, 
        lectureTitle: "입문자를 위한 성조 교정",
        name: "Zhang Min", 
        img: "women/12.jpg", 
        catchPhrase: "아나운서 출신의 정확한 발음",
        desc: "중국어의 핵심은 성조! 기초부터 탄탄하게 발음을 교정해드립니다.",
        tags: ["#입문", "#발음"], 
        rate: 4.6, 
        price: "20,000",
        totalHours: 8,
        mainTime: "13:00 ~ 15:00"
      },
    ]
  };

  const currentMentors = mentorsData[selectedLang] || [];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 섹션 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2 capitalize flex items-center gap-2">
              {selectedLang} Popular Lectures <span className="text-2xl animate-bounce">🔥</span>
            </h2>
            <p className="text-gray-600">
              수강생 평점이 가장 높은 인기 강의를 확인해보세요.
            </p>
          </div>

          <Link to="/LectureList">
            <Button variant="ghost" size="medium" className="group">
              전체 보기 
              <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </Button>
          </Link>
        </div>

        {/* 강의 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMentors.length > 0 ? (
            currentMentors.map((data) => (
              <LectureCard key={data.id} data={data} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
                <i className="fa-solid fa-person-chalkboard text-4xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 font-medium">
                해당 언어의 강의가 준비 중입니다. 
                <br /><span className="text-sm text-gray-400">빠른 시일 내에 오픈하겠습니다!</span>
              </p>
            </div>
          )}
        </div>
        
      </div>
    </section>
  );
};

export default MentorList;
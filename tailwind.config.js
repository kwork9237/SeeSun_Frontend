/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 1. 컬러 팔레트:
      colors: {
        // [메인] 브랜드 아이덴티티 (신뢰, 글로벌, 비즈니스)
        primary: {
          DEFAULT: '#2563eb', // Royal Blue (로고, 메인 버튼)
          hover: '#1d4ed8',   // Hover 상태
          light: '#eff6ff',   // 연한 배경 (말풍선, 선택된 항목)
        },
        
        // [포인트] 행동 유도 (수강신청, 강조, 알림)
        secondary: {
          DEFAULT: '#f97316', // Vivid Orange (CTA 버튼)
          hover: '#ea580c',   
        },

        // [상태 표시] 교육/화상 수업에 필요한 시멘틱 컬러
        status: {
          success: '#10b981', // 수업 예약 성공, 온라인 상태 (Green)
          error: '#f43f5e',   // 결제 실패, 오프라인 상태 (Rose)
          waiting: '#f59e0b', // 매칭 대기 중, 로딩 (Amber)
        },

        // [배경] 눈이 편안한 학습 환경 조성
        bg: {
          base: '#F8FAFC',    // 전체 배경 (차가운 옅은 회색)
          card: '#FFFFFF',    // 카드/모달 배경 (흰색)
          footer: '#1e293b',  // 푸터 배경 (짙은 네이비)
        },
        
        // [텍스트] 가독성 중심
        text: {
          main: '#1e293b',    // 본문 (거의 검정)
          sub: '#64748b',     // 설명글 (회색)
          footer: '#94a3b8',  // 푸터 글씨 (연한 회색)
        }
      },

      // 2. 그림자: 멘토 카드, 강의실 리스트에 사용할 부드러운 입체감
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)', // 일반 카드
        'card-hover': '0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -4px rgba(37, 99, 235, 0.1)', // 호버 시 살짝 파란 빛
      },

      // 3. 폰트: 한글/영문 모두 깔끔한 Pretendard
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "Roboto", "sans-serif"],
      },

      // 4. 애니메이션: 화상 연결 대기/매칭 중일 때 사용
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // 대기 중일 때 깜빡임
        'wiggle': 'wiggle 1s ease-in-out infinite', // 알림 벨 흔들림
      }
    },
  },
  plugins: [],
}
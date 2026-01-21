/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ 
    "./src/**/*.{js,jsx,ts,tsx}",

  ],
  theme: {
    extend: {
      colors: {
        // 1. 브랜드 메인 컬러
        primary: {
          DEFAULT: '#2563eb', // bg-primary, text-primary
          hover: '#1d4ed8',   // hover:bg-primary-hover (살짝 더 진한 블루)
          dark: '#1e40af',    // 아주 진한 블루
        },
        // 2. 포인트/행동 유도 컬러
        secondary: {
          DEFAULT: '#f97316', // bg-secondary
          hover: '#ea580c',   // hover:bg-secondary-hover
        },
        // 3. 푸터 전용 컬러
        footer: {
          bg: '#1e293b',      // bg-footer-bg
          text: '#94a3b8',    // text-footer-text
        }
      },
    },
  },
  plugins: [],
}

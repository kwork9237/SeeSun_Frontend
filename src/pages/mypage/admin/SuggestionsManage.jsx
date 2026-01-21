import React from 'react';

const SuggestionsManage = () => {
  // 반복되는 색상 변수 정의 (유지보수 편의성)
  const colors = {
    primary: '#f97316', // Orange-500
    primaryLight: '#fdba74', // Orange-300
    textMain: '#1f2937', // Gray-800
    textSub: '#4b5563', // Gray-600
    textMuted: '#6b7280', // Gray-500
    border: '#e5e7eb', // Gray-200
    borderDark: '#d1d5db', // Gray-300
    bgLight: '#f9fafb', // Gray-50
    bgHover: '#f3f4f6', // Gray-100
    white: '#ffffff',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.white, color: colors.textMain, fontFamily: 'sans-serif' }}>
      
      {/* 1. 상단 네비게이션 (헤더) */}
      <header style={{
        height: '64px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        backgroundColor: colors.white,
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 10,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 로고 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <span style={{ color: colors.primary, fontSize: '1.5rem' }}>●</span> 
            <span>LinguaConnect</span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '0.875rem', fontWeight: 500, color: colors.textSub }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>How it Works</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>Languages</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>Mentors</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>Pricing</button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{
            padding: '6px 16px',
            border: `1px solid ${colors.primaryLight}`,
            color: colors.primary,
            borderRadius: '4px',
            background: 'none',
            cursor: 'pointer'
          }}>
            Sign In
          </button>
          <button style={{
            padding: '6px 16px',
            backgroundColor: colors.primary,
            color: colors.white,
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            Get Started
          </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>
        
        {/* 왼쪽 사이드바 */}
        <aside style={{
          width: '256px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${colors.border}`,
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          left: 0,
          top: '64px',
          overflowY: 'auto',
          backgroundColor: colors.white,
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          
          {/* 프로필 영역 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>관리자 페이지</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: colors.border, borderRadius: '9999px' }}></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>admin</div>
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: colors.bgHover,
                  border: `1px solid ${colors.borderDark}`,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: colors.textMuted
                }}>관리자</span>
              </div>
            </div>
          </div>

          {/* 메뉴 리스트 */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 대시보드 */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '8px' }}>대시보드</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                borderRadius: '4px', border: `1px solid ${colors.border}`, cursor: 'pointer'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span style={{ fontSize: '0.875rem' }}>홈</span>
              </div>
            </div>

            {/* 회원 관리 */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '8px' }}>회원 관리</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ padding: '8px', border: `1px solid ${colors.border}`, borderRadius: '4px', fontSize: '0.875rem', color: colors.textSub, cursor: 'pointer' }}>
                  멘토 승인 관리 (요청 기능 N)
                </li>
                <li style={{ padding: '8px', border: `1px solid ${colors.border}`, borderRadius: '4px', fontSize: '0.875rem', color: colors.textSub, cursor: 'pointer' }}>
                  전체 회원 조회 (선택사항)
                </li>
              </ul>
            </div>

            {/* 콘텐츠 관리 */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '8px' }}>콘텐츠 관리</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ padding: '8px', border: `1px solid ${colors.border}`, borderRadius: '4px', fontSize: '0.875rem', color: colors.textSub, cursor: 'pointer' }}>
                  강의 신고 관리 (요청 기능 N)
                </li>
              </ul>
            </div>

            {/* 고객센터 관리 (현재 활성화) */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '8px' }}>고객센터 관리</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 활성화된 상태 */}
                <li style={{
                  padding: '8px',
                  border: `1px solid ${colors.borderDark}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  backgroundColor: colors.bgLight,
                  cursor: 'pointer'
                }}>
                  건의 사항 관리 (요청 기능 N)
                </li>
                <li style={{ padding: '8px', border: `1px solid ${colors.border}`, borderRadius: '4px', fontSize: '0.875rem', color: colors.textSub, cursor: 'pointer' }}>
                  공지 사항 작성
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* 오른쪽 메인 컨텐츠 */}
        <main style={{ flex: 1, marginLeft: '256px', padding: '40px', backgroundColor: colors.white }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>건의 사항 관리 (게시판 형식)</h1>

          {/* 게시판 테이블 영역 */}
          <div style={{
            border: `1px solid ${colors.borderDark}`,
            borderRadius: '8px',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* 테이블 헤더 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 7fr 2fr', // Grid 비율 설정 (NO, 구분, 사유, 건의자)
              gap: '16px',
              borderBottom: `1px solid ${colors.borderDark}`,
              padding: '16px',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              backgroundColor: colors.white,
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <div>NO</div>
              <div>구분</div>
              <div>건의 사유</div>
              <div style={{ textAlign: 'right' }}>건의자</div>
            </div>

            {/* 테이블 바디 (내용 없음) */}
            <div style={{ flex: 1, padding: '24px', color: colors.textSub, fontWeight: 500, fontSize: '1.125rem' }}>
              사용자가 작성한 건의 사항을 나열한 리스트
            </div>

          </div>

          {/* 페이지네이션 */}
          <div style={{ marginTop: '32px', textAlign: 'center', color: '#374151', fontWeight: 'bold' }}>
            페이징 처리
          </div>
        </main>

      </div>
    </div>
  );
}

export default SuggestionsManage;
import React, { useState } from 'react';

/* -------------------------------------------------------------------------- */
/* 아이콘 컴포넌트 (SVG)                           */
/* -------------------------------------------------------------------------- */
const Icons = {
  Home: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  User: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Search: ({ style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
};

/* -------------------------------------------------------------------------- */
/* 스타일 정의 객체                                */
/* -------------------------------------------------------------------------- */
const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  // 헤더 스타일
  header: {
    height: '64px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    backgroundColor: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#f97316', // orange-500
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: '16px',
    height: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    opacity: 0.5,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  nav: {
    display: 'flex',
    gap: '32px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563', // gray-600
  },
  navItem: {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  headerBtnGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  // 버튼 스타일
  btnBase: {
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
  },
  btnPrimary: {
    backgroundColor: '#f97316',
    color: 'white',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    border: '1px solid #f97316',
    color: '#f97316',
  },
  btnWhite: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    color: '#374151',
  },

  // 메인 레이아웃
  container: {
    display: 'flex',
    flex: 1,
  },
  
  // 사이드바
  sidebar: {
    width: '256px',
    borderRight: '1px solid #e5e7eb',
    padding: '24px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  profileSection: {
    marginBottom: '16px',
  },
  profileTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    margin: 0,
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
  },
  profileIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#e5e7eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  },
  badge: {
    fontSize: '12px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    padding: '2px 8px',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    marginLeft: '4px',
  },
  
  // 메뉴 리스트
  menuGroup: {
    marginBottom: '16px',
  },
  menuTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  menuItem: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#374151',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  menuItemActive: { // 홈 버튼용 스타일
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
  },
  disabledText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 'normal',
    marginLeft: '4px',
  },

  // 메인 콘텐츠
  mainContent: {
    flex: 1,
    padding: '40px',
    backgroundColor: '#ffffff',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px',
  },
  contentCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  listItem: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f3f4f6',
  },
  listItemText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#374151',
  },
  pagination: {
    marginTop: '32px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#374151',
  }
};

/* -------------------------------------------------------------------------- */
/* 메인 컴포넌트                                  */
/* -------------------------------------------------------------------------- */

const MentoRequest = () => {
  return (
    <div style={styles.wrapper}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <div style={styles.logoGroup}>
              <div style={styles.logoIcon}>
                  <div style={styles.logoDot}></div>
              </div>
              <span style={styles.logoText}>LinguaConnect</span>
          </div>
        </div>

        {/* 데스크탑 네비게이션 (모바일 숨김 처리는 미디어쿼리 필요하나 인라인 한계로 생략, 기본 flex로 표시) */}
        <nav style={styles.nav}>
          <a href="#" style={styles.navItem}>How it Works</a>
          <a href="#" style={styles.navItem}>Languages</a>
          <a href="#" style={styles.navItem}>Mentors</a>
          <a href="#" style={styles.navItem}>Pricing</a>
        </nav>

        <div style={styles.headerBtnGroup}>
          <button style={{...styles.btnBase, ...styles.btnOutline}}>Sign In</button>
          <button style={{...styles.btnBase, ...styles.btnPrimary}}>Get Started</button>
        </div>
      </header>

      <div style={styles.container}>
        {/* 사이드바 */}
        <aside style={styles.sidebar}>
          {/* 관리자 프로필 영역 */}
          <div style={styles.profileSection}>
            <h2 style={styles.profileTitle}>관리자 페이지</h2>
            <div style={styles.profileCard}>
              <div style={styles.profileIcon}>
                <Icons.User style={{width: 24, height: 24}} />
              </div>
              <div>
                <div style={{fontWeight: 'bold', color: '#1f2937'}}>admin</div>
                <span style={styles.badge}>관리자</span>
              </div>
            </div>
          </div>

          {/* 메뉴 리스트 */}
          <nav style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            {/* 대시보드 */}
            <div style={styles.menuGroup}>
              <h3 style={styles.menuTitle}>대시보드</h3>
              <ul style={styles.menuList}>
                <li style={styles.menuItemActive}>
                  <Icons.Home style={{color: '#374151'}} />
                  <span>홈</span>
                </li>
              </ul>
            </div>

            {/* 회원 관리 */}
            <div style={styles.menuGroup}>
              <h3 style={styles.menuTitle}>회원 관리</h3>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  멘토 승인 관리 <span style={styles.disabledText}>(요청 기능 N)</span>
                </li>
                <li style={styles.menuItem}>
                  전체 회원 조회 <span style={styles.disabledText}>(선택 사항)</span>
                </li>
              </ul>
            </div>

            {/* 콘텐츠 관리 */}
            <div style={styles.menuGroup}>
              <h3 style={styles.menuTitle}>콘텐츠 관리</h3>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  강의 신고 관리 <span style={styles.disabledText}>(요청 기능 N)</span>
                </li>
              </ul>
            </div>

            {/* 고객센터 관리 */}
            <div style={styles.menuGroup}>
              <h3 style={styles.menuTitle}>고객센터 관리</h3>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  건의 사항 관리 <span style={styles.disabledText}>(요청 기능 N)</span>
                </li>
                <li style={styles.menuItem}>
                  공지 사항 작성
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main style={styles.mainContent}>
          <h1 style={styles.pageTitle}>신규 멘토 신청자 (게시판 형식)</h1>

          {/* 리스트 카드 */}
          <div style={styles.contentCard}>
            
            {/* 리스트 헤더 */}
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>신규 멘토 신청자 정보 컬럼들</h2>
            </div>

            {/* 리스트 아이템 (예시) */}
            <div style={styles.listItem}>
              <span style={styles.listItemText}>신규 멘토 신청자의 멘티 정보들</span>
              <button style={{...styles.btnBase, ...styles.btnWhite, fontWeight: 'bold'}}>
                정보 상세보기
              </button>
            </div>
            
             {/* 빈 공간 채우기 */}
             <div style={{flex: 1}}></div>

          </div>

          {/* 페이징 처리 */}
          <div style={styles.pagination}>
            <span>페이징 처리</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentoRequest;
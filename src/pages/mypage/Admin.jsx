import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios 임포트 필요

const Admin = () => {
  // --- 상태 관리 (State) ---
  const [dashboardStats, setDashboardStats] = useState({
    newMentorCount: 0,    // 신규 멘토 신청
    reportedLectureCount: 0, // 신고된 강의
    inquiryCount: 0       // 처리 가능한 건의 사항
  });

  // --- 데이터 가져오기 (API 호출) ---
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // [TODO] 실제 백엔드 API 주소로 변경해주세요.
        // 예: http://localhost:8080/api/admin/dashboard/stats
        const response = await axios.get('/api/admin/dashboard-stats');
        
        // 백엔드 응답 구조에 맞춰 데이터 설정 (예시)
        // response.data가 { newMentor: 5, reported: 2, inquiry: 10 } 형태라고 가정
        setDashboardStats({
          newMentorCount: response.data.newMentorCount || 0,
          reportedLectureCount: response.data.reportedLectureCount || 0,
          inquiryCount: response.data.inquiryCount || 0,
        });

      } catch (error) {
        console.error("관리자 대시보드 데이터를 불러오는데 실패했습니다.", error);
        
        // [테스트용] API가 없을 때 화면 확인을 위한 임시 데이터 (실제 배포 시 삭제)
        setDashboardStats({
          newMentorCount: 12,
          reportedLectureCount: 3,
          inquiryCount: 8
        });
      }
    };

    fetchAdminStats();
  }, []);

  // --- 스타일 정의 (Inline CSS Objects) ---
  const styles = {
    container: {
      fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#333',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 40px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#fff',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '20px',
    },
    logoIcon: {
      color: '#FF6B4A',
      marginRight: '8px',
      fontSize: '24px',
    },
    navLinks: {
      display: 'flex',
      gap: '30px',
      fontSize: '14px',
      color: '#666',
      alignItems: 'center',
    },
    authButtons: {
      display: 'flex',
      gap: '10px',
    },
    btnSignIn: {
      padding: '8px 20px',
      border: '1px solid #FF6B4A',
      color: '#FF6B4A',
      backgroundColor: 'transparent',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: '500',
    },
    btnGetStarted: {
      padding: '8px 20px',
      backgroundColor: '#FF6B4A',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: '500',
    },
    body: {
      display: 'flex',
      flex: 1,
      backgroundColor: '#fff',
    },
    sidebar: {
      width: '260px',
      padding: '20px',
      borderRight: '1px solid #f0f0f0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    profileSection: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#dcdcdc',
      borderRadius: '50%',
      marginRight: '10px',
    },
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    adminName: {
      fontWeight: 'bold',
      fontSize: '14px',
    },
    adminBadge: {
      fontSize: '11px',
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '2px 8px',
      marginTop: '2px',
      textAlign: 'center',
      width: 'fit-content',
    },
    menuGroup: {
      marginBottom: '20px',
    },
    menuLabel: {
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
    },
    menuItem: {
      padding: '10px 15px',
      border: '1px solid #eee',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    activeMenuItem: {
      padding: '10px 15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    mainContent: {
      flex: 1,
      padding: '40px',
      backgroundColor: '#fff',
    },
    dashboardBoxLarge: {
      height: '300px',
      border: '1px solid #eee',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '30px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
    },
    statTextMain: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    statTextSub: {
      fontSize: '18px',
      fontWeight: 'normal',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
    },
    statCard: {
      height: '150px',
      border: '1px solid #eee',
      borderRadius: '15px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      backgroundColor: '#fff',
      boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
    },
  };

  return (
    <div style={styles.container}>
      {/* --- Header --- */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <span style={styles.logoIcon}>☁️</span>
          LinguaConnect
        </div>
        <nav style={styles.navLinks}>
          <span>How it Works</span>
          <span>Languages</span>
          <span>Mentors</span>
          <span>Pricing</span>
        </nav>
        <div style={styles.authButtons}>
          <button style={styles.btnSignIn}>Sign In</button>
          <button style={styles.btnGetStarted}>Get Started</button>
        </div>
      </header>

      {/* --- Body Area --- */}
      <div style={styles.body}>
        
        {/* --- Sidebar --- */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>관리자 페이지</div>
          
          <div style={styles.profileSection}>
            <div style={styles.avatar}></div>
            <div style={styles.profileInfo}>
              <span style={styles.adminName}>admin</span>
              <span style={styles.adminBadge}>관리자</span>
            </div>
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuLabel}>대시보드</div>
            <div style={styles.activeMenuItem}>
              <span style={{ marginRight: '8px' }}>🏠</span> 홈
            </div>
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuLabel}>회원 관리</div>
            <div style={styles.menuItem}>멘토 승인 관리 (요청 기능 N)</div>
            <div style={styles.menuItem}>전체 회원 조회 (선택 사항)</div>
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuLabel}>콘텐츠 관리</div>
            <div style={styles.menuItem}>강의 신고 관리 (요청 기능 N)</div>
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuLabel}>고객센터 관리</div>
            <div style={styles.menuItem}>건의 사항 관리 (요청 기능 N)</div>
            <div style={styles.menuItem}>공지 사항 작성</div>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main style={styles.mainContent}>
          <div style={styles.dashboardBoxLarge}>
            <div style={styles.statTextMain}>총 통계 및 오늘의 통계</div>
            <div style={styles.statTextSub}>(2차 구현 기능)</div>
          </div>

          {/* 하단 카드 그리드 (데이터 바인딩 적용) */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              신규 멘토 신청 : {dashboardStats.newMentorCount}건
            </div>
            <div style={styles.statCard}>
              신고된 강의 : {dashboardStats.reportedLectureCount}건
            </div>
            <div style={styles.statCard}>
              <div style={{ textAlign: 'center' }}>
                처리 가능한<br/>건의 사항 : {dashboardStats.inquiryCount}건
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Admin;
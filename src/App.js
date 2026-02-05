import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import Login from './pages/member/Login';
import MyPage from './pages/mypage/MyPage';
import MyPageGate from './pages/mypage/MyPageGate';

// 강의
import LectureList from './pages/lecture/LectureList';
import LectureDetail from './pages/lecture/LectureDetail';
import LectureRealtime from './pages/realtime/LectureRealtime';

// 회원가입
import Join from './pages/member/join/JoinMain';
import Create from './pages/lecture/mento/Create';

// 실시간 강의
import LectureRealtimeMentee from "./pages/realtime/LectureRealtimeMentee";
import LectureRealtimeMentor from "./pages/realtime/LectureRealtimeMentor";

// 강의 상세정보
import SuccessPage from "./pages/lecture/detail/SuccessPage";
import FailPage from "./pages/lecture/detail/FailPage";

// 관리자
import Admin from './pages/mypage/Admin';
import AdminHome from './pages/mypage/admin/AdminHome';
import MentoRequest from './pages/mypage/admin/MentoRequest';
import LectureReport from './pages/mypage/admin/LectureReport'; 
import SuggestionsManage from './pages/mypage/admin/SuggestionsManage';
import SuggestionDetail from './pages/mypage/admin/SuggestionDetail'; 
import NotificationManage from './pages/mypage/admin/NotificationManage';
import NotificationWrite from './pages/mypage/admin/NotificationWrite'; 
import NotificationDetail from './pages/mypage/admin/NotificationDetail';
import NotificationEdit from './pages/mypage/admin/NotificationEdit'; 
import MemberManage from './pages/mypage/admin/MemberManage';

// 멘티
import Mentee from './pages/mypage/Mentee';
import MenteeHome from './pages/mypage/mentee/MenteeHome';

// 멘토
import Mento from './pages/mypage/Mento';
import MentoHome from './pages/mypage/mento/MentoHome';
import MentoManagement from './pages/mypage/mento/MentoManagement';

// 멘토 멘티 공용
import Profile from './pages/mypage/public/Profile';
import Classes from './pages/mypage/public/Classes';
import Payments from './pages/mypage/public/Payments';

// 보안 기능
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleGuard from './auth/RoleGuard';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 메인 레이아웃을 사용하는 페이지 */}
          <Route element={<MainLayout/>}>

            {/* 메인 페이지 */}
            <Route path='/' element={<MainPage/>}/>

            {/* 결제 */}
            <Route path="/payment/success" element={<SuccessPage />} />
            <Route path="/payment/fail" element={<FailPage />} />

            {/* 회원가입 */}
            <Route path='/join' element={<Join/>}/>

            {/* 로그인 */}
            <Route path='/login' element={<Login/>}/>

            {/* 강의 목록 */}
            <Route path='/lecture' element={<LectureList/>}/>
            <Route path='/lecture/detail/:id' element={<LectureDetail/>}/>
            
            {/* 로그인 필수 영역 */}
            <Route element={<ProtectedRoute />}>
              {/* 마이페이지 */}
              <Route path='/mypage' element={<MyPage/>}>
                <Route index element={<MyPageGate/>}/>

                {/* 멘티 */}
                <Route element={<RoleGuard allow={["ROLE_MENTEE"]} fallback="/"/>}>
                  <Route path="mentee" element={<Mentee />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<MenteeHome />} />
                    <Route path="classes" element={<Classes />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="payments" element={<Payments />} />
                  </Route>
                </Route>

                {/* 멘토 */}
                <Route element={<RoleGuard allow={["ROLE_MENTOR"]} fallback="/"/>}>
                  <Route path="mento" element={<Mento />}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<MentoHome />} />
                    <Route path="classes" element={<Classes />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="management" element={<MentoManagement />} />
                  </Route>
                </Route>

                {/* 관리자 */}
                <Route element={<RoleGuard allow={["ROLE_ADMIN"]} fallback="/"/>}>
                  <Route path="admin" element={<Admin/>}>
                    <Route index element={<Navigate to="home" replace/>}/>
                    <Route path="home" element={<AdminHome/>}/>

                    <Route path='mentorequests' element={<MentoRequest/>}/>
                    <Route path='leturereport' element={<LectureReport/>}/>

                    <Route path='membermanage' element={<MemberManage/>}/>

                    <Route path='suggestonsmanage' element={<SuggestionsManage/>}/>
                    <Route path='suggestonsmanage/:sgId' element={<SuggestionDetail/>}/>

                    <Route path='notification' element={<NotificationManage/>}/>
                    <Route path="notificationwrite" element={<NotificationWrite />}/>
                    <Route path="notification/:ntId" element={<NotificationDetail />}/>
                    <Route path="notification/edit/:ntId" element={<NotificationEdit />}/>
                  </Route>
                </Route>
              </Route>

              <Route element={<RoleGuard allow={["ROLE_MENTEE"]} fallback="/"/>}>
                <Route path="/mentee/lecture/:uuid" element={<LectureRealtimeMentee />} />
              </Route>

              <Route element={<RoleGuard allow={["ROLE_MENTOR"]} fallback="/"/>}>
                <Route path='/lecture/create' element={<Create/>}/>
              </Route>

              {/* 멘토 및 관리자 */}
              <Route element={<RoleGuard allow={["ROLE_MENTO", "ROLE_ADMIN"]} fallback="/"/>}>
                <Route path="/mentor/lecture/:uuid" element={<LectureRealtimeMentor />} />
              </Route>
              
              {/* 실시간 강의 */}
              <Route path='/lecture/realtime' element={<LectureRealtime/>}/>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
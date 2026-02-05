import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import Login from './pages/member/Login';
import MyPage from './pages/mypage/MyPage';

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

import MenteeLayout from './pages/mypage/Mentee';
import MentoLayout from './pages/mypage/Mento';

// 관리자
import MentoRequest from './pages/mypage/admin/MentoRequest';
import LectureReport from './pages/mypage/admin/LectureReport'; 
import SuggestionsManage from './pages/mypage/admin/SuggestionsManage';
import SuggestionDetail from './pages/mypage/admin/SuggestionDetail'; 
import Notification from './pages/mypage/admin/Notification';
import NotificationWrite from './pages/mypage/admin/NotificationWrite'; 
import NotificationDetail from './pages/mypage/admin/NotificationDetail';
import NotificationEdit from './pages/mypage/admin/NotificationEdit'; 
import MemberManage from './pages/mypage/admin/MemberManage';


// 보안 기능
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

// 디버그
import DebugLivePage from './_debug/DebugLivePage';
import DebugCreatePage from './_debug/DebugCreatePage';
import RoleGuard from './auth/RoleGuard';
import MenteeHome from './pages/mypage/mentee/MenteeHome';
import MenteeClasses from './pages/mypage/mentee/MenteeClasses';
import MenteeProfile from './pages/mypage/mentee/MenteeProfile';
import MenteePayment from './pages/mypage/mentee/MenteePayments';
import MentoHome from './pages/mypage/mento/MentoHome';
import MentoClasses from './pages/mypage/mento/MentoClasses';
import MentoManagement from './pages/mypage/mento/MentoManagement';
import MentoProfile from './pages/mypage/mento/MentoProfile';
import MentoPayment from './pages/mypage/mento/MentoPayments';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 메인 레이아웃을 사용하는 페이지 */}
          <Route element={<MainLayout/>}>

            {/* 메인 페이지 */}
            <Route path='/' element={<MainPage/>}/>

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
              <Route path='/mypage' element={<MyPage/>}/>

              {/* 멘티만 접속 가능 */}
              <Route element={<RoleGuard allow={["ROLE_MENTEE"]} fallback="/"/>}>
                {/* 멘티 페이지 */}
                <Route path="/mentee" element={<MenteeLayout />}>
                  <Route index element={<Navigate to="home" replace />} />
                  <Route path="home" element={<MenteeHome />} />
                  <Route path="classes" element={<MenteeClasses />} />
                  <Route path="profile" element={<MenteeProfile />} />
                  <Route path="payments" element={<MenteePayment />} />
                </Route>

                {/* 멘티 강의페이지 */}
                <Route path="/mentee/lecture/:uuid" element={<LectureRealtimeMentee />} />
              </Route>

              {/* 멘토만 접속 가능 */}
              <Route element={<RoleGuard allow={["ROLE_MENTO"]} fallback="/"/>}>
                {/* 멘토 페이지 */}
                <Route path="/mento/*" element={<MentoLayout />}>
                  <Route index element={<Navigate to="home" replace />} />
                  <Route path="home" element={<MentoHome />} />
                  <Route path="classes" element={<MentoClasses />} />
                  <Route path="management" element={<MentoManagement />} />
                  <Route path="profile" element={<MentoProfile />} />
                  <Route path="payments" element={<MentoPayment />} />
                </Route>

                {/* 강의 생성 (멘토) */}
                <Route path='/lecture/create' element={<Create/>}/>
              </Route>

              {/* 관리자만 접속 가능 */}
              <Route element={<RoleGuard allow={["ROLE_ADMIN"]} fallback="/"/>}>
                {/* 관리자 페이지 */}
                <Route path='/mypage/mentorequests' element={<MentoRequest/>}/>
                <Route path='/mypage/leturereport' element={<LectureReport/>}/>

                {/* 회원 관리 라우트 */}
                <Route path='/mypage/membermanage' element={<MemberManage/>}/>

                {/* 건의사항 관리 라우트 */}
                <Route path='/mypage/suggestonsmanage' element={<SuggestionsManage/>}/>
                <Route path='/mypage/suggestonsmanage/:sgId' element={<SuggestionDetail/>}/>
              </Route>

              {/* 멘토 및 관리자 */}
              <Route element={<RoleGuard allow={["ROLE_MENTO", "ROLE_ADMIN"]} fallback="/"/>}>
                <Route path="/mentor/lecture/:uuid" element={<LectureRealtimeMentor />} />
              </Route>
              
              <Route path='/lecture/realtime' element={<LectureRealtime/>}/>

              {/* 공지사항 라우트 */}
              <Route path='/mypage/notification' element={<Notification/>}/>
              <Route path="/mypage/notificationwrite" element={<NotificationWrite />}/>
              <Route path="/mypage/notification/:ntId" element={<NotificationDetail />}/>
              <Route path="/mypage/notification/edit/:ntId" element={<NotificationEdit />}/>
            </Route>
            
            {/* 디버그 전용 페이지 */}
            <Route path='/debug/create' element={<DebugCreatePage/>}/>
            <Route path='/debug/live/:id' element={<DebugLivePage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
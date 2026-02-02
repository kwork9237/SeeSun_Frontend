import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import Login from './pages/member/Login';
import MyPage from './pages/mypage/MyPage';

// 강의
import LectureList from './pages/lecture/LectureList';
import LectureDetail from './pages/lecture/LectureDetail';
import LectureRealtime from './pages/realtime/LectureRealtime';
import WebRTCTest from './pages/realtime/MentorRoom'

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
import DebugLivePage from './_debug/DebugLivePage';
import DebugCreatePage from './_debug/DebugCreatePage';

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

            {/* 마이페이지 */}
            <Route path='/mypage' element={<MyPage/>}/>

            {/* 강의 목록 */}
            <Route path='/lecture' element={<LectureList/>}/>
            <Route path='/lecture/detail/:id' element={<LectureDetail/>}/>
            
            {/* 강의 생성 (멘토) */}
            <Route path='/lecture/create' element={<Create/>}/>

            {/* 멘티 페이지 */}
            <Route path="/mentee/*" element={<MenteeLayout />}/>
            
            {/* 멘토 페이지 */}
            <Route path="/mento/*" element={<MentoLayout />}/>

            {/* 강의 실시간(WebRTC 테스트) */}
            <Route path='/lecture/realtime' element={<LectureRealtime/>}/>
            <Route path="/mentor/lecture/:lectureId" element={<LectureRealtimeMentor />} />
            <Route path="/mentee/lecture/:lectureId" element={<LectureRealtimeMentee />} />
            <Route path='/webrtctest' element={<WebRTCTest/>}/>

            {/* 관리자 페이지 */}
            <Route path='/mypage/mentorequests' element={<MentoRequest/>}/>
            <Route path='/mypage/leturereport' element={<LectureReport/>}/>

            {/* 회원 관리 라우트 */}
            <Route path='/mypage/membermanage' element={<MemberManage/>}/>
          

            {/* 건의사항 관리 라우트 */}
            <Route path='/mypage/suggestonsmanage' element={<SuggestionsManage/>}/>
            <Route path='/mypage/suggestonsmanage/:sgId' element={<SuggestionDetail/>}/>
            
            
            {/* 공지사항 라우트 */}
            <Route path='/mypage/notification' element={<Notification/>}/>
            <Route path="/mypage/notificationwrite" element={<NotificationWrite />}/>
            <Route path="/mypage/notification/:ntId" element={<NotificationDetail />}/>
            <Route path="/mypage/notification/edit/:ntId" element={<NotificationEdit />}/>

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
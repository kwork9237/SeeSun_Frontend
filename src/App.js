import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import Login from './pages/member/Login';
import MyPage from './pages/mypage/MyPage';

// 강의
import LectureList from './pages/lecture/LectureList';
import LectureDetail from './pages/lecture/LectureDetail';
import LectureRealtime from './pages/lecture/LectureRealtime';
import WebRTCTest from './pages/lecture/MentorRoom';

// 회원가입
import Join from './pages/member/join/JoinMain';
import Create from './pages/lecture/mento/Create';

// 실시간 강의
import LectureRealtimeMentee from "./pages/lecture/LectureRealtimeMentee";
import LectureRealtimeMentor from "./pages/lecture/LectureRealtimeMentor";

// 강의 상세정보
import SuccessPage from "./pages/lecture/detail/SuccessPage";
import FailPage from "./pages/lecture/detail/FailPage";

// 멘티 페이지들
import MenteeLayout from './pages/mypage/Mentee';
import MenteeHome from './pages/mypage/mentee/MenteeHome';
import MenteeClasses from './pages/mypage/mentee/MenteeClasses';
import MenteeProfile from './pages/mypage/mentee/MenteeProfile';
import MenteePayments from './pages/mypage/mentee/MenteePayments';

// 멘토 페이지들
import MentoLayout from './pages/mypage/Mento';
import MentoHome from './pages/mypage/mento/MentoHome';
import MentoClasses from './pages/mypage/mento/MentoClasses';
import MentoProfile from './pages/mypage/mento/MentoProfile';
import MentoPayments from './pages/mypage/mento/MentoPayments';
import MentoManagement from './pages/mypage/mento/MentoManagement'; 

// 관리자
import MentoRequest from './pages/mypage/admin/MentoRequest';
import LectureReport from './pages/mypage/admin/LectureReport'; 
import SuggestionsManage from './pages/mypage/admin/SuggestionsManage'; 
import Notification from './pages/mypage/admin/Notification';
import NotificationWrite from './pages/mypage/admin/NotificationWrite'; 
import NotificationDetail from './pages/mypage/admin/NotificationDetail';
 import NotificationEdit from './pages/mypage/admin/NotificationEdit'; // [추가] 수정 페이지 Import
 
function App() {
  return (
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

          {/* 멘티 라우트 */}
          <Route path="/mentee" element={<MenteeLayout />}>
            <Route index element={<MenteeHome />} />
            <Route path="home" element={<MenteeHome />} />      
            <Route path="classes" element={<MenteeClasses />} /> 
            <Route path="profile" element={<MenteeProfile />} /> 
            <Route path="payments" element={<MenteePayments />} /> 
          </Route>

          {/* 멘토 라우트 */}
          <Route path="/mento" element={<MentoLayout />}>
            <Route index element={<MentoHome />} />
            <Route path="Mthome" element={<MentoHome />} />      
            <Route path="Mtclasses" element={<MentoClasses />} /> 
            <Route path="Mtmanagement" element={<MentoManagement />} />
            <Route path="Mtprofile" element={<MentoProfile />} /> 
            <Route path="Mtpayments" element={<MentoPayments />} /> 
          </Route>

          {/* 강의 실시간(WebRTC 테스트) */}
          <Route path='/lecture/realtime' element={<LectureRealtime/>}/>
          <Route path="/mentor/lecture/:lectureId" element={<LectureRealtimeMentor />} />
          <Route path="/mentee/lecture/:lectureId" element={<LectureRealtimeMentee />} />
          <Route path='/webrtctest' element={<WebRTCTest/>}/>

          {/* 관리자 페이지 */}
          <Route path='/mypage/mentorequests' element={<MentoRequest/>}/>
          <Route path='/mypage/lecturereport' element={<LectureReport/>}/>
          <Route path='/mypage/suggestionsmanage' element={<SuggestionsManage/>}/>
          <Route path='/mypage/notification' element={<Notification/>}/>
          <Route path="/mypage/notificationwrite" element={<NotificationWrite />}/>
          <Route path="/mypage/notification/:ntId" element={<NotificationDetail />}/>
        <Route path="/mypage/notification/edit/:ntId" element={<NotificationEdit />}/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
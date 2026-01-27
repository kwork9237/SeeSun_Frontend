import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import Login from './pages/member/Login';
import MyPage from './pages/mypage/MyPage';

// 강의
import LectureList from './pages/lecture/LectureList';
import LectureDetail from './pages/lecture/LectureDetail';

// 회원가입
import Join from './pages/member/Join';
import Mento from './pages/member/JoinDetail/Mento';
import Mentee from './pages/member/JoinDetail/Mentee';
import Create from './pages/lecture/mento/Create';

// 관리자
import Admin from './pages/mypage/Admin';
import MentoRequest from './pages/mypage/admin/MentoRequest';
import LectureReport from './pages/mypage/admin/LectureReport';
import SuggestionsManage from './pages/mypage/admin/SuggestionsManage'; 
import Notification from './pages/mypage/admin/Notification';
import NotificationWrite from './pages/mypage/admin/NotificationWrite';  

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 메인 레이아웃을 사용하는 페이지 */}
        <Route element={<MainLayout/>}>

          {/* 메인 페이지 */}
          <Route path='/' element={<MainPage/>}/>

          {/* 회원가입 */}
          <Route path='/join' element={<Join/>}/>
          <Route path='/join/Mento' element={<Mento/>}/>
          <Route path='/join/Mentee' element={<Mentee/>}/>

          {/* 로그인 */}
          <Route path='/Login' element={<Login/>}/>

          {/* 마이페이지 */}
          <Route path='/mypage' element={<MyPage/>}/>

          {/* 강의 목록 */}
          <Route path='/lecture' element={<LectureList/>}/>
          <Route path='/lectre/detail/:id' element={<LectureDetail/>}/>
          
          {/* 강의 생성 (멘토) */}
          <Route path='/lecture/create' element={<Create/>}/>

          {/* 관리자 페이지 */}
          <Route path='/mypage/mentorequests' element={<MentoRequest/>}/>
          <Route path='/mypage/leturereport' element={<LectureReport/>}/>
          <Route path='/mypage/suggestonsmanage' element={<SuggestionsManage/>}/>
          <Route path='/mypage/notification' element={<Notification/>}/>
          <Route path="/mypage/notificationwrite" element={<NotificationWrite />}/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

import PaymentButton from "./pages/PaymentButton";
import SuccessPage from "./pages/SuccessPage";

import MenteeLayout from './pages/mypage/Mentee';

// 멘티 페이지들
import MenteeHome from './pages/mypage/mentee/MenteeHome';
import MenteeClasses from './pages/mypage/mentee/MenteeClasses';
import MenteeProfile from './pages/mypage/mentee/MenteeProfile';
import MenteePayments from './pages/mypage/mentee/MenteePayments';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 메인 레이아웃을 사용하는 페이지 */}
        <Route element={<MainLayout/>}>

          {/* 메인 페이지 */}
          <Route path='/' element={<MainPage/>}/>

          <Route path="/payment/test" element={<PaymentButton memberId={3} lectureId={2} price={10000} />} />
          <Route path="/success" element={<SuccessPage />} />

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

          <Route path="/mentee" element={<MenteeLayout />}>
          
          {/* 1. /mentee 로 그냥 들어오면 -> /mentee/home 으로 납치(리다이렉트) */}
          <Route index element={<Navigate to="home" replace />} />
          
          {/* 2. 각 메뉴별 페이지 갈아 끼우기 */}
          <Route path="home" element={<MenteeHome />} />      
          <Route path="classes" element={<MenteeClasses />} /> 
          <Route path="profile" element={<MenteeProfile />} /> 
          <Route path="payments" element={<MenteePayments />} /> 

          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

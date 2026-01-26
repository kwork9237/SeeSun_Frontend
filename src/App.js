import './App.css';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import Login from './pages/member/Login';
import MyPage from './pages/mypage/MyPage';

// 강의
import LectureList from './pages/lecture/LectureList';
import LectureDetail from './pages/lecture/LectureDetail';

// 회원가입
import Join from './pages/member/join/JoinMain';
// import Mento from './pages/member/JoinDetail/Mento';
// import Mentee from './pages/member/JoinDetail/Mentee';
import Create from './pages/lecture/mento/Create';

import SuccessPage from "./pages/lecture/detail/SuccessPage";
import FailPage from "./pages/lecture/detail/FailPage";

import MenteeLayout from './pages/mypage/Mentee';

// 멘티 페이지들
import MenteeHome from './pages/mypage/mentee/MenteeHome';
import MenteeClasses from './pages/mypage/mentee/MenteeClasses';
import MenteeProfile from './pages/mypage/mentee/MenteeProfile';
import MenteePayments from './pages/mypage/mentee/MenteePayments';

import MentoLayout from './pages/mypage/Mento';

// 멘토 페이지들
import MentoHome from './pages/mypage/mento/MentoHome';
import MentoClasses from './pages/mypage/mento/MentoClasses';
import MentoProfile from './pages/mypage/mento/MentoProfile';
import MentoPayments from './pages/mypage/mento/MentoPayments';
import MentoManagement from  './pages/mypage/mento/MentoManagement';

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
          {/* <Route path='/join/Mento' element={<Mento/>}/>
          <Route path='/join/Mentee' element={<Mentee/>}/> */}

          {/* 로그인 */}
          <Route path='/Login' element={<Login/>}/>

          {/* 마이페이지 */}
          <Route path='/MyPage' element={<MyPage/>}/>

          {/* 강의 목록 */}
          <Route path='/lecture' element={<LectureList/>}/>
          <Route path='/lecture/detail/:id' element={<LectureDetail/>}/>
          
          {/* 강의 생성 (멘토) */}
          <Route path='/lecture/create' element={<Create/>}/>

          <Route path="/mentee" element={<MenteeLayout />}>
            {/* 1. /mentee 로 그냥 들어오면 -> /mentee/home 으로 납치(리다이렉트) */}
            <Route index element={<MenteeHome />} />
            
            {/* 2. 각 메뉴별 페이지 갈아 끼우기 */}
            <Route path="home" element={<MenteeHome />} />      
            <Route path="classes" element={<MenteeClasses />} /> 
            <Route path="profile" element={<MenteeProfile />} /> 
            <Route path="payments" element={<MenteePayments />} /> 
          </Route>

          <Route path="/mento" element={<MentoLayout />}>
            {/* 1. /mento 로 그냥 들어오면 -> /mento/home 으로 납치(리다이렉트) */}
            <Route index element={<MentoHome />} />
            
            {/* 2. 각 메뉴별 페이지 갈아 끼우기 */}
            <Route path="Mthome" element={<MentoHome />} />      
            <Route path="Mtclasses" element={<MentoClasses />} /> 
            <Route path="Mtmanagement" element={<MentoManagement />} />
            <Route path="Mtprofile" element={<MentoProfile />} /> 
            <Route path="Mtpayments" element={<MentoPayments />} /> 
        </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

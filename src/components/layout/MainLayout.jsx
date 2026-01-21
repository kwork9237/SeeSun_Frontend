import { Outlet, useLocation } from "react-router-dom";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";
import SimpleFooter from "./SimpleFooter";

const MainLayout = () => {
    const location = useLocation(); // 현재 경로 정보를 가져옵니다.

    // SimpleFooter를 보여줄 경로들의 목록을 정의합니다.
    // 예: 마이페이지, 로그인, 회원가입 등
    const simpleFooterPaths = ['/MyPage', '/Login', '/Join'];

    // 현재 경로가 simpleFooterPaths 중 하나로 시작하는지 확인합니다.
    // startsWith를 사용하면 '/MyPage/Edit' 같은 하위 경로도 포함됩니다.
    const showSimpleFooter = simpleFooterPaths.some(path => 
        location.pathname.startsWith(path)
    );

    return (
        <div className="flex flex-col min-h-screen"> 
            {/* min-h-screen과 flex-col을 주면 컨텐츠가 짧아도 푸터가 바닥에 붙게 하기 좋습니다 */}
            
            {/* 메인 헤더 */}
            <MainHeader/>

            {/* 페이지 항목 출력 (flex-1을 주면 남은 공간을 차지합니다) */}
            <main className="flex-1">
                <Outlet/>
            </main>

            {/* 조건부 푸터 렌더링 */}
            {showSimpleFooter ? <SimpleFooter /> : <MainFooter />}
        </div>
    );
}

export default MainLayout;
import { Outlet } from "react-router-dom";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";

const MainLayout = () => {
    // 주요 레이아웃 출력입니다.

    return (
        <div>
            {/* 메인 헤더 */}
            <MainHeader/>

            {/* 페이지 항목 출력 */}
            <Outlet/>

            {/* 메인 푸터 */}
            <MainFooter/>
        </div>
    );
}

export default MainLayout;
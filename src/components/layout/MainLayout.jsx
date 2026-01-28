import { Outlet, useLocation } from "react-router-dom";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";
import SimpleFooter from "./SimpleFooter";

const MainLayout = () => {
    const location = useLocation();

    // ▼ 실시간 강의 페이지 판별
    const isRealtimePage = location.pathname.startsWith("/realtime");

    // ▼ SimpleFooter를 사용할 경로
    const simpleFooterPaths = ["/MyPage", "/Login", "/Join"];
    const showSimpleFooter = simpleFooterPaths.some((path) =>
        location.pathname.startsWith(path)
    );

    return (
        <div className="flex flex-col min-h-screen">

            {/* ▼ 실시간 강의 페이지에서는 헤더 숨기기 */}
            {!isRealtimePage && <MainHeader />}

            {/* 메인 영역 */}
            <main className={`flex-1 ${isRealtimePage ? "mt-0" : ""}`}>
                <Outlet />
            </main>

            {/* ▼ 실시간 강의 페이지에서는 푸터도 숨김 */}
            {!isRealtimePage &&
                (showSimpleFooter ? <SimpleFooter /> : <MainFooter />)}
        </div>
    );
};

export default MainLayout;

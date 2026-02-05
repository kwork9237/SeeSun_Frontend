import { Outlet, useLocation } from "react-router-dom";
import MainFooter from "./MainFooter";
import MainHeader from "./MainHeader";
import SimpleFooter from "./SimpleFooter";

const MainLayout = () => {
  const location = useLocation();

  // ▼ SimpleFooter를 사용할 경로
  const simpleFooterPaths = ["/mypage", "/login", "/join", "/mento", "/mentee"];
  const showSimpleFooter = simpleFooterPaths.some((path) => location.pathname.startsWith(path));

  // ▼ 실시간 강의 페이지 판별
  const isRealtimePage = location.pathname.startsWith("/realtime");

  return (
    <div className="flex flex-col min-h-screen">
      {/* ▼ 실시간 강의 페이지에서는 헤더 숨기기 */}
      {!isRealtimePage && <MainHeader />}

      {/* 페이지 항목 출력 (flex-1을 주면 남은 공간을 차지합니다) */}
      {/* 26 02 01 상단 헤더 묻힘 현상 수정 */}
      <main className={`flex-1 ${isRealtimePage ? "mt-0" : "pt-16"}`}>
        <Outlet />
      </main>

      {/* ▼ 실시간 강의 페이지에서는 푸터도 숨김 */}
      {!isRealtimePage && (showSimpleFooter ? <SimpleFooter /> : <MainFooter />)}
    </div>
  );
};

export default MainLayout;

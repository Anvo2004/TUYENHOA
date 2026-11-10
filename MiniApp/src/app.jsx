import React, { useEffect } from "react";
import { Route, useNavigate } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes } from "zmp-ui";
import Layout from "./components/layout.jsx";
import HomePage from "./pages/home.jsx";
import NewsPage from "./pages/news.jsx";
import ServicesPage from "./pages/services.jsx";
import AssistantPage from "./pages/assistant.jsx";
import IdeasPage from "./pages/ideas.jsx";
import ContactPage from "./pages/contact.jsx";
import ReportFormPage from "./pages/report-form.jsx";
import MyReportsPage from "./pages/phan-anh-cua-toi.jsx";
import TraCuuHoSoPage from "./pages/tra-cuu-ho-so.jsx";
import ThuTucHanhChinhPage from "./pages/thu-tuc-hanh-chinh.jsx";
import VanBanPage from "./pages/van-ban.jsx";
import LichCupDienPage from "./pages/lich-cup-dien.jsx";
import LichYTePage from "./pages/lich-y-te.jsx";
import ThongBaoPage from "./pages/thong-bao.jsx";
import PhongChongThienTaiPage from "./pages/phong-chong-thien-tai.jsx";
import PcttKyNangPage from "./pages/pctt-ky-nang.jsx";
import PcttKyNangChiTietPage from "./pages/pctt-ky-nang-chi-tiet.jsx";
import DanSoPage from "./pages/dan-so.jsx";
import ThonXomPage from "./pages/thon-xom.jsx";
import VanHoaPage from "./pages/van-hoa.jsx";
import DuLichPage from "./pages/du-lich.jsx";
import ThongTinUngDungPage from "./pages/thong-tin-ung-dung.jsx";
import CongDanPage from "./pages/cong-dan.jsx";
import TichDiemPage from "./pages/tich-diem.jsx";
import CongDuLieuPage from "./pages/cong-du-lieu.jsx";
import { captureReferral } from "./data/citizen.js";

// Mini App mở từ link chia sẻ "/?ref=MÃ" — nhớ mã ngay lúc khởi động, trước khi
// router nuốt tham số, để áp dụng khi người dùng đăng ký ở tab Công dân.
captureReferral();

// Chỉ khi chạy `vite dev`: mở thẳng 1 trang bằng "?route=/lich-cup-dien" (router
// chạy trong bộ nhớ nên URL không tự dẫn tới trang con) — tiện xem/chụp từng màn.
const DevRoute = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const route = new URLSearchParams(window.location.search).get("route");
    if (route && route !== "/") navigate(route, { replace: true });
  }, []);
  return null;
};

const MyApp = () => {
  return (
    <App>
      {/*
        memoryRouter avoids zmp-ui's ZMPRouter hardcoded basename (`/zapps/{appId}`
        in prod, or when the `?env=` query param is present). Zalo's dev tooling
        (CLI device mode, VSCode extension Simulator) navigates to the page's
        root path while still appending `?env=DEVELOPMENT`, which triggers that
        basename check without the real URL ever matching it -> blank page with
        no console error. Routing in-memory sidesteps browser-URL matching
        entirely. Tradeoff: sub-page URLs on the standalone web mirror
        (tuyenhoa.dxvtech.vn) are no longer deep-linkable/refreshable.
      */}
      <ZMPRouter memoryRouter>
        {import.meta.env.DEV && <DevRoute />}
        <Layout>
          <AnimationRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tin-tuc" element={<NewsPage />} />
            <Route path="/dich-vu" element={<ServicesPage />} />
            <Route path="/tro-ly-so" element={<AssistantPage />} />
            <Route path="/hien-ke" element={<IdeasPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/phan-anh" element={<ReportFormPage />} />
            <Route path="/phan-anh-cua-toi" element={<MyReportsPage />} />
            <Route path="/tra-cuu-ho-so" element={<TraCuuHoSoPage />} />
            <Route path="/thu-tuc-hanh-chinh" element={<ThuTucHanhChinhPage />} />
            <Route path="/van-ban" element={<VanBanPage />} />
            <Route path="/lich-cup-dien" element={<LichCupDienPage />} />
            <Route path="/lich-y-te" element={<LichYTePage />} />
            <Route path="/thong-bao" element={<ThongBaoPage />} />
            <Route path="/phong-chong-thien-tai" element={<PhongChongThienTaiPage />} />
            <Route path="/pctt-ky-nang" element={<PcttKyNangPage />} />
            <Route path="/pctt-ky-nang/:id" element={<PcttKyNangChiTietPage />} />
            <Route path="/dan-so" element={<DanSoPage />} />
            <Route path="/thon-xom" element={<ThonXomPage />} />
            <Route path="/van-hoa" element={<VanHoaPage />} />
            <Route path="/du-lich" element={<DuLichPage />} />
            <Route path="/thong-tin-ung-dung" element={<ThongTinUngDungPage />} />
            <Route path="/cong-dan" element={<CongDanPage />} />
            <Route path="/tich-diem" element={<TichDiemPage />} />
            <Route path="/cong-du-lieu" element={<CongDuLieuPage />} />
          </AnimationRoutes>
        </Layout>
      </ZMPRouter>
    </App>
  );
};

export default MyApp;

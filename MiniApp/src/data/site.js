// Thông tin thương hiệu tĩnh (tên app, khẩu hiệu) — hiếm khi đổi nên để trong
// code. Số liệu dân số, thông báo, và thông tin liên hệ đã chuyển sang
// MongoDB (xem pages/home.jsx, pages/contact.jsx — gọi /api/public/dan-so,
// /thong-bao, /site-info).
const SITE = {
  appName: "Tuyên Hóa Số",
  shortName: "Tuyên Hóa Số",
  province: "Tỉnh Quảng Trị",
  badge: "Chính quyền số gần dân",
  heroCaption: "Xã Tuyên Hóa",
  office: "UBND xã Tuyên Hóa",
  // Theo bộ giao diện TuyenHoaSo-XanhDuong (thẻ đầu Trang chủ).
  slogan: "Tuyên Hóa – khát vọng vươn lên",
  mergedFrom: ["Tiến Hóa", "Châu Hóa", "Cao Quảng", "Văn Hóa"],
};

export default SITE;

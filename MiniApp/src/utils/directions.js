import { openOutApp } from "zmp-sdk/apis";

// Nút "Chỉ đường" tới một địa điểm (màn Di tích). Mở Google Maps BÊN NGOÀI Zalo
// (openOutApp → app bản đồ / trình duyệt của máy) chứ không mở webview trong
// Mini App — openWebview chỉ dùng cho trang .gov.vn (quy định kiểm duyệt, xem
// utils/linkPolicy.js phía Backend). Có toạ độ thì dẫn đúng điểm; không có thì
// tìm theo tên + địa chỉ.
export function directionsUrl({ lat, lng, ten, diaChi }) {
  const dest =
    lat != null && lng != null && lat !== "" && lng !== ""
      ? `${lat},${lng}`
      : [ten, diaChi].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

export function openDirections(place) {
  const url = directionsUrl(place);
  try {
    openOutApp({ url }).catch(() => window.open(url, "_blank"));
  } catch {
    window.open(url, "_blank");
  }
}

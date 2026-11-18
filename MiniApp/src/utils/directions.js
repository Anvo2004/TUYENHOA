import { openWebview } from "zmp-sdk/apis";

// Chỉ đường / bản đồ cho một địa điểm (màn Di tích). Có toạ độ (lat, lng) thì
// dẫn đúng điểm; không có thì tìm theo tên + địa chỉ.
const destOf = ({ lat, lng, ten, diaChi }) =>
  lat != null && lng != null && lat !== "" && lng !== ""
    ? `${lat},${lng}`
    : [ten, diaChi].filter(Boolean).join(", ");

export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destOf(place))}`;
}

// Bản đồ nhúng (iframe) ghim vị trí — không cần API key.
export function embedMapUrl(place) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(destOf(place))}&z=15&hl=vi&output=embed`;
}

// Mở Google Maps (chế độ chỉ đường) trong webview của Zalo. Trước đây dùng
// openOutApp (mở app ngoài Zalo) nhưng trên máy thật không mở được gì —
// openWebview là API các nút mở trang ngoài khác trong app đang dùng ổn định.
// Ngoài Zalo (trình duyệt thường) thì fallback window.open.
export function openDirections(place) {
  const url = directionsUrl(place);
  try {
    openWebview({ url, config: { style: "normal" } }).catch(() => window.open(url, "_blank"));
  } catch {
    window.open(url, "_blank");
  }
}

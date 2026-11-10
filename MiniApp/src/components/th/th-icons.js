// Bộ 48 icon 3D của giao diện "Tuyên Hóa Số" (TuyenHoaSo-XanhDuong/03-icon-3d/svg)
// — đóng gói sẵn trong bundle, tra theo slug = tên file (vd "phan-anh").
// AppLink.icon trong DB (AdminWeb) dùng chính các slug này.
const files = import.meta.glob("../../static/th-icons/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const TH_ICONS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop().replace(/\.svg$/, ""), url])
);

export const thIcon = (slug) => TH_ICONS[slug] || "";

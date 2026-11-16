// Danh sách 11 thôn của xã Tuyên Hóa (Quảng Trị), do xã cung cấp ngày 13/11/2026.
// ensureVillages() chỉ THÊM thôn còn thiếu (theo tên) khi Backend khởi động. Thông
// tin cán bộ, số hộ, dân số của từng thôn nhập ở AdminWeb → Thôn xóm.
// Lưu ý: thôn đã xoá trên AdminWeb mà vẫn còn trong danh sách này sẽ được tạo
// lại ở lần khởi động sau. Muốn bỏ hẳn một thôn thì xoá ở cả 2 nơi.
const NAMES = [
  "Tiền Phong",
  "Thanh Phong",
  "Minh Phong",
  "Hồng Phong",
  "Tiến Hoá",
  "Văn Hoá",
  "Lệ Sơn",
  "Châu Hoá",
  "Phong Châu",
  "Cao Quảng",
  "Cao Hoá",
];

module.exports = NAMES.map((name, i) => ({ ten: `Thôn ${name}`, thuTu: i + 1 }));

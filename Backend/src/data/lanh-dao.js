const config = require("../config");

// Lãnh đạo xã và các cơ quan, đơn vị — Phụ lục I công văn UBND xã Tuyên Hóa cung
// cấp thông tin nâng cấp Trang TTĐT (docs/"CV de nghi cung cap thong tin nang cap
// Trang TTDT.docx", 11/2026), ảnh từ docs/Anh.rar (thu nhỏ 360×480, lưu
// Backend/public/site/lanh-dao). Giữ nguyên thứ tự và chức vụ như công văn.
// Chưa có ảnh: Trần Mạnh Hùng, Phạm Ngọc Chiến (MiniApp hiện chữ cái đầu).
// Đã sửa so với công văn: email Phạm Ngọc Chiến bỏ dấu "." thừa trước "@"; SĐT
// Phan Thị Hải Yến trong công văn chỉ có 9 chữ số ("091716117") → để trống, chờ xã xác nhận.
const anh = (slug) => `${config.publicUrl}/site/lanh-dao/${slug}.jpg`;

const GROUPS = [
  ["Thường trực Đảng ủy", [
    ["Trần Hoài Nam", "Bí thư Đảng ủy, Chủ tịch HĐND xã", "0916831812", "tranhoainam@quangtri.gov.vn", "tran-hoai-nam"],
    ["Hoàng Trọng Tài", "Phó Bí thư Thường trực Đảng ủy", "0944220884", "hoangtrongtai@quangtri.gov.vn", "hoang-trong-tai"],
  ]],
  ["Ban Xây dựng Đảng", [
    ["Phan Văn Thịnh", "Ủy viên Ban Thường vụ, Trưởng ban", "0912238711", "phanvanthinh@quangtri.gov.vn", "phan-van-thinh"],
    ["Trần Đức Hiến", "Đảng ủy viên, Phó Trưởng ban", "0979148825", "tranduchien@quangtri.gov.vn", "tran-duc-hien"],
  ]],
  ["HĐND xã", [
    ["Hoàng Trọng Tài", "Phó Bí thư Đảng ủy, Chủ tịch HĐND xã", "0944220884", "hoangtrongtai@quangtri.gov.vn", "hoang-trong-tai"],
    ["Nguyễn Thị Phương", "Đảng ủy viên, Phó Chủ tịch HĐND xã", "0947959134", "nguyenphuongducaoquang@gmail.com", "nguyen-thi-phuong"],
  ]],
  ["UBND xã", [
    ["Trần Khánh Linh", "Phó Bí thư Đảng ủy, Chủ tịch UBND xã", "0982897411", "trankhanhlinh@quangtri.gov.vn", "tran-khanh-linh"],
    ["Nguyễn Vũ Thành Long", "Ủy viên Ban Thường vụ Đảng ủy, Phó Chủ tịch UBND xã", "0858505559", "nguyenvuthanhlong@quangtri.gov.vn", "nguyen-vu-thanh-long"],
    ["Trần Mạnh Hùng", "Đảng ủy viên, Phó Chủ tịch UBND xã", "0855367686", "tranmanhhung1@quangtri.gov.vn", ""],
  ]],
  ["Ủy ban MTTQ Việt Nam xã", [
    ["Phạm Thị Hồng Tư", "Ủy viên Ban Thường vụ, Chủ tịch Ủy ban MTTQ Việt Nam xã", "0915166559", "hongtupham123@gmail.com", "pham-thi-hong-tu"],
    ["Đặng Thị Kim Huệ", "Đảng ủy viên, Bí thư Đoàn xã", "0949257157", "Kimhue930404@gmail.com", "dang-thi-kim-hue"],
    ["Trần Thị Hồng Thanh", "Đảng ủy viên, Chủ tịch Hội LHPN", "0838744016", "phunucaoquang@gmail.com", "tran-thi-hong-thanh"],
    ["Nguyễn Văn Thoan", "Chủ tịch Hội Cựu chiến binh", "0844899969", "thoanmtcq@gmail.com", "nguyen-van-thoan"],
    ["Trương Quang Tiến", "Đảng ủy viên, Chủ tịch Hội Nông dân", "0888058111", "tientrai83qb@gmail.com", "truong-quang-tien"],
  ]],
  ["Văn phòng HĐND và UBND", [
    ["Hà Bình Trọng", "Đảng ủy viên, Chánh Văn phòng HĐND và UBND xã", "0912688578", "habinhtrong@quangtri.gov.vn", "ha-binh-trong"],
    ["Phan Thị Hải Yến", "Phó Chánh Văn phòng", "", "phanthihaiyen@quangtri.gov.vn", "phan-thi-hai-yen"],
  ]],
  ["Phòng Kinh tế", [
    ["Phan Huy Hoàng", "Đảng ủy viên, Trưởng phòng Kinh tế", "0915432209", "phanhuyhoang@quangtri.gov.vn", "phan-huy-hoang"],
    ["Trần Đức Chiến", "Phó Trưởng phòng", "0917108887", "tranducchien@quangtri.gov.vn", "tran-duc-chien"],
  ]],
  ["Phòng Văn hóa - Xã hội", [
    ["Phạm Ngọc Chiến", "Đảng ủy viên, Trưởng phòng Văn hóa - Xã hội", "0888877345", "phamngocchien@quangtri.gov.vn", ""],
  ]],
  ["Trung tâm Phục vụ hành chính công", [
    ["Nguyễn Xuân Phong", "Giám đốc Trung tâm Phục vụ hành chính công", "0918842132", "nguyenxuanphong@quangtri.gov.vn", "nguyen-xuan-phong"],
    ["Lê Hồng Chung", "Phó Giám đốc Trung tâm Phục vụ hành chính công", "0912477009", "lehongchung@quangtri.gov.vn", "le-hong-chung"],
  ]],
  ["Trung tâm Dịch vụ tổng hợp", [
    ["Đoàn Hạnh Phúc", "Đảng ủy viên, Giám đốc Trung tâm Dịch vụ tổng hợp", "0915871962", "hanhphucth@gmail.com", "doan-hanh-phuc"],
  ]],
  ["Ban Quản lý dự án đầu tư xây dựng", [
    ["Trần Duy Hằng", "Phó Giám đốc phụ trách Ban Quản lý dự án đầu tư xây dựng xã", "0912591349", "tranduyhang@quangtri.gov.vn", "tran-duy-hang"],
    ["Nguyễn Văn Thăng", "Phó Giám đốc Ban Quản lý dự án đầu tư xây dựng xã", "0912433577", "nguyenvanthang@quangtri.gov.vn", "nguyen-van-thang"],
  ]],
];

module.exports = GROUPS.flatMap(([coQuan, people]) =>
  people.map(([hoTen, chucVu, dienThoai, email, slug]) => ({
    hoTen,
    chucVu,
    coQuan,
    dienThoai,
    email,
    anh: slug ? anh(slug) : "",
  }))
).map((p, i) => ({ ...p, thuTu: i + 1 }));

// Di chuyển nội dung đang hardcode ở MiniApp/src/data/quick-links.js và
// services.js sang MongoDB (collection AppLink) để cán bộ xã sửa icon/link
// qua AdminWeb mà không cần build lại MiniApp. Chạy 1 lần khi triển khai
// tính năng này; an toàn để chạy lại (bỏ qua section nào đã có dữ liệu).
const mongoose = require("mongoose");
const config = require("../src/config");
const AppLink = require("../src/models/AppLink");

// Theo bộ giao diện "Tuyên Hóa Số" (TuyenHoaSo-XanhDuong, màn Trang chủ + Dịch vụ).
// `icon` là slug trong MiniApp/src/static/th-icons/. Link ngoài CHỈ dùng cổng
// quốc gia .gov.vn đã biết chắc; mục đặc thù của xã/tỉnh (bản đồ số, camera,
// OCOP, khảo sát...) để href rỗng — MiniApp báo "đang cập nhật" — cán bộ điền
// qua AdminWeb khi xã xác nhận URL (xem docs/SETUP_CHECKLIST.md). Không đoán URL.
const QUICK_LINKS = [
  { icon: "phan-anh", label: "Phản ánh", path: "/phan-anh" },
  { icon: "tra-cuu-ho-so", label: "Tra cứu hồ sơ", path: "/tra-cuu-ho-so" },
  { icon: "lich-cat-dien", label: "Lịch cắt điện", path: "/lich-cup-dien" },
  { icon: "lich-y-te", label: "Lịch y tế", path: "/lich-y-te" },
  { icon: "thu-tuc", label: "Thủ tục", path: "/thu-tuc-hanh-chinh" },
  { icon: "van-ban", label: "Văn bản", path: "/van-ban" },
  { icon: "tro-cap", label: "Trợ cấp", path: "/thong-bao" },
  { icon: "thien-tai", label: "Thiên tai", path: "/phong-chong-thien-tai" },
];

const GOV_LINKS = [
  { icon: "lanh-dao", label: "Lãnh đạo xã", href: "" }, // TODO: trang giới thiệu lãnh đạo xã
  { icon: "tro-ly-ai", label: "Trợ lý AI", path: "/tro-ly-so" },
  { icon: "ban-do", label: "Bản đồ số", href: "" }, // TODO: bản đồ số của tỉnh Quảng Trị (.gov.vn)
  { icon: "camera", label: "Camera an ninh", href: "" }, // TODO
  { icon: "cong-du-lieu", label: "Cổng dữ liệu", path: "/cong-du-lieu" },
  { icon: "qr-tai-lieu", label: "QR tài liệu", href: "" }, // TODO
  { icon: "khao-sat", label: "Khảo sát", path: "/cong-du-lieu" },
  { icon: "dvc-quoc-gia", label: "DVC Quốc gia", href: "https://dichvucong.gov.vn" },
];

const ECON_LINKS = [
  { icon: "ocop", label: "OCOP", href: "" }, // TODO
  { icon: "doanh-nghiep", label: "Doanh nghiệp", href: "https://dangkykinhdoanh.gov.vn" },
  { icon: "du-lich", label: "Du lịch", path: "/du-lich" },
  { icon: "van-hoa", label: "Văn hóa", path: "/van-hoa" },
  { icon: "hoc-ai", label: "Học AI", href: "" }, // TODO
  { icon: "hoc-vu-so", label: "Học vụ số", href: "" }, // TODO
  { icon: "bhxh", label: "BHXH", href: "https://baohiemxahoi.gov.vn" },
  { icon: "ma-so-thue", label: "Mã số thuế", href: "https://tracuunnt.gdt.gov.vn" },
];

// Trang /dich-vu — "Danh sách dịch vụ" (type: online = Trực tuyến, offline = Trực tiếp)
const SERVICES = [
  { icon: "phan-anh", label: "Phản ánh – Kiến nghị", type: "online", path: "/phan-anh" },
  { icon: "tra-cuu-ho-so", label: "Tra cứu hồ sơ TTHC", type: "online", path: "/tra-cuu-ho-so" },
  { icon: "van-ban", label: "Văn bản – Chính sách", type: "online", path: "/van-ban" },
  { icon: "lich-cat-dien", label: "Lịch cắt điện", type: "online", path: "/lich-cup-dien" },
  { icon: "lich-y-te", label: "Lịch y tế – Tiêm chủng", type: "online", path: "/lich-y-te" },
  { icon: "tro-cap", label: "Thông báo trợ cấp", type: "online", path: "/thong-bao" },
  { icon: "thu-tuc", label: "Danh mục thủ tục", type: "online", path: "/thu-tuc-hanh-chinh" },
  { icon: "thien-tai", label: "Phòng chống thiên tai", type: "offline", path: "/phong-chong-thien-tai" },
];

// Trang /dich-vu — "Cổng kết nối"
const PORTAL_LINKS = [
  {
    icon: "tro-ly-ai",
    label: "Trợ lý Công dân số",
    description: "Hỏi đáp thủ tục, tra cứu hồ sơ bằng AI",
    path: "/tro-ly-so",
  },
  {
    icon: "dvc-quoc-gia",
    label: "Cổng DVC Quốc gia",
    description: "dichvucong.gov.vn",
    href: "https://dichvucong.gov.vn",
  },
  {
    icon: "vneid",
    label: "VNeID",
    description: "Định danh điện tử quốc gia",
    href: "https://vneid.gov.vn",
  },
];

async function seedSection(section, items) {
  const count = await AppLink.countDocuments({ section });
  if (count > 0) {
    console.log(`[${section}] đã có ${count} bản ghi, bỏ qua.`);
    return;
  }
  await AppLink.insertMany(
    items.map((it, i) => ({ ...it, section, order: i + 1 }))
  );
  console.log(`[${section}] đã seed ${items.length} bản ghi.`);
}

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  await seedSection("quick_link", QUICK_LINKS);
  await seedSection("gov", GOV_LINKS);
  await seedSection("econ", ECON_LINKS);
  await seedSection("service", SERVICES);
  await seedSection("portal", PORTAL_LINKS);

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { QUICK_LINKS, GOV_LINKS, ECON_LINKS, SERVICES, PORTAL_LINKS };

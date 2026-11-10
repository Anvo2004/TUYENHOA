// Seeds the Village/DanSo/DuLich/VanHoa/SiteInfo collections with the content
// that used to live in MiniApp/src/data/*.js before those pages moved to
// fetching from the DB. Safe to re-run — adds missing villages and skips other
// collections that already have data; this reconstructs the content on
// a fresh DB (e.g. disaster recovery, a new environment) instead of it only
// existing wherever it was manually seeded. Usage: node scripts/seed-site-content.js
const mongoose = require("mongoose");
const config = require("../src/config");
const { ensureVillages } = require("../src/services/villageService");
const DanSo = require("../src/models/DanSo");
const DuLich = require("../src/models/DuLich");
const VanHoa = require("../src/models/VanHoa");
const SiteInfo = require("../src/models/SiteInfo");

const VILLAGES = require("../src/data/villages");

// Nguồn: bộ giao diện "Tuyên Hóa Số" (TuyenHoaSo-XanhDuong/DOC-TRUOC.txt) —
// diện tích 194,92 km², dân số 21.452 người; xã hợp nhất từ Tiến Hóa, Châu Hóa,
// Cao Quảng, Văn Hóa (tỉnh Quảng Trị). TODO: đối chiếu số liệu chính thức của xã.
const DAN_SO = {
  tongDanSo: 21452,
  dienTichKm2: 194.92,
  soThon: VILLAGES.length || null,
  hoDan: null,
  gioiTinh: null,
  doTuoi: null,
};

// TODO: nội dung Du lịch / Văn hóa của xã Tuyên Hóa chưa có — để trống, cán bộ
// xã nhập qua AdminWeb. KHÔNG mang nội dung của xã khác sang.
const DU_LICH = {
  title: "Du lịch - Danh thắng",
  subtitle: "Khám phá thiên nhiên & con người Tuyên Hóa",
  diemNoiBat: [],
  diemThamQuan: [],
};

const VAN_HOA = {
  title: "Văn hóa - Nghệ thuật",
  subtitle: "Bản sắc văn hóa xã Tuyên Hóa",
  hoatDong: [],
  diSan: [],
  diemNoiBat: [],
  tinTuc: [],
};

// TODO: thông tin liên hệ thật của UBND xã Tuyên Hóa (địa chỉ trụ sở, số điện
// thoại, website, giờ làm việc, Công an xã) — xem docs/SETUP_CHECKLIST.md. Để
// trống thì MiniApp tự ẩn dòng tương ứng; cán bộ cập nhật trong DB/AdminWeb.
const SITE_INFO = {
  contact: {
    officeName: "UBND xã Tuyên Hóa",
    address: "",
    phone: "",
    hotline: "",
    hotline2: "",
    email: "",
    website: "",
    // Theo bộ thiết kế (màn Liên hệ) — TODO: xác nhận giờ làm việc thật của xã.
    workHours: "Thứ 2 - Thứ 6\nSáng: 7h30-11h30 | Chiều: 13h30-17h00",
    chairman: { name: "", title: "Chủ tịch UBND xã Tuyên Hóa", phone: "" },
    policeStation: { name: "Công an xã Tuyên Hóa", address: "", phone: "" },
    // Bản đồ số .gov.vn của tỉnh cho nút "Chỉ đường" (màn Liên hệ) — trống thì ẩn nút.
    mapUrl: "",
  },
  zaloOA: {
    name: "UBND xã Tuyên Hóa",
    description: "Nhận thông báo, tin tức mới nhất từ chính quyền.",
  },
  digitalTransform: {
    href: "",
    title: "Chuyển đổi số xã Tuyên Hóa",
    tags: ["Chính quyền số", "Kinh tế số", "Xã hội số"],
  },
};

module.exports = { VILLAGES, DAN_SO, DU_LICH, VAN_HOA, SITE_INFO };

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  await ensureVillages();
  console.log(`Ensured ${VILLAGES.length} villages.`);

  for (const [name, Model, data] of [
    ["DanSo", DanSo, DAN_SO],
    ["DuLich", DuLich, DU_LICH],
    ["VanHoa", VanHoa, VAN_HOA],
    ["SiteInfo", SiteInfo, SITE_INFO],
  ]) {
    const existing = await Model.findOne();
    if (existing) {
      console.log(`${name} already has a document, skipping.`);
    } else {
      await Model.create(data);
      console.log(`Seeded ${name}.`);
    }
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

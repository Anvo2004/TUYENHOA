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

// Nội dung Du lịch / Văn hóa (16/11/2026) — CHỈ lấy từ Trang TTĐT xã
// (tuyenhoa.quangtri.gov.vn): bài "Giới thiệu chung" + tin mục Văn hóa - Xã hội.
// Cổng xã chưa có bài về danh thắng/điểm du lịch (mục "Lịch sử văn hoá", "Điều
// kiện tự nhiên" đang trống) — không tự thêm địa danh; cán bộ bổ sung qua AdminWeb.
// Ảnh: tải từ bài viết, thu nhỏ, lưu Backend/public/site/gioi-thieu (route /site).
// DB đã seed thì chạy scripts/update-du-lich-van-hoa.js.
const img = (name) => `${config.publicUrl}/site/gioi-thieu/${name}`;
const TTDT = "Trang TTĐT xã Tuyên Hóa";
const article = (cat, id) => `https://tuyenhoa.quangtri.gov.vn/chi-tiet-tin/-/view-article/1/${cat}/${id}`;

const DINH_KINH_CHAU = {
  id: "dinh-kinh-chau",
  icon: "🏯",
  title: "Đình làng Kinh Châu",
  name: "Đình làng Kinh Châu",
  desc:
    "Nơi làng Kinh Châu tổ chức lễ dâng hương dịp Rằm tháng Bảy với nhiều nghi thức truyền thống: các xóm dâng mâm cúng, trống khai hội, hát ca trù và hát dâng hương Kinh Châu — tưởng nhớ công lao các bậc tiền nhân.",
  address: "Thôn Phong Châu, xã Tuyên Hóa, tỉnh Quảng Trị",
  image: img("dinh-kinh-chau.jpg"),
};
const DINH_UYEN_PHONG = {
  id: "dinh-uyen-phong",
  icon: "⛩️",
  title: "Đình làng Uyên Phong",
  name: "Đình làng Uyên Phong",
  desc:
    "Đình làng của làng Uyên Phong — nơi bà con các xóm cùng lãnh đạo xã dâng hương dịp Rằm tháng Bảy, hướng về cội nguồn, gìn giữ đạo lý \"Uống nước nhớ nguồn\".",
  address: "Thôn Phong Châu, xã Tuyên Hóa, tỉnh Quảng Trị",
  image: img("dinh-uyen-phong.jpg"),
};

const DU_LICH = {
  title: "Du lịch - Danh thắng",
  subtitle: "Khám phá thiên nhiên & con người Tuyên Hóa",
  diemNoiBat: [
    {
      id: "dien-tich",
      icon: "🌄",
      title: "194,92 km²",
      subtitle: "Diện tích tự nhiên",
      desc:
        "Xã Tuyên Hóa (tỉnh Quảng Trị) hình thành năm 2025 từ việc sáp nhập 4 xã Tiến Hóa, Châu Hóa, Cao Quảng, Văn Hóa; diện tích 194,92 km², dân số khoảng 21.452 người.",
    },
    {
      id: "sinh-thai",
      icon: "🌿",
      title: "Du lịch sinh thái",
      subtitle: "Tiềm năng phát triển",
      desc:
        "Mật độ dân số thấp (khoảng 110 người/km²), không gian thoáng đãng, quỹ đất dồi dào — phù hợp phát triển nông nghiệp, du lịch sinh thái và khu dân cư mới.",
    },
    {
      id: "dinh-lang",
      icon: "🏯",
      title: "Đình làng",
      subtitle: "Kinh Châu · Uyên Phong",
      desc: "Hai ngôi đình làng của thôn Phong Châu (sáp nhập từ hai làng Uyên Phong và Kinh Châu), nơi lưu giữ các nghi lễ truyền thống.",
      image: img("dinh-uyen-phong.jpg"),
    },
    {
      id: "ca-tru",
      icon: "🎶",
      title: "Ca trù Kinh Châu",
      subtitle: "Nghệ thuật truyền thống",
      desc: "Câu lạc bộ Ca trù Kinh Châu gìn giữ, trao truyền làn điệu ca trù qua nhiều thế hệ, có cả các ca nương nhí.",
      image: img("ca-tru-kinh-chau.jpg"),
    },
  ],
  diemThamQuan: [DINH_KINH_CHAU, DINH_UYEN_PHONG],
};

const VAN_HOA = {
  title: "Văn hóa - Nghệ thuật",
  subtitle: "Bản sắc văn hóa xã Tuyên Hóa",
  hoatDong: [
    {
      id: "ca-tru",
      icon: "🎶",
      title: "Ca trù Kinh Châu",
      desc:
        "CLB Ca trù Kinh Châu biểu diễn trong lễ dâng hương đình làng và các liên hoan văn nghệ; những làn điệu truyền thống được tiếp nối qua các ca nương nhí.",
      image: img("ca-tru-kinh-chau.jpg"),
    },
    {
      id: "dang-huong",
      icon: "🏮",
      title: "Lễ dâng hương đình làng",
      desc: "Làng Uyên Phong và Kinh Châu tổ chức lễ dâng hương tại đình làng dịp Rằm tháng Bảy, tưởng nhớ công lao các bậc tiền nhân.",
      image: img("dinh-kinh-chau.jpg"),
    },
    {
      id: "dai-doan-ket",
      icon: "🤝",
      title: "Ngày hội Đại đoàn kết",
      desc: "Các thôn tổ chức Ngày hội Đại đoàn kết toàn dân tộc gắn với Ngày Văn hóa Việt Nam, với chương trình văn nghệ ca ngợi quê hương, đất nước.",
      image: img("ngay-hoi-phong-chau.jpg"),
    },
    {
      id: "van-nghe",
      icon: "🎤",
      title: "Văn nghệ quần chúng",
      desc: "Liên hoan văn nghệ thôn Phong Châu với 17 tiết mục, 3 chương \"Mừng quê hương\", \"Nghĩa tình cội nguồn\", \"Phong Châu ngày hội\".",
      image: img("lien-hoan-van-nghe.jpg"),
    },
    {
      id: "the-thao",
      icon: "🏐",
      title: "Thể thao quần chúng",
      desc: "Giải bóng chuyền nam, nữ xã Tuyên Hóa năm 2026 quy tụ 25 đội bóng với 278 vận động viên từ các thôn.",
      image: img("giai-bong-chuyen.jpg"),
    },
  ],
  diSan: [
    {
      id: "ca-tru",
      icon: "🎼",
      title: "Nghệ thuật Ca trù",
      subtitle: "Di sản văn hóa phi vật thể cần bảo vệ khẩn cấp (UNESCO, 2009) — được CLB Ca trù Kinh Châu gìn giữ",
      desc: "Các tiết mục hát ca trù và hát dâng hương Kinh Châu là nét đẹp văn hóa truyền thống của địa phương, được trình diễn trong không gian đình làng.",
      image: img("ca-tru-kinh-chau.jpg"),
    },
  ],
  diemNoiBat: [DINH_KINH_CHAU, DINH_UYEN_PHONG],
  tinTuc: [
    {
      id: "1794818789819",
      tag: "Văn hóa - Xã hội",
      date: "16/11/2026",
      title: "Thôn Phong Châu tổ chức Ngày hội Đại đoàn kết toàn dân tộc – Ngày Văn hóa Việt Nam năm 2026",
      summary: "Thôn Phong Châu (sáp nhập từ Uyên Phong và Kinh Châu) tổ chức ngày hội với nhiều tiết mục văn nghệ đặc sắc, ôn lại truyền thống 96 năm Mặt trận Tổ quốc Việt Nam.",
      source: TTDT,
      link: article("542591447209827452", "1794818789819"),
      image: img("ngay-hoi-phong-chau.jpg"),
    },
    {
      id: "1794810885680",
      tag: "Văn hóa - Xã hội",
      date: "16/11/2026",
      title: "Thôn Thanh Phong tổ chức Ngày hội Đại đoàn kết toàn dân tộc năm 2026",
      summary: "Ngày hội gắn với các hoạt động hưởng ứng Ngày Văn hóa Việt Nam, mở đầu bằng chương trình văn nghệ của các cụm dân cư và đoàn thể.",
      source: TTDT,
      link: article("542591447209827452", "1794810885680"),
      image: img("ngay-hoi-thanh-phong.jpg"),
    },
    {
      id: "1788263320362",
      tag: "Thể thao",
      date: "01/09/2026",
      title: "Bế mạc giải bóng chuyền nam, nữ xã Tuyên Hóa năm 2026",
      summary: "25 đội bóng, 278 vận động viên tranh tài; thôn Minh Phong giành giải Nhất nữ, thôn Cao Quảng giành giải Nhất nam.",
      source: TTDT,
      link: article("542591447209827415", "1788263320362"),
      image: img("giai-bong-chuyen.jpg"),
    },
    {
      id: "1787907969527",
      tag: "Văn nghệ",
      date: "28/08/2026",
      title: "Thôn Phong Châu tổ chức liên hoan văn nghệ quần chúng",
      summary: "17 tiết mục văn nghệ; các tiết mục ca trù của CLB Ca trù Kinh Châu, có phần thể hiện của ca nương nhí, tạo điểm nhấn cho chương trình.",
      source: TTDT,
      link: article("542591447209827415", "1787907969527"),
      image: img("lien-hoan-van-nghe.jpg"),
    },
    {
      id: "1787797872938",
      tag: "Lễ hội",
      date: "27/08/2026",
      title: "Làng Uyên Phong và Kinh Châu tổ chức lễ dâng hương Đình làng nhân dịp Rằm tháng Bảy",
      summary: "Lễ dâng hương với nhiều nghi thức truyền thống đặc sắc, hát ca trù và hát dâng hương Kinh Châu trong không gian đình làng.",
      source: TTDT,
      link: article("542591447209827415", "1787797872938"),
      image: img("dinh-kinh-chau.jpg"),
    },
  ],
};

// Thông tin liên hệ do xã cung cấp (16/11/2026). Còn trống: hotline thứ 2, số
// Ban Chỉ huy PCTT, Chủ tịch xã, bản đồ số — MiniApp tự ẩn dòng trống; cán bộ
// cập nhật trong DB/AdminWeb. DB đã seed thì chạy scripts/update-contact.js.
const CONTACT = {
  officeName: "UBND xã Tuyên Hóa",
  address: "Thôn Tiền Phong, xã Tuyên Hóa, tỉnh Quảng Trị",
  phone: "0232 3672 112",
  hotline: "0232 3672 112",
  email: "ubndtuyenhoa@quangtri.gov.vn",
  website: "https://tuyenhoa.quangtri.gov.vn",
  policeStation: {
    name: "Công an xã Tuyên Hóa",
    address: "Thôn Tiền Phong, xã Tuyên Hóa, tỉnh Quảng Trị",
    phone: "0232 3690 168",
  },
};

const SITE_INFO = {
  contact: {
    ...CONTACT,
    hotline2: "",
    // Theo bộ thiết kế (màn Liên hệ) — TODO: xác nhận giờ làm việc thật của xã.
    workHours: "Thứ 2 - Thứ 6\nSáng: 7h30-11h30 | Chiều: 13h30-17h00",
    chairman: { name: "", title: "Chủ tịch UBND xã Tuyên Hóa", phone: "" },
    policeStation: CONTACT.policeStation,
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

module.exports = { VILLAGES, DAN_SO, DU_LICH, VAN_HOA, SITE_INFO, CONTACT };

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

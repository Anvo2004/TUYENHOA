// Cập nhật lưới "Tiện ích" Trang chủ trên DB đang chạy (seed-app-links.js bỏ qua
// section đã có dữ liệu) theo yêu cầu xã 16/11/2026:
//   - Bỏ OCOP, BHXH, Mã số thuế, Cổng dữ liệu, Camera an ninh, Khảo sát, Học AI,
//     Tra cứu hồ sơ (trùng Kết quả TTHC), QR tài liệu.
//   - Gán link "Học vụ số" (lấy từ ECON_LINKS trong seed-app-links.js).
//   - Thêm mục mới có trong seed mà DB chưa có (so theo label) — vd 18/11/2026:
//     Kết quả TTHC, Tòa án nhân dân, Kết quả PAKN, Đánh giá phục vụ, Thuế điện tử.
//   - Đánh lại thứ tự từng nhóm gov / econ theo thứ tự seed (mục cán bộ tự thêm xếp sau).
// An toàn để chạy lại. Chạy trên VPS: cd Backend && node scripts/update-home-links.js
const mongoose = require("mongoose");
const config = require("../src/config");
const AppLink = require("../src/models/AppLink");
const { GOV_LINKS, ECON_LINKS, SERVICES } = require("./seed-app-links");

const REMOVED = ["OCOP", "BHXH", "Mã số thuế", "Cổng dữ liệu", "Camera an ninh", "Khảo sát", "Học AI", "Tra cứu hồ sơ", "QR tài liệu"];

async function main() {
  await mongoose.connect(config.mongoUri);

  const del = await AppLink.deleteMany({ section: { $in: ["quick_link", "gov", "econ"] }, label: { $in: REMOVED } });
  console.log(`Đã xoá ${del.deletedCount} mục:`, REMOVED.join(", "));

  const hocVuSo = ECON_LINKS.find((l) => l.label === "Học vụ số");
  const upd = await AppLink.updateMany({ section: "econ", label: "Học vụ số" }, { $set: { href: hocVuSo.href, path: "" } });
  console.log(`Học vụ số → ${hocVuSo.href} (${upd.modifiedCount} bản ghi)`);

  for (const [section, seed] of [["gov", GOV_LINKS], ["econ", ECON_LINKS]]) {
    for (const link of seed) {
      if (!(await AppLink.exists({ section, label: link.label }))) {
        await AppLink.create({ ...link, section, order: 999 });
        console.log(`[${section}] thêm "${link.label}"`);
      }
    }
    // Đồng bộ href các mục link ngoài theo seed (vd sửa link Tòa án 19/11/2026).
    for (const link of seed.filter((l) => l.href)) {
      const r = await AppLink.updateMany({ section, label: link.label, href: { $ne: link.href } }, { $set: { href: link.href } });
      if (r.modifiedCount) console.log(`[${section}] "${link.label}" → ${link.href}`);
    }
    const rank = (label) => {
      const i = seed.findIndex((l) => l.label === label);
      return i === -1 ? 1000 : i;
    };
    const items = (await AppLink.find({ section }).sort({ order: 1, label: 1 })).sort((a, b) => rank(a.label) - rank(b.label));
    await Promise.all(items.map((it, i) => AppLink.updateOne({ _id: it._id }, { $set: { order: i + 1 } })));
    console.log(`[${section}]`, items.map((it) => it.label).join(" · "));
  }

  // Mục Dịch vụ "Tra cứu hồ sơ TTHC" → mở thẳng Cổng DVC như "Kết quả TTHC".
  const svc = SERVICES.find((l) => l.label === "Tra cứu hồ sơ TTHC");
  const r = await AppLink.updateMany(
    { section: "service", label: svc.label, href: { $ne: svc.href } },
    { $set: { href: svc.href, path: "", icon: svc.icon } }
  );
  if (r.modifiedCount) console.log(`[service] "${svc.label}" → ${svc.href}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

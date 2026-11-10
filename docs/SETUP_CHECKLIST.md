# Checklist chuẩn bị trước khi chạy thật (Tuyên Hóa)

Dự án fork từ MINIAPP_TRALIEN (2026-11-10). Mọi giá trị đặc thù của Trà Liên
(domain, App ID, tài khoản, dữ liệu) đã bị gỡ — mục nào chưa có thông tin thật
đều để trống và tự tắt gracefully (xem `.claude/rules/secrets.md`). Đánh dấu
`[x]` khi đã xác nhận với xã.

## 1. Thông tin cơ bản của xã

- [x] Tên, tỉnh: **xã Tuyên Hóa, tỉnh Quảng Trị**; hợp nhất từ Tiến Hóa, Châu
  Hóa, Cao Quảng, Văn Hóa; diện tích 194,92 km², dân số 21.452 người — lấy từ
  bộ giao diện `TuyenHoaSo-XanhDuong/DOC-TRUOC.txt`. Cần đối chiếu số liệu chính
  thức (seed ở `Backend/scripts/seed-site-content.js` → collection `DanSo`).
- [ ] **Danh sách thôn** — `Backend/src/data/villages.js` đang để **rỗng** (chưa
  có văn bản của xã). Điền tên thôn chính thức hoặc nhập qua AdminWeb → Thôn xóm.
  Trang chủ hiện "—" ở ô "Thôn" cho tới khi có dữ liệu.
- [ ] **Thông tin liên hệ** (`SiteInfo.contact`, sửa qua AdminWeb/DB): địa chỉ
  trụ sở, số điện thoại (`hotline`, `hotline2`), website, email, giờ làm việc,
  Công an xã (`policeStation.name/address/phone` — số trực ban), số Ban Chỉ huy
  PCTT&TKCN xã (`pcttPhone`, màn Phòng chống thiên tai), bản đồ số `.gov.vn` của
  tỉnh (`mapUrl`, nút "Chỉ đường" + ô "Bản đồ số"). Trường trống thì MiniApp ẩn
  hoặc hiện "Đang cập nhật".
- [ ] Trang điều khoản `GET /dieu-khoan-su-dung` (`Backend/src/app.js`): điền
  địa chỉ + hotline thật ở mục "9. Liên hệ" (đang để `[TODO: ...]`).
- [ ] Tọa độ bản đồ ở trang đăng nhập AdminWeb (`LoginPage.jsx`, `LAT/LNG`) đang
  là giá trị **gần đúng** — xác nhận trên OpenStreetMap.

## 2. Domain & hạ tầng (mặc định theo mẫu các xã khác — xác nhận lại)

- [x] Domain (đã trỏ về VPS 123.30.48.104): `tuyenhoa.dxvtech.vn` (web mirror
  MiniApp, cổng 3016), `tuyenhoaadmin.dxvtech.vn` (AdminWeb tĩnh),
  `tuyenhoaapi.dxvtech.vn` (Backend, cổng 4002 — `PORT` trong `Backend/.env`). Đang hardcode ở `MiniApp/src/data/api-config.js`,
  `Backend/src/config/index.js` (`publicUrl`), `MiniApp/vite.config.js`
  (`allowedHosts`), `.github/workflows/sync-lich-cup-dien.yml`.
- [ ] `Frontend/AdminWeb/.env` trên VPS: `VITE_API_URL=https://tuyenhoaapi.dxvtech.vn`
  rồi `npm run build` (xem cảnh báo trong `CLAUDE.md`).
- [x] VPS: thư mục `/var/www/tuyenhoa`, PM2 `tuyenhoa` (MiniApp) và
  `tuyenhoa-backend` — khớp `.github/workflows/deploy.yml`. Cấu hình Nginx + SSL.
- [x] MongoDB Atlas: project **TuyenHoa** (org "Võ's Org"), cluster
  `tuyenhoa.ufk5ak4.mongodb.net`, user `annguyen14032004_db_user`, database
  `tuyenhoa` → `MONGO_URI` (chỉ ở `.env` trên VPS). IP Access List đã có
  `123.30.48.104`. `JWT_SECRET` sinh ngẫu nhiên. Đã seed (10/11/2026): admin,
  6 lĩnh vực, DanSo/SiteInfo, AppLink, 8 TTHC mẫu.
- [x] Ảnh tải lên lưu ra đĩa VPS (`Backend/public/images/`, không cấu hình
  Cloudinary). Token Zalo OA lưu trong MongoDB (collection `Setting`), Backend
  tự làm mới trước khi hết hạn — KHÔNG chạy Backend thứ hai (máy local) với
  cùng DB/token, Zalo xoay refresh_token mỗi lần làm mới.
- [ ] Cloudinary / Upstash (**tuỳ chọn**, đang để trống: ảnh lưu đĩa VPS,
  rate-limit chạy trong bộ nhớ).
- [x] Repo GitHub: https://github.com/Anvo2004/TUYENHOA
- [ ] Secrets cho CI/CD (`.github/workflows/deploy.yml`): `VPS_HOST`,
  `VPS_DEPLOY_SSH_KEY` — chưa có thì mỗi lần push job deploy báo đỏ, deploy tay
  trên VPS theo đúng trình tự trong `deploy.yml`.

## 3. Zalo

- [x] **Mini App**: ID `1712187978845959925` (`MiniApp/zmp-cli.json`,
  `MiniApp/.env` `APP_ID`).
- [ ] Khai báo domain `tuyenhoaapi.dxvtech.vn` trong Zalo Mini App Console (mục
  cho phép gọi API) — thiếu thì Mini App thật không gọi được Backend.
- [x] **Zalo app/OA**: `ZALO_APP_ID` (3963230990847588986), `ZALO_APP_SECRET`,
  `ZALO_OA_TOKEN`, `ZALO_REFRESH_TOKEN` — đã điền trong `.env` trên VPS.
- [x] `ZALO_OA_ID` = `2122960456450113020` (OA "UBND xã Tuyên Hóa", lấy qua API
  `oa/getoa` ngày 10/11/2026) — nút Quan tâm OA ở tab Cá nhân.
- [ ] `ZALO_OA_SECRET_KEY` (xác thực chữ ký webhook OA) — chưa có, không bắt buộc.
- [ ] Thẻ `zalo-platform-site-verification` cho domain API: lấy mã mới trong
  Zalo for Developers, dán vào `Backend/src/app.js` (đang là comment TODO).
- [ ] Quyền "Số điện thoại" trong Mini App Console (tab Cá nhân xin SĐT).
- [ ] Kiểm duyệt Zalo: mọi link ngoài phải là `.gov.vn` (`utils/linkPolicy.js`,
  `ALLOWED_LINK_DOMAINS`). Đã bỏ DaNang AI và các link `*.danang.gov.vn`.

## 4. Tích hợp ngoài (của Đà Nẵng — không áp dụng)

- [x] **Cổng góp ý 1022** là hệ thống của TP Đà Nẵng → để trống `CGY1022_*`.
  Phản ánh dùng **mã tự cấp 6 chữ số** (`services/feedbackCodeService.js`,
  bắt đầu từ 100001), nhắn kèm trong tin cảm ơn qua Zalo, tra cứu được ở
  "Phản ánh của tôi". Nếu tỉnh có hệ thống tương tự thì viết service riêng.
- [ ] **Lịch cắt điện**: xác định điện lực phụ trách xã (EVN CPC — PC Quảng
  Trị/đơn vị cũ Quảng Bình) → `XENVN_URL` hoặc `EVNCPC_ORG_CODE/SUBORG_CODE`.
  Trống thì đồng bộ tự bỏ qua, màn hình hiện danh sách rỗng. Không đoán mã.
- [ ] **Tin tức / Văn bản** từ trang TTĐT xã: xác nhận URL rồi KIỂM TRA cấu trúc
  HTML — `newsScrapeService.js` và `vanBanTuyenHoaService.js` được viết cho
  portal VNPT của các xã Đà Nẵng, có thể phải viết lại parser. Khi chưa có,
  Trang chủ ẩn khối Tin tức, màn Văn bản rỗng.
- [ ] **Tra cứu hồ sơ TTHC**: chưa có API của tỉnh → bấm "Tra cứu" sao chép mã
  và mở Cổng DVC Quốc gia. Ô "Mã bảo mật" + khối "Kết quả tra cứu" trong bộ
  thiết kế chờ có API thật.

## 5. Nội dung & liên kết (seed + AdminWeb)

- [x] `node Backend/scripts/seed.js` — tài khoản `admin / Admin@123` (**đổi ngay**)
  + 6 lĩnh vực phản ánh theo bộ thiết kế.
- [ ] `node Backend/scripts/seed-site-content.js` — DanSo, SiteInfo (liên hệ
  trống), Du lịch/Văn hóa trống (không mang nội dung xã cũ).
- [ ] `node Backend/scripts/seed-app-links.js` — 3 lưới Trang chủ (Tiện ích
  nhanh / Chính quyền số / Kinh tế · Văn hóa · Học tập), Dịch vụ, Cổng kết nối.
  Các mục **chưa có link** (bấm vào báo "đang cập nhật"), điền qua AdminWeb →
  Icon & liên kết MiniApp khi xã xác nhận URL `.gov.vn`:
  Lãnh đạo xã, Bản đồ số, Camera an ninh, QR tài liệu, OCOP, Học AI, Học vụ số.
- [ ] **Bộ dữ liệu mở** (màn Cổng dữ liệu): thêm ở AdminWeb → Icon & liên kết →
  nhóm "Bộ dữ liệu mở" (mô tả, định dạng ở ô Badge, link file ở href).
- [ ] Danh mục thủ tục (`seed-tthc.js` là danh mục chung — rà soát theo xã),
  lịch y tế, lịch chi trả trợ cấp, thông báo: cán bộ nhập qua AdminWeb.
- [ ] Kỹ năng PCTT: ảnh nằm trên Cloudinary của dự án Trà Liên
  (`data/pctt-skills.js`), video ở `Backend/media/pctt-videos/` (ngoài git) —
  chép thư mục media sang VPS Tuyên Hóa; nên tải lại ảnh lên Cloudinary riêng.

## 6. AI

- [ ] `ANTHROPIC_API_KEY` cho Trợ lý AI (màn chat trong app). Trống thì màn vẫn
  mở, câu trả lời báo "Trợ lý số chưa được cấu hình".

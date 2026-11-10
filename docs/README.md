# Tài liệu dự án — Tuyên Hóa Số

Mini App Zalo "Tuyên Hóa Số" của UBND xã Tuyên Hóa, tỉnh Quảng Trị: tiếp nhận
phản ánh – kiến nghị (mã tra cứu tự cấp), tra cứu tiện ích (lịch cắt điện, lịch
y tế, trợ cấp, văn bản, thủ tục), Trợ lý AI, Cổng dữ liệu + khảo sát nhu cầu,
tab Cá nhân (liên kết Zalo, tích điểm), đăng tin qua Zalo OA; cùng AdminWeb cho
cán bộ xã.

Fork từ MINIAPP_TRALIEN — xem [`../CLAUDE.md`](../CLAUDE.md) cho tổng quan kỹ
thuật và [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md) cho các việc cần chuẩn
bị trước khi chạy thật.

## Giao diện MiniApp

Theo bộ thiết kế `TuyenHoaSo-XanhDuong` (bộ Xanh dương, khung 390px, phông Be
Vietnam Pro) đặt ở thư mục gốc `D:\TUYENHOA\TuyenHoaSo-XanhDuong`.

- Style dùng chung: `MiniApp/src/css/th.css` (thông số lấy nguyên từ HTML thiết kế).
- Component: `MiniApp/src/components/th/` (header, mục, lưới icon, tab, chip...).
- Bộ 48 icon 3D: `MiniApp/src/static/th-icons/<slug>.svg`.
- Các trang chưa có trong bộ thiết kế (Tin tức, Văn hóa, Du lịch, Tích điểm,
  Kỹ năng PCTT...) giữ bố cục cũ (`css/ns.css`, `ns-legacy.css`) nhưng đã đổi
  sang bảng màu xanh dương.

## Đổi icon / liên kết

AdminWeb → **Icon & liên kết MiniApp**: 3 lưới Trang chủ, danh sách Dịch vụ,
Cổng kết nối, Bộ dữ liệu mở. Ô "Icon có sẵn" nhận slug của bộ icon (vd
`phan-anh`, `ban-do`, `ocop`), hoặc chọn/tải ảnh riêng. Có hiệu lực ngay,
không cần build lại MiniApp.

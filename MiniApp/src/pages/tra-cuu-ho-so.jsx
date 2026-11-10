import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { scanQRCode } from "zmp-sdk/apis";
import { openExternal } from "../utils/open-external.js";
import { ThPage, ThHeader, ThSection, ThNote, Th3, Ic, useToast } from "../components/th/th-ui.jsx";

// Màn Tra cứu hồ sơ theo bộ giao diện "Tuyên Hóa Số" (15-TraCuuHoSo).
// Xã CHƯA có API tra cứu hồ sơ một cửa (bản Trà Liên đã bỏ IOCTC; hệ thống một
// cửa của tỉnh Quảng Trị chưa tích hợp) nên KHÔNG hiển thị kết quả trong app:
// bấm "Tra cứu" sẽ sao chép mã rồi mở Cổng Dịch vụ công Quốc gia để người dân
// dán mã vào. Ô "Mã bảo mật" và khối "Kết quả tra cứu" của bản thiết kế chờ có
// API thật (xem docs/SETUP_CHECKLIST.md).
const DVC_URL = "https://dichvucong.gov.vn/tra-cuu-ho-so";

async function copy(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* WebView chặn clipboard */
  }
  return false;
}

const TraCuuHoSoPage = () => {
  const location = useLocation();
  const [maHoSo, setMaHoSo] = useState(location.state?.prefillMaHoSo || "");
  const [toast, showToast] = useToast();

  const lookup = async (code = maHoSo) => {
    const v = code.trim();
    if (v && (await copy(v))) showToast("Đã sao chép mã hồ sơ — dán vào ô tra cứu trên Cổng DVC");
    openExternal(DVC_URL);
  };

  useEffect(() => {
    // Vào từ QR biên nhận (có mã điền sẵn): mở thẳng cổng, không bắt bấm thêm.
    if (location.state?.prefillMaHoSo) lookup(location.state.prefillMaHoSo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scan = async () => {
    try {
      const { content } = await scanQRCode({});
      const value = (content || "").trim();
      if (!value) return;
      if (/^https?:\/\//i.test(value)) openExternal(value);
      else setMaHoSo(value);
    } catch {
      /* người dùng đóng trình quét */
    }
  };

  return (
    <ThPage>
      <ThHeader title="Tra cứu hồ sơ" desc="Nhập mã hồ sơ trên giấy biên nhận để xem tiến độ giải quyết." art="tra-cuu-ho-so" />

      <section className="th-card th-card--float th-float th-stack">
        <label className="th-field">
          <span className="th-label">
            Mã hồ sơ<i> *</i>
          </span>
          <span className="th-input">
            <input
              value={maHoSo}
              onChange={(e) => setMaHoSo(e.target.value)}
              placeholder="Nhập mã in trên giấy biên nhận"
              autoCapitalize="characters"
            />
          </span>
        </label>
        <button type="button" className="th-btn" onClick={() => lookup()}>
          <Ic n="search" size={18} sw={2.2} />
          Tra cứu
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="th-meta">
          <i style={{ flex: 1, height: 1, background: "var(--th-divider)" }} />
          hoặc
          <i style={{ flex: 1, height: 1, background: "var(--th-divider)" }} />
        </div>
        <button type="button" className="th-btn th-btn--ghost" onClick={scan}>
          <Th3 name="qr-tai-lieu" size={26} />
          Quét mã QR trên biên nhận
        </button>
      </section>

      <ThNote>
        Kết quả tra cứu được hiển thị trên Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn). Ứng dụng không lưu mã hồ sơ
        của bạn.
      </ThNote>

      <ThSection title="Các bước xử lý hồ sơ">
        <div className="th-card">
          {[
            ["Đã tiếp nhận", "Bộ phận một cửa xã"],
            ["Đang thẩm định", "Công chức chuyên môn phụ trách"],
            ["Trả kết quả", "Tại bộ phận một cửa hoặc qua bưu điện"],
          ].map(([t, d], i, arr) => (
            <div key={t} style={{ position: "relative", display: "flex", gap: 12, paddingBottom: i === arr.length - 1 ? 0 : 14 }}>
              {i < arr.length - 1 && (
                <span style={{ position: "absolute", left: 11, top: 26, bottom: -2, width: 2, background: "linear-gradient(180deg,#BFD0FA,#BFEDE6)" }} />
              )}
              <span
                style={{
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "#EEF3FF",
                  color: "var(--th-primary)",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <b style={{ fontSize: 14, fontWeight: 700 }}>{t}</b>
                <span className="th-sub">{d}</span>
              </span>
            </div>
          ))}
        </div>
      </ThSection>
      {toast}
    </ThPage>
  );
};

export default TraCuuHoSoPage;

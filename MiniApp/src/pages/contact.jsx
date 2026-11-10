import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openChat } from "zmp-sdk/apis";
import { ThPage, ThHeader, ThSection, Th3, Ic, useToast } from "../components/th/th-ui.jsx";
import { fmtInt, fmtDec } from "../components/ns/ns-util.js";
import API_BASE_URL from "../data/api-config.js";
import { openExternal } from "../utils/open-external.js";
import { callPhone } from "../utils/call-phone.js";
import logo from "../static/logo-tuyenhoa.png";
import SITE from "../data/site.js";

// Màn Liên hệ theo bộ giao diện "Tuyên Hóa Số" (05-LienHe). Dữ liệu từ
// SiteInfo (MongoDB): contact.{officeName,address,website,email,workHours,
// hotline,hotline2,policeStation,mapUrl} + zaloOA. Trường trống thì ẩn dòng.
// contact.mapUrl (tuỳ chọn) = bản đồ số .gov.vn của tỉnh cho nút "Chỉ đường" —
// bỏ trống thì ẩn nút (không trỏ sang bản đồ của địa phương khác).

// Suy ra trạng thái "đang làm việc" từ chuỗi workHours có khung giờ dạng
// "07:30-11:30". Không tách được khung giờ → không hiện badge (tránh báo sai).
function getOpenStatus(workHours) {
  if (!workHours) return null;
  const ranges = [...workHours.matchAll(/(\d{1,2})[:h](\d{2})\s*[-–]\s*(\d{1,2})[:h](\d{2})/g)];
  if (!ranges.length) return null;
  const day = new Date().getDay(); // 0 = CN
  if (day === 0 || day === 6) return { open: false };
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const [, h1, m1, h2, m2] of ranges) {
    const start = Number(h1) * 60 + Number(m1);
    const end = Number(h2) * 60 + Number(m2);
    if (nowMinutes >= start && nowMinutes <= end) return { open: true, closeLabel: `${h2.padStart(2, "0")}:${m2}` };
  }
  return { open: false };
}

const InfoRow = ({ icon, label, children, onClick, trailing }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
        borderTop: "1px solid var(--th-divider)",
        background: "none",
        borderLeft: 0,
        borderRight: 0,
        borderBottom: 0,
        textAlign: "left",
        color: "inherit",
      }}
    >
      <span className="th-ib" style={{ width: 40, height: 40, borderRadius: 13 }}>
        <Th3 name={icon} size={28} />
      </span>
      <span className="th-kv" style={{ flex: 1, minWidth: 0 }}>
        <small>{label}</small>
        <span>{children}</span>
      </span>
      {trailing}
    </Tag>
  );
};

const QuickCard = ({ icon, title, desc, onClick }) => (
  <button
    type="button"
    className="th-art"
    onClick={onClick}
    style={{ border: 0, textAlign: "left", display: "flex", flexDirection: "column", gap: 8, color: "var(--th-text)" }}
  >
    <Th3 name={icon} size={44} />
    <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>{title}</span>
    <span className="th-meta" style={{ lineHeight: 1.45 }}>{desc}</span>
  </button>
);

const ContactPage = () => {
  const navigate = useNavigate();
  const [toast, showToast] = useToast();
  const [siteInfo, setSiteInfo] = useState(null);
  const [danSo, setDanSo] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/site-info`)
      .then((res) => res.json())
      .then((data) => setSiteInfo(data || {}))
      .catch(() => setSiteInfo({}));
    fetch(`${API_BASE_URL}/api/public/dan-so`)
      .then((res) => res.json())
      .then((data) => setDanSo(data || {}))
      .catch(() => setDanSo({}));
  }, []);

  const c = siteInfo?.contact || {};
  const oa = siteInfo?.zaloOA || {};
  const police = c.policeStation || {};
  const officeName = c.officeName || SITE.office;
  const openStatus = getOpenStatus(c.workHours);

  async function copyEmail() {
    if (!c.email) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(c.email);
      } else {
        const ta = document.createElement("textarea");
        ta.value = c.email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Đã sao chép email");
    } catch (e) {
      /* WebView không cho ghi clipboard — bỏ qua */
    }
  }

  function openZaloOA() {
    if (!oa.id) {
      showToast("Kênh Zalo OA đang được cập nhật");
      return;
    }
    openChat({ type: "oa", id: String(oa.id) }).catch(() => {});
  }

  return (
    <ThPage>
      <ThHeader
        tab
        title="Liên hệ & Hỗ trợ"
        desc={`Luôn sẵn sàng hỗ trợ người dân · ${officeName}, ${SITE.province.replace(/^T/, "t")}`}
        art="tai-nghe"
      />

      <section className="th-card th-card--float th-float">
        {siteInfo === null ? (
          <div className="th-spin" />
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12 }}>
              <img src={logo} alt="" width="52" height="52" className="th-logo" style={{ boxShadow: "0 6px 14px rgba(6,24,90,.18)" }} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <b style={{ fontSize: 16.5, fontWeight: 800 }}>{officeName}</b>
                <span className="th-sub">{SITE.province}</span>
                {openStatus && (
                  <span className={`th-pill th-pill--dot ${openStatus.open ? "th-pill--teal" : "th-pill--amber"}`} style={{ alignSelf: "flex-start", marginTop: 2 }}>
                    {openStatus.open ? `Đang làm việc · đến ${openStatus.closeLabel}` : "Ngoài giờ làm việc"}
                  </span>
                )}
              </span>
            </div>

            <InfoRow icon="vi-tri" label="Địa chỉ">
              {c.address || "Đang cập nhật"}
            </InfoRow>
            <InfoRow
              icon="trang-thong-tin"
              label="Website"
              onClick={c.website ? () => openExternal(/^https?:\/\//.test(c.website) ? c.website : `https://${c.website}`) : undefined}
              trailing={c.website ? <span className="th-row__chev"><Ic n="ext" size={16} /></span> : null}
            >
              {c.website || "Đang cập nhật"}
            </InfoRow>
            {c.email && (
              <InfoRow icon="zalo-chat" label="Email" onClick={copyEmail} trailing={<span className="th-row__chev"><Ic n="copy" size={16} /></span>}>
                {c.email}
              </InfoRow>
            )}
            <InfoRow icon="dong-ho" label="Giờ làm việc">
              {c.workHours || "Đang cập nhật"}
            </InfoRow>

            {c.hotline ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
                <button type="button" className="th-btn" onClick={() => callPhone(c.hotline)}>
                  <Ic n="phone" size={18} sw={2.2} />
                  Gọi {officeName} · {c.hotline}
                </button>
                {c.hotline2 && (
                  <button type="button" className="th-btn th-btn--ghost th-btn--sm" onClick={() => callPhone(c.hotline2)}>
                    Hoặc gọi số {c.hotline2}
                  </button>
                )}
              </div>
            ) : null}
          </>
        )}
      </section>

      {(police.address || police.phone) && (
        <ThSection tight style={{ marginTop: 14 }}>
          <div className="th-card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12 }}>
              <Th3 name="cong-an" size={46} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <b style={{ fontSize: 15, fontWeight: 700 }}>{police.name || "Công an xã"}</b>
                {police.address && <span className="th-sub">{police.address}</span>}
              </span>
            </div>
            {police.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid var(--th-divider)" }}>
                <span className="th-ib" style={{ width: 40, height: 40, borderRadius: 13 }}>
                  <Th3 name="hotline" size={28} />
                </span>
                <span className="th-kv" style={{ flex: 1 }}>
                  <small>Điện thoại trực ban</small>
                  <span>{police.phone}</span>
                </span>
                <button
                  type="button"
                  aria-label="Gọi trực ban"
                  onClick={() => callPhone(police.phone)}
                  style={{ width: 40, height: 40, borderRadius: 13, border: 0, background: "var(--th-btn-grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 12px rgba(22,70,200,.25)" }}
                >
                  <Ic n="phone" size={18} sw={2.2} />
                </button>
              </div>
            )}
          </div>
        </ThSection>
      )}

      <ThSection title="Kênh hỗ trợ nhanh">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
          <QuickCard icon="zalo-chat" title="Zalo OA" desc="Nhắn tin trực tiếp với cán bộ xã" onClick={openZaloOA} />
          <QuickCard icon="phan-anh" title="Gửi phản ánh" desc="Kèm ảnh, vị trí hiện tại" onClick={() => navigate("/phan-anh")} />
          <QuickCard icon="tro-ly-ai" title="Hỏi đáp AI" desc="Giải đáp thủ tục 24/7" onClick={() => navigate("/tro-ly-so")} />
          <QuickCard icon="trang-thong-tin" title="Trang thông tin" desc="Tin tức, thông báo của xã" onClick={() => navigate("/tin-tuc")} />
        </div>
      </ThSection>

      <ThSection>
        <div className="th-card th-card--flush">
          <div
            style={{
              position: "relative",
              height: 120,
              background:
                "linear-gradient(0deg,rgba(255,255,255,.0),rgba(255,255,255,0)),repeating-linear-gradient(0deg,#EAF0FA 0 1px,transparent 1px 22px),repeating-linear-gradient(90deg,#EAF0FA 0 1px,transparent 1px 22px),linear-gradient(135deg,#DDE9FB,#E6F6F2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="th-pill th-pill--dot" style={{ position: "absolute", left: 12, top: 12, background: "#fff" }}>
              Bản đồ số
            </span>
            <Th3 name="vi-tri" size={56} style={{ filter: "drop-shadow(0 8px 10px rgba(6,24,90,.25))" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
            <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <b style={{ fontSize: 14, fontWeight: 700 }}>Vị trí {officeName}</b>
              <span className="th-meta">
                {danSo.tongDanSo != null ? `${fmtInt(danSo.tongDanSo)} người` : ""}
                {danSo.dienTichKm2 != null ? ` · ${fmtDec(danSo.dienTichKm2)} km²` : ""}
              </span>
            </span>
            {c.mapUrl && (
              <button type="button" className="th-pill-btn th-pill-btn--ghost" onClick={() => openExternal(c.mapUrl)}>
                <Ic n="send" size={14} sw={2.2} />
                Chỉ đường
              </button>
            )}
          </div>
        </div>
      </ThSection>
      {toast}
    </ThPage>
  );
};

export default ContactPage;

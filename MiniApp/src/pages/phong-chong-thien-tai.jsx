import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../data/api-config.js";
import PCTT_SKILLS from "../data/pctt-skills.js";
import { openExternal } from "../utils/open-external.js";
import { callPhone } from "../utils/call-phone.js";
import { ThPage, ThHeader, ThSection, MoreLink, Th3, Ic, useToast } from "../components/th/th-ui.jsx";

// Màn Phòng chống thiên tai theo bộ giao diện "Tuyên Hóa Số" (14-PhongChongThienTai).
// - SOS gọi 112 (Tìm kiếm cứu nạn — số khẩn cấp toàn quốc).
// - Video lấy từ dữ liệu Kỹ năng PCTT (data/pctt-skills.js).
// - Số Ban Chỉ huy PCTT&TKCN xã: SiteInfo.contact.pcttPhone (AdminWeb/DB) — trống thì
//   hiện "Đang cập nhật". 112/114/115 là số khẩn cấp quốc gia.
// - Bản đồ số: SiteInfo.contact.mapUrl (.gov.vn của tỉnh) — trống thì báo đang cập nhật.
const NATIONAL = [
  ["112", "Tìm kiếm cứu nạn"],
  ["114", "Cứu hỏa"],
  ["115", "Cấp cứu y tế"],
];

const VIDEOS = PCTT_SKILLS.flatMap((s) => s.videos.map((v) => ({ ...v, skillId: s.id }))).slice(0, 3);

const PhongChongThienTaiPage = () => {
  const navigate = useNavigate();
  const [toast, showToast] = useToast();
  const [contact, setContact] = useState({});
  const phonesRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/site-info`)
      .then((res) => res.json())
      .then((d) => setContact(d?.contact || {}))
      .catch(() => setContact({}));
  }, []);

  const tiles = [
    { icon: "hotline", label: "Danh bạ PCTT", onClick: () => phonesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) },
    { icon: "ky-nang", label: "Kỹ năng PCTT", onClick: () => navigate("/pctt-ky-nang") },
    {
      icon: "ban-do",
      label: "Bản đồ số",
      onClick: () => (contact.mapUrl ? openExternal(contact.mapUrl) : showToast("Bản đồ số đang được cập nhật")),
    },
  ];

  return (
    <ThPage>
      <ThHeader
        title="Phòng chống thiên tai"
        desc="Thông tin, kỹ năng và cảnh báo phòng chống thiên tai cho người dân xã Tuyên Hóa."
        art="thien-tai"
      />

      <section className="th-card th-card--float th-float">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            borderRadius: 16,
            background: "linear-gradient(120deg,#FFF1F2,#FFE4E6)",
            border: "1px solid #FBCFD5",
          }}
        >
          <Th3 name="sos" size={50} />
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <b style={{ fontSize: 15, fontWeight: 800, color: "#C8102E" }}>SOS khẩn cấp</b>
            <span style={{ fontSize: 12, color: "#7A2E39" }}>Gọi lực lượng tìm kiếm cứu nạn 112</span>
          </span>
          <button type="button" className="th-pill-btn th-pill-btn--red" style={{ height: 38 }} onClick={() => callPhone("112")}>
            <Ic n="phone" size={15} sw={2.2} />
            Gọi SOS
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", marginTop: 14 }}>
          {tiles.map((t) => (
            <button key={t.label} type="button" className="th-gi" onClick={t.onClick}>
              <span className="th-gi__ic">
                <Th3 name={t.icon} size={44} />
              </span>
              <span className="th-gi__lb">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {VIDEOS.length > 0 && (
        <ThSection title="Video hướng dẫn" action={<MoreLink onClick={() => navigate("/pctt-ky-nang")}>Xem tất cả</MoreLink>}>
          <div className="th-list">
            {VIDEOS.map((v) => (
              <button key={v.path} type="button" className="th-row" onClick={() => navigate(`/pctt-ky-nang/${v.skillId}`)}>
                <span
                  style={{
                    position: "relative",
                    width: 92,
                    height: 58,
                    flexShrink: 0,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#2563EB,#0F3AAE)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Th3 name="bao" size={40} style={{ position: "absolute", right: -6, bottom: -6, opacity: 0.55 }} />
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.95)", color: "var(--th-primary)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <Ic n="play" size={14} sw={2.4} />
                  </span>
                </span>
                <span className="th-row__tx">
                  <b style={{ fontSize: 13.5 }}>{v.title}</b>
                </span>
              </button>
            ))}
          </div>
        </ThSection>
      )}

      <div ref={phonesRef} style={{ scrollMarginTop: 16 }}>
        <ThSection title="Số điện thoại khẩn cấp">
          <div className="th-list">
            <div className="th-row">
              <span className="th-ib">
                <Th3 name="hotline" size={30} />
              </span>
              <span className="th-row__tx">
                <b>Ban Chỉ huy PCTT&amp;TKCN xã</b>
                <span>{contact.pcttPhone || "Đang cập nhật"}</span>
              </span>
              {contact.pcttPhone && (
                <button type="button" aria-label="Gọi" className="th-send" onClick={() => callPhone(contact.pcttPhone)}>
                  <Ic n="phone" size={17} sw={2.2} />
                </button>
              )}
            </div>
            {NATIONAL.map(([num, label]) => (
              <div key={num} className="th-row">
                <span
                  className="th-ib"
                  style={{ background: "#FDE8EA", boxShadow: "inset 0 0 0 1px #FBCFD5", color: "#C8102E", fontSize: 15, fontWeight: 800 }}
                >
                  {num}
                </span>
                <span className="th-row__tx">
                  <b>{label}</b>
                  <span>Gọi {num}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Gọi ${num}`}
                  className="th-send"
                  style={{ background: "linear-gradient(160deg,#FF5A67 0%,#E92335 55%,#C8102E 100%)", boxShadow: "0 6px 12px rgba(233,35,53,.3)" }}
                  onClick={() => callPhone(num)}
                >
                  <Ic n="phone" size={17} sw={2.2} />
                </button>
              </div>
            ))}
          </div>
        </ThSection>
      </div>
      {toast}
    </ThPage>
  );
};

export default PhongChongThienTaiPage;

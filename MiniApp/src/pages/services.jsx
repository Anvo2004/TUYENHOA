import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ThPage,
  ThHeader,
  ThSection,
  ThSeg,
  LinkIcon,
  Ic,
  useAppLinks,
  useOpenLink,
  useToast,
} from "../components/th/th-ui.jsx";
import { SERVICE_CATEGORIES } from "../data/services.js";

// Trang Dịch vụ theo bộ giao diện "Tuyên Hóa Số" (02-DichVu). Dữ liệu vẫn là
// AppLink section=service (danh sách dịch vụ) và section=portal (Cổng kết nối).
const PERKS = [
  {
    label: "Nộp hồ sơ 24/7",
    icon: (<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></>),
  },
  {
    label: "Đăng nhập VNeID",
    icon: (<><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>),
  },
  {
    label: "Nhận kết quả tại nhà",
    icon: (<><path d="M4 12l16-8-6 16-2.5-6.5z" /></>),
  },
];

const STEPS = [
  ["Chọn dịch vụ", "Chọn dịch vụ cần thực hiện bên dưới"],
  ["Đăng nhập", "Bằng tài khoản VNeID hoặc số CCCD"],
  ["Nộp hồ sơ", "Điền thông tin và nộp hồ sơ trực tuyến"],
  ["Nhận kết quả", "Qua bưu điện hoặc tải về bản điện tử"],
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [toast, showToast] = useToast();
  const openLink = useOpenLink(() => showToast("Dịch vụ đang được cập nhật"));
  const services = useAppLinks("service") || [];
  const portalLinks = useAppLinks("portal") || [];

  const shown = services.filter((s) => filter === "all" || s.type === filter);

  return (
    <ThPage>
      <ThHeader
        tab
        title="Dịch vụ công trực tuyến"
        desc="Thủ tục hành chính xã Tuyên Hóa · nộp hồ sơ mọi lúc, mọi nơi"
        art="thu-tuc"
      />

      <section className="th-hero th-float th-float--50" style={{ padding: "16px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 6 }}>
          {PERKS.map((p) => (
            <div key={p.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.18)",
                  border: "1px solid rgba(255,255,255,.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {p.icon}
                </svg>
              </span>
              <span style={{ fontSize: 12, lineHeight: 1.35, fontWeight: 700 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      <ThSection title={`${STEPS.length} bước nộp hồ sơ trực tuyến`}>
        <div className="th-card">
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {STEPS.map(([title, desc], i) => {
              const last = i === STEPS.length - 1;
              return (
                <li key={title} style={{ position: "relative", display: "flex", gap: 12, paddingBottom: last ? 0 : 14 }}>
                  {!last && (
                    <span
                      style={{ position: "absolute", left: 15, top: 34, bottom: -6, width: 2, background: "linear-gradient(180deg,#BFD0FA,#BFEDE6)" }}
                    />
                  )}
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "var(--th-btn-grad)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 12px rgba(22,70,200,.25)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 1, paddingTop: 2 }}>
                    <strong style={{ fontSize: 14, fontWeight: 700 }}>{title}</strong>
                    <span className="th-sub">{desc}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div style={{ marginTop: 16 }}>
            <button type="button" className="th-btn" onClick={() => navigate("/thu-tuc-hanh-chinh")}>
              <Ic n="send" size={18} sw={2.2} />
              Bắt đầu nộp hồ sơ
            </button>
          </div>
        </div>
      </ThSection>

      <ThSection title="Danh sách dịch vụ">
        <ThSeg
          className="th-seg--inset"
          options={SERVICE_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
          value={filter}
          onChange={setFilter}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
          {shown.map((s) => (
            <button
              key={s._id}
              type="button"
              className="th-art"
              style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, border: 0, textAlign: "left", color: "var(--th-text)" }}
              onClick={() => openLink(s)}
            >
              <span style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                <LinkIcon item={s} size={46} />
                <span className={`th-pill ${s.type === "online" ? "th-pill--teal" : "th-pill--gray"}`}>
                  {s.type === "online" ? "Trực tuyến" : "Trực tiếp"}
                </span>
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.35, fontWeight: 700 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </ThSection>

      {portalLinks.length > 0 && (
        <ThSection title="Cổng kết nối">
          <div className="th-list">
            {portalLinks.map((link) => (
              <button key={link._id} type="button" className="th-row" onClick={() => openLink(link)}>
                <LinkIcon item={link} size={42} />
                <span className="th-row__tx">
                  <b style={{ fontSize: 14.5 }}>
                    {link.label}
                    {link.badge && (
                      <span className="th-badge th-badge--blue" style={{ marginLeft: 6 }}>
                        {link.badge}
                      </span>
                    )}
                  </b>
                  {link.description && <span style={{ fontSize: 12.5 }}>{link.description}</span>}
                </span>
                <span className="th-row__chev">
                  <Ic n={link.href ? "ext" : "chev"} size={16} sw={2.2} />
                </span>
              </button>
            ))}
          </div>
        </ThSection>
      )}
      {toast}
    </ThPage>
  );
};

export default ServicesPage;

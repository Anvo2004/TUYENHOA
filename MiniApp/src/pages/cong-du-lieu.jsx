import React, { useEffect, useState } from "react";
import { getAccessToken } from "zmp-sdk/apis";
import API_BASE_URL from "../data/api-config.js";
import SITE from "../data/site.js";
import { fmtInt, fmtDec } from "../components/ns/ns-util.js";
import {
  ThPage,
  ThHeader,
  ThSection,
  ThEmpty,
  LinkIcon,
  Th3,
  Ic,
  useAppLinks,
  useOpenLink,
  useToast,
} from "../components/th/th-ui.jsx";

// Màn Cổng dữ liệu theo bộ giao diện "Tuyên Hóa Số" (16-CongDuLieu):
// - Số liệu chung: /api/public/dan-so + số xã hợp nhất (data/site.js).
// - Bộ dữ liệu mở: AppLink section=data (cán bộ thêm qua AdminWeb: tên, mô tả,
//   định dạng ở "badge", link tải ở "href").
// - Khảo sát nhu cầu: POST /api/public/khao-sat (định danh bằng access token
//   Zalo, mỗi người 1 phiếu, gửi lại = đổi lựa chọn) — thống kê ở AdminWeb.
const CongDuLieuPage = () => {
  const [toast, showToast] = useToast();
  const openLink = useOpenLink(() => showToast("Bộ dữ liệu đang được cập nhật"));
  const datasets = useAppLinks("data");
  const [danSo, setDanSo] = useState({});
  const [options, setOptions] = useState([]);
  const [choice, setChoice] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/dan-so`)
      .then((res) => res.json())
      .then((d) => setDanSo(d || {}))
      .catch(() => setDanSo({}));
    fetch(`${API_BASE_URL}/api/public/khao-sat`)
      .then((res) => res.json())
      .then((d) => setOptions(d.options || []))
      .catch(() => setOptions([]));
  }, []);

  const submit = async () => {
    if (!choice || sending) return;
    setSending(true);
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/public/khao-sat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-zalo-access-token": accessToken },
        body: JSON.stringify({ option: choice }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không gửi được ý kiến");
      setSent(true);
      showToast("Cảm ơn bạn đã gửi ý kiến!");
    } catch (err) {
      showToast(err.message || "Không gửi được ý kiến, vui lòng thử lại");
    } finally {
      setSending(false);
    }
  };

  return (
    <ThPage>
      <ThHeader title="Cổng dữ liệu" desc="Dữ liệu mở của xã Tuyên Hóa và khảo sát nhu cầu của người dân." art="cong-du-lieu" />

      <section className="th-hero th-float" style={{ padding: 16 }}>
        <span className="th-hero__kicker">SỐ LIỆU CHUNG</span>
        <div className="th-stats" style={{ marginTop: 10 }}>
          <div className="th-stat">
            <strong>{fmtInt(danSo.tongDanSo)}</strong>
            <span>Dân số (người)</span>
          </div>
          <div className="th-stat">
            <strong>{fmtDec(danSo.dienTichKm2)}</strong>
            <span>Diện tích (km²)</span>
          </div>
          <div className="th-stat">
            <strong>{SITE.mergedFrom.length}</strong>
            <span>Xã hợp nhất</span>
          </div>
        </div>
      </section>

      <ThSection title="Bộ dữ liệu mở">
        {datasets === null && <div className="th-spin" />}
        {datasets?.length === 0 && (
          <div className="th-card">
            <ThEmpty icon="cong-du-lieu" title="Bộ dữ liệu đang được cập nhật" desc="Dữ liệu mở của xã sẽ được công bố tại đây." />
          </div>
        )}
        {datasets?.length > 0 && (
          <div className="th-list">
            {datasets.map((d) => (
              <button key={d._id} type="button" className="th-row" onClick={() => openLink(d)}>
                <span className="th-ib">
                  <LinkIcon item={d} size={30} />
                </span>
                <span className="th-row__tx">
                  <b>{d.label}</b>
                  {d.description && <span>{d.description}</span>}
                </span>
                {d.badge && <span className="th-badge th-badge--blue">{d.badge}</span>}
              </button>
            ))}
          </div>
        )}
      </ThSection>

      {options.length > 0 && (
        <ThSection>
          <div className="th-card th-stack" style={{ gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Th3 name="khao-sat" size={46} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--th-teal-dk)" }}>KHẢO SÁT NHU CẦU</span>
                <b style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>Bạn muốn xã ưu tiên tiện ích nào?</b>
              </span>
            </div>
            <span className="th-meta">Chọn một tiện ích</span>
            <div role="radiogroup" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((o) => {
                const on = choice === o;
                return (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setChoice(o);
                      setSent(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      height: 46,
                      padding: "0 14px",
                      borderRadius: 14,
                      border: on ? "1.5px solid #9DB8F6" : "1px solid var(--th-line)",
                      background: on ? "#EEF3FF" : "var(--th-field)",
                      color: on ? "var(--th-primary)" : "var(--th-text)",
                      fontSize: 13.5,
                      fontWeight: on ? 700 : 600,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: on ? "5px solid #1646C8" : "2px solid #B8C4DA",
                        background: "#fff",
                        flexShrink: 0,
                      }}
                    />
                    {o}
                  </button>
                );
              })}
            </div>
            <button type="button" className="th-btn" disabled={!choice || sending || sent} onClick={submit}>
              <Ic n={sent ? "check" : "send"} size={18} sw={2.2} />
              {sent ? "Đã gửi ý kiến" : sending ? "Đang gửi…" : "Gửi ý kiến"}
            </button>
          </div>
        </ThSection>
      )}
      {toast}
    </ThPage>
  );
};

export default CongDuLieuPage;

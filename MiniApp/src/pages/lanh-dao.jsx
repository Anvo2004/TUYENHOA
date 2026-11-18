import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, ThHeader, ThSection, ThChips, ThEmpty, Ic, useToast } from "../components/th/th-ui.jsx";
import { callPhone } from "../utils/call-phone.js";

// Tiện ích "Lãnh đạo xã": ảnh, chức vụ, điện thoại, email của lãnh đạo xã và các
// cơ quan, đơn vị (collection LanhDao, AdminWeb → Lãnh đạo xã). Nhóm theo "coQuan"
// đúng thứ tự xuất hiện (thuTu).
const initials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

const PersonCard = ({ p, onCopy }) => (
  <article className="th-ld">
    <span className="th-ld__photo">
      {p.anh ? <img src={p.anh} alt={p.hoTen} loading="lazy" /> : <span className="th-ld__ini">{initials(p.hoTen)}</span>}
    </span>
    <div className="th-ld__tx">
      <b>{p.hoTen}</b>
      <span className="th-ld__role">{p.chucVu}</span>
      {p.dienThoai && (
        <span className="th-ld__line">
          <Ic n="phone" size={13} color="#1646C8" />
          {p.dienThoai}
        </span>
      )}
      {p.email && (
        <span className="th-ld__line th-ld__mail">
          <Ic n="send" size={13} color="#1646C8" />
          {p.email}
        </span>
      )}
      <div className="th-ld__act">
        {p.dienThoai && (
          <button type="button" className="th-pill-btn" onClick={() => callPhone(p.dienThoai)}>
            <Ic n="phone" size={14} sw={2.2} />
            Gọi
          </button>
        )}
        {p.email && (
          <button type="button" className="th-pill-btn th-pill-btn--ghost" onClick={() => onCopy(p.email)}>
            <Ic n="copy" size={14} sw={2.2} />
            Chép email
          </button>
        )}
      </div>
    </div>
  </article>
);

const LanhDaoPage = () => {
  const [items, setItems] = useState(null);
  const [group, setGroup] = useState("all");
  const [toast, showToast] = useToast();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/lanh-dao`)
      .then((res) => res.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  const groups = useMemo(() => [...new Set((items || []).map((x) => x.coQuan || "Khác"))], [items]);
  const shown = group === "all" ? groups : [group];

  const onCopy = async (email) => showToast((await copyText(email)) ? `Đã chép ${email}` : email);

  return (
    <ThPage>
      <ThHeader title="Lãnh đạo xã" desc="Thông tin liên hệ lãnh đạo xã và các cơ quan, đơn vị" art="lanh-dao" />

      {items === null ? (
        <div className="th-sub" style={{ textAlign: "center", padding: 24 }}>Đang tải...</div>
      ) : items.length === 0 ? (
        <ThEmpty icon="lanh-dao" title="Thông tin đang được cập nhật" />
      ) : (
        <>
          <ThSection tight>
            <ThChips
              options={[{ value: "all", label: "Tất cả" }, ...groups.map((g) => ({ value: g, label: g }))]}
              value={group}
              onChange={setGroup}
            />
          </ThSection>
          {shown.map((g) => (
            <ThSection key={g} title={g}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items
                  .filter((p) => (p.coQuan || "Khác") === g)
                  .map((p) => (
                    <PersonCard key={p._id} p={p} onCopy={onCopy} />
                  ))}
              </div>
            </ThSection>
          ))}
        </>
      )}
      <div style={{ height: 24 }} />
      {toast}
    </ThPage>
  );
};

export default LanhDaoPage;

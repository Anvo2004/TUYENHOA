import React, { useEffect, useState } from "react";
import API_BASE_URL from "../data/api-config.js";
import { openExternal } from "../utils/open-external.js";
import { ThPage, ThHeader, ThSection, ThChips, ThEmpty, Th3, Ic } from "../components/th/th-ui.jsx";

// Màn Văn bản – Chính sách theo bộ giao diện "Tuyên Hóa Số" (12-VanBan). Dữ liệu
// cào từ trang TTĐT xã (vanBanTuyenHoaService.js) — chưa cấu hình nguồn thì rỗng.
const VAN_BAN_CATEGORIES = [
  { value: "all", label: "Tất cả" },
  { value: "quy-dinh", label: "Quy định" },
  { value: "chinh-sach", label: "Chính sách" },
  { value: "thong-bao", label: "Thông báo" },
  { value: "khac", label: "Khác" },
];
const CATEGORY_LABEL = Object.fromEntries(VAN_BAN_CATEGORIES.map((c) => [c.value, c.label]));
const CATEGORY_PILL = { "quy-dinh": "", "chinh-sach": "th-pill--teal", "thong-bao": "th-pill--amber", khac: "th-pill--gray" };

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const VanBanPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (q.trim()) params.set("q", q.trim());
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/public/van-ban?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setItems(data.items || []);
          setError("");
        })
        .catch(() => setError("Không thể tải danh sách văn bản. Vui lòng thử lại sau."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, q]);

  return (
    <ThPage>
      <ThHeader
        title="Văn bản – Chính sách"
        desc="Tra cứu văn bản, quy định, chính sách mới ban hành của HĐND, UBND tỉnh và xã."
        art="van-ban"
      />

      <section className="th-float" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label role="search" className="th-search th-search--flat">
          <Ic n="search" size={20} color="#8A93A8" />
          <input type="search" placeholder="Tìm theo tên, số hiệu văn bản…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <ThChips options={VAN_BAN_CATEGORIES} value={activeCategory} onChange={setActiveCategory} />
      </section>

      <ThSection tight title="Văn bản mới">
        {loading && <div className="th-spin" />}
        {!loading && error && <ThEmpty icon="van-ban" title="Không tải được danh sách" desc={error} />}
        {!loading && !error && items.length === 0 && (
          <ThEmpty icon="van-ban" title="Không tìm thấy văn bản phù hợp" desc="Văn bản mới ban hành sẽ được cập nhật tại đây." />
        )}
        {!loading &&
          !error &&
          items.map((item) => (
            <article key={item._id} className="th-art">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className={`th-pill ${CATEGORY_PILL[item.category] ?? "th-pill--gray"}`}>{CATEGORY_LABEL[item.category] || "Khác"}</span>
                {item.ngayBanHanh && <span className="th-meta">{formatDate(item.ngayBanHanh)}</span>}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <Th3 name="van-ban" size={40} style={{ flexShrink: 0 }} />
                <b style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 700 }}>{item.title}</b>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--th-divider)",
                }}
              >
                <span className="th-sub">{item.soHieu ? `Số: ${item.soHieu}` : item.source || ""}</span>
                {item.detailUrl && (
                  <button type="button" className="th-pill-btn th-pill-btn--ghost" onClick={() => openExternal(item.detailUrl)}>
                    <Ic n="file" size={15} />
                    Xem văn bản
                  </button>
                )}
              </div>
            </article>
          ))}
      </ThSection>
    </ThPage>
  );
};

export default VanBanPage;

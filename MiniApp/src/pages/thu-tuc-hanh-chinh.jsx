import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../data/api-config.js";
import { openExternal } from "../utils/open-external.js";
import { ThPage, ThHeader, ThSection, ThChips, ThEmpty, Th3, Ic } from "../components/th/th-ui.jsx";

// Màn Thủ tục hành chính theo bộ giao diện "Tuyên Hóa Số" (09-ThuTuc). Dữ liệu
// từ collection ThuTucHanhChinh (AdminWeb); chip lọc = các lĩnh vực có trong dữ liệu.
const MUC_DO = {
  "4": { label: "DVC toàn trình", cls: "th-badge" },
  "3": { label: "DVC một phần", cls: "th-badge th-badge--blue" },
};

const ThuTucHanhChinhPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [linhVuc, setLinhVuc] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/public/thu-tuc-hanh-chinh?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setItems(data.items || []);
          setError("");
        })
        .catch(() => setError("Không thể tải danh mục thủ tục. Vui lòng thử lại sau."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const fields = useMemo(() => [...new Set(items.map((i) => i.linhVuc).filter(Boolean))], [items]);
  const shown = linhVuc === "all" ? items : items.filter((i) => i.linhVuc === linhVuc);

  return (
    <ThPage>
      <ThHeader
        title="Thủ tục hành chính"
        desc="Xem trước giấy tờ cần chuẩn bị, thời gian xử lý trước khi đi làm thủ tục."
        art="thu-tuc"
      />

      <section className="th-float" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label role="search" className="th-search th-search--flat">
          <Ic n="search" size={20} color="#8A93A8" />
          <input type="search" placeholder="Tìm theo tên thủ tục, lĩnh vực…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {fields.length > 1 && (
          <ThChips
            options={[{ value: "all", label: "Tất cả" }, ...fields.map((f) => ({ value: f, label: f }))]}
            value={linhVuc}
            onChange={setLinhVuc}
          />
        )}
      </section>

      <ThSection tight title="Danh mục thủ tục" action={!loading && shown.length > 0 ? <span className="th-more">{shown.length} thủ tục</span> : null}>
        {loading && <div className="th-spin" />}
        {!loading && error && <ThEmpty icon="thu-tuc" title="Không tải được danh mục" desc={error} />}
        {!loading && !error && shown.length === 0 && (
          <ThEmpty icon="thu-tuc" title="Không tìm thấy thủ tục phù hợp" desc="Thử tìm với từ khoá khác hoặc hỏi Trợ lý AI." />
        )}
        {!loading && !error && shown.length > 0 && (
          <div className="th-list">
            {shown.map((item) => {
              const isOpen = openId === item._id;
              const md = MUC_DO[item.mucDo];
              const giayTo = (item.giayToCanNop || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              return (
                <div key={item._id} style={{ borderTop: "1px solid var(--th-divider)" }}>
                  <button type="button" className="th-row" style={{ borderTop: 0 }} onClick={() => setOpenId(isOpen ? null : item._id)}>
                    <span className="th-ib">
                      <Th3 name="thu-tuc" size={30} />
                    </span>
                    <span className="th-row__tx">
                      <b>{item.tenThuTuc}</b>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {item.linhVuc}
                        {md && <span className={md.cls}>{md.label}</span>}
                      </span>
                    </span>
                    <span className="th-row__chev">
                      <Ic n={isOpen ? "down" : "chev"} size={16} sw={2.2} />
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 14px 14px 70px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {item.thoiGianXuLy && (
                        <div className="th-kv">
                          <small>Thời gian xử lý</small>
                          <span>{item.thoiGianXuLy}</span>
                        </div>
                      )}
                      {giayTo.length > 0 && (
                        <div className="th-kv">
                          <small>Giấy tờ cần nộp</small>
                          <ol style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.5 }}>
                            {giayTo.map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {item.ghiChu && (
                        <div className="th-kv">
                          <small>Ghi chú</small>
                          <span style={{ fontWeight: 500 }}>{item.ghiChu}</span>
                        </div>
                      )}
                      {item.linkNopTrucTuyen && (
                        <button type="button" className="th-btn th-btn--sm" onClick={() => openExternal(item.linkNopTrucTuyen)}>
                          <Ic n="send" size={16} sw={2.2} />
                          Nộp hồ sơ trực tuyến
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ThSection>

      <ThSection>
        <button
          type="button"
          className="th-hero"
          onClick={() => navigate("/tro-ly-so")}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, border: 0, textAlign: "left", width: "100%" }}
        >
          <span style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 16, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Th3 name="tro-ly-ai" size={40} />
          </span>
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <b style={{ fontSize: 14.5, fontWeight: 700 }}>Chưa rõ giấy tờ cần chuẩn bị?</b>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.9)" }}>Hỏi Trợ lý AI để được hướng dẫn từng bước</span>
          </span>
          <span style={{ height: 34, padding: "0 14px", borderRadius: 999, background: "#fff", color: "var(--th-primary)", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center" }}>
            Hỏi ngay
          </span>
        </button>
      </ThSection>
    </ThPage>
  );
};

export default ThuTucHanhChinhPage;

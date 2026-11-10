import React, { useEffect, useState } from "react";
import { getAccessToken } from "zmp-sdk/apis";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, ThSection, ThChips, ThEmpty, Th3, Ic } from "../components/th/th-ui.jsx";
import FeedbackHeader, { categoryIcon } from "../components/th/feedback-header.jsx";

// Màn "Phản ánh của tôi" theo bộ giao diện "Tuyên Hóa Số" (04-PhanAnhCuaToi).
// Backend nhận diện người dùng qua access token Zalo, không qua userId client
// tự khai — nên danh sách luôn chỉ là phản ánh của chính mình. Ô tìm kiếm đầu
// trang tra cứu theo mã (mã tự cấp hoặc mã 1022, không cần đúng tài khoản Zalo).
const STATUS_PILL = {
  received: "",
  processing: "th-pill--amber",
  answered: "th-pill--teal",
};
const STEP_OF = { received: 1, processing: 2, answered: 3 };

const pad = (n) => String(n).padStart(2, "0");
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${formatDate(value)}`;
}

// "Còn 3 ngày" / "Quá hạn 2 ngày" — chỉ khi chưa trả lời.
function deadlineText(deadline, status) {
  if (!deadline || status === "answered") return null;
  const days = Math.ceil((new Date(deadline) - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, late: true };
  if (days === 0) return { text: "Đến hạn hôm nay", late: true };
  return { text: `Còn ${days} ngày`, late: false };
}

const ReportCard = ({ item, open, onToggle }) => {
  const dl = deadlineText(item.deadline, item.status);
  const step = STEP_OF[item.status] || 1;
  return (
    <article className="th-art">
      <button type="button" onClick={onToggle} style={{ display: "block", width: "100%", background: "none", border: 0, padding: 0, textAlign: "left", color: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <strong style={{ fontSize: 13.5, fontWeight: 800, color: "var(--th-primary)" }}>
              {item.code ? `#${item.code}` : "Chờ cấp mã"}
            </strong>
            <span className={`th-pill th-pill--dot ${STATUS_PILL[item.status] || ""}`}>{item.statusLabel}</span>
          </span>
          <span className="th-meta">{formatDate(item.createdAt)}</span>
        </div>
        <h3 style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.4, fontWeight: 700 }}>{item.title || item.content}</h3>
        <div className="th-progress" style={{ marginTop: 12 }}>
          {[1, 2, 3].map((i) => (
            <i key={i} className={i <= step ? "on" : ""} />
          ))}
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
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--th-sub)", minWidth: 0 }}>
            <Th3 name={categoryIcon(item.category?.name)} size={28} />
            {item.category?.name || "Chưa phân loại"}
          </span>
          {item.status === "answered" ? (
            <span className="th-more" style={{ fontSize: 12.5 }}>
              {open ? "Thu gọn" : "Xem phản hồi"}
              <Ic n={open ? "down" : "chev"} size={14} sw={2.2} />
            </span>
          ) : (
            dl && <span className={`th-pill ${dl.late ? "th-pill--red" : "th-pill--gray"}`}>{dl.text}</span>
          )}
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {item.timeline.map((s) => (
              <li key={s.key} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 1,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: s.at ? "var(--th-teal)" : "#fff",
                    border: s.at ? 0 : "2px solid #C9D7F8",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.at && <Ic n="check" size={12} sw={3} />}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <b style={{ fontSize: 13.5, fontWeight: 700, color: s.at ? "var(--th-text)" : "var(--th-muted)" }}>{s.label}</b>
                  {s.at && <span className="th-meta">{formatDateTime(s.at)}</span>}
                </span>
              </li>
            ))}
          </ol>

          <div className="th-kv">
            <small>Nội dung đã gửi</small>
            <span style={{ fontWeight: 500 }}>{item.content}</span>
          </div>
          {item.address && (
            <div className="th-kv">
              <small>Địa chỉ</small>
              <span style={{ fontWeight: 500 }}>{item.address}</span>
            </div>
          )}
          {item.imageUrls.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {item.imageUrls.map((url) => (
                <img key={url} src={url} alt="Ảnh phản ánh" style={{ width: 76, height: 76, borderRadius: 14, objectFit: "cover" }} />
              ))}
            </div>
          )}

          {item.response ? (
            <div style={{ padding: "12px 14px", borderRadius: 16, background: "#E6F8F5", border: "1px solid #C3EDE6" }}>
              <b style={{ fontSize: 13.5, color: "var(--th-teal-dk)" }}>Phản hồi của UBND xã Tuyên Hóa</b>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{item.response.text}</p>
              {item.response.sentAt && (
                <span className="th-meta" style={{ display: "block", marginTop: 6 }}>
                  Trả lời lúc {formatDateTime(item.response.sentAt)}
                </span>
              )}
            </div>
          ) : (
            <p className="th-sub">Phản ánh đang được xem xét. Bạn sẽ nhận phản hồi qua Zalo ngay khi có kết quả.</p>
          )}
        </div>
      )}
    </article>
  );
};

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");

  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeResult, setCodeResult] = useState(null);

  const searchByCode = async () => {
    const trimmed = code.trim().replace(/^#/, "");
    if (!trimmed) {
      setCodeResult(null);
      setCodeError("");
      return;
    }
    setCodeLoading(true);
    setCodeError("");
    setCodeResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/feedbacks/by-code/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tra cứu được phản ánh");
      setCodeResult(data.feedback);
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setCodeLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const accessToken = await getAccessToken();
        const res = await fetch(`${API_BASE_URL}/api/public/feedbacks/mine`, {
          headers: { "x-zalo-access-token": accessToken },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không tải được danh sách phản ánh");
        if (!cancelled) setReports(data.feedbacks || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = reports.filter((r) =>
    filter === "all" ? true : filter === "answered" ? r.status === "answered" : r.status !== "answered"
  );
  const searching = code.trim() && (codeLoading || codeError || codeResult);

  return (
    <ThPage>
      <FeedbackHeader
        active="/phan-anh-cua-toi"
        desc="Theo dõi tiến độ xử lý và phản hồi của cán bộ xã cho từng phản ánh."
      />

      <ThSection tight>
        <form
          role="search"
          className="th-search th-search--flat"
          onSubmit={(e) => {
            e.preventDefault();
            searchByCode();
          }}
        >
          <Ic n="search" size={20} color="#8A93A8" />
          <input
            type="search"
            inputMode="numeric"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (!e.target.value.trim()) {
                setCodeResult(null);
                setCodeError("");
              }
            }}
            placeholder="Tra cứu theo mã, VD: 115377"
          />
          {code.trim() && (
            <button type="submit" className="th-pill-btn">
              Tra cứu
            </button>
          )}
        </form>
        {!searching && (
          <ThChips
            options={[
              { value: "all", label: `Tất cả · ${reports.length}` },
              { value: "processing", label: "Đang xử lý" },
              { value: "answered", label: "Đã trả lời" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        )}
      </ThSection>

      <ThSection tight style={{ marginTop: 14 }}>
        {searching ? (
          <>
            {codeLoading && <div className="th-spin" />}
            {!codeLoading && codeError && <ThEmpty icon="tra-cuu-ho-so" title="Không tìm thấy" desc={codeError} />}
            {!codeLoading && codeResult && <ReportCard item={codeResult} open onToggle={() => {}} />}
          </>
        ) : (
          <>
            {loading && <div className="th-spin" />}
            {!loading && error && <ThEmpty icon="phan-anh" title="Không tải được danh sách" desc={error} />}
            {!loading && !error && shown.length === 0 && (
              <ThEmpty
                icon="phan-anh"
                title={reports.length ? "Không có phản ánh ở mục này" : "Bạn chưa gửi phản ánh nào"}
                desc="Phản ánh bạn gửi sẽ hiện ở đây kèm tiến độ xử lý."
              />
            )}
            {!loading &&
              !error &&
              shown.map((item) => (
                <ReportCard
                  key={item.id}
                  item={item}
                  open={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
              ))}
          </>
        )}
      </ThSection>
    </ThPage>
  );
};

export default MyReportsPage;

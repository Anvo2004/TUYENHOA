import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "zmp-sdk/apis";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, Th3, Ic } from "../components/th/th-ui.jsx";
import logo from "../static/logo-tuyenhoa.png";
import { thIcon } from "../components/th/th-icons.js";

// Màn Trợ lý AI theo bộ giao diện "Tuyên Hóa Số" (13-TroLyAI) — hỏi đáp ngay
// trong Mini App qua POST /api/public/assistant/ask (Backend gọi Claude API,
// tự trả 503 khi chưa cấu hình ANTHROPIC_API_KEY).
const SUGGESTIONS = [
  "Tra cứu hồ sơ một cửa",
  "Lịch cắt điện tuần này",
  "Đăng ký kết hôn cần gì?",
  "Trợ cấp người cao tuổi",
];
const CAPABILITIES = [
  "Tra cứu thủ tục và tiến độ hồ sơ",
  "Hướng dẫn nộp hồ sơ trực tuyến",
  "Hỏi đáp chính sách, pháp luật",
];

const pad = (n) => String(n).padStart(2, "0");
const hhmm = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const Bot = () => (
  <span className="th-msg__av">
    <img src={thIcon("tro-ly-ai")} alt="" />
  </span>
);

const AssistantPage = () => {
  const navigate = useNavigate();
  const [zaloUser, setZaloUser] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // [{ role: "user"|"assistant", text, at }]
  const [sending, setSending] = useState(false);
  const [startedAt] = useState(hhmm());
  const bottomRef = useRef(null);

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => setZaloUser(userInfo))
      .catch(() => setZaloUser(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const sendQuestion = async (question) => {
    const q = question.trim();
    if (!q || sending) return;
    setMessages((prev) => [...prev, { role: "user", text: q, at: hhmm() }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/assistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: zaloUser?.id, question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không trả lời được lúc này");
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, at: hhmm() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: `⚠️ ${err.message}`, at: hhmm(), error: true }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <ThPage>
      <header className="th-hdr" style={{ paddingBottom: 22 }}>
        <span aria-hidden="true" className="th-hdr__c1" />
        <span aria-hidden="true" className="th-hdr__c2" />
        <div className="th-hdr__in" style={{ gap: 16 }}>
          <div className="th-hdr__bar">
            <button type="button" aria-label="Quay lại" className="th-glassbtn" onClick={() => navigate(-1)}>
              <Ic n="back" size={19} sw={2.4} color="#fff" />
            </button>
            <img src={logo} alt="" width="30" height="30" className="th-logo th-logo--sm" />
            <span className="th-brand-sm">TRỢ LÝ CÔNG DÂN SỐ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 17,
                background: "rgba(255,255,255,.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(6,24,90,.25)",
              }}
            >
              <Th3 name="tro-ly-ai" size={40} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Trợ lý AI Tuyên Hóa</h1>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,.9)" }}>
                <i style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 0 3px rgba(52,211,153,.25)" }} />
                Trực tuyến 24/7
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="th-chat" style={{ paddingBottom: 90 }}>
        <span className="th-chat__day">Hôm nay, {startedAt}</span>

        <div className="th-msg">
          <Bot />
          <div className="th-msg__b" style={{ whiteSpace: "normal" }}>
            Xin chào! Tôi là Trợ lý AI của UBND xã Tuyên Hóa. Tôi có thể hỗ trợ bạn:
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {CAPABILITIES.map((c) => (
                <li key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#E1F6F3", color: "#0F766E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n="check" size={11} sw={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="th-msg th-msg--me" style={{ flexDirection: "column", alignItems: "flex-end" }}>
              <div className="th-msg__b">{m.text}</div>
              <span className="th-msg__t">{m.at}</span>
            </div>
          ) : (
            <div key={i} className="th-msg">
              <Bot />
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "82%" }}>
                <div className="th-msg__b" style={{ maxWidth: "100%", ...(m.error ? { background: "#FFF4DE", color: "#8A4B07" } : {}) }}>
                  {m.text}
                </div>
                <span className="th-msg__t">{m.at}</span>
              </div>
            </div>
          )
        )}

        {sending && (
          <div className="th-msg">
            <Bot />
            <div className="th-msg__b" style={{ color: "var(--th-muted)" }}>
              Đang trả lời…
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            <span className="th-label">Gợi ý câu hỏi</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="th-chip" style={{ color: "var(--th-primary)", borderColor: "#C9D7F8", display: "flex", alignItems: "center", gap: 6 }} onClick={() => sendQuestion(s)}>
                  <Ic n="search" size={14} sw={2.2} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <span className="th-meta" style={{ textAlign: "center" }}>
          AI có thể mắc lỗi — hãy kiểm tra lại thông tin quan trọng với cán bộ xã.
        </span>
        <div ref={bottomRef} />
      </div>

      <div className="th-chatbar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
        >
          <input placeholder="Nhập câu hỏi cho Trợ lý AI…" value={input} onChange={(e) => setInput(e.target.value)} disabled={sending} />
          <button type="submit" className="th-send" aria-label="Gửi" disabled={sending || !input.trim()}>
            <Ic n="send" size={18} sw={2.2} />
          </button>
        </form>
      </div>
    </ThPage>
  );
};

export default AssistantPage;

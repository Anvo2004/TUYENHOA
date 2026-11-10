import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, chooseImage } from "zmp-sdk/apis";
import API_BASE_URL from "../data/api-config.js";
import { isLinked, openCitizen } from "../data/citizen.js";
import { ThPage, ThSection, ThNote, Th3, Ic } from "../components/th/th-ui.jsx";
import FeedbackHeader from "../components/th/feedback-header.jsx";

const PHONE_RE = /^(0|\+84)[3-9]\d{8}$/;
const MAX_IMAGES = 5;
const MAX_CONTENT = 1000;

// Toạ độ lấy qua Web Geolocation chuẩn (navigator.geolocation) — chạy được
// ngay trong webview Mini App, không cần xin quyền userLocation riêng từ Zalo
// và test được cả trên Simulator (khác với zmp-sdk's getLocation(), API đó chỉ
// trả token cần đổi qua Backend và luôn rỗng ở môi trường dev).
function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error("Không lấy được vị trí")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Dịch toạ độ → địa chỉ đọc được qua Backend (KHÔNG gọi Nominatim thẳng từ
// đây — WebView Zalo Mini App thật chỉ cho fetch tới domain đã khai báo,
// xem comment ở route /api/public/reverse-geocode phía Backend).
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/reverse-geocode?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    return data.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

const Req = () => <i> *</i>;

// Màn "Gửi phản ánh" theo bộ giao diện "Tuyên Hóa Số" (03-PhanAnh).
const ReportFormPage = () => {
  const navigate = useNavigate();
  const [zaloUser, setZaloUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [contact, setContact] = useState("");
  const [linkedPhone, setLinkedPhone] = useState(""); // SĐT của hồ sơ Công dân đã liên kết
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng } | null
  const [locationMode, setLocationMode] = useState(""); // "" | "auto" | "manual"
  const [locationLoading, setLocationLoading] = useState(false);
  const [images, setImages] = useState([]); // [{ previewUrl }]
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null); // { code } sau khi gửi thành công

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => setZaloUser(userInfo))
      .catch(() => setZaloUser(null));

    fetch(`${API_BASE_URL}/api/public/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));

    // Đã liên kết tab Cá nhân → điền sẵn SĐT của hồ sơ (người dân vẫn sửa được).
    if (isLinked()) {
      openCitizen({})
        .then(({ citizen }) => {
          if (citizen?.phone) {
            setLinkedPhone(citizen.phone);
            setContact((cur) => cur || citizen.phone);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleChooseImage = async () => {
    if (images.length >= MAX_IMAGES) return;
    try {
      const { filePaths } = await chooseImage({ count: MAX_IMAGES - images.length });
      setImages((prev) => [...prev, ...filePaths.map((url) => ({ previewUrl: url }))].slice(0, MAX_IMAGES));
    } catch (err) {
      // user cancelled the picker — not an error worth surfacing
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoLocation = async () => {
    setLocationLoading(true);
    setError("");
    try {
      const { lat, lng } = await detectLocation();
      setCoords({ lat, lng });
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
      setLocationMode("auto");
    } catch (err) {
      setLocationMode("manual");
      setError("Không lấy được vị trí tự động. Vui lòng nhập tay bên dưới.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualMode = () => {
    setLocationMode("manual");
    setCoords(null);
    setAddress("");
  };

  const clearLocation = () => {
    setLocationMode("");
    setCoords(null);
    setAddress("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!zaloUser?.id) {
      setError("Không lấy được thông tin tài khoản Zalo. Vui lòng thử lại.");
      return;
    }
    const trimmedContact = contact.trim().replace(/\s+/g, "");
    if (!PHONE_RE.test(trimmedContact)) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }
    if (content.trim().length < 5) {
      setError("Nội dung phải có ít nhất 5 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", zaloUser.id);
      formData.append("displayName", zaloUser.name || "");
      formData.append("contact", trimmedContact);
      if (title.trim()) formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (categoryId) formData.append("categoryId", categoryId);
      if (address.trim()) formData.append("address", address.trim());
      if (coords) {
        formData.append("lat", coords.lat);
        formData.append("lng", coords.lng);
      }

      for (const img of images) {
        const blob = await fetch(img.previewUrl).then((r) => r.blob());
        formData.append("images", blob, "photo.jpg");
      }

      const res = await fetch(`${API_BASE_URL}/api/public/feedbacks`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi phản ánh thất bại");

      setSubmitted({ code: data.code || null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryId("");
    setContact(linkedPhone);
    setTitle("");
    setContent("");
    setAddress("");
    setCoords(null);
    setLocationMode("");
    setImages([]);
    setError("");
    setSubmitted(null);
  };

  if (submitted) {
    const selectedCategory = categories.find((cat) => cat._id === categoryId);
    return (
      <ThPage>
        <FeedbackHeader active="/phan-anh" desc="Cảm ơn bạn đã gửi phản ánh tới UBND xã Tuyên Hóa." />
        <ThSection tight>
          <div className="th-card th-card--lg" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(160deg,#2DD4BF,#14B8A6)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 20px rgba(20,184,166,.32)",
              }}
            >
              <Ic n="check" size={32} sw={2.6} />
            </span>
            <b style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Đã tiếp nhận phản ánh</b>
            {submitted.code ? (
              <>
                <span className="th-sub">Mã phản ánh của bạn</span>
                <strong style={{ fontSize: 26, fontWeight: 800, color: "var(--th-primary)", letterSpacing: ".04em" }}>
                  #{submitted.code}
                </strong>
                <span className="th-sub">Mã cũng đã được nhắn qua Zalo. Dùng mã này để tra cứu tiến độ xử lý.</span>
              </>
            ) : (
              <span className="th-sub">Mã phản ánh sẽ được nhắn cho bạn qua Zalo ngay khi hệ thống tiếp nhận.</span>
            )}
          </div>

          <div className="th-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {selectedCategory && (
              <div className="th-kv">
                <small>Lĩnh vực</small>
                <span>{selectedCategory.name}</span>
              </div>
            )}
            <div className="th-kv">
              <small>Liên hệ</small>
              <span>{contact}</span>
            </div>
            <div className="th-kv">
              <small>Nội dung</small>
              <span style={{ fontWeight: 500 }}>{content}</span>
            </div>
            {address && (
              <div className="th-kv">
                <small>Địa chỉ</small>
                <span style={{ fontWeight: 500 }}>{address}</span>
              </div>
            )}
            {images.length > 0 && (
              <div className="th-kv">
                <small>Hình ảnh</small>
                <span>{images.length} ảnh đính kèm</span>
              </div>
            )}
          </div>

          <button type="button" className="th-btn" onClick={() => navigate("/phan-anh-cua-toi")}>
            Theo dõi phản ánh của tôi
          </button>
          <button type="button" className="th-btn th-btn--ghost" onClick={resetForm}>
            Gửi phản ánh khác
          </button>
        </ThSection>
      </ThPage>
    );
  }

  return (
    <ThPage>
      <FeedbackHeader
        active="/phan-anh"
        desc="Gửi hiện trạng kèm ảnh và vị trí để cán bộ xã kịp thời tiếp nhận, xử lý."
      />

      <ThSection tight>
        <form className="th-card th-card--lg th-stack th-stack--16" onSubmit={handleSubmit}>
          {categories.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <span className="th-label">
                Lĩnh vực
              </span>
              <div className="th-chips th-chips--wrap">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    aria-pressed={categoryId === cat._id}
                    className={`th-chip th-chip--soft ${categoryId === cat._id ? "on" : ""}`}
                    onClick={() => setCategoryId(categoryId === cat._id ? "" : cat._id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="th-field">
            <span className="th-label">Tiêu đề (tùy chọn)</span>
            <span className="th-input">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Đèn đường hỏng tại thôn…"
                maxLength={120}
              />
            </span>
          </label>

          <label className="th-field">
            <span className="th-label">
              Nội dung phản ánh<Req />
            </span>
            <textarea
              className="th-textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
              placeholder="Mô tả chi tiết vấn đề bạn muốn phản ánh…"
              required
            />
            <span className="th-count">
              {content.length}/{MAX_CONTENT}
            </span>
          </label>

          <label className="th-field">
            <span className="th-label">
              Số điện thoại<Req />
            </span>
            <span className="th-input">
              <Ic n="phone" size={18} color="#1646C8" />
              <input
                type="tel"
                inputMode="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="VD: 0912 345 678"
                required
              />
            </span>
            {linkedPhone && contact === linkedPhone && (
              <span className="th-meta">✓ Lấy từ tài khoản Zalo đã liên kết — bạn có thể sửa nếu cần</span>
            )}
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span className="th-label">Vị trí (tùy chọn)</span>
            {locationMode === "" ? (
              <div className="th-btn-row">
                <button
                  type="button"
                  className="th-btn th-btn--soft"
                  style={{ height: 46, borderRadius: 14, fontSize: 13.5 }}
                  onClick={handleAutoLocation}
                  disabled={locationLoading}
                >
                  <Th3 name="vi-tri" size={24} />
                  {locationLoading ? "Đang lấy…" : "Vị trí hiện tại"}
                </button>
                <button type="button" className="th-btn th-btn--field" onClick={handleManualMode}>
                  <Ic n="edit" size={18} color="#41506E" />
                  Nhập địa chỉ
                </button>
              </div>
            ) : (
              <>
                <span className="th-input">
                  <Ic n="pin" size={18} color="#1646C8" />
                  <input
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setLocationMode("manual");
                    }}
                    placeholder="Số nhà, thôn, xã Tuyên Hóa…"
                  />
                </span>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span className="th-meta">
                    {coords ? `GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : ""}
                  </span>
                  <button type="button" className="th-more" onClick={clearLocation}>
                    Xoá vị trí
                  </button>
                </span>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span className="th-label">Hình ảnh (tối đa {MAX_IMAGES})</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={handleChooseImage}
                  style={{
                    width: 86,
                    height: 86,
                    border: "1.5px dashed #9DB8F6",
                    borderRadius: 16,
                    background: "#F3F7FF",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    color: "var(--th-primary)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <Th3 name="may-anh" size={38} />
                  Thêm ảnh
                </button>
              )}
              {images.map((img, index) => (
                <span
                  key={img.previewUrl}
                  style={{ position: "relative", width: 86, height: 86, borderRadius: 16, overflow: "hidden", border: "1px solid #E3EAF6" }}
                >
                  <img src={img.previewUrl} alt="Ảnh đính kèm" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    aria-label="Xoá ảnh"
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: 0,
                      background: "rgba(15,27,61,.7)",
                      color: "#fff",
                      fontSize: 13,
                      lineHeight: "24px",
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {/* Ô trống giữ chỗ như bản thiết kế khi chưa có ảnh */}
              {images.length === 0 &&
                [0, 1].map((i) => (
                  <span
                    key={i}
                    style={{ width: 86, height: 86, borderRadius: 16, border: "1px solid #E3EAF6", background: "var(--th-field)" }}
                  />
                ))}
            </div>
          </div>

          {error && <div className="th-err">{error}</div>}

          <button type="submit" className="th-btn" disabled={submitting}>
            <Ic n="send" size={18} sw={2.2} />
            {submitting ? "Đang gửi…" : "Gửi phản ánh"}
          </button>
        </form>
      </ThSection>

      <ThNote>Thông tin của bạn chỉ được dùng để xử lý phản ánh và không công khai.</ThNote>
    </ThPage>
  );
};

export default ReportFormPage;

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet } from "zmp-ui";
import {
  getUserInfo,
  getPhoneNumber,
  followOA,
  unfollowOA,
  openShareSheet,
  createShortcut,
} from "zmp-sdk/apis";
import API_BASE_URL from "../data/api-config.js";
import SITE from "../data/site.js";
import logo from "../static/logo-tuyenhoa.png";
import { ThPage, ThHeader, ThSection, Th3, Ic, useToast } from "../components/th/th-ui.jsx";
import {
  clearPendingReferral,
  fetchProgram,
  fetchVillages,
  isLinked,
  markLinked,
  markPhoneAsked,
  openCitizen,
  pendingReferral,
  resetPhoneAsked,
  sendPhoneToken,
  submitReferral,
  updateProfile,
  wasPhoneAsked,
} from "../data/citizen.js";

// Tab "Cá nhân" theo bộ giao diện "Tuyên Hóa Số": chưa liên kết → màn "Công dân
// số" xin phép (06-CongDan); đã liên kết → hồ sơ, điểm, OA, mã giới thiệu,
// tiện ích (07-CaNhan). Logic/API giữ nguyên (data/citizen.js).
const OFFICE = SITE.office;
const FOLLOWED_KEY = "tuyenhoa_oa_followed";
const MAX_INLINE_VILLAGES = 8;

const setLocal = (k, v) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* WebView có thể chặn localStorage — bỏ qua */
  }
};

// Che bớt định danh như bản thiết kế: "•••• •••• 3407", "09•• ••• 141".
const maskId = (id) => (id ? `•••• •••• ${String(id).slice(-4)}` : "");
const maskPhone = (p) => {
  const s = String(p || "").replace(/\D/g, "");
  return s.length >= 6 ? `${s.slice(0, 2)}•• ••• ${s.slice(-3)}` : s;
};
const initials = (name) =>
  (name || "CD")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const Row = ({ icon, title, desc, trailing, onClick }) => (
  <button type="button" className="th-row" onClick={onClick}>
    <Th3 name={icon} size={40} />
    <span className="th-row__tx">
      <b>{title}</b>
      {desc && <span>{desc}</span>}
    </span>
    {trailing || (
      <span className="th-row__chev">
        <Ic n="chev" size={16} sw={2.2} />
      </span>
    )}
  </button>
);

const VillageChip = ({ on, children, onClick, disabled }) => (
  <button
    type="button"
    aria-pressed={on}
    disabled={disabled}
    className={`th-chip th-chip--soft ${on ? "on" : ""}`}
    style={{ height: 34, padding: "0 12px", fontSize: 12.5 }}
    onClick={onClick}
  >
    {children}
  </button>
);

const CitizenPage = () => {
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState(null);
  const [program, setProgram] = useState(null);
  const [oaId, setOaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, notify] = useToast();

  const [villageSheet, setVillageSheet] = useState(false);
  const [villages, setVillages] = useState(null);
  const [referralSheet, setReferralSheet] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralError, setReferralError] = useState("");

  // Lấy tên/ảnh Zalo → tự đăng ký (lần đầu +điểm) → trả hồ sơ công dân.
  const load = useCallback(async () => {
    setError("");
    try {
      const { userInfo } = await getUserInfo({ autoRequestPermission: true });
      const data = await openCitizen({
        displayName: userInfo?.name || "",
        avatar: userInfo?.avatar || "",
        followedOA: Boolean(userInfo?.followedOA),
        referralCode: pendingReferral(),
      });
      clearPendingReferral();
      setCitizen(data.citizen);
      return data.citizen;
    } catch (err) {
      setError(err.message || "Không tải được thông tin công dân");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // SĐT: xin tự động một lần sau khi đăng ký; người dùng từ chối thì không hỏi lại
  // cho tới khi bấm "Liên kết lại".
  const askPhone = useCallback(async (force = false) => {
    if (!force && wasPhoneAsked()) return;
    markPhoneAsked();
    try {
      const { token } = await getPhoneNumber();
      if (!token) return;
      const data = await sendPhoneToken(token);
      setCitizen(data.citizen);
    } catch {
      /* từ chối hoặc chưa được cấp quyền — bỏ qua, không chặn dùng app */
    }
  }, []);

  const loadVillages = useCallback(async () => {
    try {
      setVillages(await fetchVillages());
    } catch {
      setVillages([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      fetchProgram()
        .then((d) => {
          setProgram(d.program);
          setOaId(d.oaId || "");
        })
        .catch(() => {});
      if (!isLinked()) {
        setLoading(false); // lần đầu: chờ người dùng bấm "Cho phép & liên kết"
        return;
      }
      loadVillages();
      const c = await load();
      if (c && !c.phone) askPhone(false);
    })();
  }, [load, askPhone, loadVillages]);

  // Lần đầu: xin phép MỘT lần (tên, ảnh, số điện thoại), đăng ký tài khoản
  // (+điểm), rồi mời chọn thôn để hồ sơ đầy đủ.
  const link = async () => {
    setBusy(true);
    setLoading(true);
    resetPhoneAsked();
    const c = await load();
    if (c) {
      await askPhone(true);
      markLinked();
      notify("Đã liên kết tài khoản Zalo");
      loadVillages();
      if (!c.village) setTimeout(() => setVillageSheet(true), 400);
    }
    setBusy(false);
  };

  const relink = async () => {
    setBusy(true);
    resetPhoneAsked();
    const c = await load();
    if (c) await askPhone(true);
    setBusy(false);
    if (c) notify("Đã liên kết lại thông tin Zalo");
  };

  const chooseVillage = async (v) => {
    if (citizen.village?.id === v._id) return;
    setBusy(true);
    try {
      const data = await updateProfile({ villageId: v._id });
      setCitizen(data.citizen);
      setVillageSheet(false);
      notify(`Đã chọn ${v.ten}`);
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleFollow = async () => {
    if (!oaId) return;
    try {
      if (citizen.followedOA) {
        await unfollowOA({ id: oaId });
        setLocal(FOLLOWED_KEY, null);
        const data = await updateProfile({ followedOA: false });
        setCitizen(data.citizen);
      } else {
        await followOA({ id: oaId });
        setLocal(FOLLOWED_KEY, "1");
        const data = await updateProfile({ followedOA: true });
        setCitizen(data.citizen);
        notify("Đã quan tâm Zalo OA");
      }
    } catch {
      /* người dùng huỷ trong hộp thoại của Zalo */
    }
  };

  const share = async () => {
    try {
      await openShareSheet({
        type: "zmp_deep_link",
        data: {
          title: SITE.appName,
          description: `Ứng dụng của ${OFFICE}. Nhập mã giới thiệu ${citizen.referralCode} để nhận điểm thưởng.`,
          thumbnail: `${API_BASE_URL}/brand/logo-tuyenhoa.png`,
          path: `/?ref=${citizen.referralCode}`,
        },
      });
    } catch {
      /* đóng cửa sổ chia sẻ */
    }
  };

  const pin = async () => {
    try {
      await createShortcut();
    } catch {
      notify("Thiết bị chưa hỗ trợ ghim ứng dụng");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(citizen.referralCode);
      notify("Đã sao chép mã giới thiệu");
    } catch {
      notify("Giữ vào mã để sao chép");
    }
  };

  const redeem = async () => {
    setReferralError("");
    setBusy(true);
    try {
      const data = await submitReferral(referralInput);
      setCitizen(data.citizen);
      setReferralSheet(false);
      setReferralInput("");
      notify(data.points ? `Nhập mã thành công, +${data.points} điểm` : "Nhập mã thành công");
    } catch (err) {
      setReferralError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const referrerPoints = program?.rules?.referrer?.points ?? 2;
  const registerPoints = program?.rules?.register?.points ?? 5;

  if (loading) {
    return (
      <ThPage>
        <ThHeader tab title="Cá nhân" desc="Quản lý thông tin và điểm thưởng" />
        <div className="th-spin" style={{ marginTop: 30 }} />
      </ThPage>
    );
  }

  // ---- Chưa liên kết: màn xin phép "Công dân số"
  if (!citizen) {
    const perms = [
      ["Tên và ảnh đại diện Zalo", "Hiển thị trong hồ sơ công dân của bạn."],
      ["Số điện thoại", "Để cán bộ liên hệ khi xử lý phản ánh và xác minh tài khoản tích điểm."],
      ["Thôn bạn sinh sống", "Bạn sẽ chọn ngay sau khi liên kết."],
    ];
    return (
      <ThPage>
        <ThHeader
          tab
          title="Công dân số"
          desc="Liên kết tài khoản Zalo để tích điểm và theo dõi phản ánh của bạn"
          art="vneid"
        />
        <section className="th-card th-card--float th-float" style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <img src={logo} alt="" width="58" height="58" className="th-logo" />
            <span style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <i key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#9DB8F6" }} />
              ))}
            </span>
            <Th3 name="zalo-chat" size={58} />
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Liên kết tài khoản Zalo</h2>
            <p className="th-sub" style={{ marginTop: 2 }}>
              {SITE.appName} cần bạn cho phép:
            </p>
          </div>
          <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {perms.map(([t, d]) => (
              <li key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    marginTop: 1,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "#E1F6F3",
                    color: "var(--th-teal-dk)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ic n="check" size={13} sw={3} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <b style={{ fontSize: 14, fontWeight: 700 }}>{t}</b>
                  <span className="th-sub">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          {error && (
            <p className="th-err" style={{ marginTop: 12 }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <button type="button" className="th-btn" onClick={link} disabled={busy}>
              <Ic n="shield" size={18} sw={2.2} />
              Cho phép &amp; liên kết
            </button>
            <button type="button" className="th-btn th-btn--ghost" onClick={() => navigate("/")}>
              Để sau
            </button>
          </div>
        </section>

        <section className="th-note">
          <span className="th-note__ic">
            <Ic n="shield" size={18} color="#fff" />
          </span>
          <p>
            Thông tin chỉ dùng cho dịch vụ của {OFFICE}. Bạn có thể từ chối cấp số điện thoại và vẫn sử dụng ứng dụng.
          </p>
        </section>

        <ThSection tight>
          <div className="th-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
            <Th3 name="qua-tang" size={40} />
            <b style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Liên kết lần đầu nhận</b>
            <span className="th-pill th-pill--teal">+{registerPoints} điểm</span>
          </div>
        </ThSection>
        {toast}
      </ThPage>
    );
  }

  // ---- Đã liên kết: hồ sơ công dân
  const villageList = villages || [];
  const inlineVillages = villageList.length <= MAX_INLINE_VILLAGES;
  const currentVillage = citizen.village;

  return (
    <ThPage>
      <ThHeader tab title="Cá nhân" desc="Quản lý thông tin và điểm thưởng" />

      <section className="th-card th-float th-float--50">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {citizen.avatar ? (
            <img
              src={citizen.avatar}
              alt=""
              width="66"
              height="66"
              style={{ borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 8px 18px rgba(22,70,200,.28)", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <span
              aria-hidden="true"
              style={{
                width: 66,
                height: 66,
                flexShrink: 0,
                borderRadius: "50%",
                background: "linear-gradient(140deg,#2563EB,#14B8A6)",
                border: "3px solid #fff",
                boxShadow: "0 8px 18px rgba(22,70,200,.28)",
                color: "#fff",
                fontSize: 22,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {initials(citizen.displayName)}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{citizen.displayName || "Công dân"}</h2>
              <button
                type="button"
                className="th-pill th-pill--teal"
                style={{ border: 0 }}
                onClick={() => navigate("/tich-diem")}
              >
                {citizen.tier ? citizen.tier.name : "Công dân"}
              </button>
            </span>
            <span className="th-sub">ID Zalo: {maskId(citizen.zaloUserId)}</span>
            <span className="th-sub">SĐT: {citizen.phone ? maskPhone(citizen.phone) : "Chưa liên kết"}</span>
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--th-divider)", display: "flex", flexDirection: "column", gap: 9 }}>
          <span className="th-label">Thôn sinh sống</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {villages === null ? (
              <span className="th-meta">Đang tải…</span>
            ) : inlineVillages && villageList.length > 0 ? (
              villageList.map((v) => (
                <VillageChip key={v._id} on={currentVillage?.id === v._id} disabled={busy} onClick={() => chooseVillage(v)}>
                  {v.ten}
                </VillageChip>
              ))
            ) : (
              <>
                {currentVillage && <VillageChip on>{currentVillage.name}</VillageChip>}
                <VillageChip onClick={() => setVillageSheet(true)}>
                  {villageList.length === 0 ? "Danh sách thôn đang cập nhật" : currentVillage ? "Thôn khác" : "Chọn thôn"}
                </VillageChip>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="th-hero" style={{ margin: "14px 16px 0", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Th3 name="qua-tang" size={58} style={{ flexShrink: 0, filter: "drop-shadow(0 8px 12px rgba(6,24,90,.3))" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.9)" }}>Điểm tích lũy</span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <strong style={{ fontSize: 30, lineHeight: 1.15, fontWeight: 800 }}>{citizen.points ?? 0}</strong>
              <span style={{ fontSize: 13, fontWeight: 600 }}>điểm</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/tich-diem")}
            style={{
              height: 42,
              borderRadius: 12,
              background: "#fff",
              color: "var(--th-primary)",
              border: 0,
              boxShadow: "0 6px 14px rgba(6,24,90,.2)",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
            }}
          >
            <Ic n="gift" size={18} />
            Đổi quà
          </button>
        </div>
      </section>

      <ThSection tight style={{ marginTop: 14 }}>
        {oaId && (
          <div className="th-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <Th3 name="zalo-chat" size={44} />
            <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong style={{ fontSize: 14, fontWeight: 700 }}>{citizen.followedOA ? "Đã quan tâm OA" : "Quan tâm Zalo OA"}</strong>
                {citizen.followedOA && <Ic n="check" size={15} sw={2.6} color="#14B8A6" />}
              </span>
              <span className="th-sub">{OFFICE}</span>
            </span>
            <button
              type="button"
              className={`th-pill-btn ${citizen.followedOA ? "th-pill-btn--ghost" : ""}`}
              style={{ height: 36, borderRadius: 12 }}
              onClick={toggleFollow}
            >
              {citizen.followedOA ? "Bỏ quan tâm" : "Quan tâm"}
            </button>
          </div>
        )}

        <div className="th-card" style={{ border: "1.5px dashed #BFD0FA", boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--th-muted)" }}>MÃ GIỚI THIỆU CỦA TÔI</span>
              <strong style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 800, letterSpacing: ".12em", color: "var(--th-primary)" }}>
                {citizen.referralCode}
              </strong>
            </div>
            <button type="button" className="th-pill-btn th-pill-btn--ghost" style={{ height: 40, borderRadius: 12, fontSize: 13 }} onClick={copyCode}>
              <Ic n="copy" size={16} />
              Sao chép
            </button>
          </div>
          <p style={{ margin: "10px 0 0", padding: "10px 12px", borderRadius: 12, background: "#F3F7FF", fontSize: 12.5, lineHeight: 1.5, color: "var(--th-sub)" }}>
            Mời người thân dùng {SITE.appName} để cùng nhận điểm thưởng.
          </p>
        </div>
      </ThSection>

      <ThSection title="Tiện ích">
        <div className="th-list">
          <Row
            icon="chia-se"
            title="Chia sẻ Mini App"
            desc="Mời người thân cùng sử dụng"
            onClick={share}
            trailing={<span className="th-pill th-pill--teal">+{referrerPoints} điểm</span>}
          />
          <Row
            icon="gioi-thieu"
            title="Nhập mã giới thiệu"
            desc={citizen.referredBy ? "Bạn đã nhập mã giới thiệu" : undefined}
            onClick={() => {
              setReferralError("");
              setReferralSheet(true);
            }}
          />
          <Row icon="phan-anh" title="Phản ánh của tôi" onClick={() => navigate("/phan-anh-cua-toi")} />
          <Row icon="ghim" title="Ghim ứng dụng ra màn hình" desc="Thêm lối tắt vào màn hình chính" onClick={pin} />
          <Row icon="qua-tang" title="Điểm thưởng & thể lệ" desc="Xếp hạng, lịch sử điểm, đổi quà" onClick={() => navigate("/tich-diem", { state: { tab: "the-le" } })} />
          <Row icon="trang-thong-tin" title="Thông tin ứng dụng" onClick={() => navigate("/thong-tin-ung-dung")} />
        </div>
        <button type="button" className="th-btn th-btn--ghost" onClick={relink} disabled={busy}>
          <Ic n="refresh" size={18} />
          Liên kết lại thông tin Zalo
        </button>
      </ThSection>

      {toast}

      <Sheet visible={villageSheet} onClose={() => setVillageSheet(false)} autoHeight swipeToClose>
        <div className="th-sheet">
          <b className="th-sheet__title">Chọn thôn</b>
          <p className="th-sub">Chọn nơi bạn sinh sống để nhận thông báo đúng khu vực.</p>
          {villages === null && <div className="th-spin" />}
          {villages && villages.length === 0 && <p className="th-meta" style={{ padding: "16px 0" }}>Danh sách thôn đang được cập nhật.</p>}
          <div className="th-chips th-chips--wrap" style={{ marginTop: 12, maxHeight: "50vh", overflowY: "auto" }}>
            {villageList.map((v) => (
              <VillageChip key={v._id} on={currentVillage?.id === v._id} disabled={busy} onClick={() => chooseVillage(v)}>
                {v.ten}
              </VillageChip>
            ))}
          </div>
        </div>
      </Sheet>

      <Sheet visible={referralSheet} onClose={() => setReferralSheet(false)} autoHeight swipeToClose>
        <div className="th-sheet">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Th3 name="gioi-thieu" size={44} />
            <b className="th-sheet__title">Nhập mã giới thiệu</b>
          </div>
          <p className="th-sub" style={{ marginTop: 6 }}>
            Nhập mã của người đã mời bạn để cả hai cùng nhận điểm thưởng.
          </p>
          {citizen.referredBy ? (
            <p className="th-meta" style={{ padding: "16px 0" }}>Bạn đã nhập mã giới thiệu trước đó.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <span className="th-input">
                <input
                  value={referralInput}
                  maxLength={6}
                  placeholder="Ví dụ: ABC123"
                  aria-label="Mã giới thiệu"
                  style={{ letterSpacing: ".12em", fontWeight: 700 }}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                />
              </span>
              {referralError && <div className="th-err">{referralError}</div>}
              <div className="th-btn-row">
                <button type="button" className="th-btn th-btn--ghost" onClick={() => setReferralSheet(false)}>
                  Hủy
                </button>
                <button type="button" className="th-btn" onClick={redeem} disabled={busy || referralInput.trim().length !== 6}>
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>
      </Sheet>
    </ThPage>
  );
};

export default CitizenPage;

import React from "react";
import { openExternal } from "../../utils/open-external.js";
import { Th3 } from "./th-ui.jsx";

// 1 dòng tin (Chỉ đạo điều hành, tin thiên tai): bấm mở bài gốc trên trang TTĐT xã.
const ThNewsRow = ({ item, icon = "loa" }) => (
  <button
    type="button"
    className="th-art"
    style={{ display: "flex", gap: 12, width: "100%", textAlign: "left", border: 0, cursor: "pointer" }}
    onClick={() => item.link && openExternal(item.link)}
  >
    {item.image ? (
      <img
        src={item.image}
        alt=""
        style={{ width: 72, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
      />
    ) : (
      <span className="th-ib">
        <Th3 name={icon} size={30} />
      </span>
    )}
    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
      <b style={{ fontSize: 14.5, lineHeight: 1.4, fontWeight: 700 }}>{item.title}</b>
      {item.summary && (
        <span
          className="th-sub"
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {item.summary}
        </span>
      )}
      <span className="th-meta">{item.date}</span>
    </span>
  </button>
);

export default ThNewsRow;

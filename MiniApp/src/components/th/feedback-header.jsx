import React from "react";
import { useNavigate } from "react-router-dom";
import { ThHeader, ThSeg } from "./th-ui.jsx";

// Header chung của 2 màn "Gửi phản ánh" / "Phản ánh của tôi" (03, 04 trong bộ
// giao diện): header xanh + tab phân đoạn nổi chồng lên đáy header.
const FeedbackHeader = ({ active, desc }) => {
  const navigate = useNavigate();
  return (
    <>
      <ThHeader tab variant="tabs" title="Phản ánh – Kiến nghị" desc={desc} art="phan-anh" />
      <div className="th-float th-float--30">
        <ThSeg
          options={[
            { value: "/phan-anh", label: "Gửi phản ánh" },
            { value: "/phan-anh-cua-toi", label: "Phản ánh của tôi" },
          ]}
          value={active}
          onChange={(path) => path !== active && navigate(path, { replace: true })}
        />
      </div>
    </>
  );
};

// Icon 3D minh hoạ theo tên lĩnh vực (danh mục do cán bộ đặt tên trong AdminWeb).
const CATEGORY_ICONS = [
  [/giao thông|hạ tầng|đường|cầu/i, "ban-do"],
  [/môi trường|rác|nước thải|vệ sinh/i, "du-lich"],
  [/an ninh|trật tự/i, "cong-an"],
  [/đất đai|xây dựng/i, "tru-so"],
  [/y tế|giáo dục|trường/i, "lich-y-te"],
  [/điện/i, "lich-cat-dien"],
];
export const categoryIcon = (name) =>
  (CATEGORY_ICONS.find(([re]) => re.test(name || "")) || [null, "phan-anh"])[1];

export default FeedbackHeader;

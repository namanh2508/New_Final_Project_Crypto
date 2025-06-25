import React, { useState } from "react";

const ProductTabs = ({ description, reviews }) => {
  const [tab, setTab] = useState("desc");
  return (
    <div>
      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={() => setTab("desc")}>Mô tả</button>
        <button onClick={() => setTab("reviews")}>Đánh giá</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {tab === "desc" ? (
          <div>{description || "Không có mô tả"}</div>
        ) : (
          <div>
            {reviews && reviews.length > 0
              ? reviews.map((r, i) => <div key={i}>{r}</div>)
              : "Chưa có đánh giá"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
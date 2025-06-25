import React from "react";

const ImageGallery = ({ images }) => (
  <div>
    {images && images.length > 0 ? (
      images.map((img, idx) => (
        <img key={idx} src={img} alt={`product-${idx}`} style={{ maxWidth: 100, margin: 4 }} />
      ))
    ) : (
      <span>Không có hình ảnh</span>
    )}
  </div>
);

export default ImageGallery;
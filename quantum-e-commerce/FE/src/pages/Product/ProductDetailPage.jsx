import React from 'react';
import ProductDetail from '../../components/Product/ProductDetail';
import Breadcrumb from '../../components/Layout/Breadcrumb';

const ProductDetailPage = () => {
  const breadcrumbItems = [
    { title: 'Trang chủ', href: '/' },
    { title: 'Sản phẩm', href: '/products' },
    { title: 'Chi tiết sản phẩm' }
  ];

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <ProductDetail />
    </div>
  );
};

export default ProductDetailPage;
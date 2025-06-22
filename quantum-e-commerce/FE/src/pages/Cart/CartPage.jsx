import React from 'react';
import Cart from '../../components/Cart/Cart';
import Breadcrumb from '../../components/Layout/Breadcrumb';

const CartPage = () => {
  const breadcrumbItems = [
    { title: 'Trang chủ', href: '/' },
    { title: 'Giỏ hàng' }
  ];

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <Cart />
    </div>
  );
};

export default CartPage;
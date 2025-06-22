import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  ClipboardDocumentListIcon,
  CreditCardIcon,
  KeyIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ userType = 'buyer' }) => {
  const location = useLocation();

  const buyerMenuItems = [
    { name: 'Trang chủ', href: '/', icon: HomeIcon },
    { name: 'Đơn hàng', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Thanh toán', href: '/payments', icon: CreditCardIcon },
    { name: 'Thông tin cá nhân', href: '/profile', icon: UserIcon },
    { name: 'Địa chỉ', href: '/addresses', icon: HomeIcon },
    { name: 'Chữ ký số', href: '/digital-signature', icon: KeyIcon },
    { name: 'Cài đặt', href: '/settings', icon: Cog6ToothIcon },
  ];

  const sellerMenuItems = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: HomeIcon },
    { name: 'Sản phẩm', href: '/seller/products', icon: ShoppingBagIcon },
    { name: 'Đơn hàng', href: '/seller/orders', icon: ClipboardDocumentListIcon },
    { name: 'Doanh thu', href: '/seller/revenue', icon: CreditCardIcon },
    { name: 'Thông tin shop', href: '/seller/profile', icon: UserIcon },
    { name: 'Chữ ký số', href: '/seller/digital-signature', icon: KeyIcon },
    { name: 'Cài đặt', href: '/seller/settings', icon: Cog6ToothIcon },
  ];

  const menuItems = userType === 'seller' ? sellerMenuItems : buyerMenuItems;

  return (
    <div className="w-64 bg-white shadow-sm border-r h-full">
      <nav className="mt-8">
        <div className="px-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {userType === 'seller' ? 'Quản lý Shop' : 'Tài khoản của tôi'}
          </h2>
        </div>
        
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
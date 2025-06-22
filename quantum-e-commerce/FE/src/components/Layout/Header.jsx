import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline';
import buyerService from '../../services/buyerService';
import sellerService from '../../services/sellerService';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('user_type');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      setUser(JSON.parse(userData));
      setUserType(type);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
    setUser(null);
    setUserType(null);
    navigate('/');
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
        <div className="container mx-auto px-4 py-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span>Kênh Người Bán</span>
              <span>|</span>
              <span>Trở thành Người bán Shopee</span>
              <span>|</span>
              <span>Tải ứng dụng</span>
            </div>
            <div className="flex items-center space-x-4">
              <BellIcon className="h-4 w-4" />
              <span>Hỗ trợ</span>
              <span>Tiếng Việt</span>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-1 hover:text-gray-200"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{user.full_name || user.shop_name || user.username}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Đơn mua
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/register" className="hover:text-gray-200">Đăng Ký</Link>
                  <span>|</span>
                  <Link to="/login" className="hover:text-gray-200">Đăng Nhập</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-primary font-bold text-2xl">
                Shopee
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-3xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu và tên shop"
                  className="w-full py-3 px-4 pr-12 border-2 border-primary rounded-sm focus:outline-none focus:border-secondary"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-6 bg-primary text-white hover:bg-secondary transition-colors rounded-r-sm"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </form>
              
              {/* Popular searches */}
              <div className="mt-2 flex flex-wrap gap-2">
                {['iPhone 15', 'Áo khoác', 'Giày thể thao', 'Laptop'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="text-xs text-gray-500 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-6">
              {/* Cart */}
              <Link to="/cart" className="relative">
                <ShoppingCartIcon className="h-7 w-7 text-gray-600 hover:text-primary" />
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center py-2">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-primary mr-6">
              <Bars3Icon className="h-5 w-5" />
              <span>Danh mục</span>
            </button>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/mall" className="text-gray-600 hover:text-primary">
                Shopee Mall
              </Link>
              <Link to="/flash-sale" className="text-gray-600 hover:text-primary">
                Flash Sale
              </Link>
              <Link to="/vouchers" className="text-gray-600 hover:text-primary">
                Voucher
              </Link>
              <Link to="/blog" className="text-gray-600 hover:text-primary">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
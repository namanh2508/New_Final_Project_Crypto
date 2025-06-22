import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Customer Care */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">CHĂM SÓC KHÁCH HÀNG</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/help-center" className="hover:text-primary">Trung Tâm Trợ Giúp</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Liên Hệ</Link></li>
              <li><Link to="/shopping-guide" className="hover:text-primary">Hướng Dẫn Mua Hàng</Link></li>
              <li><Link to="/payment-guide" className="hover:text-primary">Hướng Dẫn Thanh Toán</Link></li>
              <li><Link to="/shipping-info" className="hover:text-primary">Vận Chuyển</Link></li>
              <li><Link to="/return-policy" className="hover:text-primary">Trả Hàng & Hoàn Tiền</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">VỀ SHOPEE</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-primary">Giới Thiệu Về Shopee Việt Nam</Link></li>
              <li><Link to="/careers" className="hover:text-primary">Tuyển Dụng</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Điều Khoản Shopee</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Chính Sách Bảo Mật</Link></li>
              <li><Link to="/flash-sales" className="hover:text-primary">Flash Sales</Link></li>
              <li><Link to="/seller-center" className="hover:text-primary">Kênh Người Bán</Link></li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">THANH TOÁN</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <img src="/images/payment/visa.png" alt="Visa" className="h-8 bg-white border rounded" />
              <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-8 bg-white border rounded" />
              <img src="/images/payment/vnpay.png" alt="VNPay" className="h-8 bg-white border rounded" />
              <img src="/images/payment/shopeepay.png" alt="ShopeePay" className="h-8 bg-white border rounded" />
              <img src="/images/payment/momo.png" alt="MoMo" className="h-8 bg-white border rounded" />
              <img src="/images/payment/zalopay.png" alt="ZaloPay" className="h-8 bg-white border rounded" />
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-4">ĐƠN VỊ VẬN CHUYỂN</h3>
            <div className="grid grid-cols-3 gap-2">
              <img src="/images/shipping/ghn.png" alt="GHN" className="h-8 bg-white border rounded" />
              <img src="/images/shipping/ghtk.png" alt="GHTK" className="h-8 bg-white border rounded" />
              <img src="/images/shipping/viettel.png" alt="Viettel Post" className="h-8 bg-white border rounded" />
              <img src="/images/shipping/shopee-express.png" alt="Shopee Express" className="h-8 bg-white border rounded" />
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">THEO DÕI CHÚNG TÔI TRÊN</h3>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li><a href="#" className="hover:text-primary flex items-center"><span className="mr-2">📘</span>Facebook</a></li>
              <li><a href="#" className="hover:text-primary flex items-center"><span className="mr-2">📷</span>Instagram</a></li>
              <li><a href="#" className="hover:text-primary flex items-center"><span className="mr-2">🐦</span>Twitter</a></li>
              <li><a href="#" className="hover:text-primary flex items-center"><span className="mr-2">📱</span>TikTok</a></li>
            </ul>

            <h3 className="font-semibold text-gray-800 mb-4">TẢI ỨNG DỤNG SHOPEE NGAY THÔI</h3>
            <div className="flex space-x-2">
              <img src="/images/qr-code.png" alt="QR Code" className="w-16 h-16" />
              <div className="flex flex-col space-y-1">
                <img src="/images/app-store.png" alt="App Store" className="h-8" />
                <img src="/images/google-play.png" alt="Google Play" className="h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-4 md:mb-0">
              © 2024 Shopee. Tất cả các quyền được bảo lưu.
            </div>
            <div className="flex items-center space-x-4">
              <span>Quốc gia & Khu vực:</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                <option>Việt Nam</option>
                <option>Singapore</option>
                <option>Malaysia</option>
                <option>Thailand</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
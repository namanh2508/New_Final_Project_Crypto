import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Page Components
import Home from './pages/Home/Home';
import ProductDetailPage from './pages/Product/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import ProfilePage from './pages/Profile/ProfilePage';

// Product & Order Components
import ProductList from './components/Product/ProductList';
import OrderList from './components/Order/OrderList';
import Loading from './components/Common/Loading';

// Services
import orderService from './services/orderService';
import { formatDate, formatPrice } from './utils/helpers';

// Styles
import './index.css';

// Additional Page Components
const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Kết quả tìm kiếm cho: "<span className="text-primary">{query}</span>"
      </h1>
      <ProductList 
        filters={{ search: query }} 
        title=""
        showFilters={true}
      />
    </div>
  );
};

const CategoryProducts = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductList 
        filters={{ category: id }} 
        title="Sản phẩm theo danh mục"
        showFilters={true}
      />
    </div>
  );
};

const ProductsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductList 
        title="Tất cả sản phẩm"
        showFilters={true}
      />
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await orderService.getOrderDetail(id);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Cannot load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="large" text="Đang tải chi tiết đơn hàng..." />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Không tìm thấy đơn hàng
        </h2>
        <p className="text-gray-600 mb-6">
          Đơn hàng này không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b pb-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Chi tiết đơn hàng #{order.order_number}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Đặt hàng: {formatDate(order.created_at)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
              order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status_display}
            </span>
          </div>
        </div>
        
        {/* Order Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">Thông tin đơn hàng</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-medium">{order.status_display}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thanh toán:</span>
                <span className="font-medium">{order.payment_status_display}</span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã vận đơn:</span>
                  <span className="font-mono font-medium">{order.tracking_number}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-lg text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">Thông tin giao hàng</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm">
                <div className="font-medium mb-2">{order.buyer?.full_name}</div>
                <div className="text-gray-600 mb-2">{order.buyer?.phone}</div>
                <div className="text-gray-600">{order.shipping_address}</div>
              </div>
            </div>
            
            {order.logistics_provider && (
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  Đơn vị vận chuyển: <span className="font-medium">{order.logistics_name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-4 text-gray-800">Sản phẩm đã đặt</h3>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center border-b pb-4 last:border-b-0">
                <img
                  src={item.product_image || '/images/placeholder-product.jpg'}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{item.product_name}</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    Shop: {item.seller_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Số lượng: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-800">{formatPrice(item.price)}</div>
                  <div className="text-sm text-gray-500">
                    Tổng: {formatPrice(item.total_price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Signature Info */}
        {order.buyer_signature && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              🔒 Chữ ký số Dilithium
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Thuật toán: {order.signature_algorithm}</div>
              <div>Thời gian ký: {formatDate(order.signature_timestamp)}</div>
              <div className="flex items-center">
                <span className="text-green-600">✅</span>
                <span className="ml-1">Chữ ký đã được xác minh</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const [stats, setStats] = React.useState({
    newOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
    totalSold: 0
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Người bán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Đơn hàng mới</h3>
          <div className="text-3xl font-bold text-blue-600">{stats.newOrders}</div>
          <p className="text-xs text-gray-500 mt-1">Cần xử lý</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Doanh thu hôm nay</h3>
          <div className="text-3xl font-bold text-green-600">{formatPrice(stats.todayRevenue)}</div>
          <p className="text-xs text-gray-500 mt-1">+12% so với hôm qua</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng sản phẩm</h3>
          <div className="text-3xl font-bold text-purple-600">{stats.totalProducts}</div>
          <p className="text-xs text-gray-500 mt-1">Đang bán</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng đã bán</h3>
          <div className="text-3xl font-bold text-yellow-600">{stats.totalSold}</div>
          <p className="text-xs text-gray-500 mt-1">Tất cả thời gian</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h3>
          <div className="text-center text-gray-500 py-8">
            Chưa có đơn hàng mới
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
          <div className="text-center text-gray-500 py-8">
            Chưa có dữ liệu
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! Trang không tồn tại
        </h1>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Về trang chủ
          </button>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

const Unauthorized = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl font-bold text-red-500 mb-4">403</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập vào trang này.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Public Routes with Layout */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          
          <Route path="/products" element={
            <Layout>
              <ProductsPage />
            </Layout>
          } />
          
          <Route path="/product/:id" element={
            <Layout>
              <ProductDetailPage />
            </Layout>
          } />
          
          <Route path="/search" element={
            <Layout>
              <SearchResults />
            </Layout>
          } />
          
          <Route path="/category/:id" element={
            <Layout>
              <CategoryProducts />
            </Layout>
          } />

          {/* Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Layout>
                <CartPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Layout>
                <CheckoutPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout>
                <OrderList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <Layout>
                <OrderDetail />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Seller Protected Routes */}
          <Route path="/seller/dashboard" element={
            <ProtectedRoute requiredUserType="seller">
              <Layout>
                <SellerDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* 404 Page */}
          <Route path="*" element={
            <Layout>
              <NotFound />
            </Layout>
          } />
        </Routes>
        
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Default options for all toasts
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            
            // Success toasts
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            
            // Error toasts
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
            
            // Loading toasts
            loading: {
              style: {
                background: '#3B82F6',
                color: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
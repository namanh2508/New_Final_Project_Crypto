import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../../components/Product/ProductList';
import productService from '../../services/productService';
import Loading from '../../components/Common/Loading';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
        productService.getFeaturedProducts(),
        productService.getTrendingProducts(),
        productService.getCategories()
      ]);

      if (featuredRes.success) setFeaturedProducts(featuredRes.data);
      if (trendingRes.success) setTrendingProducts(trendingRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      
    } catch (error) {
      toast.error('Không thể tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="large" text="Đang tải trang chủ..." />;
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Mua sắm trực tuyến
          </h1>
          <p className="text-xl mb-8">
            Hàng triệu sản phẩm với giá tốt nhất
          </p>
          <Link to="/products" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Khám phá ngay
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Danh mục nổi bật</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <img
                      src={category.image || '/images/category-placeholder.png'}
                      alt={category.name}
                      className="w-10 h-10 object-cover"
                    />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-primary">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale */}
      <section className="py-12 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-600 mb-2">⚡ FLASH SALE</h2>
            <p className="text-gray-600">Khuyến mãi có thời hạn</p>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="bg-red-600 text-white px-3 py-2 rounded font-bold">02</div>
              <div className="bg-red-600 text-white px-3 py-2 rounded font-bold">:</div>
              <div className="bg-red-600 text-white px-3 py-2 rounded font-bold">45</div>
              <div className="bg-red-600 text-white px-3 py-2 rounded font-bold">:</div>
              <div className="bg-red-600 text-white px-3 py-2 rounded font-bold">30</div>
            </div>
          </div>
          
          {featuredProducts.length > 0 && (
            <ProductList 
              title=""
              products={featuredProducts.slice(0, 6)}
              showFilters={false}
            />
          )}
        </div>
      </section>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <ProductList 
              title="🔥 Sản phẩm xu hướng"
              products={trendingProducts}
              showFilters={false}
            />
          </div>
        </section>
      )}

      {/* Shopee Mall */}
      <section className="py-12 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">🏬 SHOPEE MALL</h2>
            <p className="text-gray-600">Thương hiệu chính hãng</p>
          </div>
          
          <ProductList 
            title=""
            filters={{ seller__shop_type: 'shopee_mall' }}
            showFilters={false}
            itemsPerPage={8}
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn Shopee?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Miễn phí vận chuyển</h3>
              <p className="text-gray-600">Giao hàng miễn phí cho đơn hàng từ 150k</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bảo mật thanh toán</h3>
              <p className="text-gray-600">Chữ ký số Dilithium đảm bảo an toàn tuyệt đối</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">↩️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đổi trả dễ dàng</h3>
              <p className="text-gray-600">Đổi trả miễn phí trong vòng 15 ngày</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
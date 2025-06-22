import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import productService from '../../services/productService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import ProductSkeleton from './ProductSkeleton';
import ImageGallery from './ImageGallery';
import ProductTabs from './ProductTabs';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductDetail(id);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        toast.error('Không thể tải thông tin sản phẩm');
        navigate('/');
      }
    } catch (error) {
      toast.error('Lỗi tải sản phẩm');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!localStorage.getItem('access_token')) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    // TODO: Implement add to cart logic
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (!localStorage.getItem('access_token')) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // TODO: Implement buy now logic
    navigate('/checkout', { state: { products: [{ ...product, quantity }] } });
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm không tồn tại</h2>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const { 
    name, 
    description, 
    price, 
    stock, 
    images, 
    rating, 
    seller,
    category,
    reviews_summary 
  } = product;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ImageGallery images={images} productName={name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{name}</h1>
            
            {/* Rating & Sales */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <span className="text-primary font-medium mr-1">{rating}</span>
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">({reviews_summary?.total_reviews || 0} đánh giá)</span>
              </div>
              <span className="text-gray-500">
                {product.sold_count} đã bán
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(price)}
              </span>
              {/* TODO: Add discount price logic */}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-1 text-center border-l border-r border-gray-300 focus:outline-none"
              />
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <span className="text-gray-500 text-sm">
              {stock} sản phẩm có sẵn
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-secondary"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 btn-primary"
            >
              Mua ngay
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {isFavorited ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Chia sẻ:</span>
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
              <ShareIcon className="h-4 w-4" />
              <span>Facebook</span>
            </button>
            <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-600">
              <ShareIcon className="h-4 w-4" />
              <span>Twitter</span>
            </button>
          </div>

          {/* Seller Info */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Thông tin Shop</h3>
              <button className="text-primary hover:text-secondary text-sm">
                Xem Shop
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tên Shop:</span>
                <span className="font-medium">{seller.shop_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đánh giá:</span>
                <span className="font-medium">{seller.rating}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sản phẩm:</span>
                <span className="font-medium">{seller.total_products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã bán:</span>
                <span className="font-medium">{seller.total_sold}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <ProductTabs product={product} />
      </div>
    </div>
  );
};

export default ProductDetail;
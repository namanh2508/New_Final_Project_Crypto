import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import Pagination from '../Common/Pagination';
import productService from '../../services/productService';
import toast from 'react-hot-toast';

const ProductList = ({ 
  title = "Sản phẩm", 
  filters = {}, 
  showFilters = true,
  itemsPerPage = 20 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage,
        page_size: itemsPerPage,
        ordering: sortBy
      };

      const response = await productService.getProducts(params);
      
      if (response.success) {
        setProducts(response.data.results || response.data);
        setTotalPages(Math.ceil((response.data.count || response.data.length) / itemsPerPage));
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(itemsPerPage)].map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        
        {showFilters && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">Liên quan</option>
              <option value="-created_at">Mới nhất</option>
              <option value="price">Giá thấp đến cao</option>
              <option value="-price">Giá cao đến thấp</option>
              <option value="-rating">Đánh giá cao nhất</option>
              <option value="-sold_count">Bán chạy nhất</option>
            </select>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm nào</div>
          <div className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
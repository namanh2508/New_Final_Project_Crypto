import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class ProductService {
  // Lấy danh sách sản phẩm
  async getProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy chi tiết sản phẩm
  async getProductDetail(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tạo sản phẩm mới (seller)
  async createProduct(productData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật sản phẩm (seller)
  async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRODUCT_DETAIL(id), productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xóa sản phẩm (seller)
  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRODUCT_DETAIL(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh mục
  async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sản phẩm nổi bật
  async getFeaturedProducts() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FEATURED_PRODUCTS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sản phẩm xu hướng
  async getTrendingProducts() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRENDING_PRODUCTS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tìm kiếm sản phẩm
  async searchProducts(query, filters = {}) {
    try {
      const params = { q: query, ...filters };
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_SEARCH, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sản phẩm liên quan
  async getRelatedProducts(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT_DETAIL(id)}related/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Có lỗi xảy ra',
        errors: error.response.data.errors || {},
        status: error.response.status
      };
    }
    return { message: 'Lỗi kết nối mạng', errors: {}, status: 0 };
  }
}

export default new ProductService();
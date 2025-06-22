import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class SellerService {
  // Đăng ký seller
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SELLER_REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đăng nhập seller
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SELLER_LOGIN, credentials);
      const { tokens, seller } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_type', 'seller');
      localStorage.setItem('user_data', JSON.stringify(seller));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy thông tin profile seller
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SELLER_PROFILE);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật thông tin seller
  async updateProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SELLER_PROFILE, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách sellers
  async getSellers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SELLERS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy chi tiết seller
  async getSellerDetail(sellerId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SELLER_DETAIL(sellerId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy sản phẩm của seller
  async getSellerProducts(sellerId, params = {}) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SELLER_DETAIL(sellerId)}products/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy thống kê seller
  async getSellerStats(sellerId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SELLER_DETAIL(sellerId)}stats/`);
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

export default new SellerService();
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class AuthService {
  // Đăng ký buyer
  async registerBuyer(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BUYER_REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đăng nhập buyer
  async loginBuyer(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BUYER_LOGIN, credentials);
      const { tokens, buyer } = response.data;
      
      // Lưu tokens vào localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_type', 'buyer');
      localStorage.setItem('user_data', JSON.stringify(buyer));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đăng ký seller
  async registerSeller(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SELLER_REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đăng nhập seller
  async loginSeller(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SELLER_LOGIN, credentials);
      const { tokens, seller } = response.data;
      
      // Lưu tokens vào localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_type', 'seller');
      localStorage.setItem('user_data', JSON.stringify(seller));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Lấy loại user
  getUserType() {
    return localStorage.getItem('user_type');
  }

  // Xử lý lỗi
  handleError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Có lỗi xảy ra',
        errors: error.response.data.errors || {},
        status: error.response.status
      };
    }
    return {
      message: 'Lỗi kết nối mạng',
      errors: {},
      status: 0
    };
  }
}

export default new AuthService();
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class BuyerService {
  // Đăng ký buyer
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BUYER_REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đăng nhập buyer
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BUYER_LOGIN, credentials);
      const { tokens, buyer } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_type', 'buyer');
      localStorage.setItem('user_data', JSON.stringify(buyer));
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy thông tin profile
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUYER_PROFILE);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BUYER_PROFILE, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách địa chỉ
  async getAddresses() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUYER_ADDRESSES);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Thêm địa chỉ mới
  async addAddress(addressData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BUYER_ADDRESSES, addressData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật địa chỉ
  async updateAddress(addressId, addressData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.BUYER_ADDRESSES}${addressId}/`, addressData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xóa địa chỉ
  async deleteAddress(addressId) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.BUYER_ADDRESSES}${addressId}/`);
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
  async createDigitalSignature(userId) {
    try {
      // Gọi API để tạo chữ ký số cho người dùng
      const response = await apiClient.post(`/api/buyers/${userId}/create-digital-signature/`);
      return response.data;
    } catch (error) {
      // Xử lý lỗi
      throw this.handleError(error); // Nên dùng handleError để thống nhất
    }
  }
}

const buyerService = new BuyerService();
export default buyerService;
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class PaymentService {
  // Tạo thanh toán
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách thanh toán
  async getPayments(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy chi tiết thanh toán
  async getPaymentDetail(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS}${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xác nhận thanh toán
  async confirmPayment(id) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.PAYMENTS}${id}/confirm/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đánh dấu thanh toán thất bại
  async failPayment(id, reason) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.PAYMENTS}${id}/fail/`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tạo yêu cầu hoàn tiền
  async createRefund(refundData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REFUNDS, refundData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách hoàn tiền
  async getRefunds(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REFUNDS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Phê duyệt hoàn tiền
  async approveRefund(id) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.REFUNDS}${id}/approve/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hoàn thành hoàn tiền
  async completeRefund(id) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.REFUNDS}${id}/complete/`);
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

export default new PaymentService();
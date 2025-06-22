import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class OrderService {
  // Tạo đơn hàng
  async createOrder(orderData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_ORDER, orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách đơn hàng
  async getOrders(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetail(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDER_DETAIL(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xác nhận đơn hàng (seller)
  async confirmOrder(id) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.ORDER_DETAIL(id)}confirm/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Giao hàng (seller)
  async shipOrder(id, trackingNumber) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.ORDER_DETAIL(id)}ship/`, {
        tracking_number: trackingNumber
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hủy đơn hàng
  async cancelOrder(id, reason) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.ORDER_DETAIL(id)}cancel/`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xác nhận nhận hàng (buyer)
  async completeOrder(id) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.ORDER_DETAIL(id)}complete/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy đơn vị vận chuyển
  async getLogisticsProviders() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LOGISTICS_PROVIDERS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy phương thức thanh toán
  async getPaymentMethods() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENT_METHODS);
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

export default new OrderService();
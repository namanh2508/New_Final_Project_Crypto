import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

class SignatureService {
  // Tạo cặp khóa Dilithium
  async generateKeypair() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.GENERATE_KEYPAIR);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ký tin nhắn
  async signMessage(signatureData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SIGN_MESSAGE, signatureData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xác minh chữ ký
  async verifySignature(verificationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_SIGNATURE, verificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy log chữ ký
  async getSignatureLogs(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SIGNATURE_LOGS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy thống kê chữ ký
  async getSignatureStats() {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SIGNATURE_LOGS}stats/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy Certificate Authorities
  async getCertificateAuthorities() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CERTIFICATE_AUTHORITIES);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy CA hỗ trợ quantum-safe
  async getQuantumSafeCAs() {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.CERTIFICATE_AUTHORITIES}quantum_safe/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ký đơn hàng (buyer)
  async signOrder(orderId, message, privateKey) {
    try {
      const signatureData = {
        entity_type: 'order',
        entity_id: orderId,
        message: message,
        private_key: privateKey
      };
      return await this.signMessage(signatureData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ký thanh toán
  async signPayment(paymentId, message, privateKey) {
    try {
      const signatureData = {
        entity_type: 'payment',
        entity_id: paymentId,
        message: message,
        private_key: privateKey
      };
      return await this.signMessage(signatureData);
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

export default new SignatureService();
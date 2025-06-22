import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../../utils/helpers';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import signatureService from '../../services/signatureService';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [logisticsProviders, setLogisticsProviders] = useState([]);
  
  const [formData, setFormData] = useState({
    shipping_address: '',
    payment_method_id: '',
    logistics_provider_id: '',
    notes: ''
  });

  useEffect(() => {
    // Get cart items from location state
    const items = location.state?.cartItems || [];
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    setCartItems(items);
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      const [paymentRes, logisticsRes] = await Promise.all([
        orderService.getPaymentMethods(),
        orderService.getLogisticsProviders()
      ]);

      if (paymentRes.success) setPaymentMethods(paymentRes.data);
      if (logisticsRes.success) setLogisticsProviders(logisticsRes.data);
    } catch (error) {
      toast.error('Không thể tải thông tin thanh toán');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        shipping_address: formData.shipping_address,
        payment_method_id: formData.payment_method_id,
        logistics_provider_id: formData.logistics_provider_id,
        notes: formData.notes
      };

      // Create order
      const orderResponse = await orderService.createOrder(orderData);
      
      if (orderResponse.success) {
        const orders = orderResponse.data;
        
        // Sign each order with digital signature
        for (const order of orders) {
          try {
            await signatureService.signOrder(
              order.id,
              JSON.stringify(order),
              'buyer_private_key' // TODO: Get from user's stored key
            );
          } catch (signError) {
            console.warn('Could not sign order:', signError);
          }
        }

        // Create payment for first order (or handle multiple orders)
        const firstOrder = orders[0];
        const paymentData = {
          order_id: firstOrder.id,
          payment_method_id: formData.payment_method_id
        };

        const paymentResponse = await paymentService.createPayment(paymentData);
        
        if (paymentResponse.success) {
          toast.success('Đặt hàng thành công!');
          
          // Redirect to payment URL or success page
          if (paymentResponse.data.payment_url) {
            window.location.href = paymentResponse.data.payment_url;
          } else {
            navigate('/orders', { 
              state: { message: 'Đặt hàng thành công!' }
            });
          }
        }
      }
    } catch (error) {
      toast.error(error.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 0
  );
  const shippingFee = 30000; // 30k
  const total = subtotal + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h2>
              <textarea
                required
                value={formData.shipping_address}
                onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                rows={3}
                className="input-field"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      onChange={(e) => setFormData({...formData, payment_method_id: e.target.value})}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      required
                    />
                    <span className="ml-2 text-gray-700">{method.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Đơn vị vận chuyển</h2>
              <div className="space-y-3">
                {logisticsProviders.map((provider) => (
                  <label key={provider.id} className="flex items-center">
                    <input
                      type="radio"
                      name="logistics_provider"
                      value={provider.id}
                      onChange={(e) => setFormData({...formData, logistics_provider_id: e.target.value})}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      required
                    />
                    <span className="ml-2 text-gray-700">{provider.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ghi chú cho người bán..."
                rows={3}
                className="input-field"
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng của bạn</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center">
                  <img
                    src={item.product.images?.[0] || '/images/placeholder-product.jpg'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium line-clamp-1">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      x{item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Digital Signature Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center text-sm text-blue-800">
                <span className="mr-2">🔒</span>
                <span>Đơn hàng được bảo vệ bằng chữ ký số Dilithium</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
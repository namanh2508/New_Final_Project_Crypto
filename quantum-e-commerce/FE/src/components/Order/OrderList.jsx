import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import { ORDER_STATUS } from '../../utils/constants';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: ORDER_STATUS.PENDING, label: 'Chờ xác nhận' },
    { key: ORDER_STATUS.CONFIRMED, label: 'Đã xác nhận' },
    { key: ORDER_STATUS.SHIPPING, label: 'Đang giao' },
    { key: ORDER_STATUS.DELIVERED, label: 'Hoàn thành' },
    { key: ORDER_STATUS.CANCELLED, label: 'Đã hủy' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await orderService.getOrders(params);
      
      if (response.success) {
        setOrders(response.data.results || response.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (action, order) => {
    try {
      switch (action) {
        case 'cancel':
          await orderService.cancelOrder(order.id, 'Người dùng hủy');
          toast.success('Đã hủy đơn hàng');
          break;
        case 'confirm_received':
          await orderService.completeOrder(order.id);
          toast.success('Đã xác nhận nhận hàng');
          break;
        case 'review':
          // TODO: Navigate to review page
          break;
        default:
          break;
      }
      
      fetchOrders(); // Refresh list
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {activeTab === 'all' ? 'Chưa có đơn hàng nào' : `Chưa có đơn hàng ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={handleOrderAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_DISPLAY } from '../../utils/constants';

const OrderCard = ({ order, onAction }) => {
  const {
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    items,
    seller_name,
    created_at,
    tracking_number
  } = order;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'shipping': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const canCancel = status === 'pending' || status === 'confirmed';
  const canConfirmReceived = status === 'shipping';

  return (
    <div className="bg-white rounded-lg shadow border p-6 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-800">#{order_number}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {ORDER_STATUS_DISPLAY[status]}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Đặt hàng: {formatDate(created_at)} • Shop: {seller_name}
          </div>
        </div>
        
        <Link
          to={`/orders/${id}`}
          className="text-primary hover:text-secondary text-sm font-medium"
        >
          Xem chi tiết
        </Link>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {items?.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center">
            <img
              src={item.product_image || '/images/placeholder-product.jpg'}
              alt={item.product_name}
              className="w-16 h-16 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800 line-clamp-1">
                {item.product_name}
              </div>
              <div className="text-sm text-gray-500">
                x{item.quantity} • {formatPrice(item.price)}
              </div>
            </div>
          </div>
        ))}
        
        {items?.length > 2 && (
          <div className="text-sm text-gray-500 text-center py-2">
            ... và {items.length - 2} sản phẩm khác
          </div>
        )}
      </div>

      {/* Tracking */}
      {tracking_number && (
        <div className="bg-gray-50 rounded p-3 mb-4">
          <div className="text-sm text-gray-600">
            Mã vận đơn: <span className="font-mono">{tracking_number}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-right">
          <div className="text-sm text-gray-600">Tổng tiền:</div>
          <div className="text-lg font-bold text-primary">
            {formatPrice(total_amount)}
          </div>
        </div>

        <div className="flex space-x-2">
          {canCancel && (
            <button
              onClick={() => onAction('cancel', order)}
              className="btn-secondary text-sm"
            >
              Hủy đơn
            </button>
          )}
          
          {canConfirmReceived && (
            <button
              onClick={() => onAction('confirm_received', order)}
              className="btn-primary text-sm"
            >
              Đã nhận hàng
            </button>
          )}
          
          {status === 'delivered' && (
            <button
              onClick={() => onAction('review', order)}
              className="btn-primary text-sm"
            >
              Đánh giá
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
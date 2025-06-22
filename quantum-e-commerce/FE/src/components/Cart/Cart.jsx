import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      // TODO: Call cart API
      // const response = await cartService.getCart();
      
      // Mock data for now
      const mockItems = [
        {
          id: '1',
          product: {
            id: '1',
            name: 'iPhone 15 Pro Max 256GB',
            price: 29990000,
            stock: 10,
            images: ['/images/iphone15.jpg'],
            seller_name: 'Apple Store'
          },
          quantity: 1,
          selected: true
        }
      ];
      
      setCartItems(mockItems);
    } catch (error) {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      // TODO: Call update quantity API
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Đã cập nhật số lượng');
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // TODO: Call remove item API
      setCartItems(items => items.filter(item => item.id !== itemId));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggleSelect = (itemId) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 0
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    
    navigate('/checkout', { state: { cartItems: selectedItems } });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">Giỏ hàng của bạn đang trống</div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-4"
            />
            <span className="flex-1 font-medium">Sản phẩm</span>
            <span className="w-24 text-center">Đơn giá</span>
            <span className="w-32 text-center">Số lượng</span>
            <span className="w-24 text-center">Thành tiền</span>
            <span className="w-16"></span>
          </div>

          {/* Cart Items */}
          <div>
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-2"
                />
                <span>Chọn tất cả ({cartItems.length})</span>
                
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => {
                      selectedItems.forEach(item => handleRemoveItem(item.id));
                    }}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Tổng thanh toán ({selectedItems.length} sản phẩm):
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(totalAmount)}
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mua hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
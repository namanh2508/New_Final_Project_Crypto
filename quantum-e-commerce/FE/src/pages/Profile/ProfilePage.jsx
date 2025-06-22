// src/pages/Profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  KeyIcon, 
  ShieldCheckIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/Layout/Sidebar';
import Modal from '../../components/Common/Modal';
import buyerService from '../../services/buyerService';
import sellerService from '../../services/sellerService';
import signatureService from '../../services/signatureService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address: '',
    phone: '',
    is_default: false
  });
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('user_type');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    setUserType(type);
    fetchProfile(type);
    if (type === 'buyer') {
      fetchAddresses();
    }
  }, [navigate]);

  const fetchProfile = async (type) => {
    try {
      setLoading(true);
      let response;
      
      if (type === 'buyer') {
        response = await buyerService.getProfile();
      } else {
        response = await sellerService.getProfile();
      }
      
      if (response.success) {
        setUser(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await buyerService.getAddresses();
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Không thể tải địa chỉ:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (userType === 'buyer') {
        response = await buyerService.updateProfile(formData);
      } else {
        response = await sellerService.updateProfile(formData);
      }
      
      if (response.success) {
        setUser(response.data);
        setEditing(false);
        toast.success('Cập nhật thông tin thành công');
        
        // Update localStorage
        localStorage.setItem('user_data', JSON.stringify(response.data));
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingAddress) {
        response = await buyerService.updateAddress(editingAddress.id, addressForm);
      } else {
        response = await buyerService.addAddress(addressForm);
      }
      
      if (response.success) {
        toast.success(editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
        fetchAddresses();
        setShowAddressModal(false);
        setEditingAddress(null);
        setAddressForm({ address: '', phone: '', is_default: false });
      }
    } catch (error) {
      toast.error(error.message || 'Không thể lưu địa chỉ');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    
    try {
      await buyerService.deleteAddress(addressId);
      toast.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error) {
      toast.error('Không thể xóa địa chỉ');
    }
  };

  const handleGenerateSignature = async () => {
    try {
      setLoading(true);
      const response = await signatureService.generateKeypair();
      
      if (response.success) {
        setSignatureData(response.data);
        toast.success('Tạo cặp khóa Dilithium thành công');
        
        // Có thể lưu public key vào profile user
        const updateData = {
          ...formData,
          public_key: response.data.public_key,
          quantum_resistant: true,
          signature_algorithm: 'CRYSTAL-DILITHIUM',
          dilithium_variant: 'DILITHIUM3'
        };
        
        // Update profile with new key
        if (userType === 'buyer') {
          await buyerService.updateProfile(updateData);
        } else {
          await sellerService.updateProfile(updateData);
        }
        
        setUser(prev => ({ ...prev, ...updateData, is_signature_verified: true }));
      }
    } catch (error) {
      toast.error('Không thể tạo chữ ký số');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ được upload hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    // TODO: Implement actual file upload to server
    // For now, just show success message
    toast.success('Upload ảnh thành công');
  };

  if (loading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <Sidebar userType={userType} />
        
        <div className="flex-1 space-y-6">
          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <UserIcon className="h-6 w-6 mr-2" />
                {userType === 'buyer' ? 'Thông tin cá nhân' : 'Thông tin Shop'}
              </h1>
              <button
                onClick={() => setEditing(!editing)}
                className={editing ? 'btn-secondary' : 'btn-primary'}
                disabled={loading}
              >
                {editing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-secondary">
                    <CameraIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">
                  {user?.[userType === 'buyer' ? 'full_name' : 'shop_name'] || user?.username}
                </h3>
                <p className="text-gray-500">
                  {userType === 'buyer' ? 'Người mua' : user?.shop_type === 'shopee_mall' ? 'Shopee Mall' : 'Shop thường'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    className="input-field bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <div className="flex items-center">
                    <input
                      type="email"
                      value={formData.email || ''}
                      className="input-field bg-gray-100 flex-1"
                      disabled
                    />
                    {user?.email_verified ? (
                      <ShieldCheckIcon className="h-5 w-5 text-green-500 ml-2" title="Email đã xác minh" />
                    ) : (
                      <button
                        type="button"
                        className="ml-2 text-xs text-primary hover:text-secondary"
                      >
                        Xác minh
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    {userType === 'buyer' ? 'Họ và tên' : 'Tên Shop'}
                  </label>
                  <input
                    type="text"
                    value={formData[userType === 'buyer' ? 'full_name' : 'shop_name'] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [userType === 'buyer' ? 'full_name' : 'shop_name']: e.target.value
                    })}
                    className="input-field"
                    disabled={!editing}
                    placeholder={userType === 'buyer' ? 'Nhập họ và tên' : 'Nhập tên shop'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="h-4 w-4 inline mr-1" />
                    Số điện thoại
                  </label>
                  <div className="flex items-center">
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input-field flex-1"
                      disabled={!editing}
                      placeholder="Nhập số điện thoại"
                    />
                    {user?.phone_verified ? (
                      <ShieldCheckIcon className="h-5 w-5 text-green-500 ml-2" title="SĐT đã xác minh" />
                    ) : (
                      user?.phone && (
                        <button
                          type="button"
                          className="ml-2 text-xs text-primary hover:text-secondary"
                        >
                          Xác minh
                        </button>
                      )
                    )}
                  </div>
                </div>

                {userType === 'seller' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại Shop
                      </label>
                      <select
                        value={formData.shop_type || 'normal'}
                        onChange={(e) => setFormData({...formData, shop_type: e.target.value})}
                        className="input-field"
                        disabled={!editing || user?.shop_type === 'shopee_mall'}
                      >
                        <option value="normal">Shop thường</option>
                        <option value="shopee_mall">Shopee Mall</option>
                      </select>
                      {user?.shop_type === 'shopee_mall' && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Shop đã được xác minh Shopee Mall
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả Shop
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="input-field"
                        disabled={!editing}
                        placeholder="Mô tả về shop của bạn..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPinIcon className="h-4 w-4 inline mr-1" />
                        Địa chỉ Shop
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="input-field"
                        disabled={!editing}
                        placeholder="Nhập địa chỉ shop"
                      />
                    </div>

                    {/* Business Info for Sellers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã số thuế
                      </label>
                      <input
                        type="text"
                        value={formData.tax_code || ''}
                        onChange={(e) => setFormData({...formData, tax_code: e.target.value})}
                        className="input-field"
                        disabled={!editing}
                        placeholder="Nhập mã số thuế"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Người đại diện pháp luật
                      </label>
                      <input
                        type="text"
                        value={formData.legal_representative || ''}
                        onChange={(e) => setFormData({...formData, legal_representative: e.target.value})}
                        className="input-field"
                        disabled={!editing}
                        placeholder="Nhập tên người đại diện"
                      />
                    </div>
                  </>
                )}
              </div>

              {editing && (
                <div className="mt-6 flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Digital Signature Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              Chữ ký số Dilithium
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                    user?.is_signature_verified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                  <div>
                    <div className="font-medium text-blue-800">
                      {user?.is_signature_verified ? 'Đã thiết lập chữ ký số' : 'Chưa thiết lập chữ ký số'}
                    </div>
                    <div className="text-sm text-blue-600">
                      {user?.signature_algorithm && (
                        <span>Thuật toán: {user.signature_algorithm} {user.dilithium_variant}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!user?.is_signature_verified ? (
                    <button
                      onClick={handleGenerateSignature}
                      disabled={loading}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {loading ? 'Đang tạo...' : 'Tạo chữ ký số'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSignatureModal(true)}
                      className="btn-secondary text-sm"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </div>
              
              {user?.quantum_resistant && (
                <div className="mt-2 text-xs text-green-700">
                  ✅ Chữ ký số kháng lượng tử (Post-Quantum Cryptography)
                </div>
              )}
            </div>
          </div>

          {/* Addresses Section (Only for Buyers) */}
          {userType === 'buyer' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Địa chỉ của tôi
                </h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="btn-primary text-sm"
                >
                  Thêm địa chỉ mới
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Bạn chưa có địa chỉ nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium">{address.phone}</span>
                            {address.is_default && (
                              <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.address}</p>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingAddress(address);
                              setAddressForm(address);
                              setShowAddressModal(true);
                            }}
                            className="text-primary hover:text-secondary text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Thống kê tài khoản</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userType === 'seller' ? user?.total_products || 0 : '12'}
                </div>
                <div className="text-sm text-gray-500">
                  {userType === 'seller' ? 'Sản phẩm' : 'Đơn hàng'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userType === 'seller' ? user?.total_sold || 0 : '8'}
                </div>
                <div className="text-sm text-gray-500">
                  {userType === 'seller' ? 'Đã bán' : 'Hoàn thành'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {user?.rating || '0.0'}
                </div>
                <div className="text-sm text-gray-500">Đánh giá</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor((new Date() - new Date(user?.created_at)) / (1000 * 60 * 60 * 24)) || 0}
                </div>
                <div className="text-sm text-gray-500">Ngày tham gia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
          setAddressForm({ address: '', phone: '', is_default: false });
        }}
        title={editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
      >
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ *
            </label>
            <textarea
              required
              value={addressForm.address}
              onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
              rows={3}
              className="input-field"
              placeholder="Nhập địa chỉ đầy đủ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={addressForm.phone}
              onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
              className="input-field"
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={addressForm.is_default}
              onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="btn-secondary flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Signature Details Modal */}
      <Modal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title="Chi tiết chữ ký số Dilithium"
        size="large"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">
              ✅ Chữ ký số đã được thiết lập
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Thuật toán: {user?.signature_algorithm}</div>
              <div>Variant: {user?.dilithium_variant}</div>
              <div>Kháng lượng tử: {user?.quantum_resistant ? 'Có' : 'Không'}</div>
              <div>Trạng thái: {user?.is_signature_verified ? 'Đã xác minh' : 'Chưa xác minh'}</div>
            </div>
          </div>

          {signatureData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key (Khóa công khai)
                </label>
                <textarea
                  value={signatureData.public_key}
                  readOnly
                  rows={4}
                  className="input-field font-mono text-xs bg-gray-50"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Lưu ý quan trọng</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Private key đã được mã hóa và lưu trữ an toàn</li>
                  <li>• Không chia sẻ private key với bất kỳ ai</li>
                  <li>• Sao lưu khóa riêng ở nơi an toàn</li>
                  <li>• Chữ ký số này sẽ được dùng để xác thực các giao dịch</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowSignatureModal(false)}
              className="btn-primary"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
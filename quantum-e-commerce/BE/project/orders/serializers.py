from rest_framework import serializers
from .models import Order, OrderItem, LogisticsProvider, PaymentMethod
from products.models import Product
from buyers.models import Buyer
from sellers.models import Seller

class LogisticsProviderSerializer(serializers.ModelSerializer):
    """Serializer đơn vị vận chuyển"""
    
    class Meta:
        model = LogisticsProvider
        fields = ['id', 'name', 'code', 'is_active']

class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer phương thức thanh toán"""
    
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'is_active']

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer item trong đơn hàng"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='product.seller.shop_name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image', 'seller_name',
            'quantity', 'price', 'total_price'
        ]
    
    def get_product_image(self, obj):
        if obj.product.images and len(obj.product.images) > 0:
            return obj.product.images[0]
        return None

class OrderListSerializer(serializers.ModelSerializer):
    """Serializer danh sách đơn hàng"""
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    seller_name = serializers.CharField(source='seller.shop_name', read_only=True)
    logistics_name = serializers.CharField(source='logistics_provider.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    items_count = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'buyer_name', 'seller_name', 'logistics_name',
            'payment_method_name', 'status', 'status_display', 'payment_status',
            'total_amount', 'items_count', 'created_at', 'shipped_at', 'delivered_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_status_display(self, obj):
        status_mapping = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        }
        return status_mapping.get(obj.status, obj.status)

class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết đơn hàng"""
    buyer = serializers.SerializerMethodField()
    seller = serializers.SerializerMethodField()
    logistics_provider = LogisticsProviderSerializer(read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.SerializerMethodField()
    payment_status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'buyer', 'seller', 'logistics_provider',
            'payment_method', 'status', 'status_display', 'payment_status',
            'payment_status_display', 'subtotal', 'shipping_fee', 'total_amount',
            'shipping_address', 'tracking_number', 'items',
            'buyer_signature', 'seller_signature', 'platform_signature',
            'order_hash', 'signature_algorithm', 'signature_timestamp',
            'created_at', 'shipped_at', 'delivered_at'
        ]
    
    def get_buyer(self, obj):
        return {
            'id': obj.buyer.id,
            'username': obj.buyer.username,
            'full_name': obj.buyer.full_name,
            'email': obj.buyer.email,
            'phone': obj.buyer.phone
        }
    
    def get_seller(self, obj):
        return {
            'id': obj.seller.id,
            'shop_name': obj.seller.shop_name,
            'shop_type': obj.seller.shop_type,
            'phone': obj.seller.phone,
            'is_verified': obj.seller.is_verified
        }
    
    def get_status_display(self, obj):
        status_mapping = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        }
        return status_mapping.get(obj.status, obj.status)
    
    def get_payment_status_display(self, obj):
        payment_status_mapping = {
            'pending': 'Chờ thanh toán',
            'paid': 'Đã thanh toán',
            'failed': 'Thanh toán thất bại'
        }
        return payment_status_mapping.get(obj.payment_status, obj.payment_status)

class OrderCreateSerializer(serializers.Serializer):
    """Serializer tạo đơn hàng mới"""
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text="Danh sách sản phẩm: [{'product_id': 'uuid', 'quantity': 1}]"
    )
    shipping_address = serializers.CharField(max_length=500)
    payment_method_id = serializers.UUIDField()
    logistics_provider_id = serializers.UUIDField()
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_items(self, value):
        """Validate items data"""
        if not value:
            raise serializers.ValidationError("Đơn hàng phải có ít nhất 1 sản phẩm")
        
        for item in value:
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError("Mỗi item phải có product_id và quantity")
            
            try:
                quantity = int(item['quantity'])
                if quantity <= 0:
                    raise serializers.ValidationError("Số lượng phải lớn hơn 0")
                item['quantity'] = quantity
            except (ValueError, TypeError):
                raise serializers.ValidationError("Số lượng không hợp lệ")
            
            # Kiểm tra product tồn tại
            try:
                product = Product.objects.get(id=item['product_id'], is_active=True)
                if product.stock < quantity:
                    raise serializers.ValidationError(f"Sản phẩm {product.name} không đủ hàng")
                item['product'] = product
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Sản phẩm {item['product_id']} không tồn tại")
        
        return value
    
    def validate_payment_method_id(self, value):
        try:
            PaymentMethod.objects.get(id=value, is_active=True)
            return value
        except PaymentMethod.DoesNotExist:
            raise serializers.ValidationError("Phương thức thanh toán không hợp lệ")
    
    def validate_logistics_provider_id(self, value):
        try:
            LogisticsProvider.objects.get(id=value, is_active=True)
            return value
        except LogisticsProvider.DoesNotExist:
            raise serializers.ValidationError("Đơn vị vận chuyển không hợp lệ")
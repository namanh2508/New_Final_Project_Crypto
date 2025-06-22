# payments/serializers.py
from rest_framework import serializers
from .models import Payment, PaymentWebhook, Refund
from orders.models import Order, PaymentMethod

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer thanh toán"""
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    buyer_name = serializers.CharField(source='order.buyer.full_name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'buyer_name', 'payment_method',
            'payment_method_name', 'amount', 'status', 'status_display',
            'transaction_id', 'payment_signature', 'payment_hash',
            'gateway_signature', 'signature_algorithm', 'gateway_response',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'payment_signature', 'payment_hash', 'gateway_signature',
            'gateway_response', 'created_at', 'updated_at'
        ]
    
    def get_status_display(self, obj):
        status_mapping = {
            'pending': 'Chờ thanh toán',
            'processing': 'Đang xử lý',
            'succeeded': 'Thành công',
            'failed': 'Thất bại',
            'cancelled': 'Đã hủy',
            'refunded': 'Đã hoàn tiền'
        }
        return status_mapping.get(obj.status, obj.status)

class PaymentCreateSerializer(serializers.Serializer):
    """Serializer tạo thanh toán"""
    order_id = serializers.UUIDField()
    payment_method_id = serializers.UUIDField()
    return_url = serializers.URLField(required=False)
    
    def validate_order_id(self, value):
        try:
            order = Order.objects.get(id=value)
            if order.payment_status == 'paid':
                raise serializers.ValidationError("Đơn hàng đã được thanh toán")
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError("Đơn hàng không tồn tại")
    
    def validate_payment_method_id(self, value):
        try:
            PaymentMethod.objects.get(id=value, is_active=True)
            return value
        except PaymentMethod.DoesNotExist:
            raise serializers.ValidationError("Phương thức thanh toán không hợp lệ")

class RefundSerializer(serializers.ModelSerializer):
    """Serializer hoàn tiền"""
    payment_info = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    reason_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'payment_info', 'amount', 'reason', 'reason_display',
            'status', 'status_display', 'refund_id', 'notes',
            'created_at', 'processed_at'
        ]
        read_only_fields = ['refund_id', 'status', 'processed_at']
    
    def get_payment_info(self, obj):
        return {
            'id': obj.payment.id,
            'order_number': obj.payment.order.order_number,
            'amount': obj.payment.amount,
            'transaction_id': obj.payment.transaction_id
        }
    
    def get_status_display(self, obj):
        status_mapping = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'succeeded': 'Thành công',
            'failed': 'Thất bại',
            'cancelled': 'Đã hủy'
        }
        return status_mapping.get(obj.status, obj.status)
    
    def get_reason_display(self, obj):
        reason_mapping = {
            'customer_request': 'Yêu cầu của khách hàng',
            'fraud': 'Gian lận',
            'duplicate': 'Trùng lặp',
            'defective_product': 'Sản phẩm lỗi',
            'other': 'Khác'
        }
        return reason_mapping.get(obj.reason, obj.reason)

class RefundCreateSerializer(serializers.ModelSerializer):
    """Serializer tạo yêu cầu hoàn tiền"""
    
    class Meta:
        model = Refund
        fields = ['payment', 'amount', 'reason', 'notes']
    
    def validate_payment(self, value):
        if value.status != 'succeeded':
            raise serializers.ValidationError("Chỉ có thể hoàn tiền cho giao dịch thành công")
        
        # Kiểm tra đã có refund chưa
        if Refund.objects.filter(payment=value, status__in=['pending', 'processing', 'succeeded']).exists():
            raise serializers.ValidationError("Đã có yêu cầu hoàn tiền cho giao dịch này")
        
        return value
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số tiền hoàn phải lớn hơn 0")
        return value
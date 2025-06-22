from rest_framework import serializers
from .models import SignatureLog, CertificateAuthority

class SignatureLogSerializer(serializers.ModelSerializer):
    """Serializer log chữ ký số"""
    entity_type_display = serializers.SerializerMethodField()
    action_display = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()
    
    class Meta:
        model = SignatureLog
        fields = [
            'id', 'entity_type', 'entity_type_display', 'entity_id',
            'action', 'action_display', 'signature_algorithm', 'dilithium_variant',
            'signature_size', 'verification_result', 'verification_status',
            'quantum_resistant', 'security_level', 'ip_address', 'user_agent',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_entity_type_display(self, obj):
        type_mapping = {
            'buyer': 'Người mua',
            'seller': 'Người bán', 
            'order': 'Đơn hàng',
            'payment': 'Thanh toán'
        }
        return type_mapping.get(obj.entity_type, obj.entity_type)
    
    def get_action_display(self, obj):
        action_mapping = {
            'key_generated': 'Tạo khóa',
            'signature_created': 'Tạo chữ ký',
            'signature_verified': 'Xác minh chữ ký'
        }
        return action_mapping.get(obj.action, obj.action)
    
    def get_verification_status(self, obj):
        if obj.verification_result is None:
            return 'Chưa xác minh'
        elif obj.verification_result:
            return 'Hợp lệ'
        else:
            return 'Không hợp lệ'

class CertificateAuthoritySerializer(serializers.ModelSerializer):
    """Serializer Certificate Authority"""
    algorithm_display = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateAuthority
        fields = [
            'id', 'name', 'algorithm', 'algorithm_display', 'dilithium_variant',
            'security_level', 'is_trusted', 'is_quantum_resistant', 'status',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_algorithm_display(self, obj):
        if obj.algorithm == 'CRYSTAL-DILITHIUM':
            return f'Crystal-Dilithium {obj.dilithium_variant} (Quantum-Safe)'
        return obj.algorithm
    
    def get_status(self, obj):
        from django.utils import timezone
        now = timezone.now()
        
        if not obj.is_trusted:
            return 'Không tin cậy'
        elif obj.expires_at and obj.expires_at < now:
            return 'Đã hết hạn'
        else:
            return 'Hoạt động'

class CreateSignatureSerializer(serializers.Serializer):
    """Serializer tạo chữ ký số"""
    entity_type = serializers.ChoiceField(choices=[
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('order', 'Order'),
        ('payment', 'Payment')
    ])
    entity_id = serializers.UUIDField()
    message = serializers.CharField(help_text="Dữ liệu cần ký")
    private_key = serializers.CharField(write_only=True, help_text="Private key để ký")
    
    def validate_message(self, value):
        if len(value) == 0:
            raise serializers.ValidationError("Message không được để trống")
        return value

class VerifySignatureSerializer(serializers.Serializer):
    """Serializer xác minh chữ ký số"""
    signature_data = serializers.CharField(help_text="Chữ ký cần xác minh")
    message = serializers.CharField(help_text="Dữ liệu gốc")
    public_key = serializers.CharField(help_text="Public key để xác minh")
    algorithm = serializers.CharField(default='CRYSTAL-DILITHIUM')
from rest_framework import serializers
from .models import SignatureLog, CertificateAuthority


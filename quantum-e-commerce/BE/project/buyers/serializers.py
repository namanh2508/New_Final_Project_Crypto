from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from .models import Buyer, BuyerAddress

class BuyerRegistrationSerializer(serializers.ModelSerializer):
    """Serializer đăng ký tài khoản buyer"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Buyer
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'full_name', 'phone'
        ]
    
    def validate_email(self, value):
        if Buyer.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng")
        return value
    
    def validate_username(self, value):
        if Buyer.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username này đã được sử dụng")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Mật khẩu xác nhận không khớp")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['password'] = make_password(validated_data['password'])
        return Buyer.objects.create(**validated_data)

class BuyerSerializer(serializers.ModelSerializer):
    """Serializer thông tin buyer"""
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Buyer
        fields = [
            'id', 'username', 'email', 'full_name', 'phone', 'avatar_url',
            'public_key', 'signature_algorithm', 'dilithium_variant', 
            'quantum_resistant', 'is_signature_verified', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'public_key', 'is_signature_verified', 'created_at']
    
    def get_avatar_url(self, obj):
        return obj.avatar if obj.avatar else None

class BuyerLoginSerializer(serializers.Serializer):
    """Serializer đăng nhập"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class BuyerAddressSerializer(serializers.ModelSerializer):
    """Serializer địa chỉ buyer"""
    
    class Meta:
        model = BuyerAddress
        fields = ['id', 'address', 'phone', 'is_default']
    
    def create(self, validated_data):
        # Nếu là địa chỉ mặc định, bỏ default của các địa chỉ khác
        if validated_data.get('is_default', False):
            BuyerAddress.objects.filter(
                buyer=validated_data['buyer']
            ).update(is_default=False)
        return super().create(validated_data)
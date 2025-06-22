from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from .models import Seller

class SellerRegistrationSerializer(serializers.ModelSerializer):
    """Serializer đăng ký tài khoản seller"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Seller
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'shop_name', 'shop_type', 'description', 'address', 'phone'
        ]
    
    def validate_email(self, value):
        if Seller.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng")
        return value
    
    def validate_username(self, value):
        if Seller.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username này đã được sử dụng")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Mật khẩu xác nhận không khớp")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['password'] = make_password(validated_data['password'])
        return Seller.objects.create(**validated_data)

class SellerSerializer(serializers.ModelSerializer):
    """Serializer thông tin seller"""
    logo_url = serializers.SerializerMethodField()
    shop_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Seller
        fields = [
            'id', 'username', 'email', 'shop_name', 'shop_type', 'shop_type_display',
            'description', 'logo_url', 'address', 'phone', 'rating', 'total_products',
            'total_sold', 'public_key', 'signature_algorithm', 'dilithium_variant',
            'quantum_resistant', 'business_license', 'tax_code', 'legal_representative',
            'is_verified', 'is_signature_verified', 'is_active', 'created_at'
        ]
        read_only_fields = [
            'id', 'rating', 'total_products', 'total_sold', 'public_key',
            'is_verified', 'is_signature_verified', 'created_at'
        ]
    
    def get_logo_url(self, obj):
        return obj.logo if obj.logo else None
    
    def get_shop_type_display(self, obj):
        type_mapping = {
            'normal': 'Shop thường',
            'shopee_mall': 'Shopee Mall'
        }
        return type_mapping.get(obj.shop_type, obj.shop_type)

class SellerLoginSerializer(serializers.Serializer):
    """Serializer đăng nhập seller"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class SellerProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer cập nhật thông tin seller"""
    
    class Meta:
        model = Seller
        fields = [
            'shop_name', 'description', 'address', 'phone',
            'business_license', 'tax_code', 'legal_representative']      
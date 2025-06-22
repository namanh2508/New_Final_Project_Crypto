from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    """Serializer danh mục sản phẩm"""
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'is_active', 'children', 'product_count']
    
    def get_children(self, obj):
        children = Category.objects.filter(parent=obj, is_active=True)
        return CategorySerializer(children, many=True).data
    
    def get_product_count(self, obj):
        return Product.objects.filter(category=obj, is_active=True).count()

class ProductListSerializer(serializers.ModelSerializer):
    """Serializer danh sách sản phẩm"""
    seller_name = serializers.CharField(source='seller.shop_name', read_only=True)
    seller_type = serializers.CharField(source='seller.shop_type', read_only=True)
    seller_verified = serializers.BooleanField(source='seller.is_verified', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'stock', 'main_image', 'rating', 'sold_count',
            'seller_name', 'seller_type', 'seller_verified', 'category_name', 
            'is_active', 'created_at'
        ]
    
    def get_main_image(self, obj):
        if obj.images and len(obj.images) > 0:
            return obj.images[0]
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết sản phẩm"""
    seller = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'images',
            'rating', 'sold_count', 'seller', 'category', 'is_active', 'created_at'
        ]
    
    def get_seller(self, obj):
        return {
            'id': obj.seller.id,
            'shop_name': obj.seller.shop_name,
            'shop_type': obj.seller.shop_type,
            'rating': float(obj.seller.rating),
            'is_verified': obj.seller.is_verified,
            'total_products': obj.seller.total_products,
            'total_sold': obj.seller.total_sold,
            'created_at': obj.seller.created_at
        }

class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer tạo sản phẩm mới"""
    
    class Meta:
        model = Product
        fields = ['category', 'name', 'description', 'price', 'stock', 'images']
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá sản phẩm phải lớn hơn 0")
        return value
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Số lượng không thể âm")
        return value

class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer cập nhật sản phẩm"""
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock', 'images', 'is_active']
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá sản phẩm phải lớn hơn 0")
        return value

from rest_framework import viewsets, filters, status
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateSerializer, ProductUpdateSerializer
)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet danh mục sản phẩm"""
    queryset = Category.objects.filter(is_active=True, parent=None)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Lấy sản phẩm theo danh mục"""
        category = self.get_object()
        products = Product.objects.filter(category=category, is_active=True)
        
        # Pagination
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(products, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet sản phẩm"""
    queryset = Product.objects.filter(is_active=True).select_related('seller', 'category')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'seller', 'seller__shop_type']
    search_fields = ['name', 'description', 'seller__shop_name']
    ordering_fields = ['created_at', 'price', 'rating', 'sold_count']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'featured', 'trending', 'search']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action == 'create':
            return ProductCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductUpdateSerializer
        return ProductListSerializer
    
    def perform_create(self, serializer):
        """Tạo sản phẩm mới"""
        # Seller được lấy từ user hiện tại
        from sellers.models import Seller
        try:
            seller = Seller.objects.get(id=self.request.user.id)
            serializer.save(seller=seller)
        except Seller.DoesNotExist:
            raise serializers.ValidationError("Chỉ seller mới có thể tạo sản phẩm")
    
    def create(self, request, *args, **kwargs):
        """Override create để trả về response tùy chỉnh"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            product = serializer.instance
            response_serializer = ProductDetailSerializer(product)
            return Response({
                'success': True,
                'message': 'Tạo sản phẩm thành công',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Override update để kiểm tra quyền"""
        instance = self.get_object()
        
        # Chỉ seller sở hữu mới được cập nhật
        if str(instance.seller.id) != str(request.user.id):
            return Response({
                'success': False,
                'message': 'Bạn không có quyền cập nhật sản phẩm này'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Cập nhật sản phẩm thành công',
                'data': ProductDetailSerializer(serializer.instance).data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Sản phẩm nổi bật"""
        featured_products = self.queryset.filter(
            rating__gte=4.0, 
            sold_count__gte=10
        ).order_by('-rating', '-sold_count')[:20]
        
        serializer = ProductListSerializer(featured_products, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Sản phẩm xu hướng"""
        from django.utils import timezone
        from datetime import timedelta
        
        last_week = timezone.now() - timedelta(days=7)
        trending_products = self.queryset.filter(
            created_at__gte=last_week
        ).order_by('-sold_count', '-rating')[:20]
        
        serializer = ProductListSerializer(trending_products, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Tìm kiếm sản phẩm nâng cao"""
        query = request.query_params.get('q', '')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        category_id = request.query_params.get('category')
        seller_type = request.query_params.get('seller_type')
        
        products = self.queryset
        
        if query:
            products = products.filter(
                Q(name__icontains=query) | 
                Q(description__icontains=query) |
                Q(seller__shop_name__icontains=query)
            )
        
        if min_price:
            products = products.filter(price__gte=min_price)
        
        if max_price:
            products = products.filter(price__lte=max_price)
        
        if category_id:
            products = products.filter(category_id=category_id)
        
        if seller_type:
            products = products.filter(seller__shop_type=seller_type)
        
        # Pagination
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(products, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'total': products.count()
        })
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Sản phẩm liên quan"""
        product = self.get_object()
        related_products = self.queryset.filter(
            category=product.category
        ).exclude(id=product.id)[:8]
        
        serializer = ProductListSerializer(related_products, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from .models import Seller
from .serializers import (
    SellerSerializer, SellerRegistrationSerializer,
    SellerLoginSerializer, SellerProfileUpdateSerializer
)

class SellerViewSet(viewsets.ModelViewSet):
    """ViewSet cho Seller"""
    queryset = Seller.objects.filter(is_active=True)
    serializer_class = SellerSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'register', 'login', 'list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Đăng ký tài khoản seller"""
        serializer = SellerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            seller = serializer.save()
            
            # Tạo JWT tokens
            refresh = RefreshToken.for_user(seller)
            
            return Response({
                'success': True,
                'message': 'Đăng ký shop thành công',
                'seller': SellerSerializer(seller).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Đăng nhập seller"""
        serializer = SellerLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                seller = Seller.objects.get(username=username, is_active=True)
                if check_password(password, seller.password):
                    refresh = RefreshToken.for_user(seller)
                    
                    return Response({
                        'success': True,
                        'message': 'Đăng nhập thành công',
                        'seller': SellerSerializer(seller).data,
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    })
                else:
                    return Response({
                        'success': False,
                        'message': 'Mật khẩu không đúng'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                    
            except Seller.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Tài khoản shop không tồn tại'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Lấy thông tin profile seller"""
        try:
            seller = Seller.objects.get(id=request.user.id)
            serializer = SellerSerializer(seller)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Seller.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Seller không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Cập nhật thông tin seller"""
        try:
            seller = Seller.objects.get(id=request.user.id)
            serializer = SellerProfileUpdateSerializer(seller, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Cập nhật thông tin thành công',
                    'data': SellerSerializer(seller).data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Seller.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Seller không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Lấy danh sách sản phẩm của seller"""
        from products.models import Product
        from products.serializers import ProductListSerializer
        
        seller = self.get_object()
        products = Product.objects.filter(seller=seller, is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Thống kê seller"""
        seller = self.get_object()
        
        # Tính toán các thống kê
        stats = {
            'total_products': seller.total_products,
            'total_sold': seller.total_sold,
            'rating': float(seller.rating),
            'is_verified': seller.is_verified,
            'shop_type': seller.shop_type,
            'created_at': seller.created_at
        }
        
        return Response({
            'success': True,
            'data': stats
        })
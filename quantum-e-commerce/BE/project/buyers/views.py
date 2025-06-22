from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from .models import Buyer, BuyerAddress
from .serializers import (
    BuyerSerializer, BuyerRegistrationSerializer, 
    BuyerLoginSerializer, BuyerAddressSerializer
)

class BuyerViewSet(viewsets.ModelViewSet):
    """ViewSet cho Buyer"""
    queryset = Buyer.objects.filter(is_active=True)
    serializer_class = BuyerSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'register', 'login']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Đăng ký tài khoản buyer"""
        serializer = BuyerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            buyer = serializer.save()
            
            # Tạo JWT tokens
            refresh = RefreshToken.for_user(buyer)
            
            return Response({
                'success': True,
                'message': 'Đăng ký thành công',
                'buyer': BuyerSerializer(buyer).data,
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
        """Đăng nhập buyer"""
        serializer = BuyerLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                buyer = Buyer.objects.get(username=username, is_active=True)
                if check_password(password, buyer.password):
                    refresh = RefreshToken.for_user(buyer)
                    
                    return Response({
                        'success': True,
                        'message': 'Đăng nhập thành công',
                        'buyer': BuyerSerializer(buyer).data,
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
                    
            except Buyer.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Tài khoản không tồn tại'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Lấy thông tin profile"""
        serializer = BuyerSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def addresses(self, request):
        """Lấy danh sách địa chỉ"""
        try:
            buyer = Buyer.objects.get(id=request.user.id)
            addresses = BuyerAddress.objects.filter(buyer=buyer)
            serializer = BuyerAddressSerializer(addresses, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Buyer.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Buyer không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def add_address(self, request):
        """Thêm địa chỉ mới"""
        try:
            buyer = Buyer.objects.get(id=request.user.id)
            serializer = BuyerAddressSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(buyer=buyer)
                return Response({
                    'success': True,
                    'message': 'Thêm địa chỉ thành công',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Buyer.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Buyer không tồn tại'
            }, status=status.HTTP_404_NOT_FOUND)
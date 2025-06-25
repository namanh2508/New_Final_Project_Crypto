# buyers/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password, make_password
from .models import Buyer, BuyerAddress
from .serializers import (
    BuyerSerializer, BuyerRegistrationSerializer, 
    BuyerLoginSerializer, BuyerAddressSerializer
)
from .authentication import BuyerRefreshToken, BuyerJWTAuthentication
import base64
from rest_framework import status
import oqs
from django.utils import timezone



class BuyerViewSet(viewsets.ModelViewSet):
    """ViewSet cho Buyer"""
    queryset = Buyer.objects.filter(is_active=True)
    serializer_class = BuyerSerializer
    authentication_classes = [BuyerJWTAuthentication]  # Sử dụng custom authentication
    
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
            # Hash password trước khi lưu
            validated_data = serializer.validated_data
            validated_data['password'] = make_password(validated_data['password'])
            
            buyer = Buyer.objects.create(**validated_data)
            
            # Tạo JWT tokens sử dụng custom token class
            refresh = BuyerRefreshToken.for_buyer(buyer)
            
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
                if buyer.check_password(password):
                    # Sử dụng custom token
                    refresh = BuyerRefreshToken.for_buyer(buyer)
                    
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
        # request.user sẽ là Buyer instance từ custom authentication
        if hasattr(request.user, 'id'):
            serializer = BuyerSerializer(request.user)
            return Response({
                'success': True,
                'data': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Người dùng chưa đăng nhập.'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['get'])
    def addresses(self, request):
        """Lấy danh sách địa chỉ"""
        if hasattr(request.user, 'id'):
            addresses = BuyerAddress.objects.filter(buyer=request.user)
            serializer = BuyerAddressSerializer(addresses, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Người dùng chưa đăng nhập'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def add_address(self, request):
        """Thêm địa chỉ mới"""
        if hasattr(request.user, 'id'):
            serializer = BuyerAddressSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(buyer=request.user)
                return Response({
                    'success': True,
                    'message': 'Thêm địa chỉ thành công',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'success': False,
                'message': 'Người dùng chưa đăng nhập'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=True, methods=['post'], url_path='create-digital-signature')
    def create_digital_signature(self, request, pk=None):
        """
        Tạo một cặp khóa Dilithium mới cho người dùng.
        LƯU Ý: Đây là phương pháp tạo khóa ở backend, kém an toàn hơn.
        Trong thực tế, nên tạo ở client-side.
        """
        user = self.get_object()

        # 1. Tạo cặp khóa mới
        with oqs.Signature('Dilithium3') as signer:
            pk = signer.generate_keypair()
            sk = signer.export_secret_key()

        # 2. Chuyển khóa sang định dạng Base64 để lưu vào TextField
        public_key_b64 = base64.b64encode(pk).decode('utf-8')
        
        # 3. MÃ HÓA KHÓA BÍ MẬT TRƯỚC KHI LƯU
        # Đây là bước cực kỳ quan trọng. Tạm thời chúng ta sẽ băm nó để
        # minh họa rằng chúng ta không lưu plaintext.
        # Trong thực tế, bạn cần một hệ thống mã hóa/giải mã phức tạp hơn.
        from django.contrib.auth.hashers import make_password
        private_key_encrypted = make_password(base64.b64encode(sk).decode('utf-8'))

        # 4. Cập nhật thông tin cho người dùng
        user.public_key = public_key_b64
        user.private_key_hash = private_key_encrypted # Lưu ý: chỉ là hash, không thể giải mã
        user.dilithium_variant = 'DILITHIUM3'
        user.signature_algorithm = 'CRYSTALS-DILITHIUM'
        user.key_created_at = timezone.now()
        user.certificate_expires_at = timezone.now() + timezone.timedelta(days=365) # Hết hạn sau 1 năm
        user.is_signature_verified = True # Có thể thêm bước tự xác minh ở đây

        user.save()

        # Chỉ trả về khóa công khai cho client
        return Response({
            'success': True,
            'message': 'Tạo chữ ký số thành công!',
            'public_key': user.public_key,
            'key_created_at': user.key_created_at,
            'certificate_expires_at': user.certificate_expires_at
        }, status=status.HTTP_200_OK)        
            
            

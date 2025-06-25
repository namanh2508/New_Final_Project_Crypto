# BE/project/signatures/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import SignatureLog
from .serializers import SignatureLogSerializer
from .dilithium_utils import DilithiumSignature
import json
from .models import CertificateAuthority
from .serializers import CertificateAuthoritySerializer  # cần có file serializers.py đúng cách
from rest_framework import viewsets
from buyers.models import Buyer 
class SignatureLogViewSet(viewsets.ModelViewSet):
    queryset = SignatureLog.objects.all()
    serializer_class = SignatureLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter signatures based on user"""
        user = self.request.user
        if hasattr(user, 'seller'):
            return SignatureLog.objects.filter(seller=user.seller)
        elif hasattr(user, 'buyer'):
            return SignatureLog.objects.filter(buyer=user.buyer)
        return SignatureLog.objects.none()

    

    @action(detail=False, methods=['post'])
    def sign_transaction(self, request):
        """Sign a transaction with private key"""
        order_id = request.data.get('order_id')
        private_key = request.data.get('private_key')
        
        if not order_id or not private_key:
            return Response(
                {'error': 'order_id and private_key are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get order details
            from orders.models import Order
            order = Order.objects.get(id=order_id)
            
            # Prepare transaction data
            transaction_data = {
                'order_id': str(order.id),
                'buyer_id': str(order.buyer.id),
                'seller_id': str(order.product.seller.id),
                'product_id': str(order.product.id),
                'quantity': order.quantity,
                'total_amount': str(order.total_amount),
                'timestamp': order.created_at.isoformat()
            }
            
            # Create signature message
            message = DilithiumSignature.hash_transaction(transaction_data)
            
            # Sign the message
            signature_data = DilithiumSignature.sign(message, private_key)
            
            # Save signature
            with transaction.atomic():
                signature = SignatureLog.objects.create(
                    order=order,
                    buyer=order.buyer,
                    seller=order.product.seller,
                    signature_data=signature_data,
                    transaction_hash=message,
                    is_verified=False
                )
                
                # Auto-verify if public key exists
                user = request.user
                public_key = None
                
                if hasattr(user, 'seller') and user.seller == order.product.seller:
                    public_key = user.seller.public_key
                elif hasattr(user, 'buyer') and user.buyer == order.buyer:
                    public_key = user.buyer.public_key
                
                if public_key:
                    is_valid = DilithiumSignature.verify(
                        message, signature_data, public_key
                    )
                    signature.is_verified = is_valid
                    signature.save()
            
            return Response({
                'signature_id': signature.id,
                'transaction_hash': message,
                'is_verified': signature.is_verified,
                'message': 'Transaction signed successfully'
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a signature"""
        signature = self.get_object()
        public_key = request.data.get('public_key')
        
        if not public_key:
            # Try to get from user profile
            if signature.seller and hasattr(signature.seller, 'public_key'):
                public_key = signature.seller.public_key
            elif signature.buyer and hasattr(signature.buyer, 'public_key'):
                public_key = signature.buyer.public_key
        
        if not public_key:
            return Response(
                {'error': 'Public key not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            is_valid = DilithiumSignature.verify(
                signature.transaction_hash,
                signature.signature_data,
                public_key
            )
            
            signature.is_verified = is_valid
            signature.save()
            
            return Response({
                'is_valid': is_valid,
                'signature_id': signature.id,
                'message': 'Signature verified successfully' if is_valid else 'Invalid signature'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            


class CertificateAuthorityViewSet(viewsets.ModelViewSet):
    queryset = CertificateAuthority.objects.all()
    serializer_class = CertificateAuthoritySerializer
    permission_classes = [IsAuthenticated]

class DigitalSignatureViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate_keypair(self, request):
        """
        Tạo một cặp khóa Dilithium mới cho người dùng.
        """
        try:
            # 1. Sử dụng thư viện thật để tạo khóa
            # (Giả sử dilithium_utils đã được cập nhật để dùng 'oqs')
            private_key_b64, public_key_b64 = DilithiumSignature.generate_keypair()

            # 2. Lưu khóa công khai vào đúng đối tượng user
            user = request.user

            # Kiểm tra xem user có phải là Buyer hay không
            if isinstance(user, Buyer):
                user.public_key = public_key_b64
                user.save()
            # Có thể thêm logic cho Seller ở đây trong tương lai
            # elif isinstance(user, Seller):
            #     user.public_key = public_key_b64
            #     user.save()
            else:
                # Nếu không xác định được loại user, trả về lỗi
                return Response(
                    {'error': 'Không thể xác định loại người dùng để lưu khóa công khai.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 3. Trả về cả hai khóa cho người dùng
            # CẢNH BÁO BẢO MẬT: Trong môi trường production, KHÔNG BAO GIỜ
            # trả về khóa bí mật như thế này. Client nên tự tạo và giữ nó.
            return Response({
                'public_key': public_key_b64,
                'private_key': private_key_b64,
                'message': 'Tạo cặp khóa thành công. Hãy lưu khóa bí mật của bạn ở nơi an toàn!'
            })
        except Exception as e:
            # In ra lỗi chi tiết để debug
            print(f"!!! LỖI NGHIÊM TRỌNG TRONG generate_keypair: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=['post'])
    def verify_signature(self, request):
        """API đơn giản để verify chữ ký"""
        data = request.data
        try:
            message = data['message']
            signature = data['signature']
            public_key = data['public_key']
            is_valid = DilithiumSignature.verify(message, signature, public_key)
            return Response({'is_valid': is_valid})
        except KeyError:
            return Response({'error': 'Missing one or more required fields'}, status=status.HTTP_400_BAD_REQUEST)
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
import uuid
import hashlib
from .models import Payment, PaymentWebhook, Refund
from .serializers import (
    PaymentSerializer, PaymentCreateSerializer,
    RefundSerializer, RefundCreateSerializer
)
from orders.models import Order, PaymentMethod
from buyers.models import Buyer

class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet thanh toán"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Lọc payment theo user"""
        user = self.request.user
        try:
            buyer = Buyer.objects.get(id=user.id)
            return Payment.objects.filter(order__buyer=buyer).order_by('-created_at')
        except Buyer.DoesNotExist:
            # Seller có thể xem payment của các đơn hàng của mình
            try:
                from sellers.models import Seller
                seller = Seller.objects.get(id=user.id)
                return Payment.objects.filter(order__seller=seller).order_by('-created_at')
            except Seller.DoesNotExist:
                pass
        
        return Payment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def create(self, request):
        """Tạo thanh toán mới"""
        serializer = PaymentCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                buyer = Buyer.objects.get(id=request.user.id)
            except Buyer.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Chỉ buyer mới có thể tạo thanh toán'
                }, status=status.HTTP_403_FORBIDDEN)
            
            order_id = serializer.validated_data['order_id']
            payment_method_id = serializer.validated_data['payment_method_id']
            
            try:
                order = Order.objects.get(id=order_id)
                payment_method = PaymentMethod.objects.get(id=payment_method_id)
                
                # Kiểm tra buyer có phải chủ đơn hàng không
                if order.buyer.id != buyer.id:
                    return Response({
                        'success': False,
                        'message': 'Bạn không có quyền thanh toán đơn hàng này'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                with transaction.atomic():
                    # Tạo payment
                    payment = Payment.objects.create(
                        order=order,
                        payment_method=payment_method,
                        amount=order.total_amount,
                        transaction_id=f"PAY_{uuid.uuid4().hex[:12].upper()}",
                        payment_hash=hashlib.sha256(f"{order.id}{order.total_amount}".encode()).hexdigest()
                    )
                    
                    # Xử lý thanh toán theo phương thức
                    if payment_method.code == 'COD':
                        # COD - thanh toán khi nhận hàng
                        payment.status = 'pending'
                        order.payment_status = 'pending'
                        payment_url = None
                        
                    elif payment_method.code == 'SPAY':
                        # ShopeePay - chuyển hướng đến ví
                        payment.status = 'pending'
                        order.payment_status = 'pending'
                        payment_url = f"shopeepay://pay?amount={payment.amount}&order_id={order.id}"
                        
                    elif payment_method.code == 'CARD':
                        # Thẻ tín dụng - tích hợp với Stripe
                        payment.status = 'pending'
                        order.payment_status = 'pending'
                        payment_url = f"https://checkout.stripe.com/pay/cs_test_{payment.transaction_id}"
                        
                    elif payment_method.code == 'BANK':
                        # Chuyển khoản ngân hàng
                        payment.status = 'pending'
                        order.payment_status = 'pending'
                        payment_url = f"https://bank-transfer.com/pay/{payment.transaction_id}"
                    
                    else:
                        payment.status = 'pending'
                        order.payment_status = 'pending'
                        payment_url = None
                    
                    payment.save()
                    order.save()
                    
                    return Response({
                        'success': True,
                        'message': 'Tạo thanh toán thành công',
                        'data': {
                            'payment': PaymentSerializer(payment).data,
                            'payment_url': payment_url,
                            'qr_code': None  # TODO: Generate QR code
                        }
                    }, status=status.HTTP_201_CREATED)
                    
            except Order.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Đơn hàng không tồn tại'
                }, status=status.HTTP_404_NOT_FOUND)
            except PaymentMethod.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Phương thức thanh toán không tồn tại'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Xác nhận thanh toán thành công"""
        payment = self.get_object()
        
        if payment.status == 'pending':
            payment.status = 'succeeded'
            payment.order.payment_status = 'paid'
            payment.updated_at = timezone.now()
            payment.save()
            payment.order.save()
            
            # TODO: Add digital signature
            
            return Response({
                'success': True,
                'message': 'Thanh toán thành công',
                'data': PaymentSerializer(payment).data
            })
        
        return Response({
            'success': False,
            'message': 'Không thể xác nhận thanh toán'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        """Đánh dấu thanh toán thất bại"""
        payment = self.get_object()
        reason = request.data.get('reason', '')
        
        if payment.status in ['pending', 'processing']:
            payment.status = 'failed'
            payment.order.payment_status = 'failed'
            payment.updated_at = timezone.now()
            payment.save()
            payment.order.save()
            
            return Response({
                'success': True,
                'message': 'Đã cập nhật trạng thái thanh toán thất bại',
                'data': PaymentSerializer(payment).data
            })
        
        return Response({
            'success': False,
            'message': 'Không thể cập nhật trạng thái thanh toán'
        }, status=status.HTTP_400_BAD_REQUEST)

class RefundViewSet(viewsets.ModelViewSet):
    """ViewSet hoàn tiền"""
    serializer_class = RefundSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Lọc refund theo user"""
        user = self.request.user
        try:
            buyer = Buyer.objects.get(id=user.id)
            return Refund.objects.filter(payment__order__buyer=buyer).order_by('-created_at')
        except Buyer.DoesNotExist:
            return Refund.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RefundCreateSerializer
        return RefundSerializer
    
    def create(self, request):
        """Tạo yêu cầu hoàn tiền"""
        serializer = RefundCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                buyer = Buyer.objects.get(id=request.user.id)
            except Buyer.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Chỉ buyer mới có thể yêu cầu hoàn tiền'
                }, status=status.HTTP_403_FORBIDDEN)
            
            payment = serializer.validated_data['payment']
            
            # Kiểm tra buyer có phải chủ payment không
            if payment.order.buyer.id != buyer.id:
                return Response({
                    'success': False,
                    'message': 'Bạn không có quyền yêu cầu hoàn tiền cho giao dịch này'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Kiểm tra amount không vượt quá payment amount
            amount = serializer.validated_data['amount']
            if amount > payment.amount:
                return Response({
                    'success': False,
                    'message': 'Số tiền hoàn không thể lớn hơn số tiền đã thanh toán'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            refund = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Tạo yêu cầu hoàn tiền thành công',
                'data': RefundSerializer(refund).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Phê duyệt hoàn tiền (admin only)"""
        refund = self.get_object()
        
        if refund.status == 'pending':
            refund.status = 'processing'
            refund.refund_id = f"REF_{uuid.uuid4().hex[:12].upper()}"
            refund.save()
            
            # TODO: Process actual refund with payment gateway
            
            return Response({
                'success': True,
                'message': 'Yêu cầu hoàn tiền đã được phê duyệt',
                'data': RefundSerializer(refund).data
            })
        
        return Response({
            'success': False,
            'message': 'Không thể phê duyệt yêu cầu hoàn tiền này'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Hoàn thành hoàn tiền"""
        refund = self.get_object()
        
        if refund.status == 'processing':
            refund.status = 'succeeded'
            refund.processed_at = timezone.now()
            refund.save()
            
            # Cập nhật payment status
            refund.payment.status = 'refunded'
            refund.payment.save()
            
            return Response({
                'success': True,
                'message': 'Hoàn tiền thành công',
                'data': RefundSerializer(refund).data
            })
        
        return Response({
            'success': False,
            'message': 'Không thể hoàn thành hoàn tiền'
        }, status=status.HTTP_400_BAD_REQUEST)
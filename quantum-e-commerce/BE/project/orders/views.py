from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
import uuid
from .models import Order, OrderItem, LogisticsProvider, PaymentMethod
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
    LogisticsProviderSerializer, PaymentMethodSerializer
)
from buyers.models import Buyer
from sellers.models import Seller

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet đơn hàng"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Lọc đơn hàng theo loại user"""
        user = self.request.user
        
        # Kiểm tra user là buyer hay seller
        try:
            buyer = Buyer.objects.get(id=user.id)
            return Order.objects.filter(buyer=buyer).order_by('-created_at')
        except Buyer.DoesNotExist:
            pass
        
        try:
            seller = Seller.objects.get(id=user.id)
            return Order.objects.filter(seller=seller).order_by('-created_at')
        except Seller.DoesNotExist:
            pass
        
        return Order.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        return OrderListSerializer
    
    def create(self, request):
        """Tạo đơn hàng mới"""
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                buyer = Buyer.objects.get(id=request.user.id)
            except Buyer.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Chỉ buyer mới có thể tạo đơn hàng'
                }, status=status.HTTP_403_FORBIDDEN)
            
            with transaction.atomic():
                # Tạo đơn hàng
                items_data = serializer.validated_data['items']
                
                # Nhóm sản phẩm theo seller (1 đơn hàng = 1 seller)
                sellers_products = {}
                for item in items_data:
                    product = item['product']
                    seller_id = product.seller.id
                    if seller_id not in sellers_products:
                        sellers_products[seller_id] = {
                            'seller': product.seller,
                            'items': []
                        }
                    sellers_products[seller_id]['items'].append(item)
                
                created_orders = []
                
                # Tạo đơn hàng cho từng seller
                for seller_data in sellers_products.values():
                    # Tính tổng tiền
                    subtotal = sum(
                        item['product'].price * item['quantity'] 
                        for item in seller_data['items']
                    )
                    shipping_fee = 30000  # 30k phí ship cố định
                    total_amount = subtotal + shipping_fee
                    
                    # Tạo order
                    order = Order.objects.create(
                        order_number=f"SPE{uuid.uuid4().hex[:8].upper()}",
                        buyer=buyer,
                        seller=seller_data['seller'],
                        logistics_provider_id=serializer.validated_data['logistics_provider_id'],
                        payment_method_id=serializer.validated_data['payment_method_id'],
                        subtotal=subtotal,
                        shipping_fee=shipping_fee,
                        total_amount=total_amount,
                        shipping_address=serializer.validated_data['shipping_address'],
                        order_hash=f"hash_{uuid.uuid4().hex}",  # TODO: Implement real hash
                        notes=serializer.validated_data.get('notes', '')
                    )
                    
                    # Tạo order items
                    for item in seller_data['items']:
                        product = item['product']
                        quantity = item['quantity']
                        price = product.price
                        
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            price=price,
                            total_price=price * quantity
                        )
                        
                        # Trừ stock
                        product.stock -= quantity
                        product.save()
                    
                    created_orders.append(order)
                
                # Serialize response
                response_data = [
                    OrderDetailSerializer(order).data 
                    for order in created_orders
                ]
                
                return Response({
                    'success': True,
                    'message': f'Tạo thành công {len(created_orders)} đơn hàng',
                    'data': response_data
                }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Xác nhận đơn hàng (seller)"""
        order = self.get_object()
        
        # Kiểm tra user có phải seller của đơn hàng không
        try:
            seller = Seller.objects.get(id=request.user.id)
            if order.seller.id != seller.id:
                return Response({
                    'success': False,
                    'message': 'Bạn không có quyền xác nhận đơn hàng này'
                }, status=status.HTTP_403_FORBIDDEN)
        except Seller.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Chỉ seller mới có thể xác nhận đơn hàng'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if order.status == 'pending':
            order.status = 'confirmed'
            order.save()
            # TODO: Add seller digital signature
            
            return Response({
                'success': True,
                'message': 'Đơn hàng đã được xác nhận',
                'data': OrderDetailSerializer(order).data
            })
        
        return Response({
            'success': False,
            'message': 'Không thể xác nhận đơn hàng này'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """Giao hàng (seller)"""
        order = self.get_object()
        tracking_number = request.data.get('tracking_number')
        
        # Kiểm tra quyền seller
        try:
            seller = Seller.objects.get(id=request.user.id)
            if order.seller.id != seller.id:
                return Response({
                    'success': False,
                    'message': 'Bạn không có quyền cập nhật đơn hàng này'
                }, status=status.HTTP_403_FORBIDDEN)
        except Seller.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Chỉ seller mới có thể cập nhật trạng thái giao hàng'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if order.status == 'confirmed' and tracking_number:
            order.status = 'shipping'
            order.tracking_number = tracking_number
            order.shipped_at = timezone.now()
            order.save()
            
            return Response({
                'success': True,
                'message': 'Đơn hàng đã được giao cho shipper',
                'data': OrderDetailSerializer(order).data
            })
        
        return Response({
            'success': False,
            'message': 'Thông tin không hợp lệ hoặc đơn hàng chưa được xác nhận'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Hủy đơn hàng"""
        order = self.get_object()
        reason = request.data.get('reason', '')
        
        if order.status in ['pending', 'confirmed']:
            order.status = 'cancelled'
            order.save()
            
            # Hoàn lại stock
            for item in order.items.all():
                item.product.stock += item.quantity
                item.product.save()
            
            return Response({
                'success': True,
                'message': 'Đơn hàng đã được hủy',
                'data': OrderDetailSerializer(order).data
            })
        
        return Response({
            'success': False,
            'message': 'Không thể hủy đơn hàng này'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Hoàn thành đơn hàng (buyer xác nhận đã nhận)"""
        order = self.get_object()
        
        # Chỉ buyer mới có thể xác nhận hoàn thành
        try:
            buyer = Buyer.objects.get(id=request.user.id)
            if order.buyer.id != buyer.id:
                return Response({
                    'success': False,
                    'message': 'Bạn không có quyền xác nhận đơn hàng này'
                }, status=status.HTTP_403_FORBIDDEN)
        except Buyer.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Chỉ buyer mới có thể xác nhận nhận hàng'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if order.status == 'shipping':
            order.status = 'delivered'
            order.delivered_at = timezone.now()
            order.save()
            
            # Cập nhật số lượng đã bán cho sản phẩm
            for item in order.items.all():
                item.product.sold_count += item.quantity
                item.product.save()
            
            return Response({
                'success': True,
                'message': 'Đơn hàng đã hoàn thành',
                'data': OrderDetailSerializer(order).data
            })
        
        return Response({
            'success': False,
            'message': 'Đơn hàng chưa được giao hoặc đã hoàn thành'
        }, status=status.HTTP_400_BAD_REQUEST)

class LogisticsProviderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet đơn vị vận chuyển"""
    queryset = LogisticsProvider.objects.filter(is_active=True)
    serializer_class = LogisticsProviderSerializer
    permission_classes = [IsAuthenticated]

class PaymentMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet phương thức thanh toán"""
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
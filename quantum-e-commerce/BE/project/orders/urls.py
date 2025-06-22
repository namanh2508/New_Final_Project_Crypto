from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, LogisticsProviderViewSet, PaymentMethodViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'logistics', LogisticsProviderViewSet, basename='logistics')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')

urlpatterns = [
    path('', include(router.urls)),
]
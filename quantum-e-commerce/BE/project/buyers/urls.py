from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import BuyerViewSet

router = DefaultRouter()
router.register(r'', BuyerViewSet, basename='buyer')

urlpatterns = [
    path('', include(router.urls)),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

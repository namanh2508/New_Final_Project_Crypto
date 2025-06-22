from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SignatureLogViewSet, CertificateAuthorityViewSet, DigitalSignatureViewSet

router = DefaultRouter()
router.register(r'logs', SignatureLogViewSet, basename='signature-log')
router.register(r'ca', CertificateAuthorityViewSet, basename='certificate-authority')
router.register(r'crypto', DigitalSignatureViewSet, basename='digital-signature')

urlpatterns = [
    path('', include(router.urls)),
]
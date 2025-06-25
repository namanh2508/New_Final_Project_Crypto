# buyers/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import AnonymousUser
from .models import Buyer


class BuyerJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class for Buyer model
    """
    def get_user(self, validated_token):
        """
        Override để lấy Buyer thay vì User
        """
        try:
            user_id = validated_token['user_id']
            buyer = Buyer.objects.get(id=user_id, is_active=True)
            return buyer
        except Buyer.DoesNotExist:
            return AnonymousUser()


class BuyerRefreshToken(RefreshToken):
    """
    Custom refresh token for Buyer model
    """
    @classmethod
    def for_buyer(cls, buyer):
        """
        Tạo token cho buyer với custom claims
        """
        token = cls()
        token['user_id'] = str(buyer.id)  # Convert UUID to string
        token['username'] = buyer.username
        token['email'] = buyer.email
        
        return token
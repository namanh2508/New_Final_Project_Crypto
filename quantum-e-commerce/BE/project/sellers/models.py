from django.db import models
import uuid
# Create your models here.

class Seller(models.Model):
    SHOP_TYPE_CHOICES = [
        ('normal', 'Normal'),
        ('shopee_mall', 'Shopee Mall'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    shop_name = models.CharField(max_length=255)
    shop_type = models.CharField(max_length=20, choices=SHOP_TYPE_CHOICES, default='normal')
    description = models.TextField(blank=True)
    logo = models.TextField(blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Digital Signature Fields
    public_key = models.TextField(blank=True)
    private_key_hash = models.TextField(blank=True)
    digital_certificate = models.TextField(blank=True)
    signature_algorithm = models.CharField(max_length=50, default='CRYSTAL-DILITHIUM')
    dilithium_variant = models.CharField(max_length=20, default='DILITHIUM3')
    quantum_resistant = models.BooleanField(default=True)
    key_created_at = models.DateTimeField(null=True, blank=True)
    certificate_expires_at = models.DateTimeField(null=True, blank=True)
    is_signature_verified = models.BooleanField(default=False)
    
    # Business verification
    business_license = models.TextField(blank=True)
    tax_code = models.CharField(max_length=50, blank=True)
    legal_representative = models.CharField(max_length=255, blank=True)
    
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sellers'
        
    def __str__(self):
        return self.shop_name
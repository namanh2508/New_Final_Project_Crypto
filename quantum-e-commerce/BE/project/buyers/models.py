import uuid
from django.db import models

class Buyer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.TextField(blank=True)
    
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
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'buyers'
        
    def __str__(self):
        return self.username

class BuyerAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, related_name='addresses')
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'buyer_addresses'
        
class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = ['buyer', 'product']
        
    def __str__(self):
        return f"{self.buyer.username} - {self.product.name} (x{self.quantity})"
    
    @property
    def total_price(self):
        return self.product.price * self.quantity
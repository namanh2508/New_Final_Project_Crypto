from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser

# Create your models here.
import uuid
from django.db import models

class SignatureLog(models.Model):
    ENTITY_TYPE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('order', 'Order'),
        ('payment', 'Payment'),
    ]
    
    ACTION_CHOICES = [
        ('key_generated', 'Key Generated'),
        ('signature_created', 'Signature Created'),
        ('signature_verified', 'Signature Verified'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPE_CHOICES)
    entity_id = models.UUIDField()
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    signature_algorithm = models.CharField(max_length=50, blank=True)
    dilithium_variant = models.CharField(max_length=20, blank=True)
    signature_data = models.TextField(blank=True)
    signature_size = models.IntegerField(null=True, blank=True)  # Size in bytes
    verification_result = models.BooleanField(null=True, blank=True)
    quantum_resistant = models.BooleanField(default=False)
    security_level = models.IntegerField(null=True, blank=True)  # NIST levels 1-5
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'signature_logs'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.entity_type} {self.action} - {self.signature_algorithm}"

class CertificateAuthority(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)  # 'Shopee Quantum CA', 'NIST PQC CA'
    public_key = models.TextField()
    certificate = models.TextField()
    algorithm = models.CharField(max_length=50, default='CRYSTAL-DILITHIUM')
    dilithium_variant = models.CharField(max_length=20, default='DILITHIUM3')
    security_level = models.IntegerField(default=3)  # NIST security level
    is_trusted = models.BooleanField(default=True)
    is_quantum_resistant = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'certificate_authorities'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} ({self.algorithm})"
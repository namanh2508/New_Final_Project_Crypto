
import uuid
from django.db import models
from orders.models import Order, PaymentMethod

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True)
    
    # Digital Signatures for Payment Security (Quantum-Resistant)
    payment_signature = models.TextField(blank=True)  # Dilithium signature
    payment_hash = models.TextField(blank=True)       # SHA3-256 hash
    gateway_signature = models.TextField(blank=True)  # Payment gateway's signature
    signature_algorithm = models.CharField(max_length=50, default='CRYSTAL-DILITHIUM')
    
    # Payment gateway response data
    gateway_response = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Payment {self.transaction_id} - ${self.amount}"

class PaymentWebhook(models.Model):
    """Store webhook events from payment gateways"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='webhooks', null=True, blank=True)
    gateway = models.CharField(max_length=50)  # 'stripe', 'paypal', 'vnpay'
    event_type = models.CharField(max_length=100)  # 'payment.succeeded', 'payment.failed'
    webhook_id = models.CharField(max_length=255, unique=True)  # Gateway's webhook ID
    data = models.JSONField()  # Full webhook payload
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_webhooks'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.gateway} - {self.event_type}"

class Refund(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    REASON_CHOICES = [
        ('customer_request', 'Customer Request'),
        ('fraud', 'Fraud'),
        ('duplicate', 'Duplicate'),
        ('defective_product', 'Defective Product'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    refund_id = models.CharField(max_length=255, blank=True)  # Gateway refund ID
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'refunds'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Refund ${self.amount} for Payment {self.payment.transaction_id}"
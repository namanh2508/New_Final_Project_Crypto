# Generated by Django 4.2 on 2025-06-14 09:43

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Buyer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('password', models.CharField(max_length=128)),
                ('full_name', models.CharField(blank=True, max_length=255)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('avatar', models.TextField(blank=True)),
                ('public_key', models.TextField(blank=True)),
                ('private_key_hash', models.TextField(blank=True)),
                ('digital_certificate', models.TextField(blank=True)),
                ('signature_algorithm', models.CharField(default='CRYSTAL-DILITHIUM', max_length=50)),
                ('dilithium_variant', models.CharField(default='DILITHIUM3', max_length=20)),
                ('quantum_resistant', models.BooleanField(default=True)),
                ('key_created_at', models.DateTimeField(blank=True, null=True)),
                ('certificate_expires_at', models.DateTimeField(blank=True, null=True)),
                ('is_signature_verified', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'buyers',
            },
        ),
        migrations.CreateModel(
            name='BuyerAddress',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('address', models.TextField()),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('is_default', models.BooleanField(default=False)),
                ('buyer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='addresses', to='buyers.buyer')),
            ],
            options={
                'db_table': 'buyer_addresses',
            },
        ),
        migrations.CreateModel(
            name='CartItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('buyer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cart_items', to='buyers.buyer')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product')),
            ],
            options={
                'db_table': 'cart_items',
                'unique_together': {('buyer', 'product')},
            },
        ),
    ]

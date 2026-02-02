from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SmartShopProduct, SmartShopPurchaseOrder


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartShopProduct
        fields = ["id", "name", "category", "price", "image"]


class PurchaseSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SmartShopPurchaseOrder
        fields = ["id", "product", "product_id", "quantity", "purchase_date"]

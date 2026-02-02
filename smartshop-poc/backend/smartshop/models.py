from django.db import models
from django.contrib.auth.models import User


class SmartShopProduct(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="product_images/", null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.category})"


class SmartShopPurchaseOrder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(SmartShopProduct, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    purchase_date = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"User {self.user_id} purchased {self.product_id} x{self.quantity}"
    
class UserAIInsight(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="ai_insight")
    purchase_signature = models.CharField(max_length=64)  # sha256 hex
    bullets_json = models.JSONField(default=list)         # list[str]
    text = models.TextField(blank=True, default="")       # optional full text
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AIInsight(user={self.user.username}, updated={self.updated_at})"
    
class UserRecommendationCache(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="ai_recommendations")
    purchase_signature = models.CharField(max_length=64)  # sha256
    items_json = models.JSONField(default=list)           # [{id, reason}, ...]
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"UserRecommendationCache(user={self.user.username}, updated={self.updated_at})"

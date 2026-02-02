from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.register),
    path("auth/login/", TokenObtainPairView.as_view()),   # POST {username, password}
    path("auth/refresh/", TokenRefreshView.as_view()),

    # Store
    path("products/", views.products_list),

    # Purchases
    path("purchases/me/", views.my_purchases),
    path("purchases/buy/", views.buy_product),

    # AI
    path("ai/recommendations/", views.recommendations),
    path("ai/insights/", views.ai_insights),
]

from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import SmartShopProduct, SmartShopPurchaseOrder, UserAIInsight
from .serializers import RegisterSerializer, ProductSerializer, PurchaseSerializer
from .reco_service import get_recommendations_for_user
from .ai_insights import generate_user_insights_bullets
from .utils import purchase_signature


# -----------------------------
# Auth
# -----------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register/
    Body: { "username": "...", "email": "...", "password": "..." }
    """
    ser = RegisterSerializer(data=request.data)
    if ser.is_valid():
        user = ser.save()
        return Response(
            {"id": user.id, "username": user.username},
            status=status.HTTP_201_CREATED,
        )
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# Products
# -----------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def products_list(request):
    """
    GET /api/products/
    """
    qs = SmartShopProduct.objects.all().order_by("id")
    return Response(ProductSerializer(qs, many=True).data)


# -----------------------------
# Purchases
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_purchases(request):
    """
    GET /api/purchases/me/
    """
    qs = (
        SmartShopPurchaseOrder.objects
        .filter(user=request.user)
        .select_related("product")
        .order_by("-purchase_date")
    )
    return Response(PurchaseSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def buy_product(request):
    """
    POST /api/purchases/buy/
    Body: { "product_id": 3, "quantity": 1 }
    """
    ser = PurchaseSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    product_id = ser.validated_data["product_id"]
    qty = ser.validated_data.get("quantity", 1)

    product = SmartShopProduct.objects.filter(id=product_id).first()
    if not product:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    po = SmartShopPurchaseOrder.objects.create(
        user=request.user,
        product=product,
        quantity=qty,
    )
    return Response(PurchaseSerializer(po).data, status=status.HTTP_201_CREATED)


# -----------------------------
# AI Recommendations
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommendations(request):
    force = request.query_params.get("force") == "1"
    data = get_recommendations_for_user(request.user, max_items=4, force=force)
    return Response(data)



# -----------------------------
# AI Insights (cached)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insights(request):
    """
    GET /api/ai/insights/
    Optional: ?force=1 to regenerate even if unchanged
    """
    user = request.user

    purchases_qs = (
        SmartShopPurchaseOrder.objects
        .filter(user=user)
        .select_related("product")
        .order_by("-purchase_date")[:15]
    )

    purchases_compact = [
        {
            "name": p.product.name,
            "category": p.product.category,
            "price": float(p.product.price),
            "qty": p.quantity,
        }
        for p in purchases_qs
    ]

    sig = purchase_signature(purchases_compact)
    force = request.query_params.get("force") == "1"

    cached = UserAIInsight.objects.filter(user=user).first()
    if (not force) and cached and cached.purchase_signature == sig and cached.bullets_json:
        return Response({
            "cached": True,
            "signature": sig,
            "bullets": cached.bullets_json,
            "text": cached.text,
            "updated_at": cached.updated_at,
        })

    # Get recommendations (shared logic)
    rec_data = get_recommendations_for_user(user, max_items=4, force=force)
    recs = rec_data.get("recommended", [])

    # Generate bullets using Gemini
    bullets = generate_user_insights_bullets(
        api_key=getattr(settings, "GEMINI_API_KEY", None),
        model_name=getattr(settings, "GEMINI_MODEL", "models/gemini-2.5-flash"),
        username=user.username,
        purchases=purchases_compact,
        recs=recs,
    )

    # Save/update cache
    if not cached:
        cached = UserAIInsight(user=user)

    cached.purchase_signature = sig
    cached.bullets_json = bullets
    cached.text = "\n".join([f"• {b}" for b in bullets])
    cached.save()

    return Response({
        "cached": False,
        "signature": sig,
        "bullets": bullets,
        "text": cached.text,
        "updated_at": cached.updated_at,
    })

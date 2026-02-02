import hashlib
import json

def purchase_signature(purchases_compact):
    """
    purchases_compact: list[dict] like:
    [{"name": "...", "category": "...", "price": 12.3, "qty": 1}, ...]
    """
    payload = json.dumps(purchases_compact, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

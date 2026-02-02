import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";
import { useAuth } from "../auth/AuthContext";

export default function ProductsPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState(null);

  // Track loading state per product id
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    api.get("/products/")
      .then((r) => setProducts(r.data))
      .catch((e) => {
        setToast({
          type: "error",
          title: "Failed to load products",
          message: e?.message || "Unknown error",
        });
      });
  }, []);

  // auto close toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return products;
    return products.filter((p) =>
      `${p.name} ${p.category}`.toLowerCase().includes(needle)
    );
  }, [products, q]);

  const buy = async (productId) => {
    if (!user) {
      setToast({
        type: "error",
        title: "Login required",
        message: "Please login to buy and build purchase history for recommendations.",
      });
      return;
    }

    try {
      setBuyingId(productId);
      await api.post("/purchases/buy/", { product_id: productId, quantity: 1 });

      setToast({
        type: "success",
        title: "Purchased",
        message: "Added to your purchase history. Check 'For You' for recommendations.",
      });
    } catch (e) {
      const msg =
        e?.response?.data
          ? (typeof e.response.data === "string" ? e.response.data : JSON.stringify(e.response.data))
          : (e?.message || "Unknown error");

      setToast({
        type: "error",
        title: "Purchase failed",
        message: msg,
      });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px" }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Products</h2>
          <div style={{ opacity: 0.75, fontWeight: 700 }}>
            Browse items and purchase to generate personalized AI recommendations.
          </div>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ddd",
            minWidth: 260,
            flex: "1 1 320px",
          }}
        />
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onBuy={buy}
            isBuying={buyingId === p.id}
          />
        ))}
      </div>
    </div>
  );
}

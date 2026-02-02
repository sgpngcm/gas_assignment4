import { useEffect, useState } from "react";
import { api } from "../api";

export default function PurchasesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/purchases/me/").then(r => setItems(r.data));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 16px" }}>
      <h2 style={{ marginTop: 0 }}>My Purchases</h2>
      <div style={{ border: "1px solid #eee", borderRadius: 16, overflow: "hidden", background: "white" }}>
        {items.length === 0 ? (
          <div style={{ padding: 16 }}>No purchases yet. Buy a product to build history.</div>
        ) : items.map(x => (
          <div key={x.id} style={{ padding: 14, borderBottom: "1px solid #f2f2f2", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 900 }}>{x.product?.name}</div>
              <div style={{ opacity: 0.7, fontSize: 14 }}>{x.product?.category} • qty {x.quantity}</div>
            </div>
            <div style={{ fontWeight: 900 }}>${x.product?.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

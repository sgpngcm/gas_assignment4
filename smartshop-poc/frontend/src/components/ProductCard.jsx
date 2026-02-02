import { API_BASE } from "../api";

export default function ProductCard({ p, onBuy, isBuying }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 16,
        overflow: "hidden",
        background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ aspectRatio: "1/1", background: "#fafafa" }}>
        {p.image ? (
          <img
            src={`${API_BASE}${p.image}`}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </div>

      <div style={{ padding: 12, display: "grid", gap: 6, flex: 1 }}>
        <div style={{ fontWeight: 900 }}>{p.name}</div>
        <div style={{ opacity: 0.7, fontSize: 14 }}>{p.category}</div>

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>${p.price}</div>

          {onBuy ? (
            <button
              onClick={() => onBuy(p.id)}
              disabled={isBuying}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "none",
                background: isBuying ? "#9db0ff" : "#1f4fff",
                color: "white",
                fontWeight: 900,
                cursor: isBuying ? "not-allowed" : "pointer",
                minWidth: 90,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isBuying ? "Buying…" : "Buy"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

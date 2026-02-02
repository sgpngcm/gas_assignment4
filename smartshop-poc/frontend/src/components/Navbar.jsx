import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = () => {
    logout();
    nav("/");
  };

  const item = ({ isActive }) => ({
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: isActive ? "white" : "#0b1220",
    background: isActive ? "#1f4fff" : "transparent",
    fontWeight: 700,
  });

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
      borderBottom: "1px solid #eee"
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/smartshop-logo.png" alt="SmartShop" style={{ width: 34, height: 34, borderRadius: 10 }} />
          <div style={{ fontWeight: 900, color: "#0b1220" }}>SmartShop</div>
        </Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <NavLink to="/" style={item}>Home</NavLink>
          <NavLink to="/products" style={item}>Products</NavLink>

          {user ? (
            <>
              <NavLink to="/recommendations" style={item}>For You</NavLink>
              <NavLink to="/purchases" style={item}>My Purchases</NavLink>
              <NavLink to="/insights" style={item}>AI Insights</NavLink>
              <span style={{ marginLeft: 8, fontWeight: 800, opacity: 0.8 }}>
                Hi, {user.username}
              </span>
              <button onClick={doLogout} style={{
                marginLeft: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd",
                background: "white", fontWeight: 800, cursor: "pointer"
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={item}>Login</NavLink>
              <NavLink to="/register" style={item}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

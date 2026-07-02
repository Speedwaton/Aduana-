import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, FileText, ShieldCheck, Car,
  PackageSearch, Clock, BarChart2, Server, Shield, LogOut, ShieldAlert,
} from "lucide-react";
import { NAV_ITEMS } from "../../data/constants";
import { useAuth } from "../../context/AuthContext";

const ICONS = {
  LayoutDashboard, ClipboardList, FileText, ShieldCheck, Car,
  PackageSearch, Clock, BarChart2, Server, ShieldAlert,
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const rol = user?.rol;
  const items = NAV_ITEMS.filter((n) => n.roles.includes(rol));
  const inicial = (user?.nombreCompleto || "U").charAt(0).toUpperCase();

  return (
    <aside style={{ width: 224, minHeight: "100vh", background: "#0c1f3f", display: "flex", flexDirection: "column", flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 40, height: 40, background: "linear-gradient(135deg, #185FA5 0%, #1a7fd4 100%)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(24,95,165,0.4)",
          }}>
            <Shield size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>Los Libertadores</div>
            <div style={{ color: "#5b8db8", fontSize: 9, letterSpacing: 0.8, marginTop: 1, textTransform: "uppercase" }}>Frontera Inteligente</div>
          </div>
        </div>
      </div>

      {/* Navegación filtrada por rol — cada item es una URL real (/dashboard, /tramites...) */}
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {items.map((n) => {
          const Icon = ICONS[n.icon];
          return (
            <NavLink
              key={n.key}
              to={`/${n.key}`}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 11, width: "100%",
                padding: "9px 18px",
                background: isActive ? "rgba(24,95,165,0.35)" : "none",
                border: "none",
                borderLeft: isActive ? "3px solid #378ADD" : "3px solid transparent",
                color: isActive ? "#fff" : "#7aa3cc",
                fontSize: 13.5, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                textDecoration: "none", boxSizing: "border-box",
              })}
            >
              {Icon && <Icon size={16} strokeWidth={1.9} />}
              {n.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Perfil + logout */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #185FA5, #1a7fd4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>{inicial}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.nombreCompleto || "Usuario"}</div>
            <div style={{ color: "#5b8db8", fontSize: 10, marginTop: 1 }}>{rol}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, color: "#9ab5cc", fontSize: 12.5, cursor: "pointer" }}
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

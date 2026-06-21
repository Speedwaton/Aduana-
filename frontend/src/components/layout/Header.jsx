import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ title }) {
  const { user } = useAuth();
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 28px", borderBottom: "1px solid #e8ecf2", background: "#fff",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Menu size={18} color="#9ab5cc" strokeWidth={1.8} />
        <span style={{ color: "#9ab5cc", fontSize: 14 }}>
          Bienvenido, {user?.nombreCompleto?.split(" ")[0] || "Usuario"}
        </span>
      </div>
      <h2 style={{ margin: 0, fontSize: 17, color: "#0c1f3f", fontWeight: 700 }}>{title}</h2>
    </div>
  );
}

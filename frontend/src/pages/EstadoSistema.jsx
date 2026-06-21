import { useEffect, useState } from "react";
import { Server, RefreshCw } from "lucide-react";
import { reportesService } from "../services/reportesService";
import { CenteredLoader } from "../components/ui/Spinner";
import { ErrorBox } from "./Dashboard";

// Health check extendido: estado de cada microservicio (ms-reportes lo agrega).
export default function EstadoSistema({ notify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      setData(await reportesService.estadoSistema());
    } catch (e) {
      setError(e.message);
      notify?.("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  if (loading) return <CenteredLoader label="Consultando estado del sistema..." />;
  if (error) return <div style={{ padding: 28 }}><ErrorBox msg={error} onRetry={cargar} /></div>;

  const ms = data.microservicios || [];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ background: "linear-gradient(135deg, #0c1f3f, #123a6b)", borderRadius: 14, padding: 24, color: "#fff", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{data.sistema}</div>
          <div style={{ fontSize: 13, color: "#9ab5cc", marginTop: 4 }}>Versión {data.version}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(29,158,117,0.2)", color: "#5ee0b0", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" }} /> {data.estado}
          </div>
          <button onClick={cargar} style={{ marginTop: 12, marginLeft: "auto", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#cdd9e6", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> Refrescar
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {ms.map((m) => (
          <div key={m.nombre} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eaf2fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Server size={18} color="#185FA5" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0c1f3f" }}>{m.nombre}</div>
              <div style={{ fontSize: 12, color: "#9ab5cc" }}>Puerto {m.puerto}</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: m.estado === "UP" ? "#0F6E56" : "#A32D2D" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.estado === "UP" ? "#1D9E75" : "#E24B4A" }} />
              {m.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Users, Car, FileText, CheckCircle2, AlertCircle, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { reportesService } from "../services/reportesService";
import { CenteredLoader } from "../components/ui/Spinner";
import { ALERTA_STYLE } from "../data/constants";

const ALERTA_ICON = {
  CRITICO: <AlertCircle size={16} color="#E24B4A" strokeWidth={2} />,
  ADVERTENCIA: <AlertTriangle size={16} color="#D97706" strokeWidth={2} />,
  INFO: <CheckCircle size={16} color="#1D9E75" strokeWidth={2} />,
};

export default function Dashboard({ notify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const d = await reportesService.dashboard();
      setData(d);
    } catch (e) {
      setError(e.message);
      notify?.("error", "No se pudo cargar el dashboard: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  if (loading) return <CenteredLoader label="Cargando métricas del dashboard..." />;

  if (error)
    return (
      <div style={{ padding: 28 }}>
        <ErrorBox msg={error} onRetry={cargar} />
      </div>
    );

  const statCards = [
    { label: "Viajeros hoy", value: data.viajeroHoy ?? 0, Icon: Users, delta: data.variacionViajeros, col: "#185FA5" },
    { label: "Vehículos hoy", value: data.vehiculosHoy ?? 0, Icon: Car, delta: data.variacionVehiculos, col: "#185FA5" },
    { label: "Trámites hoy", value: data.tramitesHoy ?? 0, Icon: FileText, delta: data.variacionTramites, col: "#185FA5" },
    { label: "Validaciones exitosas", value: data.tasaValidacionExitosa ?? "0%", Icon: CheckCircle2, delta: `${data.vehiculosEnFila ?? 0} en fila`, col: "#1D9E75" },
  ];

  const alertas = data.alertas || [];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={cargar} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e7f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#185FA5", cursor: "pointer" }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.col }}>{typeof s.value === "number" ? s.value.toLocaleString("es-CL") : s.value}</div>
                <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 3 }}>{s.label}</div>
                {s.delta && <div style={{ fontSize: 11, color: "#1D9E75", marginTop: 5 }}>{s.delta}</div>}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.col === "#1D9E75" ? "#e1f5ee" : "#eaf2fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.Icon size={18} color={s.col} strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas activas */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14 }}>Alertas y notificaciones activas</span>
          <span style={{ fontSize: 12, color: "#9ab5cc" }}>{alertas.length} activas</span>
        </div>
        {alertas.length === 0 && <div style={{ fontSize: 13, color: "#9ab5cc", padding: "10px 0" }}>Sin alertas. Todo en orden ✓</div>}
        {alertas.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 0", borderBottom: i < alertas.length - 1 ? "1px solid #f4f6fa" : "none" }}>
            <div style={{ marginTop: 1, flexShrink: 0 }}>{ALERTA_ICON[a.nivel] || ALERTA_ICON.INFO}</div>
            <div>
              <div style={{ fontSize: 13, color: "#0c1f3f", lineHeight: 1.4 }}>{a.mensaje}</div>
              <div style={{ fontSize: 11, color: "#9ab5cc", marginTop: 2 }}>
                {a.tiempoTranscurrido} · <span style={{ color: ALERTA_STYLE[a.nivel]?.color || "#9ab5cc", fontWeight: 600 }}>{a.nivel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorBox({ msg, onRetry }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f3d4d4", borderRadius: 12, padding: 28, textAlign: "center" }}>
      <AlertCircle size={30} color="#E24B4A" style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 14, color: "#A32D2D", marginBottom: 14 }}>{msg}</div>
      {onRetry && (
        <button onClick={onRetry} style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
          Reintentar
        </button>
      )}
    </div>
  );
}

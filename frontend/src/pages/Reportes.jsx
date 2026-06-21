import { useEffect, useState } from "react";
import { Users, Car, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { reportesService } from "../services/reportesService";
import { validacionService } from "../services/validacionService";
import { CenteredLoader } from "../components/ui/Spinner";
import { ErrorBox } from "./Dashboard";

// Barra horizontal simple reutilizable.
function BarRow({ label, value, max, color = "#185FA5", suffix = "" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#0c1f3f" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}{suffix}</span>
      </div>
      <div style={{ background: "#f4f6fa", borderRadius: 4, height: 9, overflow: "hidden" }}>
        <div style={{ background: color, height: "100%", width: `${pct}%`, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export default function Reportes({ notify }) {
  const [dash, setDash] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setLoading(true); setError("");
    try {
      const [d, s] = await Promise.all([
        reportesService.dashboard(),
        validacionService.estadisticas().catch(() => null),
      ]);
      setDash(d);
      setStats(s);
    } catch (e) {
      setError(e.message);
      notify?.("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  if (loading) return <CenteredLoader label="Generando reportes..." />;
  if (error) return <div style={{ padding: 28 }}><ErrorBox msg={error} onRetry={cargar} /></div>;

  const maxFlujo = Math.max(dash.viajeroHoy || 0, dash.vehiculosHoy || 0, dash.tramitesHoy || 0, 1);
  const cards = [
    { label: "Viajeros hoy", value: dash.viajeroHoy ?? 0, Icon: Users },
    { label: "Vehículos hoy", value: dash.vehiculosHoy ?? 0, Icon: Car },
    { label: "Trámites hoy", value: dash.tramitesHoy ?? 0, Icon: FileText },
    { label: "Tasa validación", value: dash.tasaValidacionExitosa ?? "0%", Icon: CheckCircle2 },
  ];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={cargar} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e7f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#185FA5", cursor: "pointer" }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#185FA5" }}>{typeof c.value === "number" ? c.value.toLocaleString("es-CL") : c.value}</div>
              <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 3 }}>{c.label}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eaf2fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <c.Icon size={18} color="#185FA5" />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 22 }}>
          <div style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14, marginBottom: 18 }}>Volumen del día</div>
          <BarRow label="Viajeros procesados" value={dash.viajeroHoy ?? 0} max={maxFlujo} color="#185FA5" />
          <BarRow label="Vehículos procesados" value={dash.vehiculosHoy ?? 0} max={maxFlujo} color="#1a7fd4" />
          <BarRow label="Trámites procesados" value={dash.tramitesHoy ?? 0} max={maxFlujo} color="#1D9E75" />
          <BarRow label="Vehículos en fila ahora" value={dash.vehiculosEnFila ?? 0} max={maxFlujo} color="#D97706" />
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 22 }}>
          <div style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14, marginBottom: 18 }}>Validaciones de identidad</div>
          {stats ? (
            <>
              <BarRow label="Aprobadas" value={stats.aprobadas ?? 0} max={stats.totalValidaciones || 1} color="#1D9E75" />
              <BarRow label="Rechazadas" value={stats.rechazadas ?? 0} max={stats.totalValidaciones || 1} color="#E24B4A" />
              <div style={{ marginTop: 18, padding: 16, background: "#f8fafd", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#1D9E75" }}>{stats.tasaExitoPorcentaje}</div>
                <div style={{ fontSize: 12.5, color: "#6b7c93", marginTop: 2 }}>Tasa de éxito · {stats.totalValidaciones} validaciones</div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#9ab5cc" }}>Estadísticas de validación no disponibles.</div>
          )}
        </div>
      </div>
    </div>
  );
}

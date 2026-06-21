import { useState } from "react";
import { Clock, Car, Search } from "lucide-react";
import { notificacionesService } from "../services/notificacionesService";
import Badge from "../components/ui/Badge";
import { PrimaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

// Consulta del turno del viajero en la fila virtual (ms-notificaciones / Redis).
export default function MiTurno({ notify }) {
  const { user } = useAuth();
  const [rut, setRut] = useState(user?.rut || "");
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const consultar = async () => {
    if (!rut.trim()) return notify("error", "Ingresa tu RUT o pasaporte.");
    setLoading(true); setBuscado(true); setTurno(null);
    try {
      const t = await notificacionesService.consultarTurno(rut.trim());
      setTurno(t);
    } catch (e) {
      if (e.status === 404) notify("info", "No tienes un turno activo en este momento.");
      else notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 28, maxWidth: 560, margin: "0 auto" }}>
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eaf2fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={19} color="#185FA5" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0c1f3f" }}>Estado de mi turno</div>
            <div style={{ fontSize: 12.5, color: "#9ab5cc" }}>Paso Los Libertadores</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && consultar()}
            placeholder="Tu RUT o pasaporte"
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #d0d5e0", fontSize: 14 }}
          />
          <PrimaryButton onClick={consultar} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {loading ? <Spinner size={15} color="#fff" /> : <Search size={15} />} Consultar
          </PrimaryButton>
        </div>
      </div>

      {turno && (
        <div style={{ background: "linear-gradient(135deg, #0c1f3f, #123a6b)", borderRadius: 16, padding: 28, marginTop: 20, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 12.5, color: "#9ab5cc", textTransform: "uppercase", letterSpacing: 1 }}>Tu número de turno</div>
          <div style={{ fontSize: 56, fontWeight: 800, margin: "6px 0", color: "#fff" }}>{turno.numeroTurno}</div>
          <div style={{ display: "inline-block", marginBottom: 18 }}><Badge estado={turno.estadoTurno} /></div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>
            <Car size={18} color="#9ab5cc" />
            <span style={{ fontSize: 14 }}>
              <b style={{ fontSize: 22 }}>{turno.vehiculosAdelante}</b> vehículos adelante
            </span>
          </div>

          <div style={{ fontSize: 13, color: "#cdd9e6", lineHeight: 1.5 }}>{turno.mensajeInformativo}</div>
        </div>
      )}

      {buscado && !loading && !turno && (
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 30, marginTop: 20, textAlign: "center", fontSize: 13.5, color: "#9ab5cc" }}>
          No se encontró un turno activo para ese documento.
        </div>
      )}
    </div>
  );
}

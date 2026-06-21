import { useState } from "react";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";
import QRCode from "react-qr-code";
import { preregistroService } from "../services/preregistroService";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { fmtFecha, labelEnum } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// Consulta de trámites por RUT del viajero (o por código de trámite) y
// gestión de estado para funcionarios/supervisores.
export default function Tramites({ notify }) {
  const { user } = useAuth();
  const esFuncionario = user?.rol === "FUNCIONARIO" || user?.rol === "SUPERVISOR";

  const [modo, setModo] = useState("rut"); // "rut" | "id"
  const [query, setQuery] = useState(user?.rol === "VIAJERO" ? user.rut : "");
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = async () => {
    if (!query.trim()) return notify("error", "Ingresa un valor para buscar.");
    setLoading(true); setBuscado(true);
    try {
      if (modo === "rut") {
        const lista = await preregistroService.porViajero(query.trim());
        setTramites(Array.isArray(lista) ? lista : []);
      } else {
        const t = await preregistroService.consultar(query.trim());
        setTramites(t ? [t] : []);
      }
    } catch (e) {
      setTramites([]);
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (idTramite, nuevoEstado) => {
    try {
      const actualizado = await preregistroService.actualizarEstado(idTramite, nuevoEstado);
      setTramites((prev) => prev.map((t) => (t.idTramite === idTramite ? actualizado : t)));
      if (detalle?.idTramite === idTramite) setDetalle(actualizado);
      notify("success", `Trámite ${idTramite} → ${labelEnum(nuevoEstado)}`);
    } catch (e) {
      notify("error", e.message);
    }
  };

  return (
    <div style={{ padding: 28 }}>
      {/* Buscador */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select value={modo} onChange={(e) => setModo(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #d0d5e0", fontSize: 13.5 }}>
            <option value="rut">Por RUT del viajero</option>
            <option value="id">Por código de trámite</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder={modo === "rut" ? "18.234.567-8" : "QR-25-05-2025-4587"}
            style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 8, border: "1px solid #d0d5e0", fontSize: 14 }}
          />
          <PrimaryButton onClick={buscar} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {loading ? <Spinner size={15} color="#fff" /> : <Search size={15} />} Buscar
          </PrimaryButton>
        </div>
      </div>

      {/* Tabla resultados */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafd" }}>
            <tr>
              {["Código", "Viajero", "RUT", "Ingreso", "Motivo", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 12, color: "#9ab5cc", fontWeight: 700, borderBottom: "1px solid #e8ecf2" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tramites.map((t) => (
              <tr key={t.idTramite} style={{ borderBottom: "1px solid #f4f6fa" }}>
                <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{t.idTramite}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#0c1f3f" }}>{t.nombreCompleto}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.rutViajero}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.fechaIngreso}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{labelEnum(t.motivoViaje)}</td>
                <td style={{ padding: "12px 14px" }}><Badge estado={t.estado} /></td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <IconBtn bg="#eaf2fb" color="#185FA5" onClick={() => setDetalle(t)}><Eye size={13} /></IconBtn>
                    {esFuncionario && t.estado !== "APROBADO" && (
                      <IconBtn bg="#e1f5ee" color="#0F6E56" onClick={() => cambiarEstado(t.idTramite, "APROBADO")}><CheckCircle size={13} /></IconBtn>
                    )}
                    {esFuncionario && t.estado !== "RECHAZADO" && (
                      <IconBtn bg="#fcebeb" color="#A32D2D" onClick={() => cambiarEstado(t.idTramite, "RECHAZADO")}><XCircle size={13} /></IconBtn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {buscado && !loading && tramites.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 26, textAlign: "center", fontSize: 13, color: "#9ab5cc" }}>No se encontraron trámites.</td></tr>
            )}
            {!buscado && (
              <tr><td colSpan={7} style={{ padding: 26, textAlign: "center", fontSize: 13, color: "#9ab5cc" }}>Realiza una búsqueda para ver los trámites.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle + QR + gestión */}
      {detalle && (
        <Modal title="Detalle del trámite" onClose={() => setDetalle(null)}>
          <div style={{ background: "#f8fafd", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            {[
              ["Código", detalle.idTramite],
              ["Viajero", detalle.nombreCompleto],
              ["RUT", detalle.rutViajero],
              ["Nacionalidad", detalle.nacionalidad],
              ["Correo", detalle.correoElectronico],
              ["Fecha ingreso", detalle.fechaIngreso],
              ["Motivo", labelEnum(detalle.motivoViaje)],
              ["Patente", detalle.patenteVehiculo || "Sin vehículo"],
              ["Creado", fmtFecha(detalle.fechaCreacion)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #e8ecf2" }}>
                <span style={{ fontSize: 13, color: "#9ab5cc" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#0c1f3f", fontWeight: 500, textAlign: "right" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 0" }}>
              <span style={{ fontSize: 13, color: "#9ab5cc" }}>Estado</span>
              <Badge estado={detalle.estado} />
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "18px 0", background: "#fff", border: "1px solid #e8ecf2", borderRadius: 10, marginBottom: 16 }}>
            <QRCode value={detalle.codigoQr || detalle.idTramite} size={140} level="M" />
            <div style={{ fontSize: 12, color: "#9ab5cc", marginTop: 10 }}>Presentar en el control de identidad</div>
          </div>

          {esFuncionario && (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <SecondaryButton onClick={() => cambiarEstado(detalle.idTramite, "EN_REVISION")}>En revisión</SecondaryButton>
              <button onClick={() => cambiarEstado(detalle.idTramite, "RECHAZADO")} style={{ background: "#fcebeb", color: "#A32D2D", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Rechazar</button>
              <PrimaryButton onClick={() => cambiarEstado(detalle.idTramite, "APROBADO")}>Aprobar</PrimaryButton>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function IconBtn({ children, bg, color, onClick }) {
  return (
    <button onClick={onClick} style={{ background: bg, color, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
      {children}
    </button>
  );
}

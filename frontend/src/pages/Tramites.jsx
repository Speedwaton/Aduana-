import { useState } from "react";
import { Search, CheckCircle, XCircle, Eye, FileText, Upload, ShieldAlert } from "lucide-react";
import QRCode from "react-qr-code";
import { preregistroService } from "../services/preregistroService";
import { validacionService } from "../services/validacionService";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { fmtFecha, labelEnum, TIPOS_DOCUMENTO } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// Consulta y gestión de trámites.
//  - VIAJERO: ve sus trámites, sube documentos desde casa y sigue el estado PDI.
//  - FUNCIONARIO (agente): ve el resultado de la PDI y corrobora (aprueba)
//    SOLO cuando la PDI ya aprobó — el backend lo exige (candado).
export default function Tramites({ notify }) {
  const { user } = useAuth();
  const esFuncionario = user?.rol === "FUNCIONARIO" || user?.rol === "SUPERVISOR";
  const esViajero = user?.rol === "VIAJERO";

  const [modo, setModo] = useState("rut"); // "rut" | "id"
  const [query, setQuery] = useState(esViajero ? user.rut : "");
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [buscado, setBuscado] = useState(false);

  // Estado PDI + documentos del trámite abierto en el detalle
  const [revisionPdi, setRevisionPdi] = useState(null);   // null = sin revisar
  const [documentos, setDocumentos] = useState([]);
  const [tipoDoc, setTipoDoc] = useState("ANTECEDENTES_PENALES");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

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

  // Abre el detalle y trae el estado PDI + documentos del trámite.
  const abrirDetalle = async (t) => {
    setDetalle(t);
    setRevisionPdi(null);
    setDocumentos([]);
    setArchivo(null);
    validacionService.pdiPorTramite(t.idTramite)
      .then(setRevisionPdi)
      .catch(() => setRevisionPdi(null)); // 404 = la PDI aún no revisa
    preregistroService.listarDocumentos(t.idTramite)
      .then((d) => setDocumentos(Array.isArray(d) ? d : []))
      .catch(() => setDocumentos([]));
  };

  const cambiarEstado = async (idTramite, nuevoEstado) => {
    try {
      const actualizado = await preregistroService.actualizarEstado(idTramite, nuevoEstado);
      setTramites((prev) => prev.map((t) => (t.idTramite === idTramite ? actualizado : t)));
      if (detalle?.idTramite === idTramite) setDetalle(actualizado);
      notify("success", `Trámite ${idTramite} → ${labelEnum(nuevoEstado)}`);
    } catch (e) {
      // El candado PDI responde 409 con el motivo (ej: falta revisión PDI).
      notify("error", e.message);
    }
  };

  const subirDocumento = async () => {
    if (!archivo) return notify("error", "Selecciona un archivo (PDF o imagen).");
    setSubiendo(true);
    try {
      await preregistroService.subirDocumento(detalle.idTramite, archivo, tipoDoc);
      notify("success", "Documento subido. La PDI podrá revisarlo antes de tu viaje.");
      setArchivo(null);
      const d = await preregistroService.listarDocumentos(detalle.idTramite);
      setDocumentos(Array.isArray(d) ? d : []);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSubiendo(false);
    }
  };

  const pdiAprobado = revisionPdi?.resultado === "APROBADO";

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
                    <IconBtn bg="#eaf2fb" color="#185FA5" onClick={() => abrirDetalle(t)}><Eye size={13} /></IconBtn>
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

      {/* Detalle: datos + estado PDI + documentos + QR + gestión */}
      {detalle && (
        <Modal title="Detalle del trámite" onClose={() => setDetalle(null)} width={640}>
          <div style={{ background: "#f8fafd", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            {[
              ["Código", detalle.idTramite],
              ["Viajero", detalle.nombreCompleto],
              ["RUT", detalle.rutViajero],
              ["Nacionalidad", detalle.nacionalidad],
              ["Fecha ingreso", detalle.fechaIngreso],
              ["Motivo", labelEnum(detalle.motivoViaje)],
              ["Patente", detalle.patenteVehiculo || "Sin vehículo"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #e8ecf2" }}>
                <span style={{ fontSize: 13, color: "#9ab5cc" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#0c1f3f", fontWeight: 500, textAlign: "right" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 0" }}>
              <span style={{ fontSize: 13, color: "#9ab5cc" }}>Estado del trámite</span>
              <Badge estado={detalle.estado} />
            </div>
          </div>

          {/* Estado de la verificación PDI (visible para viajero y agente) */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 10, marginBottom: 14,
            background: pdiAprobado ? "#e1f5ee" : revisionPdi ? "#fcebeb" : "#faeeda",
            border: `1px solid ${pdiAprobado ? "#bfe6d6" : revisionPdi ? "#f3d4d4" : "#f0e0c0"}`,
          }}>
            <ShieldAlert size={17} color={pdiAprobado ? "#0F6E56" : revisionPdi ? "#A32D2D" : "#854F0B"} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: pdiAprobado ? "#0F6E56" : revisionPdi ? "#A32D2D" : "#854F0B" }}>
                Verificación PDI: {revisionPdi ? revisionPdi.resultado : "PENDIENTE"}
              </div>
              {revisionPdi ? (
                <div style={{ fontSize: 12.5, color: "#5a6278", marginTop: 4, lineHeight: 1.5 }}>
                  Antecedentes penales: <b>{labelEnum(revisionPdi.antecedentesPenales)}</b> ·
                  Vehículo/carga: <b>{labelEnum(revisionPdi.revisionVehiculo)}</b>
                  {revisionPdi.observaciones && <div style={{ marginTop: 3 }}>Indicaciones PDI: {revisionPdi.observaciones}</div>}
                  <div style={{ fontSize: 11.5, color: "#9ab5cc", marginTop: 3 }}>Oficial {revisionPdi.rutPdi} · {fmtFecha(revisionPdi.fechaRevision)}</div>
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: "#5a6278", marginTop: 4 }}>
                  {esViajero
                    ? "La PDI aún no revisa tu trámite. Sube tus documentos para agilizar la verificación."
                    : "La PDI aún no verifica este trámite: no se puede aprobar hasta que lo haga."}
                </div>
              )}
            </div>
          </div>

          {/* Documentos del trámite */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0c1f3f", marginBottom: 8 }}>
              Documentos ({documentos.length})
            </div>
            {documentos.map((d) => (
              <a key={d.id} href={preregistroService.urlDocumento(d.id)} target="_blank" rel="noreferrer"
                 style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", background: "#f8fafd", borderRadius: 8, marginBottom: 6, textDecoration: "none" }}>
                <FileText size={15} color="#185FA5" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{labelEnum(d.tipoDocumento)}</div>
                  <div style={{ fontSize: 11.5, color: "#9ab5cc" }}>{d.nombreArchivo} · {(d.tamano / 1024).toFixed(0)} KB</div>
                </div>
                <span style={{ fontSize: 11.5, color: "#185FA5" }}>Ver ↗</span>
              </a>
            ))}
            {documentos.length === 0 && (
              <div style={{ fontSize: 12.5, color: "#9ab5cc", background: "#f8fafd", borderRadius: 8, padding: 10 }}>
                Sin documentos adjuntos todavía.
              </div>
            )}

            {/* El viajero sube documentos desde su casa */}
            {esViajero && (
              <div style={{ border: "1px dashed #c9d6e6", borderRadius: 10, padding: 12, marginTop: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#185FA5", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Upload size={14} /> Subir documento (desde tu casa, sin ir a la frontera)
                </div>
                <Input label="Tipo de documento" value={tipoDoc} onChange={setTipoDoc} options={TIPOS_DOCUMENTO} required />
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  style={{ fontSize: 12.5, marginBottom: 10, display: "block" }}
                />
                <PrimaryButton onClick={subirDocumento} disabled={subiendo || !archivo} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}>
                  {subiendo ? <Spinner size={14} color="#fff" /> : <Upload size={14} />} Subir (PDF o imagen, máx 5MB)
                </PrimaryButton>
              </div>
            )}
          </div>

          {/* QR */}
          <div style={{ textAlign: "center", padding: "16px 0", background: "#fff", border: "1px solid #e8ecf2", borderRadius: 10, marginBottom: 14 }}>
            <QRCode value={detalle.codigoQr || detalle.idTramite} size={130} level="M" />
            <div style={{ fontSize: 12, color: "#9ab5cc", marginTop: 8 }}>Presentar en el control de identidad</div>
          </div>

          {/* Gestión del agente: aprobar solo si la PDI aprobó */}
          {esFuncionario && (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
              {!pdiAprobado && (
                <span style={{ fontSize: 12, color: "#854F0B", marginRight: "auto" }}>
                  ⚠ Aprobar requiere verificación PDI aprobada.
                </span>
              )}
              <SecondaryButton onClick={() => cambiarEstado(detalle.idTramite, "EN_REVISION")}>En revisión</SecondaryButton>
              <button onClick={() => cambiarEstado(detalle.idTramite, "RECHAZADO")} style={{ background: "#fcebeb", color: "#A32D2D", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Rechazar</button>
              <PrimaryButton onClick={() => cambiarEstado(detalle.idTramite, "APROBADO")} disabled={!pdiAprobado}>
                Aprobar
              </PrimaryButton>
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

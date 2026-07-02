import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Eye, FileText, Upload, ShieldAlert, RefreshCw, Paperclip } from "lucide-react";
import QRCode from "react-qr-code";
import { preregistroService } from "../services/preregistroService";
import { validacionService } from "../services/validacionService";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner, { CenteredLoader } from "../components/ui/Spinner";
import { fmtFecha, labelEnum, TIPOS_DOCUMENTO } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// ============================================================
// Control de viajeros / Mis trámites
// ------------------------------------------------------------
// AGENTE (FUNCIONARIO/SUPERVISOR): tablero EN VIVO. No busca a
// ciegas: la lista de viajeros se carga sola y se refresca cada
// 15 s, mostrando la verificación PDI y los documentos de cada
// uno. El agente solo corrobora (aprueba/rechaza).
//
// VIAJERO: ve sus propios trámites automáticamente, sube sus
// documentos desde casa y sigue el avance de la PDI.
// ============================================================

const REFRESCO_MS = 15000;

const TABS = [
  { key: "PENDIENTES", label: "Pendientes" },
  { key: "APROBADO", label: "Aprobados" },
  { key: "RECHAZADO", label: "Rechazados" },
  { key: "TODOS", label: "Todos" },
];

export default function Tramites({ notify }) {
  const { user } = useAuth();
  const esFuncionario = user?.rol === "FUNCIONARIO" || user?.rol === "SUPERVISOR";
  const esViajero = user?.rol === "VIAJERO";

  const [tramites, setTramites] = useState([]);
  const [pdiMap, setPdiMap] = useState({});    // idTramite -> RevisionPdi
  const [docsMap, setDocsMap] = useState({});  // idTramite -> cantidad
  const [loading, setLoading] = useState(true);
  const [ultimaCarga, setUltimaCarga] = useState(null);
  const [tab, setTab] = useState("PENDIENTES");
  const [busqueda, setBusqueda] = useState("");

  // Detalle
  const [detalle, setDetalle] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [tipoDoc, setTipoDoc] = useState("ANTECEDENTES_PENALES");
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargandoRef = useRef(false);

  // Carga todo: trámites + revisiones PDI + conteo de documentos.
  // 'silencioso' evita el spinner en los refrescos automáticos.
  const cargar = async (silencioso = false) => {
    if (cargandoRef.current) return;
    cargandoRef.current = true;
    if (!silencioso) setLoading(true);
    try {
      const [lista, hist, conteos] = await Promise.all([
        esViajero ? preregistroService.porViajero(user.rut) : preregistroService.todos(),
        validacionService.pdiHistorial().catch(() => []),
        preregistroService.documentosConteo().catch(() => []),
      ]);
      setTramites(Array.isArray(lista) ? lista : []);
      const pm = {};
      (hist || []).forEach((r) => { pm[r.idTramite] = r; });
      setPdiMap(pm);
      const dm = {};
      (conteos || []).forEach((c) => { dm[c.idTramite] = c.cantidad; });
      setDocsMap(dm);
      setUltimaCarga(new Date());
    } catch (e) {
      if (!silencioso) notify("error", e.message);
    } finally {
      cargandoRef.current = false;
      setLoading(false);
    }
  };

  // Carga inicial + refresco automático para el tablero del agente.
  useEffect(() => {
    cargar();
    if (!esFuncionario) return;
    const t = setInterval(() => cargar(true), REFRESCO_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);

  const abrirDetalle = async (t) => {
    setDetalle(t);
    setArchivo(null);
    setDocumentos([]);
    try {
      const d = await preregistroService.listarDocumentos(t.idTramite);
      setDocumentos(Array.isArray(d) ? d : []);
    } catch {
      setDocumentos([]);
    }
  };

  const cambiarEstado = async (idTramite, nuevoEstado) => {
    try {
      const actualizado = await preregistroService.actualizarEstado(idTramite, nuevoEstado);
      setTramites((prev) => prev.map((t) => (t.idTramite === idTramite ? actualizado : t)));
      if (detalle?.idTramite === idTramite) setDetalle(actualizado);
      notify("success", `Trámite ${idTramite} → ${labelEnum(nuevoEstado)}`);
    } catch (e) {
      notify("error", e.message); // candado PDI: 409 con el motivo
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
      cargar(true);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSubiendo(false);
    }
  };

  // Filtro por pestaña + búsqueda local (nombre, RUT o código).
  const visibles = tramites.filter((t) => {
    const porTab =
      tab === "TODOS" ? true :
      tab === "PENDIENTES" ? (t.estado === "PRE_REGISTRADO" || t.estado === "EN_REVISION") :
      t.estado === tab;
    if (!porTab) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      (t.nombreCompleto || "").toLowerCase().includes(q) ||
      (t.rutViajero || "").toLowerCase().includes(q) ||
      (t.idTramite || "").toLowerCase().includes(q)
    );
  });

  const revisionDetalle = detalle ? pdiMap[detalle.idTramite] : null;
  const pdiAprobado = revisionDetalle?.resultado === "APROBADO";

  if (loading) return <CenteredLoader label={esViajero ? "Cargando tus trámites..." : "Cargando viajeros..."} />;

  return (
    <div style={{ padding: 28 }}>
      {/* Barra superior: pestañas (agente) + búsqueda + refresco */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {esFuncionario ? (
          <div style={{ display: "flex", gap: 8 }}>
            {TABS.map((t) => {
              const activo = tab === t.key;
              const cuenta = t.key === "TODOS" ? tramites.length
                : t.key === "PENDIENTES" ? tramites.filter((x) => x.estado === "PRE_REGISTRADO" || x.estado === "EN_REVISION").length
                : tramites.filter((x) => x.estado === t.key).length;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600,
                    border: "1px solid " + (activo ? "#185FA5" : "#e2e7f0"),
                    background: activo ? "#185FA5" : "#fff",
                    color: activo ? "#fff" : "#6b7c93",
                  }}>
                  {t.label} ({cuenta})
                </button>
              );
            })}
          </div>
        ) : (
          <h2 style={{ margin: 0, color: "#0c1f3f", fontSize: 17, fontWeight: 800 }}>Mis trámites</h2>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {esFuncionario && (
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por nombre, RUT o código..."
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d0d5e0", fontSize: 13, width: 240 }}
            />
          )}
          <button onClick={() => cargar()} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e7f0", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: "#185FA5", cursor: "pointer" }}>
            <RefreshCw size={13} /> Actualizar
          </button>
        </div>
      </div>

      {esFuncionario && (
        <div style={{ fontSize: 11.5, color: "#9ab5cc", marginBottom: 10 }}>
          ⟳ El tablero se actualiza solo cada 15 s
          {ultimaCarga && ` · última actualización ${ultimaCarga.toLocaleTimeString("es-CL")}`}
        </div>
      )}

      {/* Tablero */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafd" }}>
            <tr>
              {["Código", "Viajero", "RUT", "Ingreso", "Docs", "Verificación PDI", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 12, color: "#9ab5cc", fontWeight: 700, borderBottom: "1px solid #e8ecf2" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((t) => {
              const rev = pdiMap[t.idTramite];
              const docs = docsMap[t.idTramite] || 0;
              const puedeAprobar = rev?.resultado === "APROBADO" && t.estado !== "APROBADO";
              return (
                <tr key={t.idTramite} style={{ borderBottom: "1px solid #f4f6fa" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{t.idTramite}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#0c1f3f", fontWeight: 500 }}>{t.nombreCompleto}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.rutViajero}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.fechaIngreso}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: docs > 0 ? "#185FA5" : "#c2cddb" }}>
                      <Paperclip size={13} /> {docs}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}><Badge estado={rev ? rev.resultado : "PENDIENTE"} /></td>
                  <td style={{ padding: "12px 14px" }}><Badge estado={t.estado} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <IconBtn bg="#eaf2fb" color="#185FA5" title="Ver detalle" onClick={() => abrirDetalle(t)}><Eye size={13} /></IconBtn>
                      {esFuncionario && t.estado !== "APROBADO" && (
                        <IconBtn
                          bg={puedeAprobar ? "#e1f5ee" : "#f1f3f7"}
                          color={puedeAprobar ? "#0F6E56" : "#c2cddb"}
                          title={puedeAprobar ? "Aprobar (PDI verificado)" : "Bloqueado: requiere verificación PDI aprobada"}
                          onClick={() => puedeAprobar ? cambiarEstado(t.idTramite, "APROBADO") : notify("info", "Bloqueado: la PDI debe aprobar primero a este viajero.")}
                        >
                          <CheckCircle size={13} />
                        </IconBtn>
                      )}
                      {esFuncionario && t.estado !== "RECHAZADO" && (
                        <IconBtn bg="#fcebeb" color="#A32D2D" title="Rechazar" onClick={() => cambiarEstado(t.idTramite, "RECHAZADO")}><XCircle size={13} /></IconBtn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 28, textAlign: "center", fontSize: 13, color: "#9ab5cc" }}>
                  {esViajero
                    ? "Aún no tienes trámites. Crea tu prerregistro desde la pestaña Prerregistro."
                    : "No hay viajeros en esta categoría."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle */}
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

          {/* Verificación PDI */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 10, marginBottom: 14,
            background: pdiAprobado ? "#e1f5ee" : revisionDetalle ? "#fcebeb" : "#faeeda",
            border: `1px solid ${pdiAprobado ? "#bfe6d6" : revisionDetalle ? "#f3d4d4" : "#f0e0c0"}`,
          }}>
            <ShieldAlert size={17} color={pdiAprobado ? "#0F6E56" : revisionDetalle ? "#A32D2D" : "#854F0B"} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: pdiAprobado ? "#0F6E56" : revisionDetalle ? "#A32D2D" : "#854F0B" }}>
                Verificación PDI: {revisionDetalle ? revisionDetalle.resultado : "PENDIENTE"}
              </div>
              {revisionDetalle ? (
                <div style={{ fontSize: 12.5, color: "#5a6278", marginTop: 4, lineHeight: 1.5 }}>
                  Antecedentes penales: <b>{labelEnum(revisionDetalle.antecedentesPenales)}</b> ·
                  Vehículo/carga: <b>{labelEnum(revisionDetalle.revisionVehiculo)}</b>
                  {revisionDetalle.observaciones && <div style={{ marginTop: 3 }}>Indicaciones PDI: {revisionDetalle.observaciones}</div>}
                  <div style={{ fontSize: 11.5, color: "#9ab5cc", marginTop: 3 }}>Oficial {revisionDetalle.rutPdi} · {fmtFecha(revisionDetalle.fechaRevision)}</div>
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

          {/* Documentos */}
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
                  <div style={{ fontSize: 11.5, color: "#9ab5cc" }}>{d.nombreArchivo} · {(d.tamano / 1024).toFixed(0)} KB · {fmtFecha(d.fechaSubida)}</div>
                </div>
                <span style={{ fontSize: 11.5, color: "#185FA5" }}>Ver ↗</span>
              </a>
            ))}
            {documentos.length === 0 && (
              <div style={{ fontSize: 12.5, color: "#9ab5cc", background: "#f8fafd", borderRadius: 8, padding: 10 }}>
                {esViajero ? "Aún no subes documentos (ej: certificado de antecedentes penales)." : "El viajero no ha subido documentos."}
              </div>
            )}

            {/* Subida de documentos: el viajero, desde su casa */}
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

          {/* Acciones del agente */}
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

function IconBtn({ children, bg, color, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{ background: bg, color, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
      {children}
    </button>
  );
}

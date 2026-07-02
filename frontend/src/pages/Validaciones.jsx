import { useEffect, useRef, useState } from "react";
import { ShieldCheck, RefreshCw, ScanLine } from "lucide-react";
import { preregistroService } from "../services/preregistroService";
import { validacionService } from "../services/validacionService";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner, { CenteredLoader } from "../components/ui/Spinner";
import { fmtFecha, labelEnum } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// ============================================================
// Control de identidad (ventanilla de llegada)
// ------------------------------------------------------------
// El agente NO escribe nada a ciegas: ve la cola de viajeros
// por validar (se refresca sola). Al hacer clic en uno, los
// datos del prerregistro se cargan como si escaneara el QR;
// el agente solo los compara contra el documento físico y
// confirma. Si el documento no coincide, corrige los campos
// y el sistema lo rechaza automáticamente.
// ============================================================

const REFRESCO_MS = 15000;

export default function Validaciones({ notify }) {
  const { user } = useAuth();
  const [tramites, setTramites] = useState([]);
  const [pdiMap, setPdiMap] = useState({});        // idTramite -> RevisionPdi
  const [valMap, setValMap] = useState({});        // idTramite -> ResultadoValidacion
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("POR_VALIDAR");   // POR_VALIDAR | VALIDADOS
  const [ultimaCarga, setUltimaCarga] = useState(null);

  // Modal de validación
  const [sel, setSel] = useState(null);            // trámite seleccionado
  const [form, setForm] = useState(null);          // datos "del documento" (pre-cargados)
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cargandoRef = useRef(false);

  const cargar = async (silencioso = false) => {
    if (cargandoRef.current) return;
    cargandoRef.current = true;
    if (!silencioso) setLoading(true);
    try {
      const [lista, pdiHist, valHist, st] = await Promise.all([
        preregistroService.todos(),
        validacionService.pdiHistorial().catch(() => []),
        validacionService.historial().catch(() => []),
        validacionService.estadisticas().catch(() => null),
      ]);
      setTramites(Array.isArray(lista) ? lista : []);
      const pm = {};
      (pdiHist || []).forEach((r) => { pm[r.idTramite] = r; });
      setPdiMap(pm);
      const vm = {};
      (valHist || []).forEach((v) => { vm[v.idTramite] = v; });
      setValMap(vm);
      setStats(st);
      setUltimaCarga(new Date());
    } catch (e) {
      if (!silencioso) notify("error", e.message);
    } finally {
      cargandoRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    const t = setInterval(() => cargar(true), REFRESCO_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);

  // Al abrir un viajero, el formulario se pre-carga con los datos del
  // prerregistro: equivale a escanear su código QR en ventanilla.
  const abrirValidacion = (t) => {
    setSel(t);
    setResultado(null);
    setForm({
      rutDocumento: t.rutViajero,
      nombreDocumento: t.nombreCompleto,
      nacionalidad: t.nacionalidad,
      fechaNacimiento: "",
    });
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validar = async () => {
    setValidando(true); setResultado(null);
    try {
      const res = await validacionService.validar({
        idTramite: sel.idTramite,
        rutDocumento: form.rutDocumento.trim(),
        nombreDocumento: form.nombreDocumento.trim(),
        nacionalidad: form.nacionalidad,
        fechaNacimiento: form.fechaNacimiento.trim() || null,
        rutFuncionario: user?.rut || "FUNCIONARIO",
      });
      setResultado(res);
      notify(res.puedeAvanzar ? "success" : "error",
        res.mensaje || (res.puedeAvanzar ? "Identidad validada" : "Identidad rechazada"));
      cargar(true);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setValidando(false);
    }
  };

  if (loading) return <CenteredLoader label="Cargando cola de validación..." />;

  const porValidar = tramites.filter((t) => !valMap[t.idTramite] && t.estado !== "RECHAZADO" && t.estado !== "EXPIRADO");
  const validados = tramites.filter((t) => valMap[t.idTramite]);
  const visibles = tab === "POR_VALIDAR" ? porValidar : validados;

  const kpis = stats ? [
    { label: "Validaciones totales", value: stats.totalValidaciones, col: "#185FA5" },
    { label: "Aprobadas", value: stats.aprobadas, col: "#1D9E75" },
    { label: "Rechazadas", value: stats.rechazadas, col: "#E24B4A" },
    { label: "En cola", value: porValidar.length, col: "#D97706" },
  ] : [];

  return (
    <div style={{ padding: 28 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.col }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Pestañas + refresco */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["POR_VALIDAR", `Por validar (${porValidar.length})`], ["VALIDADOS", `Validados (${validados.length})`]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600,
                border: "1px solid " + (tab === k ? "#185FA5" : "#e2e7f0"),
                background: tab === k ? "#185FA5" : "#fff",
                color: tab === k ? "#fff" : "#6b7c93",
              }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => cargar()} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e7f0", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: "#185FA5", cursor: "pointer" }}>
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: "#9ab5cc", marginBottom: 10 }}>
        ⟳ La cola se actualiza sola cada 15 s{ultimaCarga && ` · última actualización ${ultimaCarga.toLocaleTimeString("es-CL")}`}
      </div>

      {/* Cola */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafd" }}>
            <tr>
              {(tab === "POR_VALIDAR"
                ? ["Código", "Viajero", "RUT", "Ingreso", "Verificación PDI", "Acción"]
                : ["Código", "Viajero", "RUT", "Resultado identidad", "Motivo", "Fecha", "Funcionario"]
              ).map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 12, color: "#9ab5cc", fontWeight: 700, borderBottom: "1px solid #e8ecf2" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tab === "POR_VALIDAR" && visibles.map((t) => {
              const rev = pdiMap[t.idTramite];
              return (
                <tr key={t.idTramite} style={{ borderBottom: "1px solid #f4f6fa" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{t.idTramite}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#0c1f3f", fontWeight: 500 }}>{t.nombreCompleto}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.rutViajero}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.fechaIngreso}</td>
                  <td style={{ padding: "12px 14px" }}><Badge estado={rev ? rev.resultado : "PENDIENTE"} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => abrirValidacion(t)}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "#eaf2fb", color: "#185FA5", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
                      <ScanLine size={13} /> Validar identidad
                    </button>
                  </td>
                </tr>
              );
            })}
            {tab === "VALIDADOS" && visibles.map((t) => {
              const v = valMap[t.idTramite];
              return (
                <tr key={t.idTramite} style={{ borderBottom: "1px solid #f4f6fa" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{t.idTramite}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#0c1f3f" }}>{v.nombreDocumento}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{v.rutDocumento}</td>
                  <td style={{ padding: "12px 14px" }}><Badge estado={v.resultado} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 12.5, color: v.motivoRechazo ? "#A32D2D" : "#9ab5cc" }}>{v.motivoRechazo || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7c93" }}>{fmtFecha(v.fechaValidacion)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#6b7c93" }}>{v.rutFuncionario}</td>
                </tr>
              );
            })}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 28, textAlign: "center", fontSize: 13, color: "#9ab5cc" }}>
                  {tab === "POR_VALIDAR" ? "No hay viajeros esperando validación de identidad." : "Aún no hay identidades validadas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: comparar QR (prerregistro) vs documento físico */}
      {sel && form && (
        <Modal title={`Control de identidad · ${sel.idTramite}`} onClose={() => setSel(null)} width={620}>

          {/* Lo que dice el prerregistro (equivale al QR escaneado) */}
          <div style={{ background: "#eaf2fb", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <ScanLine size={15} color="#185FA5" />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#185FA5" }}>Datos del prerregistro (QR escaneado)</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 12.5, color: "#0c1f3f" }}>
              <span>Viajero: <b>{sel.nombreCompleto}</b></span>
              <span>RUT: <b>{sel.rutViajero}</b></span>
              <span>Nacionalidad: <b>{sel.nacionalidad}</b></span>
              <span>Motivo: <b>{labelEnum(sel.motivoViaje)}</b></span>
            </div>
          </div>

          {/* Estado PDI como contexto */}
          {(() => {
            const rev = pdiMap[sel.idTramite];
            return (
              <div style={{ fontSize: 12.5, marginBottom: 14, padding: "9px 12px", borderRadius: 8, background: rev?.resultado === "APROBADO" ? "#e1f5ee" : rev ? "#fcebeb" : "#faeeda", color: rev?.resultado === "APROBADO" ? "#0F6E56" : rev ? "#A32D2D" : "#854F0B" }}>
                Verificación PDI: <b>{rev ? rev.resultado : "PENDIENTE"}</b>
                {rev?.observaciones && <span> · {rev.observaciones}</span>}
              </div>
            );
          })()}

          {/* Lo que el agente ve en el documento físico (editable si difiere) */}
          <div style={{ fontSize: 12.5, color: "#6b7c93", marginBottom: 10, lineHeight: 1.5 }}>
            Compara con el <b>documento físico</b> del viajero. Los campos ya vienen
            cargados desde el prerregistro: <b>solo corrígelos si el carnet dice algo
            distinto</b> (el sistema detectará la inconsistencia y rechazará).
          </div>
          <Input label="RUT según documento" value={form.rutDocumento} onChange={(v) => setF("rutDocumento", v)} required />
          <Input label="Nombre según documento" value={form.nombreDocumento} onChange={(v) => setF("nombreDocumento", v)} required />
          <Input label="Nacionalidad según documento" value={form.nacionalidad} onChange={(v) => setF("nacionalidad", v)} options={["Chilena", "Argentina", "Peruana", "Boliviana", "Colombiana", "Brasileña", "Otra"]} required />
          <Input label="Fecha de nacimiento (opcional)" value={form.fechaNacimiento} onChange={(v) => setF("fechaNacimiento", v)} placeholder="21/05/1988" />

          {resultado && (
            <div style={{ marginBottom: 14, padding: 14, borderRadius: 10, background: resultado.puedeAvanzar ? "#e1f5ee" : "#fcebeb", border: `1px solid ${resultado.puedeAvanzar ? "#bfe6d6" : "#f3d4d4"}` }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: resultado.puedeAvanzar ? "#0F6E56" : "#A32D2D" }}>
                {resultado.puedeAvanzar ? "✓ " : "✕ "}{resultado.resultado}
              </div>
              <div style={{ fontSize: 12.5, color: "#5a6278", marginTop: 5, lineHeight: 1.45 }}>{resultado.mensaje}</div>
              {resultado.motivoRechazo && <div style={{ fontSize: 12.5, color: "#A32D2D", marginTop: 3 }}>Motivo: {resultado.motivoRechazo}</div>}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <SecondaryButton onClick={() => setSel(null)}>{resultado ? "Cerrar" : "Cancelar"}</SecondaryButton>
            {!resultado?.puedeAvanzar && (
              <PrimaryButton onClick={validar} disabled={validando} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {validando ? <Spinner size={15} color="#fff" /> : <ShieldCheck size={15} />} Validar identidad
              </PrimaryButton>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

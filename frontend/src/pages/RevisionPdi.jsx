import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, FileText, Search } from "lucide-react";
import { preregistroService } from "../services/preregistroService";
import { validacionService } from "../services/validacionService";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner, { CenteredLoader } from "../components/ui/Spinner";
import { fmtFecha, labelEnum } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// Panel de la Policía de Investigaciones (PDI).
// La PDI revisa a cada viajero ANTES del control del agente: antecedentes
// penales, carga del vehículo y observaciones. Solo con la aprobación PDI
// el agente aduanero puede aprobar el trámite.
export default function RevisionPdi({ notify }) {
  const { user } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [revisiones, setRevisiones] = useState({}); // idTramite -> RevisionPdi
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);      // trámite en revisión
  const [documentos, setDocumentos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    antecedentesPenales: "APROBADO",
    revisionVehiculo: "APROBADO",
    observaciones: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Trae los trámites que esperan verificación + el estado PDI de cada uno.
  const cargar = async () => {
    setLoading(true);
    try {
      const [pre, rev, hist, st] = await Promise.all([
        preregistroService.porEstado("PRE_REGISTRADO"),
        preregistroService.porEstado("EN_REVISION"),
        validacionService.pdiHistorial().catch(() => []),
        validacionService.pdiEstadisticas().catch(() => null),
      ]);
      const lista = [...(pre || []), ...(rev || [])];
      setPendientes(lista);
      const mapa = {};
      (hist || []).forEach((r) => { mapa[r.idTramite] = r; });
      setRevisiones(mapa);
      setStats(st);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  const abrirRevision = async (tramite) => {
    setDetalle(tramite);
    setDocumentos([]);
    const previa = revisiones[tramite.idTramite];
    setForm({
      antecedentesPenales: previa?.antecedentesPenales || "APROBADO",
      revisionVehiculo: previa?.revisionVehiculo || (tramite.patenteVehiculo ? "APROBADO" : "NO_APLICA"),
      observaciones: previa?.observaciones || "",
    });
    try {
      const docs = await preregistroService.listarDocumentos(tramite.idTramite);
      setDocumentos(Array.isArray(docs) ? docs : []);
    } catch {
      setDocumentos([]);
    }
  };

  const guardarRevision = async () => {
    setGuardando(true);
    try {
      const res = await validacionService.pdiRegistrar({
        idTramite: detalle.idTramite,
        rutViajero: detalle.rutViajero,
        antecedentesPenales: form.antecedentesPenales,
        revisionVehiculo: form.revisionVehiculo,
        observaciones: form.observaciones.trim() || null,
        rutPdi: user?.rut || "PDI",
      });
      notify(res.resultado === "APROBADO" ? "success" : "info",
        `Revisión PDI del trámite ${detalle.idTramite}: ${res.resultado}. El agente ya puede ver el resultado.`);
      setDetalle(null);
      cargar();
    } catch (e) {
      notify("error", e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <CenteredLoader label="Cargando trámites por verificar..." />;

  const kpis = stats ? [
    { label: "Revisiones totales", value: stats.totalRevisiones, col: "#185FA5" },
    { label: "Aprobadas", value: stats.aprobadas, col: "#1D9E75" },
    { label: "Rechazadas", value: stats.rechazadas, col: "#E24B4A" },
    { label: "En espera", value: pendientes.filter((t) => !revisiones[t.idTramite]).length, col: "#D97706" },
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

      {/* Lista de trabajo */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid #e8ecf2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ShieldAlert size={17} color="#185FA5" />
            <span style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14 }}>Trámites por verificar</span>
          </div>
          <button onClick={cargar} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#185FA5", fontSize: 12.5, cursor: "pointer" }}>
            <RefreshCw size={13} /> Actualizar
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafd" }}>
            <tr>
              {["Código", "Viajero", "RUT", "Ingreso", "Patente", "Estado PDI", "Acción"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 12, color: "#9ab5cc", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pendientes.map((t) => {
              const rev = revisiones[t.idTramite];
              return (
                <tr key={t.idTramite} style={{ borderBottom: "1px solid #f4f6fa" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{t.idTramite}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#0c1f3f" }}>{t.nombreCompleto}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.rutViajero}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.fechaIngreso}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7c93" }}>{t.patenteVehiculo || "Sin vehículo"}</td>
                  <td style={{ padding: "12px 14px" }}><Badge estado={rev ? rev.resultado : "PENDIENTE"} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => abrirRevision(t)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#eaf2fb", color: "#185FA5", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
                      <Search size={13} /> {rev ? "Re-revisar" : "Revisar"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {pendientes.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 26, textAlign: "center", fontSize: 13, color: "#9ab5cc" }}>No hay trámites esperando verificación.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de revisión */}
      {detalle && (
        <Modal title={`Revisión PDI · ${detalle.idTramite}`} onClose={() => setDetalle(null)} width={640}>
          {/* Datos del viajero */}
          <div style={{ background: "#f8fafd", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            {[
              ["Viajero", detalle.nombreCompleto],
              ["RUT", detalle.rutViajero],
              ["Nacionalidad", detalle.nacionalidad],
              ["Fecha ingreso", detalle.fechaIngreso],
              ["Motivo", labelEnum(detalle.motivoViaje)],
              ["Patente", detalle.patenteVehiculo || "Sin vehículo"],
              ["Creado", fmtFecha(detalle.fechaCreacion)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e8ecf2", fontSize: 13 }}>
                <span style={{ color: "#9ab5cc" }}>{k}</span>
                <span style={{ color: "#0c1f3f", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Documentos subidos por el viajero */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0c1f3f", marginBottom: 8 }}>
              Documentos aportados por el viajero ({documentos.length})
            </div>
            {documentos.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#9ab5cc", background: "#f8fafd", borderRadius: 8, padding: 12 }}>
                El viajero aún no sube documentos (ej: certificado de antecedentes penales).
              </div>
            ) : (
              documentos.map((d) => (
                <a
                  key={d.id}
                  href={preregistroService.urlDocumento(d.id)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "#f8fafd", borderRadius: 8, marginBottom: 6, textDecoration: "none" }}
                >
                  <FileText size={15} color="#185FA5" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "#185FA5", fontWeight: 600 }}>{labelEnum(d.tipoDocumento)}</div>
                    <div style={{ fontSize: 11.5, color: "#9ab5cc" }}>{d.nombreArchivo} · {(d.tamano / 1024).toFixed(0)} KB · {fmtFecha(d.fechaSubida)}</div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "#185FA5" }}>Ver ↗</span>
                </a>
              ))
            )}
          </div>

          {/* Checklist PDI */}
          <div style={{ borderTop: "1px solid #e8ecf2", paddingTop: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0c1f3f", marginBottom: 10 }}>Verificación PDI</div>
            <Input
              label="Antecedentes penales"
              value={form.antecedentesPenales}
              onChange={(v) => set("antecedentesPenales", v)}
              options={[{ value: "APROBADO", label: "APROBADO — sin antecedentes" }, { value: "RECHAZADO", label: "RECHAZADO — presenta antecedentes" }]}
              required
            />
            <Input
              label="Revisión vehículo y carga"
              value={form.revisionVehiculo}
              onChange={(v) => set("revisionVehiculo", v)}
              options={[
                { value: "APROBADO", label: "APROBADO — carga en regla" },
                { value: "RECHAZADO", label: "RECHAZADO — carga con problemas" },
                { value: "NO_APLICA", label: "NO APLICA — cruza sin vehículo" },
              ]}
              required
            />
            <Input label="Observaciones / indicaciones para el agente" value={form.observaciones} onChange={(v) => set("observaciones", v)} textarea placeholder="Ej: Sin antecedentes. Vehículo revisado, carga declarada coincide." />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <SecondaryButton onClick={() => setDetalle(null)}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={guardarRevision} disabled={guardando} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {guardando ? <Spinner size={15} color="#fff" /> : null} Guardar revisión
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

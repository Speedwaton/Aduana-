import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { validacionService } from "../services/validacionService";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { PrimaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { fmtFecha } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// Control de identidad: cruza el documento escaneado contra el preregistro (QR).
export default function Validaciones({ notify }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [stats, setStats] = useState(null);
  const [historial, setHistorial] = useState([]);

  const [form, setForm] = useState({
    idTramite: "",
    rutDocumento: "",
    nombreDocumento: "",
    nacionalidad: "Chilena",
    fechaNacimiento: "",
    rutFuncionario: user?.rut || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const cargarAux = async () => {
    try {
      const [s, h] = await Promise.all([
        validacionService.estadisticas(),
        validacionService.historial(),
      ]);
      setStats(s);
      setHistorial(Array.isArray(h) ? h.slice().reverse() : []);
    } catch (e) {
      notify("error", "No se pudieron cargar estadísticas: " + e.message);
    }
  };

  useEffect(() => { cargarAux(); /* eslint-disable-next-line */ }, []);

  const validar = async () => {
    if (!form.idTramite || !form.rutDocumento || !form.nombreDocumento || !form.nacionalidad || !form.rutFuncionario)
      return notify("error", "Completa los campos obligatorios.");
    setLoading(true); setResultado(null);
    try {
      const res = await validacionService.validar(form);
      setResultado(res);
      notify(res.puedeAvanzar ? "success" : "error", res.mensaje || (res.puedeAvanzar ? "Validación aprobada" : "Validación rechazada"));
      cargarAux();
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const kpis = stats ? [
    { label: "Total", value: stats.totalValidaciones, col: "#185FA5" },
    { label: "Aprobadas", value: stats.aprobadas, col: "#1D9E75" },
    { label: "Rechazadas", value: stats.rechazadas, col: "#E24B4A" },
    { label: "Tasa éxito", value: stats.tasaExitoPorcentaje, col: "#185FA5" },
  ] : [];

  return (
    <div style={{ padding: 28 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.col }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
        {!stats && <div style={{ gridColumn: "1 / -1", fontSize: 13, color: "#9ab5cc" }}>Cargando estadísticas...</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 1fr) 1.3fr", gap: 22 }}>
        {/* Formulario de control */}
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#eaf2fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} color="#185FA5" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0c1f3f" }}>Control de identidad</div>
              <div style={{ fontSize: 12, color: "#9ab5cc" }}>Documento escaneado vs preregistro</div>
            </div>
          </div>

          <Input label="Código de trámite (QR)" value={form.idTramite} onChange={(v) => set("idTramite", v)} placeholder="QR-25-05-2025-4587" required />
          <Input label="RUT del documento" value={form.rutDocumento} onChange={(v) => set("rutDocumento", v)} placeholder="18.234.567-8" required />
          <Input label="Nombre del documento" value={form.nombreDocumento} onChange={(v) => set("nombreDocumento", v)} required />
          <Input label="Nacionalidad" value={form.nacionalidad} onChange={(v) => set("nacionalidad", v)} options={["Chilena", "Argentina", "Peruana", "Boliviana", "Colombiana", "Brasileña", "Otra"]} required />
          <Input label="Fecha de nacimiento" value={form.fechaNacimiento} onChange={(v) => set("fechaNacimiento", v)} placeholder="21/05/1988" />
          <Input label="RUT funcionario" value={form.rutFuncionario} onChange={(v) => set("rutFuncionario", v)} required />

          <PrimaryButton onClick={validar} disabled={loading} style={{ width: "100%", padding: "11px 0", marginTop: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {loading ? <Spinner size={16} color="#fff" /> : "Validar identidad"}
          </PrimaryButton>

          {resultado && (
            <div style={{ marginTop: 18, padding: 16, borderRadius: 10, background: resultado.puedeAvanzar ? "#e1f5ee" : "#fcebeb", border: `1px solid ${resultado.puedeAvanzar ? "#bfe6d6" : "#f3d4d4"}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: resultado.puedeAvanzar ? "#0F6E56" : "#A32D2D" }}>
                {resultado.puedeAvanzar ? "✓ " : "✕ "}{resultado.resultado}
              </div>
              <div style={{ fontSize: 12.5, color: "#5a6278", marginTop: 6, lineHeight: 1.45 }}>{resultado.mensaje}</div>
              {resultado.motivoRechazo && <div style={{ fontSize: 12.5, color: "#A32D2D", marginTop: 4 }}>Motivo: {resultado.motivoRechazo}</div>}
            </div>
          )}
        </div>

        {/* Historial */}
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid #e8ecf2" }}>
            <span style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14 }}>Historial de validaciones</span>
            <button onClick={cargarAux} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#185FA5", fontSize: 12.5, cursor: "pointer" }}>
              <RefreshCw size={13} /> Refrescar
            </button>
          </div>
          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafd", position: "sticky", top: 0 }}>
                <tr>
                  {["Trámite", "Documento", "Resultado", "Fecha"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11.5, color: "#9ab5cc", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f4f6fa" }}>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#185FA5", fontWeight: 600 }}>{v.idTramite}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12.5, color: "#0c1f3f" }}>{v.nombreDocumento}<div style={{ fontSize: 11, color: "#9ab5cc" }}>{v.rutDocumento}</div></td>
                    <td style={{ padding: "10px 14px" }}><Badge estado={v.resultado} /></td>
                    <td style={{ padding: "10px 14px", fontSize: 11.5, color: "#6b7c93" }}>{fmtFecha(v.fechaValidacion)}</td>
                  </tr>
                ))}
                {historial.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", fontSize: 13, color: "#9ab5cc" }}>Sin validaciones registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

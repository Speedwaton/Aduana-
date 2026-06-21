import { useState } from "react";
import { PackageSearch, History } from "lucide-react";
import { operacionesService } from "../services/operacionesService";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { TIPOS_VEHICULO, fmtFecha, labelEnum } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// Revisión aduanera completa de un vehículo + consulta de historial por patente.
export default function Operaciones({ notify }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loadingHist, setLoadingHist] = useState(false);

  const [form, setForm] = useState({
    patente: "",
    tipoVehiculo: "AUTO",
    rutConductor: "",
    rutFuncionario: user?.rut || "",
    observaciones: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const revisar = async () => {
    if (!form.patente || !form.rutFuncionario) return notify("error", "Patente y RUT funcionario son obligatorios.");
    setLoading(true); setResultado(null);
    try {
      const res = await operacionesService.revisar(form);
      setResultado(res);
      notify(res.permisoParaCruzar ? "success" : "error", res.mensaje || res.controlAduanero);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const verHistorial = async () => {
    if (!form.patente) return notify("error", "Ingresa una patente para ver el historial.");
    setLoadingHist(true); setHistorial(null);
    try {
      const h = await operacionesService.historial(form.patente.trim());
      setHistorial(Array.isArray(h) ? h.slice().reverse() : []);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoadingHist(false);
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 1fr) 1.2fr", gap: 22 }}>
        {/* Formulario de revisión */}
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#eaf2fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PackageSearch size={18} color="#185FA5" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0c1f3f" }}>Revisión aduanera</div>
              <div style={{ fontSize: 12, color: "#9ab5cc" }}>Inspección de vehículo y carga</div>
            </div>
          </div>

          <Input label="Patente" value={form.patente} onChange={(v) => set("patente", v)} placeholder="BBCC12" required />
          <Input label="Tipo de vehículo" value={form.tipoVehiculo} onChange={(v) => set("tipoVehiculo", v)} options={TIPOS_VEHICULO} required />
          <Input label="RUT conductor" value={form.rutConductor} onChange={(v) => set("rutConductor", v)} placeholder="18.234.567-8" />
          <Input label="RUT funcionario" value={form.rutFuncionario} onChange={(v) => set("rutFuncionario", v)} required />
          <Input label="Observaciones" value={form.observaciones} onChange={(v) => set("observaciones", v)} textarea placeholder="Detalles de la inspección..." />

          <div style={{ display: "flex", gap: 10 }}>
            <PrimaryButton onClick={revisar} disabled={loading} style={{ flex: 1, padding: "11px 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              {loading ? <Spinner size={16} color="#fff" /> : "Revisar vehículo"}
            </PrimaryButton>
            <SecondaryButton onClick={verHistorial} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <History size={15} /> Historial
            </SecondaryButton>
          </div>

          {resultado && (
            <div style={{ marginTop: 18, padding: 16, borderRadius: 10, background: resultado.permisoParaCruzar ? "#e1f5ee" : "#fcebeb", border: `1px solid ${resultado.permisoParaCruzar ? "#bfe6d6" : "#f3d4d4"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: resultado.permisoParaCruzar ? "#0F6E56" : "#A32D2D" }}>
                  {resultado.permisoParaCruzar ? "✓ Cruce autorizado" : "✕ Vehículo retenido"}
                </span>
                <Badge estado={resultado.controlAduanero} />
              </div>
              <div style={{ fontSize: 12.5, color: "#5a6278", marginTop: 8, lineHeight: 1.45 }}>{resultado.mensaje}</div>
              {resultado.motivoDetencion && <div style={{ fontSize: 12.5, color: "#A32D2D", marginTop: 4 }}>Motivo: {resultado.motivoDetencion}</div>}
            </div>
          )}
        </div>

        {/* Historial por patente */}
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 22 }}>
          <span style={{ fontWeight: 700, color: "#0c1f3f", fontSize: 14 }}>Historial de revisiones {form.patente && `· ${form.patente}`}</span>

          {loadingHist ? (
            <div style={{ textAlign: "center", padding: 30 }}><Spinner size={26} /></div>
          ) : historial === null ? (
            <div style={{ textAlign: "center", padding: 40, fontSize: 13, color: "#9ab5cc" }}>
              Ingresa una patente y pulsa <b>Historial</b> para ver las revisiones previas.
            </div>
          ) : historial.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, fontSize: 13, color: "#9ab5cc" }}>Sin revisiones registradas para esta patente.</div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {historial.map((r) => (
                <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #f4f6fa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Badge estado={r.resultado} />
                    <span style={{ fontSize: 11.5, color: "#9ab5cc" }}>{fmtFecha(r.fechaRevision)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#6b7c93" }}>
                    {labelEnum(r.tipoVehiculo)} · Conductor: {r.rutConductor || "—"} · Func: {r.rutFuncionario}
                  </div>
                  {r.motivoDetencion && <div style={{ fontSize: 12, color: "#A32D2D", marginTop: 2 }}>Motivo: {r.motivoDetencion}</div>}
                  {r.observaciones && <div style={{ fontSize: 12, color: "#9ab5cc", marginTop: 2 }}>Obs: {r.observaciones}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import QRCode from "react-qr-code";
import { preregistroService } from "../services/preregistroService";
import Input from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { MOTIVOS_VIAJE, hoyISO, fmtFecha } from "../data/constants";
import { useAuth } from "../context/AuthContext";

// Crea un prerregistro real en ms-preregistro y muestra el código QR devuelto.
export default function Prerregistro({ notify }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    rutViajero: user?.rol === "VIAJERO" ? user.rut : "",
    nombreCompleto: user?.rol === "VIAJERO" ? user.nombreCompleto : "",
    nacionalidad: "Chilena",
    correoElectronico: "",
    fechaIngreso: manana,
    motivoViaje: "TURISMO",
    patenteVehiculo: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.rutViajero || !form.nombreCompleto || !form.correoElectronico || !form.fechaIngreso || !form.motivoViaje)
      return notify("error", "Completa los campos obligatorios.");
    if (form.fechaIngreso <= hoyISO())
      return notify("error", "La fecha de ingreso debe ser futura.");

    setLoading(true);
    try {
      const res = await preregistroService.crear({
        rutViajero: form.rutViajero.trim(),
        nombreCompleto: form.nombreCompleto.trim(),
        nacionalidad: form.nacionalidad,
        correoElectronico: form.correoElectronico.trim(),
        fechaIngreso: form.fechaIngreso,
        motivoViaje: form.motivoViaje,
        patenteVehiculo: form.patenteVehiculo.trim() || null,
      });
      setResultado(res);
      notify("success", "Prerregistro creado. Código QR generado.");
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const nuevo = () => setResultado(null);

  return (
    <div style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: resultado ? "1fr 1fr" : "1fr", gap: 22 }}>

        {/* Formulario */}
        <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 24 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0c1f3f" }}>Nuevo Prerregistro</h2>
          <p style={{ fontSize: 13, color: "#9ab5cc", margin: "0 0 20px" }}>Registra los datos del viajero antes de llegar a la frontera.</p>

          <Input label="RUT o Pasaporte" value={form.rutViajero} onChange={(v) => set("rutViajero", v)} placeholder="18.234.567-8" required />
          <Input label="Nombre completo" value={form.nombreCompleto} onChange={(v) => set("nombreCompleto", v)} required />
          <Input label="Nacionalidad" value={form.nacionalidad} onChange={(v) => set("nacionalidad", v)} options={["Chilena", "Argentina", "Peruana", "Boliviana", "Colombiana", "Brasileña", "Otra"]} required />
          <Input label="Correo electrónico" type="email" value={form.correoElectronico} onChange={(v) => set("correoElectronico", v)} required />
          <Input label="Fecha de ingreso (futura)" type="date" value={form.fechaIngreso} onChange={(v) => set("fechaIngreso", v)} required />
          <Input label="Motivo del viaje" value={form.motivoViaje} onChange={(v) => set("motivoViaje", v)} options={MOTIVOS_VIAJE} required />
          <Input label="Patente vehículo (opcional)" value={form.patenteVehiculo} onChange={(v) => set("patenteVehiculo", v)} placeholder="BBCC12" />

          <PrimaryButton onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "11px 0", marginTop: 6, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {loading ? <Spinner size={16} color="#fff" /> : "Generar prerregistro"}
          </PrimaryButton>
        </div>

        {/* Resultado con QR */}
        {resultado && (
          <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#e1f5ee", color: "#0F6E56", padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
              ✓ {resultado.estado || "PRE_REGISTRADO"}
            </div>

            <div style={{ display: "inline-block", padding: 14, background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12 }}>
              <QRCode value={resultado.codigoQr || resultado.idTramite || "QR"} size={168} level="M" />
            </div>

            <div style={{ fontSize: 13, color: "#9ab5cc", marginTop: 14 }}>Código del trámite</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#185FA5", marginTop: 2, letterSpacing: 0.5 }}>{resultado.idTramite}</div>

            <div style={{ background: "#f8fafd", borderRadius: 10, padding: 14, marginTop: 16, textAlign: "left" }}>
              <Row k="Viajero" v={resultado.nombreCompleto} />
              <Row k="Creado" v={fmtFecha(resultado.fechaCreacion)} />
              {resultado.mensaje && <div style={{ fontSize: 12.5, color: "#6b7c93", marginTop: 8, lineHeight: 1.4 }}>{resultado.mensaje}</div>}
            </div>

            <button onClick={nuevo} style={{ marginTop: 16, background: "#f4f6fa", border: "1px solid #e2e7f0", borderRadius: 8, padding: "9px 16px", fontSize: 13.5, cursor: "pointer", color: "#185FA5" }}>
              + Crear otro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
      <span style={{ color: "#9ab5cc" }}>{k}</span>
      <span style={{ color: "#0c1f3f", fontWeight: 500 }}>{v}</span>
    </div>
  );
}

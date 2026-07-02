import { useState } from "react";
import { Shield, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import Input from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { ROLES_INSTITUCIONALES } from "../data/constants";

// Pantalla de acceso contra ms-autenticacion.
// SEGURIDAD DEL REGISTRO:
//  - "Registrarse" es el registro PÚBLICO: crea SIEMPRE cuentas VIAJERO
//    (el rol ya no se elige desde el formulario).
//  - El personal (Agente aduanero, PDI, Supervisor) se registra en
//    "Acceso institucional" presentando el código secreto de su rol.
export default function Login() {
  const { login, registro } = useAuth();
  const [modo, setModo] = useState("login"); // "login" | "registro" | "institucional"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    rut: "", password: "", nombreCompleto: "", email: "",
    rol: "FUNCIONARIO", codigoInstitucional: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cambiarModo = (k) => { setModo(k); setError(""); setOk(""); };

  const handleLogin = async () => {
    setError(""); setOk("");
    if (!form.rut || !form.password) return setError("Ingresa RUT y contraseña.");
    setLoading(true);
    try {
      await login(form.rut.trim(), form.password);
    } catch (e) {
      setError(e.message || "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const validarBase = () => {
    if (!form.rut || !form.nombreCompleto || !form.email || !form.password)
      return "Completa todos los campos.";
    if (form.password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  // Registro público: SIEMPRE viajero (el backend también lo fuerza).
  const handleRegistro = async () => {
    setError(""); setOk("");
    const err = validarBase();
    if (err) return setError(err);
    setLoading(true);
    try {
      await registro({
        rut: form.rut.trim(),
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setOk("Cuenta de viajero creada con éxito. Ya puedes iniciar sesión.");
      cambiarModo("login");
      setForm((f) => ({ ...f, password: "" }));
    } catch (e) {
      setError(e.message || "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  // Registro institucional: requiere código secreto del rol.
  const handleInstitucional = async () => {
    setError(""); setOk("");
    const err = validarBase();
    if (err) return setError(err);
    if (!form.codigoInstitucional) return setError("Ingresa el código institucional.");
    setLoading(true);
    try {
      await authService.registroInstitucional({
        rut: form.rut.trim(),
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
        codigoInstitucional: form.codigoInstitucional.trim(),
      });
      setOk(`Cuenta ${form.rol} creada con éxito. Ya puedes iniciar sesión.`);
      cambiarModo("login");
      setForm((f) => ({ ...f, password: "", codigoInstitucional: "" }));
    } catch (e) {
      setError(e.message || "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  const esRegistro = modo === "registro" || modo === "institucional";
  const accion = modo === "login" ? handleLogin : modo === "registro" ? handleRegistro : handleInstitucional;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0c1f3f 0%, #123a6b 100%)", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "36px 38px", width: "100%", maxWidth: 430, boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>

        {/* Marca */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 54, height: 54, background: "linear-gradient(135deg, #185FA5, #1a7fd4)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(24,95,165,0.45)" }}>
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 18, color: "#0c1f3f", marginTop: 14, fontWeight: 800 }}>Frontera Inteligente</h1>
          <p style={{ fontSize: 12.5, color: "#9ab5cc", marginTop: 3 }}>Paso Los Libertadores · Aduana</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f4f6fa", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {[["login", "Iniciar sesión"], ["registro", "Soy viajero"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => cambiarModo(k)}
              style={{
                flex: 1, padding: "9px 0", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                background: modo === k ? "#fff" : "transparent",
                color: modo === k ? "#185FA5" : "#9ab5cc",
                boxShadow: modo === k ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {modo === "registro" && (
          <div style={{ background: "#eaf2fb", color: "#185FA5", fontSize: 12.5, padding: "9px 12px", borderRadius: 8, marginBottom: 16, lineHeight: 1.45 }}>
            Registro de <b>viajeros</b>. Realiza tu prerregistro y sube tus documentos
            desde casa, sin filas en la frontera.
          </div>
        )}

        {modo === "institucional" && (
          <div style={{ background: "#faeeda", color: "#854F0B", fontSize: 12.5, padding: "9px 12px", borderRadius: 8, marginBottom: 16, lineHeight: 1.45 }}>
            Registro de <b>personal institucional</b> (Agente aduanero, PDI o Supervisor).
            Necesitas el código entregado por tu institución.
          </div>
        )}

        {esRegistro && (
          <>
            <Input label="Nombre completo" value={form.nombreCompleto} onChange={(v) => set("nombreCompleto", v)} required />
            <Input label="Correo electrónico" type="email" value={form.email} onChange={(v) => set("email", v)} required />
          </>
        )}

        <Input label="RUT o Pasaporte" value={form.rut} onChange={(v) => set("rut", v)} placeholder="12.345.678-9" required />
        <Input label="Contraseña" type="password" value={form.password} onChange={(v) => set("password", v)} required />

        {modo === "institucional" && (
          <>
            <Input
              label="Rol institucional"
              value={form.rol}
              onChange={(v) => set("rol", v)}
              options={ROLES_INSTITUCIONALES.map((r) => ({
                value: r,
                label: r === "FUNCIONARIO" ? "FUNCIONARIO (Agente aduanero)" : r === "PDI" ? "PDI (Policía de Investigaciones)" : r,
              }))}
              required
            />
            <Input label="Código institucional" type="password" value={form.codigoInstitucional} onChange={(v) => set("codigoInstitucional", v)} placeholder="Código entregado por tu institución" required />
          </>
        )}

        {error && <div style={{ background: "#fcebeb", color: "#A32D2D", fontSize: 13, padding: "9px 12px", borderRadius: 8, marginBottom: 14 }}>{error}</div>}
        {ok && <div style={{ background: "#e1f5ee", color: "#0F6E56", fontSize: 13, padding: "9px 12px", borderRadius: 8, marginBottom: 14 }}>{ok}</div>}

        <PrimaryButton
          onClick={accion}
          disabled={loading}
          style={{ width: "100%", padding: "11px 0", marginTop: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
        >
          {loading ? <Spinner size={16} color="#fff" />
            : modo === "login" ? "Entrar"
            : modo === "registro" ? "Crear cuenta de viajero"
            : "Crear cuenta institucional"}
        </PrimaryButton>

        {/* Acceso discreto para personal */}
        <button
          onClick={() => cambiarModo(modo === "institucional" ? "login" : "institucional")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 14, background: "none", border: "none", color: "#9ab5cc", fontSize: 12, cursor: "pointer" }}
        >
          <Building2 size={13} />
          {modo === "institucional" ? "Volver al acceso normal" : "Acceso institucional (personal autorizado)"}
        </button>

        <p style={{ fontSize: 11, color: "#bcc7d6", textAlign: "center", marginTop: 12 }}>
          Conectado al API Gateway · localhost:8080
        </p>
      </div>
    </div>
  );
}

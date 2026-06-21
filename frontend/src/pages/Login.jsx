import { useState } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/Buttons";
import Spinner from "../components/ui/Spinner";
import { ROLES } from "../data/constants";

// Pantalla de acceso: login y registro de usuarios contra ms-autenticacion.
export default function Login() {
  const { login, registro } = useAuth();
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    rut: "", password: "", nombreCompleto: "", email: "", rol: "VIAJERO",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setError(""); setOk("");
    if (!form.rut || !form.password) return setError("Ingresa RUT y contraseña.");
    setLoading(true);
    try {
      await login(form.rut.trim(), form.password);
      // Al setear el usuario, App re-renderiza y muestra el panel.
    } catch (e) {
      setError(e.message || "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    setError(""); setOk("");
    if (!form.rut || !form.nombreCompleto || !form.email || !form.password || !form.rol)
      return setError("Completa todos los campos.");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setLoading(true);
    try {
      await registro({
        rut: form.rut.trim(),
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
      });
      setOk("Usuario registrado con éxito. Ya puedes iniciar sesión.");
      setModo("login");
      setForm((f) => ({ ...f, password: "", nombreCompleto: "", email: "" }));
    } catch (e) {
      setError(e.message || "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0c1f3f 0%, #123a6b 100%)", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "36px 38px", width: "100%", maxWidth: 420, boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>

        {/* Marca */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
          <div style={{ width: 54, height: 54, background: "linear-gradient(135deg, #185FA5, #1a7fd4)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(24,95,165,0.45)" }}>
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 18, color: "#0c1f3f", marginTop: 14, fontWeight: 800 }}>Frontera Inteligente</h1>
          <p style={{ fontSize: 12.5, color: "#9ab5cc", marginTop: 3 }}>Paso Los Libertadores · Aduana</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f4f6fa", borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {[["login", "Iniciar sesión"], ["registro", "Registrarse"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => { setModo(k); setError(""); setOk(""); }}
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
          <>
            <Input label="Nombre completo" value={form.nombreCompleto} onChange={(v) => set("nombreCompleto", v)} required />
            <Input label="Correo electrónico" type="email" value={form.email} onChange={(v) => set("email", v)} required />
          </>
        )}

        <Input label="RUT o Pasaporte" value={form.rut} onChange={(v) => set("rut", v)} placeholder="12.345.678-9" required />
        <Input label="Contraseña" type="password" value={form.password} onChange={(v) => set("password", v)} required />

        {modo === "registro" && (
          <Input label="Rol" value={form.rol} onChange={(v) => set("rol", v)} options={ROLES} required />
        )}

        {error && <div style={{ background: "#fcebeb", color: "#A32D2D", fontSize: 13, padding: "9px 12px", borderRadius: 8, marginBottom: 14 }}>{error}</div>}
        {ok && <div style={{ background: "#e1f5ee", color: "#0F6E56", fontSize: 13, padding: "9px 12px", borderRadius: 8, marginBottom: 14 }}>{ok}</div>}

        <PrimaryButton
          onClick={modo === "login" ? handleLogin : handleRegistro}
          disabled={loading}
          style={{ width: "100%", padding: "11px 0", marginTop: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
        >
          {loading ? <Spinner size={16} color="#fff" /> : modo === "login" ? "Entrar" : "Crear cuenta"}
        </PrimaryButton>

        <p style={{ fontSize: 11, color: "#bcc7d6", textAlign: "center", marginTop: 18 }}>
          Conectado al API Gateway · localhost:8080
        </p>
      </div>
    </div>
  );
}

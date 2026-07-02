import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Toast from "./components/ui/Toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Prerregistro from "./pages/Prerregistro";
import Tramites from "./pages/Tramites";
import Validaciones from "./pages/Validaciones";
import FilaVirtual from "./pages/FilaVirtual";
import Operaciones from "./pages/Operaciones";
import MiTurno from "./pages/MiTurno";
import Reportes from "./pages/Reportes";
import EstadoSistema from "./pages/EstadoSistema";
import RevisionPdi from "./pages/RevisionPdi";
import { NAV_ITEMS } from "./data/constants";

// Página por defecto según el rol al iniciar sesión.
// El agente aterriza directo en su tablero de control de viajeros.
const DEFAULT_PAGE = {
  VIAJERO: "prerregistro",
  FUNCIONARIO: "tramites",
  PDI: "pdi",
  SUPERVISOR: "dashboard",
};

// Mapa clave de navegación → componente. La clave es también la URL (/clave).
const PAGES = {
  dashboard: Dashboard,
  prerregistro: Prerregistro,
  tramites: Tramites,
  validaciones: Validaciones,
  pdi: RevisionPdi,
  fila: FilaVirtual,
  operaciones: Operaciones,
  miturno: MiTurno,
  reportes: Reportes,
  sistema: EstadoSistema,
};

export default function App() {
  const { user, isAuth } = useAuth();
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, msg) => setToast({ type, msg, id: Date.now() }), []);

  // Sin sesión → pantalla de login (cualquier URL).
  if (!isAuth) return <Login />;

  // Rutas permitidas para el rol actual; el resto redirige al inicio del rol.
  const permitidas = NAV_ITEMS.filter((n) => n.roles.includes(user.rol)).map((n) => n.key);
  const inicio = DEFAULT_PAGE[user.rol] && permitidas.includes(DEFAULT_PAGE[user.rol])
    ? DEFAULT_PAGE[user.rol]
    : permitidas[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f6fa" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            {permitidas.map((key) => {
              const Page = PAGES[key];
              return Page ? <Route key={key} path={`/${key}`} element={<Page notify={notify} />} /> : null;
            })}
            {/* Cualquier otra URL (incluida "/") → página de inicio del rol */}
            <Route path="*" element={<Navigate to={`/${inicio}`} replace />} />
          </Routes>
        </main>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

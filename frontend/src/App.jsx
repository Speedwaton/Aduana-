import { useState, useEffect, useCallback } from "react";
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
import { NAV_ITEMS, PAGE_TITLES } from "./data/constants";

// Página por defecto según el rol al iniciar sesión.
const DEFAULT_PAGE = {
  VIAJERO: "prerregistro",
  FUNCIONARIO: "dashboard",
  SUPERVISOR: "dashboard",
};

export default function App() {
  const { user, isAuth } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, msg) => setToast({ type, msg, id: Date.now() }), []);

  // Al autenticar, posiciona en la página por defecto del rol.
  useEffect(() => {
    if (user) {
      const permitidas = NAV_ITEMS.filter((n) => n.roles.includes(user.rol)).map((n) => n.key);
      const inicio = DEFAULT_PAGE[user.rol] || permitidas[0];
      setActive(permitidas.includes(inicio) ? inicio : permitidas[0]);
    }
  }, [user]);

  // Sin sesión → pantalla de login.
  if (!isAuth) return <Login />;

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard notify={notify} />;
      case "prerregistro": return <Prerregistro notify={notify} />;
      case "tramites": return <Tramites notify={notify} />;
      case "validaciones": return <Validaciones notify={notify} />;
      case "fila": return <FilaVirtual notify={notify} />;
      case "operaciones": return <Operaciones notify={notify} />;
      case "miturno": return <MiTurno notify={notify} />;
      case "reportes": return <Reportes notify={notify} />;
      case "sistema": return <EstadoSistema notify={notify} />;
      default: return <Dashboard notify={notify} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f6fa" }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Header title={PAGE_TITLES[active] || "Frontera Inteligente"} />
        <main style={{ flex: 1 }}>{renderPage()}</main>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

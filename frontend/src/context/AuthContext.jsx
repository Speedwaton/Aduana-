import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../services/authService";
import { setToken, getToken } from "../services/apiClient";

// ============================================================
// AuthContext
// Maneja la sesión del usuario (login/registro/logout) y
// persiste el perfil + token JWT en localStorage para que la
// sesión sobreviva a recargas de página.
// ============================================================

const AuthContext = createContext(null);

const USER_KEY = "aduana_user";

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = useCallback(async (rut, password) => {
    const res = await authService.login(rut, password);
    const perfil = {
      rut: res.rut,
      nombreCompleto: res.nombreCompleto,
      rol: res.rol,
    };
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(perfil));
    setUser(perfil);
    return perfil;
  }, []);

  const registro = useCallback((payload) => authService.registro(payload), []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, registro, logout, isAuth: !!user && !!getToken() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

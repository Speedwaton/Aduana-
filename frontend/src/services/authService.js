import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-autenticacion (:8081) — login y registro de usuarios
export const authService = {
  // POST /api/v1/auth/login → { token, tipo, rut, nombreCompleto, rol }
  login: (rut, password) =>
    api.post(ENDPOINTS.auth.login, { rut, password }, { auth: false }),

  // POST /api/v1/auth/registro → registro PÚBLICO: siempre crea VIAJERO
  // payload: { rut, nombreCompleto, email, password }
  registro: (payload) =>
    api.post(ENDPOINTS.auth.registro, payload, { auth: false }),

  // POST /api/v1/auth/registro-institucional → personal con código
  // payload: { rut, nombreCompleto, email, password, rol, codigoInstitucional }
  registroInstitucional: (payload) =>
    api.post(ENDPOINTS.auth.registroInstitucional, payload, { auth: false }),
};

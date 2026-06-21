import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-operaciones (:8087) — revisión aduanera de vehículos
export const operacionesService = {
  // POST /api/operaciones/revisar → RevisionResponseDto
  // payload: { patente, tipoVehiculo, rutConductor, rutFuncionario, observaciones }
  revisar: (payload) => api.post(ENDPOINTS.operaciones.revisar, payload),

  // GET /api/operaciones/validar/{patente} → { patente, controlAduanero, permisoParaCruzar }
  validarRapido: (patente) => api.get(ENDPOINTS.operaciones.validarRapido(patente)),

  // GET /api/operaciones/historial/{patente} → List<RevisionAduanera>
  historial: (patente) => api.get(ENDPOINTS.operaciones.historial(patente)),
};

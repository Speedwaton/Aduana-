import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-reportes (:8086) — dashboard y estado del sistema
export const reportesService = {
  // GET /api/reportes/dashboard → DashboardDto
  dashboard: () => api.get(ENDPOINTS.reportes.dashboard),

  // GET /api/reportes/estado-sistema → { sistema, estado, version, microservicios[] }
  estadoSistema: () => api.get(ENDPOINTS.reportes.estadoSistema),
};

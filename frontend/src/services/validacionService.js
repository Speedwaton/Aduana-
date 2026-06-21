import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-validacion (:8085) — validación de identidad en el control
export const validacionService = {
  // POST /api/validacion → ValidacionResponseDto
  // payload: { idTramite, rutDocumento, nombreDocumento, nacionalidad,
  //            fechaNacimiento, rutFuncionario }
  validar: (payload) => api.post(ENDPOINTS.validacion.validar, payload),

  // GET /api/validacion/tramite/{idTramite} → ResultadoValidacion
  porTramite: (idTramite) => api.get(ENDPOINTS.validacion.porTramite(idTramite)),

  // GET /api/validacion/estadisticas → { totalValidaciones, aprobadas, rechazadas, tasaExitoPorcentaje }
  estadisticas: () => api.get(ENDPOINTS.validacion.estadisticas),

  // GET /api/validacion/historial → List<ResultadoValidacion>
  historial: () => api.get(ENDPOINTS.validacion.historial),
};

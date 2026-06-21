import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-notificaciones (:8083) — consulta del turno del viajero (Redis)
export const notificacionesService = {
  // GET /turnos/consultar/{rut} → TurnoResponseDto
  // { rutViajero, numeroTurno, estadoTurno, vehiculosAdelante, mensajeInformativo }
  consultarTurno: (rut) => api.get(ENDPOINTS.notificaciones.consultarTurno(rut)),
};

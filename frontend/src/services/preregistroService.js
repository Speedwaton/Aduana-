import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-preregistro (:8084) — prerregistro de viajeros y tickets QR
export const preregistroService = {
  // POST /api/preregistro → PreregistroResponseDto (incluye codigoQr)
  // payload: { rutViajero, nombreCompleto, nacionalidad, correoElectronico,
  //            fechaIngreso (YYYY-MM-DD futura), motivoViaje, patenteVehiculo? }
  crear: (payload) => api.post(ENDPOINTS.preregistro.crear, payload),

  // GET /api/preregistro/{idTramite} → Tramite
  consultar: (idTramite) => api.get(ENDPOINTS.preregistro.consultar(idTramite)),

  // GET /api/preregistro/viajero/{rut} → List<Tramite>
  porViajero: (rut) => api.get(ENDPOINTS.preregistro.porViajero(rut)),

  // PATCH /api/preregistro/{id}/estado?nuevoEstado=APROBADO → Tramite
  actualizarEstado: (idTramite, nuevoEstado) =>
    api.patch(ENDPOINTS.preregistro.actualizarEstado(idTramite, nuevoEstado)),
};

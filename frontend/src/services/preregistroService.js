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

  // GET /api/preregistro → List<Tramite> TODOS (tablero del agente, sin buscar)
  todos: () => api.get(ENDPOINTS.preregistro.todos),

  // GET /api/preregistro/estado/{estado} → List<Tramite> (lista de trabajo PDI)
  porEstado: (estado) => api.get(ENDPOINTS.preregistro.porEstado(estado)),

  // PATCH /api/preregistro/{id}/estado?nuevoEstado=APROBADO → Tramite
  // (si es APROBADO el backend exige revisión PDI aprobada → 409 si falta)
  actualizarEstado: (idTramite, nuevoEstado) =>
    api.patch(ENDPOINTS.preregistro.actualizarEstado(idTramite, nuevoEstado)),

  // --- Documentos del trámite (subidos por el viajero desde casa) ---

  // POST multipart /api/preregistro/{id}/documentos (file + tipoDocumento)
  subirDocumento: (idTramite, file, tipoDocumento) => {
    const form = new FormData();
    form.append("file", file);
    form.append("tipoDocumento", tipoDocumento);
    return api.postForm(ENDPOINTS.preregistro.documentos(idTramite), form);
  },

  // GET /api/preregistro/{id}/documentos → metadatos de los documentos
  listarDocumentos: (idTramite) => api.get(ENDPOINTS.preregistro.documentos(idTramite)),

  // URL directa para abrir/descargar un documento en otra pestaña
  urlDocumento: (id) => ENDPOINTS.preregistro.descargarDocumento(id),

  // GET /api/preregistro/documentos-conteo → [{idTramite, cantidad}]
  documentosConteo: () => api.get(ENDPOINTS.preregistro.documentosConteo),
};

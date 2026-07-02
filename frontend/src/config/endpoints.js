// ============================================================
// MAPA DE ENDPOINTS DEL BACKEND
// ------------------------------------------------------------
// Rutas relativas. El proxy de Vite (vite.config.js) las
// reenvía al API Gateway (:8080) o a ms-notificaciones (:8083).
// Así el frontend nunca depende de puertos absolutos y no sufre
// problemas de CORS en desarrollo.
// ============================================================

export const ENDPOINTS = {
  // ms-autenticacion  (vía gateway)
  auth: {
    login: "/api/v1/auth/login",
    registro: "/api/v1/auth/registro",
    registroInstitucional: "/api/v1/auth/registro-institucional",
  },

  // ms-preregistro  (vía gateway)
  preregistro: {
    crear: "/api/preregistro",
    todos: "/api/preregistro",
    consultar: (idTramite) => `/api/preregistro/${encodeURIComponent(idTramite)}`,
    porViajero: (rut) => `/api/preregistro/viajero/${encodeURIComponent(rut)}`,
    porEstado: (estado) => `/api/preregistro/estado/${encodeURIComponent(estado)}`,
    actualizarEstado: (idTramite, nuevoEstado) =>
      `/api/preregistro/${encodeURIComponent(idTramite)}/estado?nuevoEstado=${nuevoEstado}`,
    // Documentos del trámite (el viajero los sube desde su casa)
    documentos: (idTramite) => `/api/preregistro/${encodeURIComponent(idTramite)}/documentos`,
    descargarDocumento: (id) => `/api/preregistro/documentos/${id}`,
    documentosConteo: "/api/preregistro/documentos-conteo",
  },

  // ms-validacion  (vía gateway)
  validacion: {
    validar: "/api/validacion",
    porTramite: (idTramite) => `/api/validacion/tramite/${encodeURIComponent(idTramite)}`,
    estadisticas: "/api/validacion/estadisticas",
    historial: "/api/validacion/historial",
    // Revisión PDI (antecedentes penales + carga del vehículo)
    pdi: "/api/validacion/pdi",
    pdiPorTramite: (idTramite) => `/api/validacion/pdi/tramite/${encodeURIComponent(idTramite)}`,
    pdiHistorial: "/api/validacion/pdi/historial",
    pdiEstadisticas: "/api/validacion/pdi/estadisticas",
  },

  // ms-fila-virtual  (vía gateway)
  fila: {
    listar: "/api/fila",
    agregar: "/api/fila",
    buscar: (patente) => `/api/fila/buscar/${encodeURIComponent(patente)}`,
    porTipo: (tipo) => `/api/fila/tipo/${encodeURIComponent(tipo)}`,
    atender: "/api/fila/atender",
  },

  // ms-operaciones  (vía gateway)
  operaciones: {
    revisar: "/api/operaciones/revisar",
    validarRapido: (patente) => `/api/operaciones/validar/${encodeURIComponent(patente)}`,
    historial: (patente) => `/api/operaciones/historial/${encodeURIComponent(patente)}`,
  },

  // ms-reportes  (vía gateway)
  reportes: {
    dashboard: "/api/reportes/dashboard",
    estadoSistema: "/api/reportes/estado-sistema",
  },

  // ms-notificaciones  (vía gateway → /api/notificaciones/**)
  notificaciones: {
    consultarTurno: (rut) => `/api/notificaciones/consultar/${encodeURIComponent(rut)}`,
  },
};

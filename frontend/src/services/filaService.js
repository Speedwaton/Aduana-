import { api } from "./apiClient";
import { ENDPOINTS } from "../config/endpoints";

// ms-fila-virtual (:8082) — cola virtual de vehículos
export const filaService = {
  // GET /api/fila → List<{ patente, conductor, tipo }>
  listar: () => api.get(ENDPOINTS.fila.listar),

  // POST /api/fila → texto de confirmación
  // payload: { patente, conductor, tipo }
  agregar: (vehiculo) => api.post(ENDPOINTS.fila.agregar, vehiculo),

  // GET /api/fila/buscar/{patente} → { patente, conductor, tipo }
  buscar: (patente) => api.get(ENDPOINTS.fila.buscar(patente)),

  // GET /api/fila/tipo/{tipo} → List<...>
  porTipo: (tipo) => api.get(ENDPOINTS.fila.porTipo(tipo)),

  // DELETE /api/fila/atender → texto con el resultado de la atención
  atender: () => api.del(ENDPOINTS.fila.atender),
};

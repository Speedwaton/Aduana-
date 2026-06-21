// ============================================================
// CLIENTE HTTP CENTRAL
// ------------------------------------------------------------
// Envoltura sobre fetch() usada por todos los services.
//  - Inyecta el token JWT (Authorization: Bearer ...) si existe.
//  - Serializa/parsea JSON automáticamente.
//  - Soporta respuestas en texto plano (varios endpoints del
//    backend devuelven String, no JSON).
//  - Lanza ApiError con el mensaje del backend para que la UI
//    pueda mostrarlo tal cual.
// ============================================================

const TOKEN_KEY = "aduana_token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Realiza una petición al backend.
 * @param {string} url      Ruta relativa (ver config/endpoints.js)
 * @param {object} options  { method, body, auth }
 * @returns {Promise<any>}  JSON parseado, texto, o null (204)
 */
async function request(url, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend (API Gateway :8080) esté encendido.",
      0
    );
  }

  // Leemos el cuerpo una sola vez como texto y decidimos cómo interpretarlo.
  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";
  let data = raw;
  if (contentType.includes("application/json") && raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Error ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data === "" ? null : data;
}

export const api = {
  get: (url, opts) => request(url, { ...opts, method: "GET" }),
  post: (url, body, opts) => request(url, { ...opts, method: "POST", body }),
  patch: (url, body, opts) => request(url, { ...opts, method: "PATCH", body }),
  del: (url, opts) => request(url, { ...opts, method: "DELETE" }),
};

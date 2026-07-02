// ============================================================
// CONSTANTES GLOBALES Y MAPEOS DE ENUMS DEL BACKEND
// ============================================================

// --- Enums del backend (deben coincidir EXACTO con Java) ---
export const ROLES = ["VIAJERO", "FUNCIONARIO", "PDI", "SUPERVISOR"];

// Roles que se registran con código institucional (no desde el registro público)
export const ROLES_INSTITUCIONALES = ["FUNCIONARIO", "PDI", "SUPERVISOR"];

export const MOTIVOS_VIAJE = ["TURISMO", "TRABAJO", "RESIDENCIA", "TRANSITO", "COMERCIO"];

export const ESTADOS_TRAMITE = ["PRE_REGISTRADO", "EN_REVISION", "APROBADO", "RECHAZADO", "EXPIRADO"];

export const TIPOS_VEHICULO = ["AUTO", "CAMION", "BUS", "MOTO"];

// Tipos de documento que el viajero puede subir a su trámite
export const TIPOS_DOCUMENTO = [
  { value: "ANTECEDENTES_PENALES", label: "Certificado de antecedentes penales" },
  { value: "LICENCIA_CONDUCIR", label: "Licencia de conducir" },
  { value: "PERMISO_VEHICULO", label: "Permiso de circulación / vehículo" },
  { value: "SEGURO", label: "Seguro obligatorio" },
  { value: "OTRO", label: "Otro documento" },
];

// --- Colores por estado (para Badge) ---
export const ESTADO_COLORS = {
  // Trámite
  PRE_REGISTRADO: { bg: "#eaf2fb", text: "#185FA5" },
  EN_REVISION: { bg: "#faeeda", text: "#854F0B" },
  APROBADO: { bg: "#e1f5ee", text: "#0F6E56" },
  RECHAZADO: { bg: "#fcebeb", text: "#A32D2D" },
  EXPIRADO: { bg: "#f1efe8", text: "#5F5E5A" },
  // Validación / operaciones
  RECHAZADO_PAPELES_INCOMPLETOS: { bg: "#fcebeb", text: "#A32D2D" },
  RETENIDO_REVISION_CARGA: { bg: "#faeeda", text: "#854F0B" },
  RETENIDO_INSPECCION_SAG: { bg: "#faeeda", text: "#854F0B" },
  RETENIDO_SOSPECHA: { bg: "#fcebeb", text: "#A32D2D" },
  PENDIENTE_REVISION: { bg: "#faeeda", text: "#854F0B" },
  // Turnos
  EN_ESPERA: { bg: "#eaf2fb", text: "#185FA5" },
  LLAMADO_A_VENTANILLA: { bg: "#e1f5ee", text: "#0F6E56" },
  PROCESADO: { bg: "#f1efe8", text: "#5F5E5A" },
  // Revisión PDI
  NO_APLICA: { bg: "#f1efe8", text: "#5F5E5A" },
  PENDIENTE: { bg: "#faeeda", text: "#854F0B" },
};

// --- Nivel de alerta del dashboard (DashboardDto.alertas[].nivel) ---
export const ALERTA_STYLE = {
  CRITICO: { color: "#E24B4A", icon: "AlertCircle" },
  ADVERTENCIA: { color: "#D97706", icon: "AlertTriangle" },
  INFO: { color: "#1D9E75", icon: "CheckCircle" },
};

// --- Navegación: cada item declara qué roles pueden verlo ---
export const NAV_ITEMS = [
  { key: "dashboard", label: "Inicio", icon: "LayoutDashboard", roles: ["FUNCIONARIO", "SUPERVISOR"] },
  { key: "prerregistro", label: "Prerregistro", icon: "ClipboardList", roles: ["VIAJERO", "FUNCIONARIO", "SUPERVISOR"] },
  { key: "tramites", label: "Trámites", icon: "FileText", roles: ["VIAJERO", "FUNCIONARIO", "SUPERVISOR"] },
  { key: "validaciones", label: "Validaciones", icon: "ShieldCheck", roles: ["FUNCIONARIO", "SUPERVISOR"] },
  { key: "pdi", label: "Revisión PDI", icon: "ShieldAlert", roles: ["PDI", "SUPERVISOR"] },
  { key: "fila", label: "Fila Virtual", icon: "Car", roles: ["FUNCIONARIO", "SUPERVISOR"] },
  { key: "operaciones", label: "Operaciones", icon: "PackageSearch", roles: ["FUNCIONARIO", "SUPERVISOR"] },
  { key: "miturno", label: "Mi Turno", icon: "Clock", roles: ["VIAJERO"] },
  { key: "reportes", label: "Reportes", icon: "BarChart2", roles: ["SUPERVISOR", "FUNCIONARIO"] },
  { key: "sistema", label: "Estado Sistema", icon: "Server", roles: ["SUPERVISOR"] },
];

export const PAGE_TITLES = {
  dashboard: "Dashboard",
  prerregistro: "Prerregistro",
  tramites: "Trámites",
  validaciones: "Validaciones",
  pdi: "Revisión PDI",
  fila: "Fila Virtual",
  operaciones: "Operaciones Aduaneras",
  miturno: "Mi Turno",
  reportes: "Reportes",
  sistema: "Estado del Sistema",
};

// Fecha de hoy en formato YYYY-MM-DD (para inputs date)
export const hoyISO = () => new Date().toISOString().slice(0, 10);

// Formatea LocalDateTime / fecha ISO del backend a texto legible es-CL
export const fmtFecha = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-CL").replace(",", "");
  } catch {
    return iso;
  }
};

// Reemplaza guiones bajos por espacios para mostrar enums (RETENIDO_REVISION_CARGA → "RETENIDO REVISION CARGA")
export const labelEnum = (v) => (v ? String(v).replaceAll("_", " ") : "—");

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ============================================================
// Configuración de Vite
// ------------------------------------------------------------
// El frontend corre en http://localhost:5173 y NO habla
// directamente con cada microservicio: usa un proxy que evita
// problemas de CORS reenviando las peticiones server-side.
//
//   /api      → API Gateway (Spring Cloud Gateway)  :8080
//               Enruta TODOS los microservicios: auth,
//               preregistro, validacion, fila, operaciones,
//               notificaciones y reportes.
// ============================================================
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

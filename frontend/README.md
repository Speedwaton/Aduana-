# 🛂 Frontend — Frontera Inteligente Los Libertadores

Frontend **React + Vite** funcional, conectado a los microservicios Spring Boot
del backend (carpeta hermana `../`, accesible vía el **API Gateway** en `:8080`).

Este proyecto está **separado del backend**: vive en su propia carpeta `frontend/`
con su propio `package.json` y no comparte dependencias con los servicios Java.

---

## 📁 Estructura de carpetas

```
frontend/
├── index.html
├── package.json
├── vite.config.js          # Proxy /api → :8080 y /turnos → :8083 (evita CORS)
└── src/
    ├── main.jsx            # Punto de entrada + <AuthProvider>
    ├── App.jsx             # Ruteo por rol + gating de sesión
    ├── index.css
    ├── config/
    │   └── endpoints.js    # Mapa central de rutas del backend
    ├── services/           # Una capa por microservicio (fetch real)
    │   ├── apiClient.js        # Wrapper fetch + JWT + manejo de errores
    │   ├── authService.js      # ms-autenticacion
    │   ├── preregistroService.js
    │   ├── validacionService.js
    │   ├── filaService.js
    │   ├── operacionesService.js
    │   ├── reportesService.js
    │   └── notificacionesService.js
    ├── context/
    │   └── AuthContext.jsx # Sesión, login/registro/logout, token en localStorage
    ├── data/
    │   └── constants.js    # Enums del backend, colores, navegación por rol
    ├── components/
    │   ├── layout/         # Sidebar (menú por rol) + Header
    │   └── ui/             # Badge, Buttons, Input, Modal, Spinner, Toast
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx       → ms-reportes
        ├── Prerregistro.jsx    → ms-preregistro (genera QR)
        ├── Tramites.jsx        → ms-preregistro (consulta / cambia estado)
        ├── Validaciones.jsx    → ms-validacion
        ├── FilaVirtual.jsx     → ms-fila-virtual
        ├── Operaciones.jsx     → ms-operaciones
        ├── MiTurno.jsx         → ms-notificaciones
        ├── Reportes.jsx        → ms-reportes + ms-validacion
        └── EstadoSistema.jsx   → ms-reportes
```

---

## 🚀 Cómo ejecutar

### 1. Levantar el backend
Sigue el `README.md` de la raíz: primero `eureka-server`, luego los microservicios
y por último el `api-gateway` (`:8080`). Para la consulta de turno también debe estar
arriba `ms-notificaciones` (`:8083`).

### 2. Levantar el frontend
```bash
cd frontend
npm install
npm run dev
```
Abre automáticamente <http://localhost:5173>.

---

## 🔌 Cómo se conecta al backend

El frontend nunca usa puertos absolutos: hace peticiones a rutas relativas
(`/api/...`) y el **proxy de Vite** las reenvía server-side, evitando CORS.

| Ruta del frontend | Destino             | Microservicio       |
|-------------------|---------------------|---------------------|
| `/api/**`         | `localhost:8080`    | API Gateway (todos, incluido el turno en `/api/notificaciones/**`) |

> El token JWT del login se guarda en `localStorage` y se inyecta como
> `Authorization: Bearer <token>` en cada petición autenticada.

---

## 👥 Roles y vistas

| Rol           | Accede a                                                        |
|---------------|----------------------------------------------------------------|
| `VIAJERO`     | Prerregistro, Mis Trámites, Mi Turno                           |
| `FUNCIONARIO` | Dashboard, Prerregistro, Trámites, Validaciones, Fila, Operaciones, Reportes |
| `SUPERVISOR`  | Todo lo anterior + Estado del Sistema                         |

El menú lateral se filtra automáticamente según el rol devuelto en el login.

---

## 🧰 Tecnologías

- **React 18** + **Vite 5**
- **lucide-react** (iconos)
- **react-qr-code** (códigos QR del prerregistro)
- `fetch` nativo (sin axios) en una capa de servicios desacoplada

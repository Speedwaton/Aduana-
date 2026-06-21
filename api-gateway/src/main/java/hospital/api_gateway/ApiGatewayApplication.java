package hospital.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway - Frontera Inteligente Los Libertadores.
 *
 * Punto de entrada único para todas las peticiones del sistema.
 * Puerto: 8080
 *
 * Rutas disponibles:
 *   POST   /api/v1/auth/registro      → ms-autenticacion (8081)
 *   POST   /api/v1/auth/login         → ms-autenticacion (8081)
 *   POST   /api/preregistro           → ms-preregistro   (8084)
 *   GET    /api/preregistro/{id}      → ms-preregistro   (8084)
 *   POST   /api/validacion            → ms-validacion    (8085)
 *   GET    /api/fila                  → ms-fila-virtual  (8082)
 *   DELETE /api/fila/atender          → ms-fila-virtual  (8082)
 *   GET    /api/operaciones/validar   → ms-operaciones   (8087)
 *   GET    /api/reportes/dashboard    → ms-reportes      (8086)
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}

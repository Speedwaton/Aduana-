package com.frontintel.aduanas.ms_reportes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Microservicio de Reportes y Dashboard - Frontera Inteligente Los Libertadores.
 *
 * Responsabilidades:
 *  - Agregar métricas de todos los microservicios del ecosistema.
 *  - Proveer los datos del dashboard para el panel del funcionario.
 *  - Mostrar alertas y notificaciones en tiempo real.
 *  - Exponer el estado general del sistema.
 *
 * Puerto: 8086
 */
@SpringBootApplication
@EnableDiscoveryClient
public class MsReportesApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsReportesApplication.class, args);
    }
}

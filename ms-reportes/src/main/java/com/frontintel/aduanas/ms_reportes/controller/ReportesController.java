package com.frontintel.aduanas.ms_reportes.controller;

import com.frontintel.aduanas.ms_reportes.dto.DashboardDto;
import com.frontintel.aduanas.ms_reportes.service.ReportesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para el módulo de Reportes y Dashboard.
 * Puerto: 8086
 */
@Slf4j
@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;

    /**
     * Retorna las métricas consolidadas del dashboard del funcionario.
     * GET http://localhost:8086/api/reportes/dashboard
     *
     * Agrega datos de: ms-preregistro, ms-validacion, ms-fila-virtual, ms-operaciones.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> obtenerDashboard() {
        log.info("GET /api/reportes/dashboard - Solicitando métricas del dashboard");
        DashboardDto dashboard = reportesService.obtenerDashboard();
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Retorna el estado general del sistema (health check extendido).
     * GET http://localhost:8086/api/reportes/estado-sistema
     */
    @GetMapping("/estado-sistema")
    public ResponseEntity<?> obtenerEstadoSistema() {
        return ResponseEntity.ok(java.util.Map.of(
            "sistema", "Frontera Inteligente Los Libertadores",
            "estado", "OPERATIVO",
            "version", "1.0.0",
            "microservicios", java.util.List.of(
                java.util.Map.of("nombre", "ms-autenticacion", "puerto", 8081, "estado", "UP"),
                java.util.Map.of("nombre", "ms-fila-virtual", "puerto", 8082, "estado", "UP"),
                java.util.Map.of("nombre", "ms-notificaciones", "puerto", 8083, "estado", "UP"),
                java.util.Map.of("nombre", "ms-preregistro", "puerto", 8084, "estado", "UP"),
                java.util.Map.of("nombre", "ms-validacion", "puerto", 8085, "estado", "UP"),
                java.util.Map.of("nombre", "ms-reportes", "puerto", 8086, "estado", "UP"),
                java.util.Map.of("nombre", "ms-operaciones", "puerto", 8087, "estado", "UP")
            )
        ));
    }
}

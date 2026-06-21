package com.frontintel.aduanas.ms_notificaciones.controller;

import com.frontintel.aduanas.ms_notificaciones.dtos.EventoCruceDto;
import com.frontintel.aduanas.ms_notificaciones.dtos.TurnoResponseDto;
import com.frontintel.aduanas.ms_notificaciones.models.Turno;
import com.frontintel.aduanas.ms_notificaciones.services.FilaVirtualService;
import com.frontintel.aduanas.ms_notificaciones.services.NotificacionEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class FilaVirtualController {

    private final FilaVirtualService filaVirtualService;
    private final NotificacionEmailService emailService;

    /**
     * Crea/asigna el turno de un viajero. Lo invoca ms-preregistro por REST
     * (antes era un evento de Kafka).
     * POST http://localhost:8083/api/notificaciones/turno
     */
    @PostMapping("/turno")
    public ResponseEntity<?> registrarTurno(@RequestBody EventoCruceDto evento) {
        log.info("Solicitud de turno (REST) para el trámite: {}", evento.getIdTramite());

        Turno turno = filaVirtualService.asignarTurnoAFila(
                evento.getRutViajero(),
                evento.getIdTramite(),
                evento.getPatenteVehiculo());

        // Notificación (solo log en este prototipo)
        emailService.enviarCorreoConfirmacion(
                evento.getCorreoViajero(),
                evento.getIdTramite(),
                evento.getPatenteVehiculo());

        return ResponseEntity.ok(Map.of(
                "rutViajero", turno.getRutViajero(),
                "numeroTurno", turno.getNumeroTurno(),
                "estadoTurno", turno.getEstadoTurno()));
    }

    /**
     * Consulta el estado del turno y cuántos vehículos hay adelante.
     * GET http://localhost:8083/api/notificaciones/consultar/12345678-9
     * (vía gateway: http://localhost:8080/api/notificaciones/consultar/12345678-9)
     */
    @GetMapping("/consultar/{rutViajero}")
    public ResponseEntity<TurnoResponseDto> consultarEstadoTurno(@PathVariable String rutViajero) {
        log.info("Consulta de turno para el RUT: {}", rutViajero);

        Turno turno = filaVirtualService.obtenerTurnoPorRut(rutViajero);
        if (turno == null) {
            log.warn("No se encontró turno activo para el RUT: {}", rutViajero);
            return ResponseEntity.notFound().build();
        }

        long vehiculosAdelante = filaVirtualService.calcularVehiculosAdelante(rutViajero);

        TurnoResponseDto respuesta = TurnoResponseDto.builder()
                .rutViajero(turno.getRutViajero())
                .numeroTurno(turno.getNumeroTurno())
                .estadoTurno(turno.getEstadoTurno())
                .vehiculosAdelante(vehiculosAdelante)
                .mensajeInformativo("Tránsito expedito en Paso Los Libertadores. Aproxímese con su QR.")
                .build();

        return ResponseEntity.ok(respuesta);
    }
}

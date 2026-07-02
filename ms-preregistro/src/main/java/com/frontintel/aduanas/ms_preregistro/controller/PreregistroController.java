package com.frontintel.aduanas.ms_preregistro.controller;

import com.frontintel.aduanas.ms_preregistro.dto.PreregistroRequestDto;
import com.frontintel.aduanas.ms_preregistro.dto.PreregistroResponseDto;
import com.frontintel.aduanas.ms_preregistro.model.EstadoTramite;
import com.frontintel.aduanas.ms_preregistro.model.Tramite;
import com.frontintel.aduanas.ms_preregistro.service.PreregistroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el módulo de Preregistro de viajeros.
 * Puerto: 8084
 */
@Slf4j
@RestController
@RequestMapping("/api/preregistro")
@RequiredArgsConstructor
public class PreregistroController {

    private final PreregistroService preregistroService;

    /**
     * Crea un nuevo preregistro para un viajero.
     * POST http://localhost:8084/api/preregistro
     *
     * Body de ejemplo:
     * {
     *   "rutViajero": "18.234.567-8",
     *   "nombreCompleto": "Juan Pérez",
     *   "nacionalidad": "Chilena",
     *   "correoElectronico": "juan@email.com",
     *   "fechaIngreso": "2025-05-25",
     *   "motivoViaje": "TURISMO",
     *   "patenteVehiculo": "BBCC12"
     * }
     */
    @PostMapping
    public ResponseEntity<?> crearPreregistro(@Valid @RequestBody PreregistroRequestDto dto) {
        log.info("POST /api/preregistro - Nuevo preregistro para RUT: {}", dto.getRutViajero());
        try {
            PreregistroResponseDto respuesta = preregistroService.crearPreregistro(dto);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error en preregistro: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Consulta el estado de un trámite por su código QR / ID.
     * GET http://localhost:8084/api/preregistro/QR-25-05-2025-4587
     */
    @GetMapping("/{idTramite}")
    public ResponseEntity<?> consultarTramite(@PathVariable String idTramite) {
        log.info("GET /api/preregistro/{} - Consultando estado", idTramite);
        try {
            Tramite tramite = preregistroService.consultarTramite(idTramite);
            return ResponseEntity.ok(tramite);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Obtiene todos los trámites de un viajero por su RUT.
     * GET http://localhost:8084/api/preregistro/viajero/18.234.567-8
     */
    @GetMapping("/viajero/{rut}")
    public ResponseEntity<List<Tramite>> obtenerTramitesPorRut(@PathVariable String rut) {
        log.info("GET /api/preregistro/viajero/{} - Listando trámites", rut);
        List<Tramite> tramites = preregistroService.obtenerTramitesPorRut(rut);
        return ResponseEntity.ok(tramites);
    }

    /**
     * Lista TODOS los trámites (tablero del agente aduanero, sin buscar).
     * GET http://localhost:8084/api/preregistro
     */
    @GetMapping
    public ResponseEntity<List<Tramite>> obtenerTodos() {
        return ResponseEntity.ok(preregistroService.obtenerTodos());
    }

    /**
     * Lista trámites por estado. Es la "lista de trabajo" de la PDI:
     * los PRE_REGISTRADO / EN_REVISION son los que esperan verificación.
     * GET http://localhost:8084/api/preregistro/estado/PRE_REGISTRADO
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> obtenerTramitesPorEstado(@PathVariable String estado) {
        log.info("GET /api/preregistro/estado/{}", estado);
        try {
            EstadoTramite e = EstadoTramite.valueOf(estado.toUpperCase());
            return ResponseEntity.ok(preregistroService.obtenerTramitesPorEstado(e));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Estado desconocido: " + estado);
        }
    }

    /**
     * Actualiza el estado de un trámite (usado por el agente aduanero).
     * Si el nuevo estado es APROBADO, el backend exige que la PDI ya haya
     * aprobado la revisión del viajero (candado de seguridad).
     * PATCH http://localhost:8084/api/preregistro/QR-25-05-2025-4587/estado?nuevoEstado=APROBADO
     */
    @PatchMapping("/{idTramite}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable String idTramite,
            @RequestParam EstadoTramite nuevoEstado) {
        log.info("PATCH /api/preregistro/{}/estado - Actualizando a: {}", idTramite, nuevoEstado);
        try {
            Tramite actualizado = preregistroService.actualizarEstado(idTramite, nuevoEstado);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            // 404 solo si el trámite no existe; el candado PDI responde 409 (conflicto).
            HttpStatus status = e.getMessage() != null && e.getMessage().contains("no encontrado")
                    ? HttpStatus.NOT_FOUND
                    : HttpStatus.CONFLICT;
            return ResponseEntity.status(status).body(e.getMessage());
        }
    }
}

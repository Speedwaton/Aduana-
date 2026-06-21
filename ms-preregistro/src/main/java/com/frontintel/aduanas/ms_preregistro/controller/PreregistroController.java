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
     * Actualiza el estado de un trámite (usado por el funcionario aduanero).
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

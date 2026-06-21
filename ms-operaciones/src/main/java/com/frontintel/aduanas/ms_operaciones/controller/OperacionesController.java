package com.frontintel.aduanas.ms_operaciones.controller;

import com.frontintel.aduanas.ms_operaciones.dto.RevisionRequestDto;
import com.frontintel.aduanas.ms_operaciones.dto.RevisionResponseDto;
import com.frontintel.aduanas.ms_operaciones.model.RevisionAduanera;
import com.frontintel.aduanas.ms_operaciones.service.OperacionesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Controlador REST para el módulo de Operaciones Aduaneras.
 * Puerto: 8087
 */
@Slf4j
@RestController
@RequestMapping("/api/operaciones")
@RequiredArgsConstructor
public class OperacionesController {

    private final OperacionesService operacionesService;

    /**
     * Realiza la revisión aduanera completa de un vehículo.
     * POST http://localhost:8087/api/operaciones/revisar
     *
     * Body de ejemplo:
     * {
     *   "patente": "BBCC12",
     *   "tipoVehiculo": "AUTO",
     *   "rutConductor": "18.234.567-8",
     *   "rutFuncionario": "12.345.678-9",
     *   "observaciones": "Vehículo con baúl grande"
     * }
     */
    @PostMapping("/revisar")
    public ResponseEntity<RevisionResponseDto> revisarVehiculo(@Valid @RequestBody RevisionRequestDto dto) {
        log.info("POST /api/operaciones/revisar - Revisando patente: {}", dto.getPatente());
        RevisionResponseDto respuesta = operacionesService.revisarVehiculo(dto);
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Validación rápida por patente (mantiene compatibilidad con ms-fila-virtual).
     * GET http://localhost:8087/api/operaciones/validar/BBCC12
     */
    @GetMapping("/validar/{patente}")
    public Map<String, Object> validarVehiculo(@PathVariable String patente) {
        log.info("GET /api/operaciones/validar/{}", patente);
        String[] estados = {"APROBADO", "RECHAZADO - PAPELES INCOMPLETOS", "RETENIDO - REVISIÓN DE CARGA"};
        int index = new Random().nextInt(estados.length);
        String resultado = estados[index];

        return Map.of(
            "patente", patente,
            "controlAduanero", resultado,
            "permisoParaCruzar", resultado.equals("APROBADO")
        );
    }

    /**
     * Consulta el historial de revisiones de una patente.
     * GET http://localhost:8087/api/operaciones/historial/BBCC12
     */
    @GetMapping("/historial/{patente}")
    public ResponseEntity<List<RevisionAduanera>> obtenerHistorial(@PathVariable String patente) {
        List<RevisionAduanera> historial = operacionesService.obtenerHistorialPatente(patente);
        return ResponseEntity.ok(historial);
    }
}

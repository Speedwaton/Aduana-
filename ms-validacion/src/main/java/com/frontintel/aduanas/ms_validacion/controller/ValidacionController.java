package com.frontintel.aduanas.ms_validacion.controller;

import com.frontintel.aduanas.ms_validacion.dto.ValidacionRequestDto;
import com.frontintel.aduanas.ms_validacion.dto.ValidacionResponseDto;
import com.frontintel.aduanas.ms_validacion.model.ResultadoValidacion;
import com.frontintel.aduanas.ms_validacion.repository.ValidacionRepository;
import com.frontintel.aduanas.ms_validacion.service.ValidacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la validación de identidad y documentos.
 * Puerto: 8085
 */
@Slf4j
@RestController
@RequestMapping("/api/validacion")
@RequiredArgsConstructor
public class ValidacionController {

    private final ValidacionService validacionService;
    private final ValidacionRepository validacionRepository;

    /**
     * Valida la identidad del viajero cruzando el documento con el preregistro.
     * POST http://localhost:8085/api/validacion
     *
     * Body de ejemplo:
     * {
     *   "idTramite": "QR-25-05-2025-4587",
     *   "rutDocumento": "18.234.567-8",
     *   "nombreDocumento": "Juan Pérez",
     *   "nacionalidad": "Chilena",
     *   "fechaNacimiento": "21/05/1988",
     *   "rutFuncionario": "12.345.678-9"
     * }
     */
    @PostMapping
    public ResponseEntity<ValidacionResponseDto> validarIdentidad(@Valid @RequestBody ValidacionRequestDto dto) {
        log.info("POST /api/validacion - Validando trámite: {}", dto.getIdTramite());
        ValidacionResponseDto respuesta = validacionService.validarIdentidad(dto);
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Consulta el historial de validaciones de un trámite específico.
     * GET http://localhost:8085/api/validacion/tramite/QR-25-05-2025-4587
     */
    @GetMapping("/tramite/{idTramite}")
    public ResponseEntity<?> consultarValidacion(@PathVariable String idTramite) {
        log.info("GET /api/validacion/tramite/{}", idTramite);
        return validacionRepository.findByIdTramite(idTramite)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtiene estadísticas de validaciones del día para el dashboard.
     * GET http://localhost:8085/api/validacion/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        long aprobadas = validacionRepository.countByResultado(
                com.frontintel.aduanas.ms_validacion.model.EstadoValidacion.APROBADO);
        long rechazadas = validacionRepository.countByResultado(
                com.frontintel.aduanas.ms_validacion.model.EstadoValidacion.RECHAZADO);
        long total = aprobadas + rechazadas;
        double tasaExito = total > 0 ? (double) aprobadas / total * 100 : 0;

        return ResponseEntity.ok(java.util.Map.of(
                "totalValidaciones", total,
                "aprobadas", aprobadas,
                "rechazadas", rechazadas,
                "tasaExitoPorcentaje", String.format("%.1f%%", tasaExito)
        ));
    }

    /**
     * Lista todas las validaciones del historial (para el módulo de auditoría).
     * GET http://localhost:8085/api/validacion/historial
     */
    @GetMapping("/historial")
    public ResponseEntity<List<ResultadoValidacion>> obtenerHistorial() {
        return ResponseEntity.ok(validacionRepository.findAll());
    }
}

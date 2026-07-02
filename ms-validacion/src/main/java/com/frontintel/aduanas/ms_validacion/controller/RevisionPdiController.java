package com.frontintel.aduanas.ms_validacion.controller;

import com.frontintel.aduanas.ms_validacion.dto.RevisionPdiRequestDto;
import com.frontintel.aduanas.ms_validacion.model.RevisionPdi;
import com.frontintel.aduanas.ms_validacion.repository.RevisionPdiRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints de la revisión PDI (Policía de Investigaciones).
 * La PDI verifica antecedentes penales y la carga del vehículo; el agente
 * aduanero consulta aquí el estado antes de poder aprobar un trámite.
 * Puerto: 8085 (vía gateway: /api/validacion/pdi/**)
 */
@Slf4j
@RestController
@RequestMapping("/api/validacion/pdi")
@RequiredArgsConstructor
public class RevisionPdiController {

    private final RevisionPdiRepository revisionPdiRepository;

    /**
     * Registra (o actualiza) la revisión PDI de un trámite.
     * El resultado global se calcula: APROBADO solo si los antecedentes están
     * APROBADO y el vehículo APROBADO o NO_APLICA.
     * POST /api/validacion/pdi
     */
    @PostMapping
    public ResponseEntity<RevisionPdi> registrarRevision(@Valid @RequestBody RevisionPdiRequestDto dto) {
        log.info("POST /api/validacion/pdi - Revisión PDI del trámite {}", dto.getIdTramite());

        boolean aprobado = "APROBADO".equals(dto.getAntecedentesPenales())
                && ("APROBADO".equals(dto.getRevisionVehiculo())
                    || "NO_APLICA".equals(dto.getRevisionVehiculo()));

        // Upsert: si ya existía una revisión para el trámite, se actualiza.
        RevisionPdi revision = revisionPdiRepository.findByIdTramite(dto.getIdTramite())
                .orElseGet(() -> RevisionPdi.builder().idTramite(dto.getIdTramite()).build());

        revision.setRutViajero(dto.getRutViajero());
        revision.setAntecedentesPenales(dto.getAntecedentesPenales());
        revision.setRevisionVehiculo(dto.getRevisionVehiculo());
        revision.setResultado(aprobado ? "APROBADO" : "RECHAZADO");
        revision.setObservaciones(dto.getObservaciones());
        revision.setRutPdi(dto.getRutPdi());

        RevisionPdi guardada = revisionPdiRepository.save(revision);
        log.info("Revisión PDI del trámite {} guardada con resultado {}",
                guardada.getIdTramite(), guardada.getResultado());
        return ResponseEntity.ok(guardada);
    }

    /**
     * Estado PDI de un trámite. Lo consultan el agente (para corroborar) y el
     * viajero (para ver el avance). 404 = la PDI aún no lo revisa.
     * GET /api/validacion/pdi/tramite/{idTramite}
     */
    @GetMapping("/tramite/{idTramite}")
    public ResponseEntity<?> consultarPorTramite(@PathVariable String idTramite) {
        return revisionPdiRepository.findByIdTramite(idTramite)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404)
                        .body(Map.of("mensaje", "El trámite aún no ha sido revisado por la PDI.")));
    }

    /**
     * Historial completo de revisiones PDI (auditoría).
     * GET /api/validacion/pdi/historial
     */
    @GetMapping("/historial")
    public ResponseEntity<List<RevisionPdi>> historial() {
        return ResponseEntity.ok(revisionPdiRepository.findAll());
    }

    /**
     * Estadísticas rápidas para el panel PDI.
     * GET /api/validacion/pdi/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> estadisticas() {
        long aprobadas = revisionPdiRepository.countByResultado("APROBADO");
        long rechazadas = revisionPdiRepository.countByResultado("RECHAZADO");
        return ResponseEntity.ok(Map.of(
                "totalRevisiones", aprobadas + rechazadas,
                "aprobadas", aprobadas,
                "rechazadas", rechazadas));
    }
}

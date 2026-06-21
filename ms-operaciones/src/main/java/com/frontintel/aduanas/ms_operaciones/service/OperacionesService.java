package com.frontintel.aduanas.ms_operaciones.service;

import com.frontintel.aduanas.ms_operaciones.dto.RevisionRequestDto;
import com.frontintel.aduanas.ms_operaciones.dto.RevisionResponseDto;
import com.frontintel.aduanas.ms_operaciones.model.ResultadoRevision;
import com.frontintel.aduanas.ms_operaciones.model.RevisionAduanera;
import com.frontintel.aduanas.ms_operaciones.repository.RevisionAduaneraRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Servicio de operaciones aduaneras.
 * Gestiona la revisión de vehículos, documentación y equipaje.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OperacionesService {

    private final RevisionAduaneraRepository revisionRepository;

    /**
     * Realiza la revisión aduanera de un vehículo y guarda el resultado.
     * Simula la lógica de negocio real: chequeo de documentos, SAG, carga.
     *
     * @param dto Datos del vehículo y del funcionario que realiza la revisión.
     * @return Resultado de la revisión con permiso de cruce o motivo de retención.
     */
    @Transactional
    public RevisionResponseDto revisarVehiculo(RevisionRequestDto dto) {
        log.info("Iniciando revisión aduanera para patente: {}", dto.getPatente());

        // Simulación de lógica de revisión (en producción, integraría con SAG, SII, PDI)
        ResultadoRevision resultado = simularRevision();
        boolean aprobado = resultado == ResultadoRevision.APROBADO;
        String motivo = aprobado ? null : obtenerDescripcion(resultado);

        // Registrar la revisión en base de datos para auditoría
        RevisionAduanera revision = RevisionAduanera.builder()
                .patente(dto.getPatente())
                .tipoVehiculo(dto.getTipoVehiculo())
                .rutConductor(dto.getRutConductor())
                .resultado(resultado)
                .motivoDetencion(motivo)
                .rutFuncionario(dto.getRutFuncionario())
                .observaciones(dto.getObservaciones())
                .build();
        revisionRepository.save(revision);

        log.info("Revisión completada para patente {}. Resultado: {}", dto.getPatente(), resultado);

        return RevisionResponseDto.builder()
                .patente(dto.getPatente())
                .controlAduanero(obtenerDescripcion(resultado))
                .permisoParaCruzar(aprobado)
                .motivoDetencion(motivo)
                .mensaje(aprobado
                        ? "Vehículo aprobado. ¡PERMITIDO EL CRUCE A CHILE!"
                        : "Vehículo retenido. Motivo: " + motivo)
                .build();
    }

    /**
     * Consulta el historial de revisiones de una patente específica.
     */
    public List<RevisionAduanera> obtenerHistorialPatente(String patente) {
        return revisionRepository.findByPatente(patente);
    }

    /**
     * Simula la decisión aleatoria de revisión aduanera.
     * En producción se integraría con PDI, SAG, SII, TGR.
     */
    private ResultadoRevision simularRevision() {
        int valor = new Random().nextInt(10);
        if (valor <= 6) return ResultadoRevision.APROBADO;
        if (valor == 7) return ResultadoRevision.RECHAZADO_PAPELES_INCOMPLETOS;
        if (valor == 8) return ResultadoRevision.RETENIDO_REVISION_CARGA;
        return ResultadoRevision.RETENIDO_INSPECCION_SAG;
    }

    private String obtenerDescripcion(ResultadoRevision resultado) {
        return switch (resultado) {
            case APROBADO -> "APROBADO";
            case RECHAZADO_PAPELES_INCOMPLETOS -> "RECHAZADO - PAPELES INCOMPLETOS";
            case RETENIDO_REVISION_CARGA -> "RETENIDO - REVISIÓN DE CARGA";
            case RETENIDO_INSPECCION_SAG -> "RETENIDO - INSPECCIÓN SAG REQUERIDA";
            case RETENIDO_SOSPECHA -> "RETENIDO - BAJO SOSPECHA";
        };
    }
}

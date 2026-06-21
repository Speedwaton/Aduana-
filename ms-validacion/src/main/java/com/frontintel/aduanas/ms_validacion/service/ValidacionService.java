package com.frontintel.aduanas.ms_validacion.service;

import com.frontintel.aduanas.ms_validacion.dto.ValidacionRequestDto;
import com.frontintel.aduanas.ms_validacion.dto.ValidacionResponseDto;
import com.frontintel.aduanas.ms_validacion.model.EstadoValidacion;
import com.frontintel.aduanas.ms_validacion.model.ResultadoValidacion;
import com.frontintel.aduanas.ms_validacion.repository.ValidacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Servicio de validación de identidad y documentos.
 * Verifica que los datos del documento coincidan con el preregistro del viajero.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ValidacionService {

    private final ValidacionRepository validacionRepository;
    private final RestTemplate restTemplate;

    @Value("${ms.preregistro.url}")
    private String preregistroUrl;

    /**
     * Valida la identidad del viajero cruzando los datos del documento
     * escaneado con el preregistro almacenado en ms-preregistro.
     *
     * @param dto Datos capturados del escaneo del documento.
     * @return DTO con el resultado de la validación y si puede avanzar.
     */
    @Transactional
    public ValidacionResponseDto validarIdentidad(ValidacionRequestDto dto) {
        log.info("Validando identidad para trámite: {}", dto.getIdTramite());

        // Consultar el preregistro en ms-preregistro a través de Eureka (load balancer)
        String urlPreregistro = preregistroUrl + "/api/preregistro/" + dto.getIdTramite();
        
        Map<?, ?> tramite;
        try {
            tramite = restTemplate.getForObject(urlPreregistro, Map.class);
        } catch (Exception e) {
            log.error("No se pudo contactar ms-preregistro: {}", e.getMessage());
            return ValidacionResponseDto.builder()
                    .idTramite(dto.getIdTramite())
                    .resultado("ERROR")
                    .puedeAvanzar(false)
                    .mensaje("Error al consultar el preregistro. Verifica la conexión.")
                    .build();
        }

        if (tramite == null) {
            return construirRechazo(dto, "No se encontró ningún preregistro con el código QR proporcionado.");
        }

        // Cruzar datos: el RUT del documento debe coincidir con el RUT del preregistro
        String rutPreregistrado = (String) tramite.get("rutViajero");
        if (!dto.getRutDocumento().equalsIgnoreCase(rutPreregistrado)) {
            String motivo = "El RUT del documento (" + dto.getRutDocumento() +
                    ") no coincide con el RUT del preregistro (" + rutPreregistrado + ").";
            log.warn("VALIDACIÓN RECHAZADA - Trámite: {} - Motivo: {}", dto.getIdTramite(), motivo);
            return construirRechazo(dto, motivo);
        }

        // Verificar que el preregistro esté en estado válido
        String estado = (String) tramite.get("estado");
        if ("RECHAZADO".equals(estado) || "EXPIRADO".equals(estado)) {
            return construirRechazo(dto, "El preregistro tiene estado " + estado + " y no es válido para el cruce.");
        }

        // Guardar resultado exitoso en base de datos para auditoría
        ResultadoValidacion registro = ResultadoValidacion.builder()
                .idTramite(dto.getIdTramite())
                .rutDocumento(dto.getRutDocumento())
                .nombreDocumento(dto.getNombreDocumento())
                .nacionalidad(dto.getNacionalidad())
                .fechaNacimiento(dto.getFechaNacimiento())
                .resultado(EstadoValidacion.APROBADO)
                .rutFuncionario(dto.getRutFuncionario())
                .build();
        validacionRepository.save(registro);

        log.info("VALIDACIÓN APROBADA para trámite: {}", dto.getIdTramite());
        return ValidacionResponseDto.builder()
                .idTramite(dto.getIdTramite())
                .rutDocumento(dto.getRutDocumento())
                .nombreDocumento(dto.getNombreDocumento())
                .resultado("APROBADO")
                .puedeAvanzar(true)
                .mensaje("Identidad verificada. El viajero puede avanzar al control aduanero.")
                .build();
    }

    private ValidacionResponseDto construirRechazo(ValidacionRequestDto dto, String motivo) {
        ResultadoValidacion registro = ResultadoValidacion.builder()
                .idTramite(dto.getIdTramite())
                .rutDocumento(dto.getRutDocumento())
                .nombreDocumento(dto.getNombreDocumento())
                .nacionalidad(dto.getNacionalidad())
                .resultado(EstadoValidacion.RECHAZADO)
                .motivoRechazo(motivo)
                .rutFuncionario(dto.getRutFuncionario())
                .build();
        validacionRepository.save(registro);

        return ValidacionResponseDto.builder()
                .idTramite(dto.getIdTramite())
                .rutDocumento(dto.getRutDocumento())
                .nombreDocumento(dto.getNombreDocumento())
                .resultado("RECHAZADO")
                .motivoRechazo(motivo)
                .puedeAvanzar(false)
                .mensaje("Validación rechazada. El viajero debe ser derivado al módulo de atención especial.")
                .build();
    }
}

package com.frontintel.aduanas.ms_preregistro.service;

import com.frontintel.aduanas.ms_preregistro.dto.EventoCruceDto;
import com.frontintel.aduanas.ms_preregistro.dto.PreregistroRequestDto;
import com.frontintel.aduanas.ms_preregistro.dto.PreregistroResponseDto;
import com.frontintel.aduanas.ms_preregistro.model.EstadoTramite;
import com.frontintel.aduanas.ms_preregistro.model.Tramite;
import com.frontintel.aduanas.ms_preregistro.repository.TramiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

/**
 * Servicio principal para la lógica de negocio del preregistro aduanero.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PreregistroService {

    private final TramiteRepository tramiteRepository;
    private final RestTemplate restTemplate;

    @Value("${ms.notificaciones.url}")
    private String notificacionesUrl;

    @Value("${ms.validacion.url}")
    private String validacionUrl;

    /**
     * Crea un nuevo preregistro para un viajero y genera su código QR.
     * Luego publica el evento en Kafka para que ms-notificaciones asigne el turno.
     *
     * @param dto Datos del viajero y del viaje.
     * @return DTO con el código QR y la confirmación del registro.
     */
    @Transactional
    public PreregistroResponseDto crearPreregistro(PreregistroRequestDto dto) {
        log.info("Iniciando preregistro para RUT: {}", dto.getRutViajero());

        // Verificar si el viajero ya tiene un preregistro activo para la misma fecha
        tramiteRepository.findByRutViajeroAndEstado(dto.getRutViajero(), EstadoTramite.PRE_REGISTRADO)
                .ifPresent(t -> {
                    throw new RuntimeException("Ya existe un preregistro activo (ID: " + t.getIdTramite() + ") para este RUT.");
                });

        // Generar el ID del trámite con formato QR-DD-MM-YYYY-NNNN
        String idTramite = generarIdTramite();
        log.info("ID de trámite generado: {}", idTramite);

        // Construir y persistir la entidad en PostgreSQL
        Tramite nuevoTramite = Tramite.builder()
                .idTramite(idTramite)
                .rutViajero(dto.getRutViajero())
                .nombreCompleto(dto.getNombreCompleto())
                .nacionalidad(dto.getNacionalidad())
                .correoElectronico(dto.getCorreoElectronico())
                .fechaIngreso(dto.getFechaIngreso())
                .motivoViaje(dto.getMotivoViaje())
                .patenteVehiculo(dto.getPatenteVehiculo())
                .codigoQr(idTramite)
                .build();

        tramiteRepository.save(nuevoTramite);
        log.info("Trámite guardado exitosamente en la base de datos.");

        // Avisar a ms-notificaciones (por REST, vía Eureka) para que asigne el turno.
        EventoCruceDto evento = EventoCruceDto.builder()
                .idTramite(idTramite)
                .rutViajero(dto.getRutViajero())
                .correoViajero(dto.getCorreoElectronico())
                .patenteVehiculo(dto.getPatenteVehiculo())
                .estado("PRE_REGISTRADO")
                .build();

        // El preregistro ya quedó guardado en MySQL. La asignación de turno es un
        // "extra": si ms-notificaciones no está disponible, no debe romper el flujo
        // ni revertir la transacción.
        try {
            restTemplate.postForObject(notificacionesUrl + "/api/notificaciones/turno", evento, Object.class);
            log.info("Turno solicitado a ms-notificaciones para el trámite {}.", idTramite);
        } catch (Exception e) {
            log.warn("No se pudo asignar el turno en ms-notificaciones: {}. " +
                    "El preregistro se guardó igualmente.", e.getMessage());
        }

        return PreregistroResponseDto.builder()
                .idTramite(idTramite)
                .nombreCompleto(dto.getNombreCompleto())
                .codigoQr(idTramite)
                .estado("PRE_REGISTRADO")
                .mensaje("¡Preregistro exitoso! Presenta el código QR en el control de identidad.")
                .fechaCreacion(nuevoTramite.getFechaCreacion())
                .build();
    }

    /**
     * Consulta el estado actual de un trámite por su ID (código QR).
     *
     * @param idTramite ID del trámite escaneado o ingresado.
     * @return El trámite encontrado.
     */
    public Tramite consultarTramite(String idTramite) {
        log.info("Consultando trámite con ID: {}", idTramite);
        return tramiteRepository.findById(idTramite)
                .orElseThrow(() -> new RuntimeException("Trámite no encontrado con ID: " + idTramite));
    }

    /**
     * Obtiene todos los trámites registrados para un viajero por su RUT.
     *
     * @param rutViajero RUT o Pasaporte del viajero.
     * @return Lista de trámites del viajero.
     */
    public List<Tramite> obtenerTramitesPorRut(String rutViajero) {
        log.info("Buscando todos los trámites del RUT: {}", rutViajero);
        return tramiteRepository.findByRutViajero(rutViajero);
    }

    /**
     * Actualiza el estado de un trámite (usado por el funcionario en el control).
     *
     * @param idTramite ID del trámite a actualizar.
     * @param nuevoEstado Nuevo estado (APROBADO, RECHAZADO, EN_REVISION).
     * @return El trámite actualizado.
     */
    @Transactional
    public Tramite actualizarEstado(String idTramite, EstadoTramite nuevoEstado) {
        log.info("Actualizando estado del trámite {} a {}", idTramite, nuevoEstado);
        Tramite tramite = tramiteRepository.findById(idTramite)
                .orElseThrow(() -> new RuntimeException("Trámite no encontrado con ID: " + idTramite));

        // CANDADO PDI: el agente solo puede APROBAR si la PDI ya revisó y
        // aprobó al viajero (antecedentes penales, carga del vehículo, etc.).
        if (nuevoEstado == EstadoTramite.APROBADO) {
            verificarAprobacionPdi(idTramite);
        }

        tramite.setEstado(nuevoEstado);
        return tramiteRepository.save(tramite);
    }

    /**
     * Consulta a ms-validacion el estado de la revisión PDI del trámite.
     * Lanza excepción (y por tanto bloquea la aprobación) si la PDI aún no
     * revisa, si rechazó, o si el servicio de validación no está disponible
     * (bloqueo seguro: sin confirmación de la PDI no se aprueba a nadie).
     */
    private void verificarAprobacionPdi(String idTramite) {
        String url = validacionUrl + "/api/validacion/pdi/tramite/" + idTramite;
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> revision = restTemplate.getForObject(url, java.util.Map.class);
            String resultado = revision == null ? null : String.valueOf(revision.get("resultado"));
            if (!"APROBADO".equals(resultado)) {
                throw new RuntimeException("La PDI revisó este trámite y su resultado es " + resultado
                        + ". No se puede aprobar.");
            }
            log.info("Verificación PDI OK para el trámite {}", idTramite);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new RuntimeException("El trámite aún NO ha sido verificado por la PDI. " +
                    "Debe esperar la revisión de antecedentes antes de aprobar.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("La PDI")) throw e;
            if (e.getMessage() != null && e.getMessage().startsWith("El trámite aún NO")) throw e;
            log.error("No se pudo consultar la revisión PDI: {}", e.getMessage());
            throw new RuntimeException("No se pudo verificar la revisión PDI (servicio de validación " +
                    "no disponible). Por seguridad, la aprobación queda bloqueada.");
        }
    }

    /**
     * Lista trámites por estado (lista de trabajo de la PDI: PRE_REGISTRADO / EN_REVISION).
     */
    public List<Tramite> obtenerTramitesPorEstado(EstadoTramite estado) {
        return tramiteRepository.findByEstado(estado);
    }

    /**
     * Genera un ID de trámite único con el formato QR-DD-MM-YYYY-NNNN.
     * Ejemplo: QR-25-05-2025-4587
     */
    private String generarIdTramite() {
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        int numero = 1000 + new Random().nextInt(9000);
        return "QR-" + fecha + "-" + numero;
    }
}

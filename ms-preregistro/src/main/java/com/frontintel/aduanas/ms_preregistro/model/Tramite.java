package com.frontintel.aduanas.ms_preregistro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA que representa un trámite de preregistro en la frontera.
 * Se mapea con la tabla 'tramites' en PostgreSQL.
 */
@Entity
@Table(name = "tramites")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tramite {

    /** ID del trámite en formato: QR-DD-MM-YYYY-NNNN (ej: QR-25-05-2025-4587) */
    @Id
    @Column(name = "id_tramite", length = 30)
    private String idTramite;

    /** RUT o Pasaporte del viajero */
    @Column(name = "rut_viajero", nullable = false, length = 20)
    private String rutViajero;

    /** Nombre completo del viajero */
    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;

    /** Nacionalidad (ej: "Chilena", "Argentina") */
    @Column(nullable = false, length = 50)
    private String nacionalidad;

    /** Correo electrónico para enviar el ticket QR */
    @Column(nullable = false, length = 100)
    private String correoElectronico;

    /** Fecha de ingreso planeada a Chile */
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    /** Motivo del viaje según enumeración */
    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_viaje", nullable = false, length = 20)
    private MotivoViaje motivoViaje;

    /** Patente del vehículo (null si cruza a pie) */
    @Column(name = "patente_vehiculo", length = 15)
    private String patenteVehiculo;

    /** Estado actual del trámite en el flujo aduanero */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoTramite estado;

    /** Código QR generado (mismo que el ID del trámite) */
    @Column(name = "codigo_qr", length = 50)
    private String codigoQr;

    /** Fecha y hora de creación del preregistro */
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    /** Fecha y hora de la última actualización de estado */
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        this.estado = EstadoTramite.PRE_REGISTRADO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}

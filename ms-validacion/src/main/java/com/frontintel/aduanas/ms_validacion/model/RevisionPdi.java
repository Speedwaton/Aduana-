package com.frontintel.aduanas.ms_validacion.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Revisión de la Policía de Investigaciones (PDI) sobre un trámite.
 * La PDI verifica antecedentes penales, la carga/vehículo y la situación
 * general del viajero. El agente aduanero SOLO puede aprobar el trámite
 * cuando esta revisión existe y su resultado es APROBADO.
 */
@Entity
@Table(name = "revisiones_pdi")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisionPdi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Trámite revisado (único: una revisión vigente por trámite). */
    @Column(name = "id_tramite", nullable = false, unique = true, length = 30)
    private String idTramite;

    /** RUT del viajero revisado. */
    @Column(name = "rut_viajero", nullable = false, length = 20)
    private String rutViajero;

    /** Resultado del chequeo de antecedentes penales: APROBADO / RECHAZADO. */
    @Column(name = "antecedentes_penales", nullable = false, length = 15)
    private String antecedentesPenales;

    /** Resultado de la revisión del vehículo y su carga: APROBADO / RECHAZADO / NO_APLICA. */
    @Column(name = "revision_vehiculo", nullable = false, length = 15)
    private String revisionVehiculo;

    /** Resultado global de la PDI: APROBADO o RECHAZADO. */
    @Column(nullable = false, length = 15)
    private String resultado;

    /** Observaciones/indicaciones de la PDI (visibles para el agente). */
    @Column(length = 500)
    private String observaciones;

    /** RUT del oficial PDI que realizó la revisión. */
    @Column(name = "rut_pdi", nullable = false, length = 20)
    private String rutPdi;

    /** Fecha y hora de la revisión (auditoría). */
    @Column(name = "fecha_revision", nullable = false)
    private LocalDateTime fechaRevision;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.fechaRevision = LocalDateTime.now();
    }
}

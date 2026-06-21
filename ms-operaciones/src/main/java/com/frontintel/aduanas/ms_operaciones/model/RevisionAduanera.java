package com.frontintel.aduanas.ms_operaciones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA que registra cada revisión aduanera realizada a un vehículo.
 * Permite trazabilidad completa de lo que se inspeccionó y el resultado.
 */
@Entity
@Table(name = "revisiones_aduaneras")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisionAduanera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Patente del vehículo inspeccionado */
    @Column(nullable = false, length = 15)
    private String patente;

    /** Tipo de vehículo: AUTO, CAMION, BUS, MOTO */
    @Column(name = "tipo_vehiculo", length = 20)
    private String tipoVehiculo;

    /** RUT del conductor */
    @Column(name = "rut_conductor", length = 20)
    private String rutConductor;

    /** Resultado de la revisión aduanera */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ResultadoRevision resultado;

    /** Motivo detallado en caso de rechazo o retención */
    @Column(name = "motivo_detencion", length = 255)
    private String motivoDetencion;

    /** RUT del funcionario que realizó la revisión */
    @Column(name = "rut_funcionario", nullable = false, length = 20)
    private String rutFuncionario;

    /** Observaciones adicionales del funcionario */
    @Column(length = 500)
    private String observaciones;

    /** Fecha y hora de la revisión */
    @Column(name = "fecha_revision", nullable = false, updatable = false)
    private LocalDateTime fechaRevision;

    @PrePersist
    protected void onCreate() {
        this.fechaRevision = LocalDateTime.now();
    }
}

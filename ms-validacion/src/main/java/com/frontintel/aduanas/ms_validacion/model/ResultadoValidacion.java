package com.frontintel.aduanas.ms_validacion.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA que registra cada validación de identidad realizada por un funcionario.
 * Se mapea con la tabla 'validaciones' en PostgreSQL para trazabilidad y auditoría.
 */
@Entity
@Table(name = "validaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoValidacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID del trámite / código QR escaneado por el funcionario */
    @Column(name = "id_tramite", nullable = false, length = 30)
    private String idTramite;

    /** RUT o Pasaporte del documento escaneado */
    @Column(name = "rut_documento", nullable = false, length = 20)
    private String rutDocumento;

    /** Nombre completo extraído del documento escaneado */
    @Column(name = "nombre_documento", nullable = false, length = 100)
    private String nombreDocumento;

    /** Nacionalidad extraída del documento */
    @Column(nullable = false, length = 50)
    private String nacionalidad;

    /** Fecha de nacimiento extraída del documento (formato texto) */
    @Column(name = "fecha_nacimiento", length = 15)
    private String fechaNacimiento;

    /** Resultado de la validación cruzada entre QR y documento */
    @Enumerated(EnumType.STRING)
    @Column(name = "resultado", nullable = false, length = 20)
    private EstadoValidacion resultado;

    /** Motivo del rechazo en caso de resultado RECHAZADO */
    @Column(name = "motivo_rechazo", length = 255)
    private String motivoRechazo;

    /** RUT del funcionario que realizó la validación */
    @Column(name = "rut_funcionario", nullable = false, length = 20)
    private String rutFuncionario;

    /** Fecha y hora exacta de la validación para auditoría */
    @Column(name = "fecha_validacion", nullable = false, updatable = false)
    private LocalDateTime fechaValidacion;

    @PrePersist
    protected void onCreate() {
        this.fechaValidacion = LocalDateTime.now();
    }
}

package com.frontintel.aduanas.ms_preregistro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Documento que el viajero adjunta a su trámite DESDE SU CASA
 * (certificado de antecedentes penales, licencia, permiso del vehículo...).
 * Se guarda directamente en MySQL como BLOB para no depender del sistema
 * de archivos: al clonar el proyecto en otro PC todo sigue funcionando.
 */
@Entity
@Table(name = "documentos_tramite")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoTramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Trámite al que pertenece el documento. */
    @Column(name = "id_tramite", nullable = false, length = 30)
    private String idTramite;

    /** Tipo: ANTECEDENTES_PENALES, LICENCIA_CONDUCIR, PERMISO_VEHICULO, SEGURO, OTRO. */
    @Column(name = "tipo_documento", nullable = false, length = 30)
    private String tipoDocumento;

    /** Nombre original del archivo subido (ej: antecedentes.pdf). */
    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    /** Tipo MIME (application/pdf, image/jpeg...). */
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    /** Tamaño en bytes. */
    @Column(nullable = false)
    private long tamano;

    /** Contenido binario del archivo. */
    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] datos;

    @Column(name = "fecha_subida", nullable = false, updatable = false)
    private LocalDateTime fechaSubida;

    @PrePersist
    protected void onCreate() {
        this.fechaSubida = LocalDateTime.now();
    }
}

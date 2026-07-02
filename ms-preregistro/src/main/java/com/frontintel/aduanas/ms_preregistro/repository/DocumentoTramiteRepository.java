package com.frontintel.aduanas.ms_preregistro.repository;

import com.frontintel.aduanas.ms_preregistro.model.DocumentoTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoTramiteRepository extends JpaRepository<DocumentoTramite, Long> {

    /**
     * Lista los documentos de un trámite SIN traer el BLOB (solo metadatos),
     * para que el listado sea liviano.
     */
    @Query("select d.id as id, d.idTramite as idTramite, d.tipoDocumento as tipoDocumento, " +
           "d.nombreArchivo as nombreArchivo, d.contentType as contentType, " +
           "d.tamano as tamano, d.fechaSubida as fechaSubida " +
           "from DocumentoTramite d where d.idTramite = :idTramite order by d.fechaSubida desc")
    List<DocumentoResumen> findResumenByIdTramite(String idTramite);

    /** Proyección con los metadatos del documento (sin contenido binario). */
    interface DocumentoResumen {
        Long getId();
        String getIdTramite();
        String getTipoDocumento();
        String getNombreArchivo();
        String getContentType();
        long getTamano();
        java.time.LocalDateTime getFechaSubida();
    }
}

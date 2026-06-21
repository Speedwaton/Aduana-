package com.frontintel.aduanas.ms_operaciones.repository;

import com.frontintel.aduanas.ms_operaciones.model.ResultadoRevision;
import com.frontintel.aduanas.ms_operaciones.model.RevisionAduanera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para el historial de revisiones aduaneras.
 */
@Repository
public interface RevisionAduaneraRepository extends JpaRepository<RevisionAduanera, Long> {

    List<RevisionAduanera> findByPatente(String patente);
    List<RevisionAduanera> findByResultado(ResultadoRevision resultado);
    long countByResultado(ResultadoRevision resultado);
}

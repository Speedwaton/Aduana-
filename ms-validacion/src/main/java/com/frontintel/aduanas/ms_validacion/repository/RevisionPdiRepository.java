package com.frontintel.aduanas.ms_validacion.repository;

import com.frontintel.aduanas.ms_validacion.model.RevisionPdi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RevisionPdiRepository extends JpaRepository<RevisionPdi, Long> {

    /** Busca la revisión vigente de un trámite. */
    Optional<RevisionPdi> findByIdTramite(String idTramite);

    long countByResultado(String resultado);
}

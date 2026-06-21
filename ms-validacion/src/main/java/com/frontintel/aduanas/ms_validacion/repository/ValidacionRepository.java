package com.frontintel.aduanas.ms_validacion.repository;

import com.frontintel.aduanas.ms_validacion.model.EstadoValidacion;
import com.frontintel.aduanas.ms_validacion.model.ResultadoValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para el historial de validaciones de identidad.
 */
@Repository
public interface ValidacionRepository extends JpaRepository<ResultadoValidacion, Long> {

    Optional<ResultadoValidacion> findByIdTramite(String idTramite);
    List<ResultadoValidacion> findByResultado(EstadoValidacion resultado);
    List<ResultadoValidacion> findByFechaValidacionBetween(LocalDateTime inicio, LocalDateTime fin);
    long countByResultado(EstadoValidacion resultado);
}

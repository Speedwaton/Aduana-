package com.frontintel.aduanas.ms_preregistro.repository;

import com.frontintel.aduanas.ms_preregistro.model.EstadoTramite;
import com.frontintel.aduanas.ms_preregistro.model.Tramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la gestión de trámites de preregistro.
 */
@Repository
public interface TramiteRepository extends JpaRepository<Tramite, String> {

    /** Busca todos los trámites de un viajero por su RUT */
    List<Tramite> findByRutViajero(String rutViajero);

    /** Busca trámites por estado (PRE_REGISTRADO, APROBADO, etc.) */
    List<Tramite> findByEstado(EstadoTramite estado);

    /** Busca trámites por fecha de ingreso (para el dashboard del funcionario) */
    List<Tramite> findByFechaIngreso(LocalDate fechaIngreso);

    /** Busca el trámite activo de un viajero (preregistrado y no expirado) */
    Optional<Tramite> findByRutViajeroAndEstado(String rutViajero, EstadoTramite estado);

    /** Cuenta los trámites del día de hoy para el dashboard */
    long countByFechaIngreso(LocalDate fecha);
}

package com.frontintel.aduanas.ms_notificaciones.services;

import com.frontintel.aduanas.ms_notificaciones.models.Turno;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Gestiona la fila virtual de turnos EN MEMORIA (reemplaza a Redis).
 * Es suficiente para el prototipo y no requiere infraestructura externa.
 */
@Slf4j
@Service
public class FilaVirtualService {

    // Almacenamiento en memoria. Clave = RUT del viajero.
    private final Map<String, Turno> turnos = new ConcurrentHashMap<>();
    private final AtomicLong contadorTurnos = new AtomicLong(0);

    /**
     * Registra un nuevo turno en la fila. Si el viajero ya tiene un turno
     * en espera, lo reutiliza (no duplica).
     */
    public Turno asignarTurnoAFila(String rutViajero, String idTramite, String patenteVehiculo) {
        Turno existente = turnos.get(rutViajero);
        if (existente != null && "EN_ESPERA".equals(existente.getEstadoTurno())) {
            log.info("El RUT {} ya tenía el turno #{}", rutViajero, existente.getNumeroTurno());
            return existente;
        }

        long numero = contadorTurnos.incrementAndGet();
        Turno nuevo = Turno.builder()
                .rutViajero(rutViajero)
                .idTramite(idTramite)
                .patenteVehiculo(patenteVehiculo)
                .numeroTurno(numero)
                .fechaHoraIngreso(LocalDateTime.now())
                .estadoTurno("EN_ESPERA")
                .build();

        turnos.put(rutViajero, nuevo);
        log.info("Turno #{} asignado en memoria para el RUT: {}", numero, rutViajero);
        return nuevo;
    }

    /**
     * Calcula cuántos vehículos en espera tienen un número de turno menor.
     */
    public long calcularVehiculosAdelante(String rutViajero) {
        Turno turnoUsuario = turnos.get(rutViajero);
        if (turnoUsuario == null || !"EN_ESPERA".equals(turnoUsuario.getEstadoTurno())) {
            return 0L;
        }
        return turnos.values().stream()
                .filter(t -> "EN_ESPERA".equals(t.getEstadoTurno()))
                .filter(t -> t.getNumeroTurno() < turnoUsuario.getNumeroTurno())
                .count();
    }

    /**
     * Obtiene el turno de un viajero por su RUT (o null si no tiene).
     */
    public Turno obtenerTurnoPorRut(String rutViajero) {
        return turnos.get(rutViajero);
    }
}

package com.frontintel.aduanas.ms_notificaciones.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Notificación de confirmación al viajero.
 * Antes enviaba un correo SMTP; ahora solo lo registra en el log para mantener
 * el microservicio simple y sin dependencias externas (sin servidor de correo).
 */
@Slf4j
@Service
public class NotificacionEmailService {

    public void enviarCorreoConfirmacion(String destino, String idTramite, String patente) {
        log.info("[NOTIFICACION] Pre-registro confirmado -> destino: {}, tramite: {}, vehiculo: {}",
                destino, idTramite, patente);
    }
}

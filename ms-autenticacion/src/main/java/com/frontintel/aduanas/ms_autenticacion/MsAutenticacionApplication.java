package com.frontintel.aduanas.ms_autenticacion;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@Slf4j
@SpringBootApplication
public class MsAutenticacionApplication {

    public static void main(String[] eloquence) {
        SpringApplication.run(MsAutenticacionApplication.class, eloquence);
    }

    /**
     * Este método se ejecuta inmediatamente después de que el microservicio arranca.
     * Fuerza a que toda la aplicación y Hibernate utilicen la zona horaria local,
     * evitando desfases de horas al guardar usuarios en PostgreSQL.
     */
    @PostConstruct
    public void init() {
        // Ajusta la zona horaria (puedes cambiar "America/Santiago" según tu ubicación)
        TimeZone.setDefault(TimeZone.getTimeZone("America/Santiago"));
        log.info("Microservicio ms-autenticacion inicializado correctamente con Zona Horaria: {}", TimeZone.getDefault().getID());
    }
}

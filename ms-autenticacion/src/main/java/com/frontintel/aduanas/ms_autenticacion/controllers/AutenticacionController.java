package com.frontintel.aduanas.ms_autenticacion.controllers;

import com.frontintel.aduanas.ms_autenticacion.dtos.LoginRequestDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.LoginResponseDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.RegistroInstitucionalDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.RegistroRequestDto;
import com.frontintel.aduanas.ms_autenticacion.services.AutenticacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AutenticacionController {

    private final AutenticacionService autenticacionService;

    /**
     * Registro PÚBLICO de viajeros. Siempre crea la cuenta con rol VIAJERO
     * (el rol ya no se puede elegir desde afuera por seguridad).
     * URL: POST http://localhost:8081/api/v1/auth/registro
     */
    @PostMapping("/registro")
    public ResponseEntity<String> registrarUsuario(@Valid @RequestBody RegistroRequestDto registroDto) {
        log.info("Petición HTTP recibida para registrar al RUT: {}", registroDto.getRut());
        try {
            String respuesta = autenticacionService.registrarUsuario(registroDto);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error en el registro del RUT {}: {}", registroDto.getRut(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Registro INSTITUCIONAL para personal: FUNCIONARIO (agente), PDI y
     * SUPERVISOR. Exige el código institucional del rol solicitado.
     * URL: POST http://localhost:8081/api/v1/auth/registro-institucional
     */
    @PostMapping("/registro-institucional")
    public ResponseEntity<String> registrarInstitucional(
            @Valid @RequestBody RegistroInstitucionalDto dto) {
        log.info("Registro institucional solicitado: RUT {} rol {}", dto.getRut(), dto.getRol());
        try {
            String respuesta = autenticacionService.registrarInstitucional(dto);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Registro institucional rechazado para {}: {}", dto.getRut(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Endpoint HTTP POST para iniciar sesión y obtener el Token de acceso.
     * URL de acceso: POST http://localhost:8081/api/v1/auth/login
     *
     * @param loginDto Credenciales de acceso (RUT y Password).
     * @return DTO con el Token JWT y datos del perfil con estado 200 OK.
     */
    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@Valid @RequestBody LoginRequestDto loginDto) {
        log.info("Petición HTTP recibida para inicio de sesión del RUT: {}", loginDto.getRut());
        try {
            LoginResponseDto response = autenticacionService.login(loginDto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Fallo de autenticación para el RUT {}: {}", loginDto.getRut(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}

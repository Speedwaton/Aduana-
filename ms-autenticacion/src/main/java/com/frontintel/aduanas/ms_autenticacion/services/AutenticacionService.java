package com.frontintel.aduanas.ms_autenticacion.services;

import com.frontintel.aduanas.ms_autenticacion.dtos.LoginRequestDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.LoginResponseDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.RegistroRequestDto;
import com.frontintel.aduanas.ms_autenticacion.models.Rol;
import com.frontintel.aduanas.ms_autenticacion.models.Usuario;
import com.frontintel.aduanas.ms_autenticacion.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutenticacionService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Lógica de negocio para registrar cuentas en la BD relacional de usuarios.
     */
    public String registrarUsuario(RegistroRequestDto dto) {
        log.info("Procesando registro para el RUT: {}", dto.getRut());

        // 1. Validar que el RUT no esté duplicado
        if (usuarioRepository.existsByRut(dto.getRut())) {
            throw new RuntimeException("El RUT ingresado ya se encuentra registrado en el sistema.");
        }

        // 2. Validar que el Email no esté duplicado
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo electrónico ya está siendo utilizado.");
        }

        // 3. Mapear el DTO a la Entidad e indexar la clave encriptada con BCrypt
        Usuario nuevoUsuario = Usuario.builder()
                .rut(dto.getRut())
                .nombreCompleto(dto.getNombreCompleto())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword())) // Encriptación segura
                .rol(Rol.valueOf(dto.getRol().toUpperCase()))
                .build();

        usuarioRepository.save(nuevoUsuario);
        log.info("Usuario con RUT {} registrado exitosamente en PostgreSQL.", dto.getRut());
        return "Usuario registrado de forma correcta.";
    }

    /**
     * Lógica de autenticación que valida credenciales y retorna el Token JWT.
     */
    public LoginResponseDto login(LoginRequestDto dto) {
        log.info("Intento de inicio de sesión para el RUT: {}", dto.getRut());

        // 1. Buscar que el usuario exista
        Usuario usuario = usuarioRepository.findByRut(dto.getRut())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas: El RUT no existe."));

        // 2. Validar que la cuenta no esté suspendida
        if (!usuario.isActivo()) {
            throw new RuntimeException("Esta cuenta ha sido deshabilitada por administración.");
        }

        // 3. Comparar el hash de la clave ingresada contra la almacenada en la BD
        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPassword())) {
            log.warn("Contraseña incorrecta para el RUT: {}", dto.getRut());
            throw new RuntimeException("Credenciales inválidas: Contraseña incorrecta.");
        }

        // 4. Generar el JWT si todo es correcto
        String token = jwtService.generarToken(usuario);
        log.info("Autenticación exitosa. Token generado para el RUT: {}", dto.getRut());

        return LoginResponseDto.builder()
                .token(token)
                .rut(usuario.getRut())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol().name())
                .build();
    }
}

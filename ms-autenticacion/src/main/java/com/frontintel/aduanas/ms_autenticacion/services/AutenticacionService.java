package com.frontintel.aduanas.ms_autenticacion.services;

import com.frontintel.aduanas.ms_autenticacion.dtos.LoginRequestDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.LoginResponseDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.RegistroInstitucionalDto;
import com.frontintel.aduanas.ms_autenticacion.dtos.RegistroRequestDto;
import com.frontintel.aduanas.ms_autenticacion.models.Rol;
import com.frontintel.aduanas.ms_autenticacion.models.Usuario;
import com.frontintel.aduanas.ms_autenticacion.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutenticacionService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Códigos institucionales por rol (definidos en application.properties).
    // Sin el código correcto no es posible crear cuentas de personal.
    @Value("${auth.codigo.funcionario}")
    private String codigoFuncionario;

    @Value("${auth.codigo.pdi}")
    private String codigoPdi;

    @Value("${auth.codigo.supervisor}")
    private String codigoSupervisor;

    /**
     * Registro PÚBLICO: cualquier persona puede crear una cuenta, pero SIEMPRE
     * con rol VIAJERO. El rol ya no se elige desde el formulario público:
     * así nadie puede autoproclamarse funcionario, PDI o supervisor.
     */
    public String registrarUsuario(RegistroRequestDto dto) {
        log.info("Procesando registro público (VIAJERO) para el RUT: {}", dto.getRut());
        return crearCuenta(dto.getRut(), dto.getNombreCompleto(), dto.getEmail(),
                dto.getPassword(), Rol.VIAJERO);
    }

    /**
     * Registro INSTITUCIONAL: crea cuentas de personal (FUNCIONARIO, PDI,
     * SUPERVISOR) solo si se presenta el código institucional del rol.
     */
    public String registrarInstitucional(RegistroInstitucionalDto dto) {
        Rol rol;
        try {
            rol = Rol.valueOf(dto.getRol().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol desconocido: " + dto.getRol());
        }

        String codigoEsperado = switch (rol) {
            case FUNCIONARIO -> codigoFuncionario;
            case PDI -> codigoPdi;
            case SUPERVISOR -> codigoSupervisor;
            default -> throw new RuntimeException(
                    "El rol VIAJERO se registra en el formulario público, sin código.");
        };

        if (!codigoEsperado.equals(dto.getCodigoInstitucional())) {
            log.warn("Código institucional inválido para rol {} (RUT {})", rol, dto.getRut());
            throw new RuntimeException("Código institucional incorrecto para el rol " + rol + ".");
        }

        log.info("Registro institucional autorizado: RUT {} como {}", dto.getRut(), rol);
        return crearCuenta(dto.getRut(), dto.getNombreCompleto(), dto.getEmail(),
                dto.getPassword(), rol);
    }

    /** Lógica común de creación de cuentas (valida duplicados y encripta la clave). */
    private String crearCuenta(String rut, String nombreCompleto, String email,
                               String password, Rol rol) {
        if (usuarioRepository.existsByRut(rut)) {
            throw new RuntimeException("El RUT ingresado ya se encuentra registrado en el sistema.");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("El correo electrónico ya está siendo utilizado.");
        }

        Usuario nuevoUsuario = Usuario.builder()
                .rut(rut)
                .nombreCompleto(nombreCompleto)
                .email(email)
                .password(passwordEncoder.encode(password))
                .rol(rol)
                .build();

        usuarioRepository.save(nuevoUsuario);
        log.info("Usuario con RUT {} registrado exitosamente con rol {}.", rut, rol);
        return "Usuario registrado de forma correcta como " + rol + ".";
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

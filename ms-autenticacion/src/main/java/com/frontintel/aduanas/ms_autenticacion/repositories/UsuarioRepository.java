package com.frontintel.aduanas.ms_autenticacion.repositories;

import com.frontintel.aduanas.ms_autenticacion.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para la gestión de persistencia de la entidad Usuario en PostgreSQL.
 * Proporciona acceso directo a los datos de las cuentas del sistema aduanero.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario en la base de datos a través de su RUT o Pasaporte.
     * Este método es el pilar central del inicio de sesión (Login), ya que permite
     * verificar si el identificador ingresado en el formulario existe en el sistema.
     * * @param rut El RUT o pasaporte enviado por el cliente.
     * @return Un contenedor Optional que incluye al Usuario si es encontrado.
     */
    Optional<Usuario> findByRut(String rut);

    /**
     * Verifica de forma rápida si un RUT ya se encuentra registrado en el sistema.
     * Ideal para validaciones tempranas en el formulario de registro de nuevos usuarios,
     * evitando colisiones o duplicados en PostgreSQL.
     * * @param rut El RUT o pasaporte a validar.
     * @return true si el RUT ya existe, de lo contrario false.
     */
    boolean existsByRut(String rut);

    /**
     * Verifica si una dirección de correo electrónico ya está registrada.
     * Mantiene la integridad de datos exigida para las comunicaciones oficiales del sistema.
     * * @param email El correo electrónico a consultar.
     * @return true si el email ya existe, de lo contrario false.
     */
    boolean existsByEmail(String email);
}

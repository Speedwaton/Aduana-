package com.frontintel.aduanas.ms_autenticacion.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad JPA que representa a un usuario dentro del sistema aduanero.
 * Se mapea directamente con la tabla 'usuarios' en PostgreSQL.
 */
@Entity
@Table(name = "usuarios", uniqueConstraints = {
    @UniqueConstraint(columnNames = "rut")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    /**
     * Identificador único numérico autoincremental para control interno de la BD.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * RUT o Pasaporte del usuario. 
     * Funciona como el identificador de inicio de sesión único (Username).
     */
    @Column(nullable = false, length = 20)
    private String rut;

    /**
     * Nombre completo del viajero o funcionario.
     */
    @Column(nullable = false, length = 100)
    private String nombreCompleto;

    /**
     * Correo electrónico para recuperar credenciales o recibir alertas críticas.
     */
    @Column(nullable = false, length = 100)
    private String email;

    /**
     * Contraseña almacenada. 
     * ¡Importante! Nunca se guarda en texto plano, guardará el hash encriptado con BCrypt.
     */
    @Column(nullable = false, length = 255)
    private String password;

    /**
     * Rol asignado bajo el modelo RBAC.
     * Se almacena en la base de datos como una cadena de texto (STRING) para mayor legibilidad.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    /**
     * Flag para deshabilitar o suspender cuentas de funcionarios de forma administrativa.
     */
    @Column(nullable = false)
    private boolean activo;

    /**
     * Marca de tiempo para auditoría interna del sistema.
     */
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Método de ciclo de vida JPA. 
     * Asigna automáticamente la fecha y hora actual justo antes de insertar el registro.
     */
    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.activo = true; // Por defecto toda cuenta nueva se crea activa
    }
}
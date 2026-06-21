package com.frontintel.aduanas.ms_autenticacion.services;

import com.frontintel.aduanas.ms_autenticacion.models.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Clave secreta de prueba (En producción debe venir cifrada desde las variables de entorno)
    private static final String SECRET_KEY = "FronteraInteligenteClaveSecretaUltraSeguraParaElPasoLosLibertadores2026";
    
    // El token expirará en 24 horas (ideal para el transcurso del viaje de los conductores)
    private static final long JWT_EXPIRATION = 86400000; 

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    /**
     * Genera un Token JWT firmado incluyendo el RUT del usuario como Subject
     * y agregando el Rol dentro de los Claims personalizados.
     */
    public String generarToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", usuario.getRol().name());
        claims.put("nombre", usuario.getNombreCompleto());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(usuario.getRut())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae el RUT (Subject) almacenado dentro del Token.
     */
    public String extraerRut(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Verifica si el token ha expirado.
     */
    public boolean esTokenValido(String token) {
        try {
            return !extraerClaim(token, Claims::getExpiration).before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
package com.group1.proyect.freshbasket.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "mi_clave_secreta_para_jwt_1234567890";

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // Generar token
    public String generateToken(String email, Long userId) {

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60)
                ) // 1 hora
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extraer email
    public String extractEmail(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Extraer userId
    public Long extractUserId(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", Long.class);
    }

    // Validar token
    public boolean validateToken(String token) {

        try {

            Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch (JwtException e) {

            return false;
        }
    }
}